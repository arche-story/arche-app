# Graph Database Schema

This document defines the Neo4j schema used to track IP Assets, Users, Provenance, and Marketplace Listings.

## Nodes

### `(:User)`
Represents a wallet address interacting with the protocol.
- `address`: String (PK, Wallet Address)
- `username`: String (Optional, Display Name)
- `bio`: String (Optional)
- `avatarUri`: String (Optional, IPFS URI)
- `createdAt`: DateTime

### `(:IPAsset)`
Represents a registered IP Asset (Genesis or Derivative).
- `id`: String (PK, Story Protocol IP ID / Contract Address)
- `title`: String (Asset Name)
- `prompt`: String (AI Generation Prompt)
- `imageUri`: String (IPFS URI)
- `metadataUri`: String (IPFS URI to full JSON metadata)
- `txHash`: String (Registration Transaction Hash)
- `status`: StringEnum ('DRAFT', 'REGISTERED')
- `createdAt`: DateTime
- `isRoot`: Boolean (True if Genesis, False if Remix)
- `licenseTermsId`: String (ID of the attached license terms)

### `(:Listing)`
Represents an active or historical sell order in the marketplace.
- `id`: String (PK, Unique Listing ID, usually UUID)
- `price`: String (Price in WIP/USDC e.g., "100")
- `currency`: String (Token Address e.g., WIP Address)
- `status`: StringEnum ('ACTIVE', 'SOLD', 'CANCELLED')
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Relationships

### Ownership & Creation
- `(:User)-[:CREATED]->(:IPAsset)`: The original creator of the asset.
- `(:User)-[:OWNS]->(:IPAsset)`: The current owner of the asset (Updated on transfer/sale). *Note: For simplicity in early versions, we might infer ownership via CREATED if no transfer logic exists, but for Marketplace we must track OWNS explicitly.*

### Lineage (Provenance)
- `(:IPAsset)-[:REMIXED_FROM]->(:IPAsset)`: The child asset is a derivative of the parent.
- `(:IPAsset)-[:FORKED_FROM]->(:IPAsset)`: The child is an unauthorized fork (genesis pointing to inspiration).
- `(:IPAsset)-[:VERSION_OF]->(:IPAsset)`: Used for drafts/versions before registration.

### Social
- `(:User)-[:FAVORITED]->(:IPAsset)`: User liked an asset.

### Marketplace
- `(:User)-[:LISTED]->(:Listing)`: User created a sell order.
- `(:Listing)-[:SELLS]->(:IPAsset)`: The listing is selling this specific asset.
- `(:User)-[:BOUGHT {price: "...", txHash: "..."}]->(:Listing)`: Historical record of who bought the listing.

## Queries Example

**Get Active Marketplace Listings:**
```cypher
MATCH (seller:User)-[:LISTED]->(l:Listing {status: 'ACTIVE'})-[:SELLS]->(asset:IPAsset)
RETURN l, asset, seller
```

**Buy Asset Logic:**
1. Create BOUGHT relationship.
2. Set Listing status to SOLD.
3. Delete old OWNS relationship.
4. Create new OWNS relationship for Buyer.
