import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function POST(request: Request) {
  const session = await getGraphSession();
  try {
    const body = await request.json();
    const { listingId, buyerAddress, txHash } = body;

    if (!listingId || !buyerAddress || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const soldAt = new Date().toISOString();

    // 1. Mark Listing as SOLD
    // 2. Record BUYER relationship to Listing
    // 3. Transfer Ownership (Delete old OWNS, Create new OWNS)
    //    Note: If [:OWNS] doesn't exist yet (only [:CREATED]), we assume creator was owner.
    //    Ideally, we should have initialized [:OWNS] on creation, but we'll handle that logic here.
    
    const cypher = `
        MATCH (l:Listing {id: $listingId})
        MATCH (l)-[:SELLS]->(a:IPAsset)

        MERGE (buyer:User {address: $buyerAddress})

        // Update Listing Status
        SET l.status = 'SOLD',
            l.soldAt = $soldAt,
            l.buyerAddress = $buyerAddress,
            l.txHash = $txHash

        // Catat Buyer membeli Listing
        MERGE (buyer)-[:BOUGHT {txHash: $txHash, price: l.price, timestamp: $soldAt}]->(l)

        // PINDAHKAN KEPEMILIKAN ASSET (PENTING!)
        // Hapus pemilik lama (siapapun itu)
        WITH a, buyer, l
        OPTIONAL MATCH (oldOwner)-[r:OWNS]->(a)
        DELETE r

        // Set pemilik baru
        MERGE (buyer)-[:OWNS {since: $soldAt}]->(a)

        RETURN l, a
    `;

    const result = await session.run(cypher, {
      listingId,
      buyerAddress,
      txHash,
      soldAt
    });

    if (result.records.length === 0) {
      throw new Error("Listing not found or Asset not attached properly.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Buy Asset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
