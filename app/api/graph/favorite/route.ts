import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function POST(request: Request) {
  const session = await getGraphSession();
  try {
    const { userAddress, ipId } = await request.json();

    if (!userAddress || !ipId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if relationship exists
    const checkQuery = `
        MATCH (u:User {address: $userAddress})-[r:FAVORITED]->(a:IPAsset {id: $ipId})
        RETURN r
    `;
    const checkRes = await session.run(checkQuery, { userAddress, ipId });

    let isFavorited = false;

    if (checkRes.records.length > 0) {
        // Unfavorite
        const deleteQuery = `
            MATCH (u:User {address: $userAddress})-[r:FAVORITED]->(a:IPAsset {id: $ipId})
            DELETE r
        `;
        await session.run(deleteQuery, { userAddress, ipId });
        isFavorited = false;
    } else {
        // Favorite
        const createQuery = `
            MATCH (u:User {address: $userAddress})
            MATCH (a:IPAsset {id: $ipId})
            MERGE (u)-[:FAVORITED]->(a)
        `;
        await session.run(createQuery, { userAddress, ipId });
        isFavorited = true;
    }

    return NextResponse.json({ success: true, isFavorited });
  } catch (error: any) {
    console.error("Favorite API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
