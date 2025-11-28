import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const session = await getGraphSession();
  try {
    const { searchParams } = new URL(request.url);
    const ipId = searchParams.get("ipId");
    
    if (!ipId) {
      return NextResponse.json({ error: "IP ID is required" }, { status: 400 });
    }

    // Query to get specific IP Asset details
    const cypher = `
      MATCH (ip:IPAsset {id: $ipId})
      OPTIONAL MATCH (ip)-[:CREATED_BY]->(user:User)
      RETURN
        ip.id as id,
        ip.imageUri as imageUri,
        ip.metadataUri as metadataUri,
        ip.txHash as txHash,
        ip.name as name,
        ip.createdAt as createdAt,
        ip.isRoot as isRoot,
        user.address as creator
    `;

    const result = await session.executeRead(async (tx: ManagedTransaction) => {
      const res = await tx.run(cypher, { ipId });
      
      if (res.records.length === 0) {
        return { nodes: [] };
      }

      const record = res.records[0];
      const ipAsset = {
        id: record.get("id"),
        imageUri: record.get("imageUri"),
        metadataUri: record.get("metadataUri"),
        txHash: record.get("txHash"),
        name: record.get("name"),
        createdAt: record.get("createdAt"),
        isRoot: record.get("isRoot"),
        creator: record.get("creator"),
        metadata: null // We can potentially fetch more detailed metadata from IPFS
      };

      return {
        nodes: [ipAsset]
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}