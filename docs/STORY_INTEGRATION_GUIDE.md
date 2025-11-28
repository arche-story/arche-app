# Story Protocol Integration Guide

## Technical Deep Dive

Arche Story leverages Story Protocol as the foundational blockchain layer for IP registration, licensing, and royalty distribution. This guide details how we implement Story Protocol's core modules and map blockchain events to our Graph Database schema.

## Core Story Protocol Modules

### 1. IP Asset Registry (Minting)

#### Functionality
The IP Asset Registry enables the creation of IP Assets (IPAs) on the Story Protocol blockchain. Each IPA represents a unique piece of intellectual property with associated metadata and ownership rights.

#### Implementation in Arche Story
```typescript
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { useWalletClient } from 'wagmi';
import { custom, toHex } from 'viem';

// Initialize client with connected wallet
const config: StoryConfig = {
  wallet: wallet,
  transport: custom(wallet.transport),
  chainId: "aeneid", // Aeneid Testnet
};

const client = StoryClient.newClient(config);

// Register IP Asset
const registerIpAsset = async (nftContract: string, tokenId: string, metadata: any) => {
  const response = await client.ipAsset.register({
    nftContract: nftContract,
    tokenId: tokenId,
    ipMetadata: {
      ipMetadataURI: metadata.uri || "ipfs://default-uri",
      ipMetadataHash: toHex(metadata.hash, { size: 32 }),
      nftMetadataURI: metadata.nftUri || "ipfs://nft-uri",
      nftMetadataHash: toHex(metadata.nftHash, { size: 32 }),
    },
    txOptions: {
      waitForTransaction: true,
    },
  });
  
  return response;
};
```

#### Event Mapping to Graph Database
When an IP asset is registered, the following blockchain event is captured:
- `IPRegistered` event with `ipId`, `nftContract`, `tokenId`, and metadata

This event triggers the creation of a new node in the graph database with:
- Node type: `IPAsset`
- Properties: `ipId`, `nftContract`, `tokenId`, `metadataHash`, `timestamp`, `creator`
- Relationships: Connected to user account as `CREATED_BY`

### 2. Licensing Module (Minting License Tokens)

#### Functionality
The Licensing Module enables the minting of License Tokens representing usage rights to IP Assets. These licenses define what can be done with the IP (commercial vs non-commercial use).

#### Implementation in Arche Story
```typescript
// Mint License Token
const mintLicense = async (ipId: string, licenseTerms: any) => {
  const response = await client.license.mintLicenseTokens({
    ipId: ipId,
    licenseTemplate: licenseTerms.template, // PIL template address
    licenseTerms: licenseTerms.terms,       // Specific terms
    amount: 1,
    txOptions: {
      waitForTransaction: true,
    },
  });
  
  return response;
};
```

#### Event Mapping to Graph Database
When a license token is minted, the following events are processed:
- `LicenseTokensMinted` with `licensorIpId`, `receiver`, `licenseTemplate`, and `terms`

This creates relationships in the graph database:
- From: IP Asset node
- To: User account node or new IP Asset node (if for remixing)
- Relationship type: `LICENSED_TO` with properties `licenseType`, `terms`, `timestamp`, `amount`

### 3. Royalty Module (Revenue Sharing)

#### Functionality
The Royalty Module enables revenue sharing between IP creators and licensees. When revenue is generated from licensed IP, the module ensures proper distribution based on pre-defined terms.

#### Implementation in Arche Story
```typescript
// Calculate and claim revenue
const claimRevenue = async (ipId: string, revenue: number) => {
  const response = await client.royalty.claimRevenue({
    ipId: ipId,
    revenueToken: revenueTokenAddress, // Address of the token used for revenue
    txOptions: {
      waitForTransaction: true,
    },
  });
  
  return response;
};
```

#### Event Mapping to Graph Database
Revenue events create tracking in the graph database:
- `RevenueClaimed` events with `ipId`, `claimer`, `amount`, and `token`
- Updates relationship properties to track cumulative revenue
- Creates `REVENUE_TRANSFER` relationships showing flow from derivative to original IP

### 4. Dispute Module (Handling IP conflicts)

#### Functionality
The Dispute Module provides mechanisms to resolve IP conflicts through on-chain dispute resolution processes.

#### Implementation in Arche Story
```typescript
// Raise a dispute
const raiseDispute = async (disputedIpId: string, evidence: any) => {
  const response = await client.dispute.raiseDispute({
    disputedIpId: disputedIpId,
    evidenceHash: toHex(evidence.hash, { size: 32 }),
    txOptions: {
      waitForTransaction: true,
    },
  });
  
  return response;
};
```

#### Event Mapping to Graph Database
Dispute events create special nodes and relationships:
- `Dispute` node with properties: `disputedIpId`, `evidenceHash`, `status`, `timestamp`
- `DISPUTED_IP` relationship connecting to the IP asset in question
- `EVIDENCE_LINK` relationships to supporting IP assets or metadata

## Indexing Strategy

### Optimistic Indexing Flow

1. **Frontend Event**: User registers IP asset, mints license, or performs other Story Protocol action
2. **Blockchain Transaction**: Transaction is submitted and confirmed on Story Protocol
3. **Event Listening**: Our indexer monitors for specific Story Protocol contract events
4. **Graph Database Update**: The indexer processes events and updates the Neo4j/PostgreSQL schema
5. **UI Sync**: Updated graph data is served to the frontend for visualization

### Smart Contract Events We Listen To

- `IPRegistered`: When new IP assets are created
- `LicenseTokensMinted`: When usage licenses are granted
- `IPAssetAttachedToIP`: When derivative works are registered
- `RevenueClaimed`: When revenue is distributed
- `DisputeRaised`: When IP conflicts are reported

### Graph Schema Mapping

#### Node Types
- `IPAsset`: Represents individual IP assets
- `User`: Represents creators and licensees
- `License`: Represents licensing agreements
- `Dispute`: Represents IP conflicts
- `RevenueTransfer`: Represents revenue flow between IPs

#### Relationship Types
- `CREATED_BY`: Connects IPAsset to User
- `LICENSED_TO`: Connects IPAsset to User/License with terms
- `DERIVED_FROM`: Connects derivative IPAsset to parent IPAsset
- `DISPUTED_IP`: Connects Dispute to IPAsset
- `GENERATES_REVENUE`: Connects IPAsset to RevenueTransfer

### Error Handling and Recovery

- Transaction failures are caught and logged
- Failed indexing operations trigger retries with exponential backoff
- Blockchain reorgs are handled by maintaining transaction confirmations
- Backup mechanisms ensure data consistency during network issues

## Security Considerations

- All blockchain interactions require user wallet approval
- Private keys are never stored in the frontend
- JSON-RPC account pattern ensures secure user transactions
- Smart contract calls are validated against known Story Protocol contract addresses