import { NextRequest, NextResponse } from "next/server";
import { registerGenesisIP, registerDerivativeIP } from "@/lib/story/operations";
import { uploadJSONToIPFS, pinImageFromURL } from "@/lib/ipfs/client";
import { getGraphSession } from "@/lib/db/graph-client";
import { keccak256, stringToBytes, Address } from "viem";

export async function POST(req: NextRequest) {
  const session = await getGraphSession();
  
  try {
    const body = await req.json();
    // licenseTermsId is optional, only needed for Remix if we want to override or if logic demands it.
    // For now we'll assume a default or fetch it, but let's accept it from body if frontend sends it.
    const { metadata, imageUrl, recipient, parentId, draftId, licenseTermsId } = body; 
    
    if (!metadata || !imageUrl || !recipient) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Upload Image to IPFS
    console.log("Uploading image to IPFS...", imageUrl);
    let ipfsImageUri: string;
    if (imageUrl.startsWith("http") && !imageUrl.includes("pinata")) {
        ipfsImageUri = await pinImageFromURL(imageUrl);
    } else {
        ipfsImageUri = imageUrl; 
    }

    // 2. Upload Metadata to IPFS
    const finalMetadata = {
        ...metadata,
        image: ipfsImageUri,
        properties: {
            ...metadata.properties,
            parentId: parentId || null
        }
    };
    
    console.log("Uploading metadata to IPFS...");
    const ipMetadataUri = await uploadJSONToIPFS(finalMetadata);
    const ipMetadataHash = keccak256(stringToBytes(JSON.stringify(finalMetadata)));
    
    const nftMetadataUri = ipMetadataUri;
    const nftMetadataHash = ipMetadataHash;

    // 3. Determine Type & Register on Story Protocol
    let storyResponse;

    if (parentId) {
        console.log(`Processing Remix logic for Parent: ${parentId}`);
        // For Remix, we need a licenseTermsId. 
        // If not provided, we might default to '1' (Standard Commercial Remix) for hackathon simplicity,
        // or better, fail if not provided. Let's default to '1' for now as per our previous logic assumption.
        const termsId = licenseTermsId || "1"; 
        
        storyResponse = await registerDerivativeIP(
            recipient as Address,
            parentId as Address,
            termsId,
            ipMetadataUri,
            ipMetadataHash,
            nftMetadataUri,
            nftMetadataHash
        );
    } else {
        console.log("Processing Genesis IP registration...");
        storyResponse = await registerGenesisIP(
            recipient as Address,
            ipMetadataUri,
            ipMetadataHash,
            nftMetadataUri,
            nftMetadataHash
        );
    }

    const { ipId, txHash } = storyResponse;

    if (!ipId) {
        throw new Error("Failed to receive IP ID from Story Protocol");
    }

    console.log(`IP Registered: ${ipId} (Tx: ${txHash})`);
    
    // 4. Sync with Neo4j
    console.log("Syncing with Neo4j...");
    
    let cypher;
    const params: any = {
        ipId: ipId,
        txHash: txHash,
        metadataUri: ipMetadataUri,
        imageUrl: ipfsImageUri,
        name: metadata.name || "Untitled Asset",
        recipient: recipient,
        parentId: parentId || null,
        status: 'REGISTERED' 
    };

    if (draftId) {
        // Update existing Draft
        console.log(`Updating Draft ${draftId} to Registered IP...`);
        cypher = `
            MATCH (ip:IPAsset {id: $draftId})
            SET ip.id = $ipId, // Overwrite UUID with real IP ID
                ip.txHash = $txHash,
                ip.metadataUri = $metadataUri,
                ip.imageUrl = $imageUrl,
                ip.name = $name,
                ip.status = $status
            RETURN ip
        `;
        params.draftId = draftId;
    } else {
        // Create New (Fallback)
        cypher = `
            MERGE (u:User {address: $recipient})
            CREATE (ip:IPAsset {
                id: $ipId,
                txHash: $txHash,
                metadataUri: $metadataUri,
                imageUrl: $imageUrl,
                name: $name,
                status: $status,
                createdAt: datetime()
            })
            MERGE (ip)-[:CREATED_BY]->(u)
            WITH ip
            ${parentId ? `
                MATCH (parent:IPAsset {id: $parentId})
                MERGE (ip)-[:DERIVED_FROM]->(parent)
            ` : ""}
            RETURN ip
        `;
    }

    await session.run(cypher, params);

    return NextResponse.json({ 
        success: true,
        ipId: ipId, 
        txHash: txHash,
        explorerUrl: `https://aeneid.storyscan.xyz/address/${ipId}`
    });

  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  } finally {
    await session.close();
  }
}