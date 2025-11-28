import { NextRequest, NextResponse } from "next/server";
import { getGraphSession } from "@/lib/db/graph-client";

export async function GET(req: NextRequest) {
  const session = await getGraphSession();
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    const cypher = `
      MATCH (u:User {address: $address})
      RETURN u.address as address, u.username as username, u.bio as bio, u.avatarUri as avatarUri, u.createdAt as createdAt
    `;
    const result = await session.run(cypher, { address });
    
    if (result.records.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const record = result.records[0];
    const user = {
      address: record.get("address"),
      username: record.get("username"),
      bio: record.get("bio"),
      avatarUri: record.get("avatarUri"),
      createdAt: record.get("createdAt")
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}

export async function POST(req: NextRequest) {
  const session = await getGraphSession();
  try {
    const body = await req.json();
    const { address, username, bio, avatarUri } = body;

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const cypher = `
      MERGE (u:User {address: $address})
      SET u.username = $username,
          u.bio = $bio,
          u.avatarUri = $avatarUri
      RETURN u
    `;
    
    await session.run(cypher, { address, username, bio, avatarUri });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await session.close();
  }
}
