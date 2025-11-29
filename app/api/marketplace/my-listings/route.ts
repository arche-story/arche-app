import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function GET(request: Request) {
  const session = await getGraphSession();
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json({ error: "Missing userAddress parameter" }, { status: 400 });
    }

    // Fetch all listings by this user
    const cypher = `
      MATCH (u:User {address: $userAddress})-[:LISTED]->(l:Listing)-[:SELLS]->(a:IPAsset)
      WHERE l.status IN ['ACTIVE', 'SOLD', 'CANCELLED']
      RETURN
        l.id as listingId,
        l.price as price,
        l.currency as currency,
        l.status as status,
        l.createdAt as createdAt,
        a.id as assetId,
        a.title as title,
        a.prompt as prompt,
        a.imageUri as imageUri,
        a.name as name
      ORDER BY l.createdAt DESC
    `;

    const result = await session.run(cypher, {
      userAddress
    });

    const listings = result.records.map((record: any) => ({
      listingId: record.get("listingId"),
      price: record.get("price"),
      currency: record.get("currency"),
      status: record.get("status"),
      createdAt: record.get("createdAt"),
      asset: {
        id: record.get("assetId"),
        title: record.get("title"),
        prompt: record.get("prompt"),
        imageUri: record.get("imageUri"),
        name: record.get("name"),
      }
    }));

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("My Listings Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}