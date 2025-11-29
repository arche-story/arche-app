# Graph Schema Strategy

This document outlines the Neo4j graph schema for Arche Story, the "GitHub for AI Art". The schema is designed to track the provenance, licensing, and version history of IP Assets.

## Nodes (Labels)

### `User`
Represents a creator or collector interacting with the platform.
*   **Properties:**
    *   `address` (String, PK): Ethereum wallet address.
    *   `username` (String, Optional): ENS name or custom alias.
    *   `createdAt` (DateTime): When the user first interacted.

### `IPAsset`
Represents a registered Intellectual Property on Story Protocol.
    properties:
      id: String (Unique ID / Contract Address)
      title: String (Name of the asset)
      prompt: String (The text prompt used to generate)
      imageUri: String (IPFS URI or URL)
      createdAt: DateTime
      status: StringEnum ('DRAFT', 'REGISTERED')
      txHash: String (Optional, transaction hash of registration)



## Relationships

### `(:User)-[:OWNS]->(:IPAsset)`
Indicates current ownership of the IP Asset.
*   **Properties:**
    *   `since` (DateTime): When the ownership started.

### `(:User)-[:CREATED]->(:IPAsset)`
Indicates the original creator (minter) of the IP Asset. This link is permanent even if ownership changes.
*   **Properties:**
    *   `timestamp` (DateTime): When the creation occurred.

### `(:IPAsset)-[:REMIXED_FROM]->(:IPAsset)`
The core lineage relationship. Connects a Derivative IP to its Parent IP.
*   **Properties:**
    *   `licenseTokenId` (String): The ID of the license token used.
    *   `royaltyPercent` (Integer): The commercial revenue share (e.g., 10).
    *   `remixType` (String): E.g., "Style Transfer", "Inpainting", "Upscale".

### `(:IPAsset)-[:FORKED_FROM]->(:IPAsset)`
Represents a "Soft Link" or "Inspiration" where the new asset used the prompt/seed of the parent but did not mint a formal license (Fork).
*   **Properties:**
    *   `timestamp` (DateTime): When the fork occurred.

### `(:IPAsset)-[:VERSION_OF]->(:IPAsset)`
Used for tracking drafts or iterations that are not necessarily separate legal entities yet, or strict version control (like Git commits).
*   **Properties:**
    *   `commitMessage` (String): Description of changes.
    *   `version` (String): Semver or sequential ID (v1, v2).

## Indexes & Constraints

*   **Constraint:** `User.address` must be unique.
*   **Constraint:** `IPAsset.id` must be unique.
*   **Index:** `IPAsset.createdAt` for timeline queries.
