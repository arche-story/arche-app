import { NextRequest, NextResponse } from "next/server";
import {
  registerGenesisIP,
  registerGenesisIPNonCommercial,
} from "@/lib/story/register-genesis";
import { registerDerivativeIP } from "@/lib/story/register-derivative";
import {
  mintLicenseToken,
  mintCommercialRemixLicense,
  mintNonCommercialLicense,
} from "@/lib/story/license";
import { uploadJSONToIPFS, pinImageFromURL } from "@/lib/ipfs/client";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction } from "neo4j-driver";
import { keccak256, stringToBytes, Address } from "viem";

export async function POST(req: NextRequest) {
  const session = await getGraphSession();

  try {
    const body = await req.json();
    // licenseTermsId is optional, only needed for Remix if we want to override or if logic demands it.
    // For now we'll assume a default or fetch it, but let's accept it from body if frontend sends it.
    const { metadata, imageUrl, recipient, parentId, draftId, licenseTermsId, forkedFrom } =
      body;

    if (!metadata || !imageUrl || !recipient) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
    // If forkedFrom is present, we treat this as a Genesis asset on-chain, but track the parent in metadata
    const finalMetadata = {
      ...metadata,
      image: ipfsImageUri,
      properties: {
        ...metadata.properties,
        parentId: parentId || forkedFrom || null,
        isFork: !!forkedFrom,
      },
    };

    console.log("Uploading metadata to IPFS...");
    const ipMetadataUri = await uploadJSONToIPFS(finalMetadata);
    const ipMetadataHash = keccak256(
      stringToBytes(JSON.stringify(finalMetadata))
    );

    const nftMetadataUri = ipMetadataUri;
    const nftMetadataHash = ipMetadataHash;

    // --- FIX START: Definisi variable di scope luar agar bisa dipakai di Neo4j ---
    // Kita butuh variable ini untuk menyimpan ID Terms yang dipakai, baik Genesis maupun Remix
    let activeLicenseTermsId: string | undefined = "1";
    // --- FIX END ---

    // 3. Determine Type & Register on Story Protocol
    let storyResponse;

    // Logic for Forking (Unlicensed Remix)
    if (forkedFrom) {
      console.log(`Processing FORK logic for Parent: ${forkedFrom}`);
      
      // Forking means we register as GENESIS (no on-chain parent) but force NON-COMMERCIAL terms
      // This avoids the need for License Tokens and fees
      storyResponse = await registerGenesisIPNonCommercial(
        ipMetadataUri,
        process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as `0x${string}`,
        ipMetadataHash as `0x${string}`,
        nftMetadataHash as `0x${string}`,
        nftMetadataUri
      );
      activeLicenseTermsId = "2"; // ID 2 is Non-Commercial
      
    } else if (parentId) {
      console.log(`Processing Remix logic for Parent: ${parentId}`);

      // --- FIX START: Fetch License Terms ID Logic ---
      // Kita gunakan variable activeLicenseTermsId yang didefinisikan di atas
      const dbSession = await getGraphSession();

      try {
        const parentTermsCypher = `
          MATCH (ip:IPAsset {id: $parentIpId})
          RETURN ip.licenseTermsId as licenseTermsId
        `;

        const parentTermsResult = await dbSession.executeRead(async (tx: ManagedTransaction) => {
          const res = await tx.run(parentTermsCypher, { parentIpId: parentId });
          return res.records[0]?.get('licenseTermsId');
        });

        if (parentTermsResult) {
          activeLicenseTermsId = parentTermsResult.toString();
        } else {
           // Fallback jika tidak ada di DB (misal aset lama)
           activeLicenseTermsId = "1";
        }
      } catch (dbError) {
        console.warn("Could not fetch parent IP terms from database, using default:", dbError);
        activeLicenseTermsId = "1";
      } finally {
        await dbSession.close();
      }
      // --- FIX END ---

      try {
        // First, try to mint a license token from the parent IP using the licenseTermsId from DB
        // If this fails due to cost, we'll provide a more informative error
        let licenseResponse;
        try {
          licenseResponse = await mintLicenseToken(
            parentId as `0x${string}`,
            parseInt(activeLicenseTermsId || "1"), // Use the license terms ID we retrieved from DB, fallback to 1 if undefined
            1, // Amount
            100 // Max revenue share (will be ignored if terms don't support it)
          );
          console.log(
            `License token minted: ${licenseResponse.licenseTokenIds[0]}`
          );
        } catch (licenseError: any) {
          // If minting license fails because of fees, provide more helpful error message
          if (licenseError.message.includes("not have enough erc20 token to pay for fees")) {
            throw new Error("Not enough IP tokens to mint license for remix. The parent IP requires payment to create a derivative. Please get IP tokens first or remix an IP with free terms.");
          }
          throw licenseError;
        }

        // Extract the license token IDs from the response
        const licenseTokenIds = licenseResponse.licenseTokenIds;
        if (!licenseTokenIds || licenseTokenIds.length === 0) {
          throw new Error("Failed to mint license token - no token IDs returned");
        }

        // Register derivative IP using the parent IP and the correct license terms ID
        storyResponse = await registerDerivativeIP(
          parentId as `0x${string}`,
          ipMetadataUri,
          process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as `0x${string}`,
          ipMetadataHash as `0x${string}`,
          nftMetadataHash as `0x${string}`,
          nftMetadataUri,
          parseInt(activeLicenseTermsId || "1") // Use the license terms ID we retrieved from DB, fallback to 1 if undefined
        );
      } catch (licenseError: any) {
        console.error("Failed to mint license or register derivative:", licenseError);

        // Re-throw with more specific information
        throw new Error(`Failed to create remix for parent IP ${parentId}. Make sure the parent IP has commercial remix terms attached. Original error: ${licenseError.message}`);
      }
    } else {
      console.log("Processing Genesis IP registration...");

      // Determine license type from metadata or default to commercial remix
      const licenseType = metadata.licenseType || "COMMERCIAL_REMIX";
      if (licenseType === "NON_COMMERCIAL") {
        storyResponse = await registerGenesisIPNonCommercial(
          ipMetadataUri,
          process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as `0x${string}`,
          ipMetadataHash as `0x${string}`,
          nftMetadataHash as `0x${string}`,
          nftMetadataUri
        );
        activeLicenseTermsId = "2"; // Asumsi ID 2 untuk Non-Commercial
      } else {
        storyResponse = await registerGenesisIP(
          ipMetadataUri,
          process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as `0x${string}`,
          ipMetadataHash as `0x${string}`,
          nftMetadataHash as `0x${string}`,
          nftMetadataUri
        );
        // --- FIX: Ambil ID dari response jika ada ---
        if ('licenseTermsId' in storyResponse && storyResponse.licenseTermsId) {
            activeLicenseTermsId = storyResponse.licenseTermsId;
        } else {
            activeLicenseTermsId = "1";
        }
      }
    }

    const { ipId, txHash } = storyResponse;

    if (!ipId) {
      throw new Error("Failed to receive IP ID from Story Protocol");
    }

    console.log(`IP Registered: ${ipId} (Tx: ${txHash})`);

    // 4. Sync with Neo4j - Update to match GRAPH_SCHEMA.md
    console.log("Syncing with Neo4j...");

    let cypher;
    const params: any = {
      ipId: ipId,
      txHash: txHash,
      // --- FIX UTAMA ADA DI SINI: Gunakan variable yang sudah pasti ada nilainya ---
      licenseTermsId: activeLicenseTermsId || "1",
      metadataUri: ipMetadataUri,
      imageUrl: ipfsImageUri,
      title: metadata.title || metadata.name || "Untitled Asset",
      prompt: metadata.description || "", // Ensure prompt/description is saved if available
      recipient: recipient,
      parentId: parentId || forkedFrom || null,
      status: "REGISTERED",
      isRoot: !parentId, // Root assets have no on-chain parent. Forked assets are technically Root on-chain.
      createdAt: new Date().toISOString(),
    };

    if (draftId) {
      // Update existing Draft
      console.log(`Updating Draft ${draftId} to Registered IP...`);
      cypher = `
            MATCH (ip:IPAsset {id: $draftId})
            SET ip.id = $ipId, // Overwrite UUID with real IP ID
                ip.txHash = $txHash,
                ip.licenseTermsId = $licenseTermsId, // Store the license terms ID
                ip.metadataUri = $metadataUri,
                ip.imageUri = $imageUrl,
                ip.title = $title,
                ip.status = $status
            RETURN ip
        `;
      params.draftId = draftId;
    } else {
      // Create New (Following GRAPH_SCHEMA.md)
      // Logic for relationships:
      // - If parentId exists -> REMIXED_FROM
      // - If forkedFrom exists -> FORKED_FROM
      // - Else -> No parent relationship
      
      let relationshipCypher = "";
      if (parentId) {
         relationshipCypher = `
            MATCH (parent:IPAsset {id: $parentId})
            MERGE (ip)-[:REMIXED_FROM]->(parent)
         `;
      } else if (forkedFrom) {
         relationshipCypher = `
            MATCH (parent:IPAsset {id: $parentId})
            MERGE (ip)-[:FORKED_FROM {timestamp: $createdAt}]->(parent)
         `;
      }

      cypher = `
            MERGE (u:User {address: $recipient})
            CREATE (ip:IPAsset {
                id: $ipId,
                licenseTermsId: $licenseTermsId, // Store the license terms ID
                title: $title,
                prompt: $prompt,
                imageUri: $imageUrl,
                metadataUri: $metadataUri,
                txHash: $txHash,
                createdAt: $createdAt,
                isRoot: $isRoot
            })
            MERGE (u)-[:CREATED]->(ip)
            WITH ip
            ${relationshipCypher}
            RETURN ip
        `;
    }

    await session.run(cypher, params);

    return NextResponse.json({
      success: true,
      ipId: ipId,
      txHash: txHash,
      explorerUrl: `https://aeneid.storyscan.xyz/tx/${txHash}`, // Updated to show transaction instead of address
    });
  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
