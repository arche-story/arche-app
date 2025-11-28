# Story Protocol Integration

Arche Story does not just "write to blockchain" as an afterthought. The application logic is tightly coupled with **Story Protocol (Aeneid Testnet)** to ensure that every edge in our graph corresponds to a legally enforceable on-chain right.

## Smart Contract Interactions

We utilize the Story Protocol SDK to manage the full lifecycle of an IP Asset.

### 1. Genesis: Minting & Registration
When a user generates a new image, we atomically mint an NFT and register it as an IP Asset with **Programmable IP License (PIL)** terms attached.

```typescript
// arche-fe/lib/story/mint.ts
import { client } from "./client";
import { PILFlavor } from "@story-protocol/core-sdk";

export async function mintGenesisIP(metadataUri: string, nftContract: string) {
  const response = await client.ipAsset.registerIpAsset({
    nft: { 
      type: "mint", 
      spgNftContract: nftContract 
    },
    licenseTermsData: [
      {
        // We attach Commercial Remix terms by default for the Hackathon
        terms: PILFlavor.commercialRemix({
          commercialRevShare: 10, // 10% Royalty to creator
          defaultMintingFee: 0n,
          currency: "0x1514..." // $WIP Token
        }),
        maxLicenseTokens: 1000,
      }
    ],
    ipMetadata: {
      ipMetadataURI: metadataUri,
      ipMetadataHash: "0x...", // Keccak256 hash of the JSON
      nftMetadataURI: metadataUri,
      nftMetadataHash: "0x..." 
    }
  });
  
  return response.ipId;
}
```

### 2. Remix: License Tokens & Derivatives
The core innovation of Arche is the "Remix". To remix an image, a user must first hold a **License Token** from the parent.

**Step A: Buy/Mint License**
```typescript
// arche-fe/lib/story/license.ts
const licenseResponse = await client.license.mintLicenseTokens({
  licensorIpId: parentIpId, 
  licenseTermsId: "1", // ID of the specific terms (e.g., Commercial Remix)
  amount: 1,
  maxRevenueShare: 100, 
});
const licenseTokenId = licenseResponse.licenseTokenIds[0];
```

**Step B: Register Derivative**
Once the license is held, the new IP is registered as a derivative, locking in the provenance chain.
```typescript
const derivativeResponse = await client.ipAsset.registerDerivativeIp({
  licenseTokenIds: [licenseTokenId],
  // ... details of the new child IP
});
```

---

## The "Journey" Metadata

To prove that an asset was AI-generated and to track the "DNA" of the idea, we attach a strictly typed JSON schema to the `ipMetadataURI`. This is what we call the **Proof of Creation**.

```json
{
  "title": "Cyberpunk Monk #42",
  "description": "A remix of Monk #10 utilizing a neon-noir style transfer.",
  "created_at": "2024-05-20T10:00:00Z",
  "arche_type": "REMIX", // or "GENESIS"
  "ai_context": {
    "model": "Stable Diffusion XL",
    "prompt": "Cyberpunk monk meditating in rain, neon lights, 8k resolution",
    "negative_prompt": "blur, low quality, distorted",
    "seed": 123456789,
    "guidance_scale": 7.5
  },
  "parent_context": {
    "parent_ip_id": "0xParentAddress...",
    "transformation_method": "img2img"
  },
  "app_context": {
    "version": "arche-v1.0",
    "engine": "arche-gen-engine"
  }
}
```

This metadata allows our Indexer to reconstruct the "Recipe" of the image, enabling others to not just view the result, but learn from the prompt engineering history.
