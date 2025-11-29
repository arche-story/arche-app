import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const session = await getGraphSession();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "ALL"; // ALL, GENESIS, REMIX, MINE
    const sort = searchParams.get("sort") || "NEWEST"; // NEWEST, OLDEST, POPULAR
    const userAddress = searchParams.get("owner") || "";

    // Construct Dynamic Cypher Query
    let whereClause = "WHERE a.status = 'REGISTERED' AND (toLower(a.prompt) CONTAINS toLower($query) OR toLower(a.title) CONTAINS toLower($query) OR $query = '')";
    
    // Apply Filters
    if (filter === "GENESIS") {
      // Genesis has no parent
      whereClause += " AND NOT (a)-[:REMIXED_FROM]->()";
    } else if (filter === "REMIX") {
      // Remix has a parent
      whereClause += " AND (a)-[:REMIXED_FROM]->()";
    } else if (filter === "MINE" && userAddress) {
      whereClause += " AND ownerUser.address = $userAddress";
    }

    // Determine Sort Order
    let orderByClause = "ORDER BY a.createdAt DESC";
    if (sort === "OLDEST") {
      orderByClause = "ORDER BY a.createdAt ASC";
    } else if (sort === "POPULAR") {
      orderByClause = "ORDER BY remixCount DESC, a.createdAt DESC";
    }

    const cypher = `
      MATCH (a:IPAsset)
      // Match owner early if needed for filtering, or optional match
      MATCH (ownerUser:User)-[:CREATED]->(a)
      
      // Check for parent relationship
      OPTIONAL MATCH (a)-[:REMIXED_FROM]->(parent:IPAsset)

      // Count remixes (children) for popularity sort
      OPTIONAL MATCH (child:IPAsset)-[:REMIXED_FROM]->(a)
      WITH a, ownerUser, parent, count(child) as remixCount
      
      ${whereClause}
      
      RETURN 
        a.id as id, 
        a.imageUri as imageUri, 
        a.prompt as prompt,
        a.title as title,
        a.createdAt as createdAt,
        ownerUser.address as owner, 
        parent.id as parentId,
        remixCount
      ${orderByClause}
      LIMIT 100
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { query, userAddress });
      
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
                title: record.get("title") || record.get("prompt"), // Fallback to prompt if title is missing
                createdAt: record.get("createdAt"),
                owner: record.get("owner"),
                type: parentId ? "REMIX" : "GENESIS",
                remixCount: record.get("remixCount").toNumber()
            });
        }

        // Add Link if parent exists.
        // Note: In a filtered view, the parent might not be in the 'nodes' map if it was filtered out.
        // The Graph visualizer usually handles this by ignoring links to missing nodes, 
        // or we should check if both exist. For now, we push it, and the frontend graph lib often handles it or we filter there.
        if (parentId) {
            links.push({
                source: parentId,
                target: id
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
