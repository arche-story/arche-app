# Phase 2: Story Protocol Integration & Finishing

This document outlines the technical implementation plan to complete the integration of Story Protocol into Arche.

## 🎯 Objectives

1.  **True Genesis Minting:** Implement `mintAndRegisterIpAssetWithPilTerms` to atomically mint an NFT, register it as an IP Asset, and attach commercial/non-commercial license terms in a single transaction.
2.  **Remix Workflow:** Implement the "License -> Derivative" flow where a user must hold a license token from a parent IP to register a "child" IP.
3.  **Royalty Logic:** Ensure the commercial remix terms specify a revenue share (e.g., 10%) that flows back to the original creator.

## 🛠️ Technical Implementation

### 1. Genesis Minting (Server-Side)

We will use the `IpAsset` module from `@story-protocol/core-sdk`.

**Function:** `mintAndRegisterIpAndAttachPILTerms` (via SDK wrapper)

**Parameters:**
- `spgNftContract`: The address of our NFT collection contract on Aeneid.
- `ipMetadata`:
    - `ipMetadataURI`: IPFS URI containing the "Proof of Creation" (Prompt, Seed, Model).
    - `ipMetadataHash`: Keccak256 hash of the JSON file.
    - `nftMetadataURI`: IPFS URI for the visual NFT (Image).
    - `nftMetadataHash`: Keccak256 hash of the Image.
- `licenseTerms`:
    - `type`: `PILFlavor.COMMERCIAL_REMIX` (or `NON_COMMERCIAL`).
    - `terms`: { `commercialRevShare`: 10, `currency`: $WIP, ... }

### 2. Remixing (The Derivative Flow)

**Step A: Acquire License**
Before a user can remix, they need a License Token.
- **Action:** Call `client.license.mintLicenseTokens`.
- **Input:** `licensorIpId` (Parent IP), `licenseTermsId` (The specific terms selected).

**Step B: Register Derivative**
Once the license is held (or minted atomically), register the new IP.
- **Action:** Call `client.ipAsset.registerDerivativeIp`.
- **Input:** 
    - `licenseTokenIds`: [ID of the token from Step A].
    - `childIpId`: The ID of the new "Remix" IP asset.

### 3. Data Sync (Indexer)

We need to ensure Neo4j reflects the on-chain reality.
- **Event Listener:** Listen for `IPRegistered` and `IPAssetAttachedToIP`.
- **Graph Update:** 
    - Create `(:IPAsset)` node.
    - Create `[:REMIXED_FROM]` relationship if it's a derivative.

## 📝 Task Checklist

### Backend / Library (`lib/story/`)
- [ ] `register-genesis.ts`: Implement `registerGenesisIP` function.
- [ ] `register-derivative.ts`: Implement `registerDerivativeIP` function.
- [ ] `license.ts`: Implement `mintLicenseToken` function.

### API Routes (`app/api/story/`)
- [ ] `POST /api/story/register`: Update to handle both "Genesis" and "Remix" types.
    - If Genesis: Call `registerGenesisIP`.
    - If Remix: Call `registerDerivativeIP`.

### Frontend (`app/studio/`)
- [ ] **Studio UI:** Connect "Sign on Story" button to the new API route.
- [ ] **Remix Mode:** Pass `parentIpId` to the API when in Remix mode.

## 🔗 Reference: Story Protocol Aeneid

- **RPC:** `https://aeneid.storyrpc.io`
- **Chain ID:** `1315`
- **Explorer:** `https://aeneid.storyscan.xyz`
- **Faucet:** `https://faucet.story.foundation`
