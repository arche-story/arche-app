import { NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";
import { ManagedTransaction, Record } from "neo4j-driver";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("userAddress");

  if (!userAddress) {
    return NextResponse.json({ error: "User address required" }, { status: 400 });
  }

  const session = await getGraphSession();
  try {
    const result = await session.executeRead(async (tx: ManagedTransaction) => {
        const query = `
            MATCH (u:User {address: $userAddress})-[:CREATED]->(a:IPAsset)
            RETURN a.id as id, a.status as status, a.createdAt as createdAt, a.prompt as prompt, a.imageUri as imageUri, a.txHash as txHash
            ORDER BY a.createdAt DESC
        `;
        const res = await tx.run(query, { userAddress });
        
        const drafts: { id: string; status: string; createdAt: string; prompt: string; imageUri: string; txHash: string }[] = [];
        const registered: { id: string; status: string; createdAt: string; prompt: string; imageUri: string; txHash: string }[] = [];

        res.records.forEach((record: Record) => {
            const item = {
                id: record.get('id'),
                status: record.get('status'),
                createdAt: record.get('createdAt'),
                prompt: record.get('prompt'),
                imageUri: record.get('imageUri'),
                txHash: record.get('txHash'),
            };

            if (item.status === 'REGISTERED') {
                registered.push(item);
            } else {
                drafts.push(item);
            }
        });

        return { drafts, registered };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await session.close();
  }
}
