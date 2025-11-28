import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const session = await getGraphSession();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // Graph Topology Query
    const cypher = `
      MATCH (a:IPAsset)
      WHERE a.status = 'REGISTERED' 
      AND (toLower(a.prompt) CONTAINS toLower($query) OR $query = '')
      
      // Fetch the node details
      OPTIONAL MATCH (ownerUser:User)-[:CREATED]->(a)
      
      // Find optional relationships to parents (to build links)
      OPTIONAL MATCH (a)-[:REMIXED_FROM]->(parent:IPAsset)
      
      RETURN 
        a.id as id, 
        a.imageUri as imageUri, 
        a.prompt as prompt, 
        a.createdAt as createdAt,
        ownerUser.address as owner, // Return owner's address
        parent.id as parentId
      ORDER BY a.createdAt DESC
      LIMIT 100
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { query });
      
      const nodes = new Map();
      const links: { source: string; target: string }[] = [];

      res.records.forEach((record: Record) => {
        const id = record.get("id");
        const parentId = record.get("parentId");
        
        // Add Node if not already present
        if (!nodes.has(id)) {
            nodes.set(id, {
                id: id,
                imageUri: record.get("imageUri"),
                prompt: record.get("prompt"),
                createdAt: record.get("createdAt"),
                owner: record.get("owner"), // Include owner
                // Simple heuristic: if it has a parent, it's a Remix, else Genesis
                type: parentId ? "REMIX" : "GENESIS"
            });
        }

        // Add Link if parent exists
        if (parentId) {
            links.push({
                source: parentId, // Parent is source
                target: id        // Child is target
            });
        }
      });

      return {
        nodes: Array.from(nodes.values()),
        links: links
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}
