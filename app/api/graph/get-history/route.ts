import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("userAddress");
  const contextId = searchParams.get("contextId"); // Optional: Asset ID to filter lineage

  if (!userAddress) {
    return NextResponse.json({ error: "User address required" }, { status: 400 });
  }

  const session = await getGraphSession();
  try {
    const result = await session.executeRead(async (tx: ManagedTransaction) => {
        let query;
        let params: any = { userAddress };

        if (contextId) {
            // Contextual History: Find all versions connected to this asset
            // Note: This is a simple traversal (up and down VERSION_OF)
            // It finds all nodes in the same connected component of VERSION_OF relationships
            // Limit to nodes created by the user to be safe
            query = `
                MATCH (start:IPAsset {id: $contextId})
                MATCH (u:User {address: $userAddress})
                
                // Find all connected versions (undirected traversal)
                // We use *0.. to include the start node itself
                MATCH (start)-[:VERSION_OF*0..]-(related:IPAsset)
                
                // Ensure ownership
                WHERE (u)-[:CREATED]->(related)
                
                RETURN related.id as id, related.status as status, related.createdAt as createdAt, related.prompt as prompt, related.imageUri as imageUri
                ORDER BY related.createdAt DESC
            `;
            params.contextId = contextId;
        } else {
            // Global History (Dashboard): All assets created by user
            // FILTER: Only show "Head" nodes (Latest versions)
            // A "Head" node is one that has NO incoming VERSION_OF relationship from another node created by the user.
            // i.e., No newer draft points to it.
            query = `
                MATCH (u:User {address: $userAddress})-[:CREATED]->(a:IPAsset)
                WHERE NOT EXISTS {
                    MATCH (u)-[:CREATED]->(:IPAsset)-[:VERSION_OF]->(a)
                }
                RETURN a.id as id, a.status as status, a.createdAt as createdAt, a.prompt as prompt, a.imageUri as imageUri
                ORDER BY a.createdAt DESC
            `;
        }

        const res = await tx.run(query, params);
        return res.records.map((record: Record) => ({
            id: record.get('id'),
            status: record.get('status'),
            createdAt: record.get('createdAt'),
            label: record.get('status') === 'DRAFT' ? `Draft: ${record.get('prompt')?.substring(0, 15)}...` : 'Registered IP',
            prompt: record.get('prompt'),
            imageUri: record.get('imageUri')
        }));
    });

    return NextResponse.json({ versions: result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}