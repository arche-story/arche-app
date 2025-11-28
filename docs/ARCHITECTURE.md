# Architecture Overview

Arche Story is built on a "Triad Architecture" designed to bridge the gap between ephemeral AI generation and permanent on-chain provenance.

## The Triad System

1.  **The Brain (Neo4j Graph DB)**
    *   Stores the high-fidelity relationship data that makes "provenance" visible.
    *   While blockchain stores the *fact* of ownership, Neo4j stores the *context* (ancestry trees, remix paths, visual similarity links).
    *   **Why Neo4j?** Relational databases (SQL) struggle with deep recursive queries needed to walk a "family tree" of remixed art. Graph DBs are native to this problem.

2.  **The Bridge (Next.js API Indexer)**
    *   Acts as the synchronization layer between Story Protocol and our application state.
    *   Listens for on-chain events (IP Registered, License Minted) and updates the Graph accordingly.
    *   Ensures the UI never displays stale data even if the chain is ahead.

3.  **The Visuals (Frontend & React Force Graph)**
    *   A Next.js 16 (App Router) application.
    *   Uses `react-force-graph` to render the "Constellation" of IP.
    *   Optimized with GSAP for "scrollytelling" the history of an artwork.

---

## Data Flow

The system follows a "Chain-First" write policy to ensure truth, followed by an "Index-Second" read policy for performance.

```mermaid
graph TD
    User[User / Creator] -->|1. Prompts & Generates| Studio[AI Studio UI]
    Studio -->|2. Uploads Image & Metadata| IPFS[IPFS Storage]
    Studio -->|3. Mints IP Asset| Story[Story Protocol (Aeneid)]
    
    Story -- Event: IPRegistered --> Indexer[Next.js API / Indexer]
    Indexer -->|4. Syncs Node Data| Neo4j[(Neo4j Graph DB)]
    
    User -->|5. Explores Gallery| Gallery[Gallery UI]
    Gallery -->|6. Fetches Graph Data| Neo4j
    
    subgraph "Remix Workflow"
        User2[Remixer] -->|Selects Parent IP| Story
        Story -->|Mints License Token| Story
        Story -->|Registers Derivative| Story
    end
```

---

## Database Schema (Neo4j)

The graph model is designed to track lineage and value flow.

### Nodes

#### `(:IPAsset)`
The core entity representing a piece of registered IP.
*   `id`: String (Story Protocol IP ID, e.g., `0x123...`)
*   `imageUri`: String (IPFS URL)
*   `owner`: String (Wallet Address)
*   `txHash`: String (Minting Transaction)
*   `createdAt`: DateTime

#### `(:User)`
The creator or collector.
*   `address`: String (Wallet Address, PK)
*   `username`: String (Optional ENS or Alias)

### Relationships

#### `(:User)-[:CREATED]->(:IPAsset)`
Indicates the original minter of the genesis IP.
*   `timestamp`: DateTime

#### `(:IPAsset)-[:PARENT_OF {royalty: 5%}]->(:IPAsset)`
The critical relationship defining a Remix.
*   `licenseTokenId`: String (The token authorizing the remix)
*   `royalty`: Integer (The revenue share percentage enforced on-chain)
*   `remixType`: String (e.g., "Visual Variant", "Style Transfer")

#### `(:IPAsset)-[:LICENSED_TO]->(:User)`
Represents a user holding a purely commercial license without creating a derivative (e.g., for merchandise).
