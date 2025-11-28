import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { v4 as uuidv4 } from "uuid";
import { ManagedTransaction } from "neo4j-driver";

export async function POST(request: Request) {
  const session = await getGraphSession();
  try {
    const body = await request.json();
    const { prompt, imageUri, parentIpId, versionOfId, userAddress } = body;

    const draftId = `draft_${uuidv4()}`;
    const timestamp = new Date().toISOString();

    // Basic query to create the Draft Node
    // If it's a REMIX (has parentIpId), we create REMIXED_FROM relationship
    // If it's a VERSION (has versionOfId), we create VERSION_OF relationship
    
    const result = await session.executeWrite(async (tx: ManagedTransaction) => {
        // 1. Merge User
        await tx.run(
            `MERGE (u:User {address: $userAddress}) 
             ON CREATE SET u.createdAt = $timestamp`,
            { userAddress, timestamp }
        );

        // 2. Create Draft IPAsset
        const createQuery = `
            CREATE (a:IPAsset {
                id: $draftId,
                status: 'DRAFT',
                prompt: $prompt,
                imageUri: $imageUri,
                createdAt: $timestamp,
                isRoot: $isRoot
            })
            WITH a
            MATCH (u:User {address: $userAddress})
            MERGE (u)-[:CREATED]->(a)
            RETURN a
        `;

        await tx.run(createQuery, {
            draftId,
            prompt,
            imageUri: imageUri || "", 
            timestamp,
            isRoot: !parentIpId,
            userAddress
        });

        // 3. Handle Relationships
        if (parentIpId) {
            await tx.run(`
                MATCH (child:IPAsset {id: $draftId})
                MATCH (parent:IPAsset {id: $parentIpId})
                MERGE (child)-[:REMIXED_FROM]->(parent)
            `, { draftId, parentIpId });
        }

        if (versionOfId) {
             await tx.run(`
                MATCH (new:IPAsset {id: $draftId})
                MATCH (old:IPAsset {id: $versionOfId})
                MERGE (new)-[:VERSION_OF]->(old)
            `, { draftId, versionOfId });
        }

        return { draftId, status: "success" };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Neo4j Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}
