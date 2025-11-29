import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function GET(request: Request) {
  const session = await getGraphSession();
  try {
    // Fetch all ACTIVE listings
    // Return: Listing ID, Price, Asset Details (Image, Title, ID), Seller Address
    const cypher = `
      MATCH (seller:User)-[:LISTED]->(l:Listing {status: 'ACTIVE'})-[:SELLS]->(a:IPAsset)
      RETURN 
        l.id as listingId, 
        l.price as price, 
        l.createdAt as createdAt,
        a.id as assetId, 
        a.title as title, 
        a.prompt as prompt,
        a.imageUri as imageUri,
        seller.address as sellerAddress,
        seller.username as sellerName
      ORDER BY l.createdAt DESC
    `;

    const result = await session.run(cypher);

    const listings = result.records.map((record: any) => ({
      listingId: record.get("listingId"),
      price: record.get("price"),
      createdAt: record.get("createdAt"),
      asset: {
        id: record.get("assetId"),
        title: record.get("title"),
        prompt: record.get("prompt"),
        imageUri: record.get("imageUri"),
      },
      seller: {
        address: record.get("sellerAddress"),
        username: record.get("sellerName") || "Unknown Seller"
      }
    }));

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("Marketplace Explore Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
