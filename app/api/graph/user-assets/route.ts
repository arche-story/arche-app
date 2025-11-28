import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("userAddress");
  const status = searchParams.get("status"); // 'REGISTERED' | 'DRAFT' | 'ALL' (default)
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  if (!userAddress) {
    return NextResponse.json({ error: "User address required" }, { status: 400 });
  }

  const session = await getGraphSession();
  const skip = (page - 1) * limit;

  try {
    const result = await session.executeRead(async (tx: ManagedTransaction) => {
        let statusClause = "";
        if (status && status !== 'ALL') {
            statusClause = `AND a.status = $status`;
        } else if (status === 'ALL') {
             // No status filter
        } else {
             // Default behavior (legacy): fetch all but separate in JS? 
             // For pagination to work efficiently, we should stick to one mode per request if possible.
             // But to keep backward compatibility with Profile Page (which fetches both),
             // IF status is NOT provided, we return existing structure (all items, no pagination).
             
             // Let's handle the "Pagination Mode" only if 'page' or 'status' is explicitly requested differently
        }

        // LEGACY MODE (Profile Page uses this currently) - Returns { drafts: [], registered: [] }
        if (!status && !searchParams.has("page")) {
             const query = `
                MATCH (u:User {address: $userAddress})-[:CREATED]->(a:IPAsset)
                RETURN a.id as id, a.status as status, a.createdAt as createdAt, a.prompt as prompt, a.imageUri as imageUri, a.txHash as txHash, a.name as name
                ORDER BY a.createdAt DESC
            `;
            const res = await tx.run(query, { userAddress });
            
            const drafts: any[] = [];
            const registered: any[] = [];

            res.records.forEach((record: Record) => {
                const item = {
                    id: record.get('id'),
                    status: record.get('status'),
                    createdAt: record.get('createdAt'),
                    prompt: record.get('prompt'),
                    imageUri: record.get('imageUri'),
                    txHash: record.get('txHash'),
                    name: record.get('name')
                };

                if (item.status === 'REGISTERED') {
                    registered.push(item);
                } else {
                    drafts.push(item);
                }
            });
            return { drafts, registered };
        }

        // PAGINATION MODE
        let matchQuery = `MATCH (u:User {address: $userAddress})-[:CREATED]->(a:IPAsset)`;
        let whereClause = `WHERE 1=1 ${statusClause}`;

        if (status === 'FAVORITES') {
            matchQuery = `MATCH (u:User {address: $userAddress})-[:FAVORITED]->(a:IPAsset)`;
            whereClause = `WHERE 1=1`; // Clear status clause for favorites, show all
        }

        const countQuery = `
            ${matchQuery}
            ${whereClause}
            RETURN count(a) as total
        `;
        
        const dataQuery = `
            ${matchQuery}
            ${whereClause}
            RETURN 
                a.id as id, 
                a.status as status, 
                a.createdAt as createdAt, 
                a.prompt as prompt, 
                a.imageUri as imageUri, 
                a.txHash as txHash, 
                a.name as name,
                EXISTS((u)-[:FAVORITED]->(a)) as isFavorited
            ORDER BY a.createdAt DESC
            SKIP toInteger($skip) LIMIT toInteger($limit)
        `;

        const countRes = await tx.run(countQuery, { userAddress, status, skip, limit });
        const total = countRes.records[0].get("total").toNumber();

        const dataRes = await tx.run(dataQuery, { userAddress, status, skip, limit });
        const items = dataRes.records.map((record: Record) => {
            const name = record.get('name');
            const prompt = record.get('prompt');
            // If name is the default "Untitled Asset", prefer the prompt for display
            const displayLabel = (name && name !== "Untitled Asset") ? name : (prompt || "Untitled Asset");

            return {
                id: record.get('id'),
                status: record.get('status'),
                createdAt: record.get('createdAt'),
                prompt: prompt,
                imageUri: record.get('imageUri'),
                txHash: record.get('txHash'),
                name: name,
                label: displayLabel, // Use the smarter label logic
                isFavorited: record.get('isFavorited')
            };
        });

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("User Assets API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}