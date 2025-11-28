import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataJWT = process.env.PINATA_JWT;
    if (!pinataJWT) {
      return NextResponse.json({ error: "Server configuration error: Missing PINATA_JWT" }, { status: 500 });
    }

    // Forward the file to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
      body: pinataFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Pinata upload failed: ${errorText}`);
    }

    const data = await res.json();
    const ipfsUri = `ipfs://${data.IpfsHash}`;

    return NextResponse.json({ 
      success: true, 
      ipfsUri: ipfsUri,
      gatewayUrl: `https://ipfs.io/ipfs/${data.IpfsHash}` 
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
