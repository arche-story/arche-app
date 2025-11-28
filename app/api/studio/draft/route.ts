import { NextRequest, NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function DELETE(req: NextRequest) {
  const session = await getGraphSession();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const userAddress = searchParams.get("userAddress");

  if (!id || !userAddress) {
    return NextResponse.json(
      { error: "Missing required parameters (id, userAddress)" },
      { status: 400 }
    );
  }

  try {
    // Safety Check: Only delete if status is DRAFT and owned by user
    const cypher = `
      MATCH (n:IPAsset {id: $id})
      WHERE n.status = 'DRAFT' 
      AND EXISTS {
        MATCH (u:User {address: $userAddress})-[:CREATED]->(n)
      }
      DETACH DELETE n
      RETURN count(n) as deletedCount
    `;

    const result = await session.run(cypher, { id, userAddress });
    const deletedCount = result.records[0].get("deletedCount").toNumber();

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: "Draft not found or unauthorized or not a draft" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete Draft Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
