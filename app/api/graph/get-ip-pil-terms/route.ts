import { NextRequest, NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction } from "neo4j-driver";

export async function GET(request: NextRequest) {
  const session = await getGraphSession();

  try {
    const { searchParams } = new URL(request.url);
    const ipId = searchParams.get("ipId");

    if (!ipId) {
      return NextResponse.json({ error: "IP ID is required" }, { status: 400 });
    }

    // Query IP asset and its attached license terms from the graph database
    const cypher = `
      MATCH (ip:IPAsset {id: $ipId})
      RETURN 
        ip.id as id,
        ip.licenseTermsId as licenseTermsId,
        ip.createdAt as createdAt,
        ip.isRoot as isRoot,
        ip.status as status
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { ipId });
      return res.records[0];
    });

    if (!result) {
      return NextResponse.json({ error: "IP Asset not found" }, { status: 404 });
    }

    // Return the IP information including the license terms ID
    return NextResponse.json({
      success: true,
      ipAsset: {
        id: result.get("id"),
        licenseTermsId: result.get("licenseTermsId") || "1",
        createdAt: result.get("createdAt"),
        isRoot: result.get("isRoot"),
        status: result.get("status"),
      }
    });
  } catch (error: any) {
    console.error("Error fetching IP PIL terms:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}