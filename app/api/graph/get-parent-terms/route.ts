import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction } from "neo4j-driver";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentIpId = searchParams.get("ipId");
  
  if (!parentIpId) {
    return NextResponse.json({ error: "IP ID is required" }, { status: 400 });
  }
  
  const session = await getGraphSession();
  
  try {
    // Query to get the license terms information from the parent IP
    // We'll return the default license terms info that was attached during genesis registration
    const cypher = `
      MATCH (ip:IPAsset {id: $parentIpId})
      RETURN 
        ip.id as id,
        ip.licenseTermsId as licenseTermsId,
        ip.licenseType as licenseType,
        ip.isRoot as isRoot,
        ip.createdAt as createdAt
    `;
    
    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { parentIpId });
      
      if (res.records.length === 0) {
        return null;
      }
      
      const record = res.records[0];
      return {
        id: record.get("id"),
        licenseTermsId: record.get("licenseTermsId") || 1, // Default to 1 if not stored
        licenseType: record.get("licenseType") || "COMMERCIAL_REMIX",
        isRoot: record.get("isRoot"),
        createdAt: record.get("createdAt"),
      };
    });

    if (!result) {
      return NextResponse.json({ error: "Parent IP not found" }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching parent IP terms:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await session.close();
  }
}