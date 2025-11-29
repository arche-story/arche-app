import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const session = await getGraphSession();
  try {
    const body = await request.json();
    const { ipId, price, sellerAddress } = body;

    if (!ipId || !price || !sellerAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listingId = `listing_${uuidv4()}`;
    const createdAt = new Date().toISOString();

    // Create Listing Node and connect to User (Seller) and IPAsset
    const cypher = `
      MATCH (u:User {address: $sellerAddress})
      MATCH (a:IPAsset {id: $ipId})
      
      // Create Listing
      CREATE (l:Listing {
        id: $listingId,
        price: $price,
        currency: 'WIP', 
        status: 'ACTIVE',
        createdAt: $createdAt
      })
      
      // Create Relationships
      MERGE (u)-[:LISTED]->(l)
      MERGE (l)-[:SELLS]->(a)
      
      RETURN l
    `;

    await session.run(cypher, {
      sellerAddress,
      ipId,
      listingId,
      price,
      createdAt
    });

    return NextResponse.json({ success: true, listingId });
  } catch (error: any) {
    console.error("Create Listing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
