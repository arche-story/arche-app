import { NextRequest, NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ipId = searchParams.get("ipId");
  const session = await getGraphSession();

  try {
    if (!ipId) {
      return NextResponse.json(
        { error: "IP ID is required" },
        { status: 400 }
      );
    }

    // Verify that the IP exists and is registered
    const cypher = `
      MATCH (ip:IPAsset {id: $ipId})
      WHERE ip.status = 'REGISTERED'
      
      RETURN
        ip.id as id,
        ip.imageUri as imageUri,
        ip.name as name,
        ip.createdAt as createdAt,
        ip.isRoot as isRoot,
        'REGISTERED' as status
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { ipId });
      
      if (res.records.length === 0) {
        return null;
      }

      const record: Record = res.records[0];
      return {
        id: record.get("id"),
        imageUri: record.get("imageUri"),
        name: record.get("name"),
        createdAt: record.get("createdAt"),
        isRoot: record.get("isRoot"),
        status: record.get("status"),
      };
    });

    if (!result) {
      return NextResponse.json(
        { error: "IP Asset not found or not registered" },
        { status: 404 }
      );
    }

    // Return success - IP is valid for remix
    return NextResponse.json({
      success: true,
      ipAsset: result,
    });
  } catch (error: any) {
    console.error("Error validating remix:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ipId = searchParams.get("ipId");
  const session = await getGraphSession();

  try {
    if (!ipId) {
      return NextResponse.json(
        { error: "IP ID is required" },
        { status: 400 }
      );
    }

    // Verify the IP exists and is registered, then return details for remix
    const cypher = `
      MATCH (ip:IPAsset {id: $ipId})
      WHERE ip.status = 'REGISTERED'
      
      RETURN
        ip.id as id,
        ip.imageUri as imageUri,
        ip.name as name,
        ip.createdAt as createdAt
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { ipId });
      
      if (res.records.length === 0) {
        return null;
      }

      const record: Record = res.records[0];
      return {
        id: record.get("id"),
        imageUri: record.get("imageUri"),
        name: record.get("name"),
        createdAt: record.get("createdAt"),
      };
    });

    if (!result) {
      return NextResponse.json(
        { error: "IP Asset not found or not registered" },
        { status: 404 }
      );
    }

    // In a real implementation, we might also:
    // 1. Log the remix initiation
    // 2. Validate user permissions
    // 3. Create a remix session ID

    return NextResponse.json({
      success: true,
      remixData: {
        parentIpId: result.id,
        parentImageUri: result.imageUri,
        parentName: result.name,
      }
    });
  } catch (error: any) {
    console.error("Error initiating remix:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}