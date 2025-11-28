# Arche Story

**The Origin of Every Idea.**
*The "GitHub for AI Art" — Tracking the full lifecycle of creativity from Genesis to Remix.*

---

## The Problem
AI Art has a "disconnected JPEG" problem.
1.  **No Provenance:** Millions of images are generated, but their origin, prompts, and seeds are lost.
2.  **No Credit:** When someone takes an AI image and improves it (img2img), the original creator gets zero recognition.
3.  **No Rights:** "Right Click Save" is the only distribution model.

## The Solution
**Arche** is a provenance layer for AI creativity. We use **Story Protocol** to turn every generation into an IP Asset and **Neo4j** to visualize the "Family Tree" of art.

We don't just generate images; we generate enforceable, on-chain IP rights that travel with the asset as it gets remixed, shared, and monetized.

---

## Key Features

### 🧬 The Remix Station
Stop starting from scratch. Pick any IP in the Arche ecosystem and "Remix" it.
*   Inherit the parent's prompts and settings.
*   Automatically mint a **License Token** from the parent.
*   Register your new work as a **Derivative IP**, securing a royalty stream for the original creator.

### 🌌 The Graph Gallery
Explore the "Constellation" of creativity.
*   Visualized using Force-Directed Graphs.
*   See exactly which images spawned which trends.
*   Click a node to see its ancestors (Parents) and descendants (Remixes).

### 📜 Programmable IP (PIL)
Every asset comes with terms attached.
*   **Commercial Remix:** Allow others to monetize derivatives of your work (with royalties).
*   **Non-Commercial:** strictly for personal use.
*   Enforced automatically by the Story Protocol blockchain.

---

## Setup & Installation

### Prerequisites
*   Node.js v20+
*   Neo4j Database (AuraDB or Local)
*   Wallet with Story Protocol Testnet (Aeneid) funds ($IP)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/arche-fe.git
cd arche-fe
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root:

```bash
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# Story Protocol (Aeneid Testnet)
NEXT_PUBLIC_STORY_RPC=https://aeneid.storyrpc.io
WALLET_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc

# Phase 2 Configuration
NEXT_PUBLIC_WIP_TOKEN_ADDRESS=0x1514000000000000000000000000000000000000
NEXT_PUBLIC_DEFAULT_MINTING_FEE=0
NEXT_PUBLIC_COMMERCIAL_REV_SHARE=5

# IPFS (Pinata)
PINATA_JWT=your_pinata_jwt
```

### 3. Run Local Dev
```bash
npm run dev
```
Visit `http://localhost:3000` to start your journey.

---

## Tech Stack
*   **Frontend:** Next.js 16, Tailwind CSS 4, GSAP
*   **Database:** Neo4j (Graph DB)
*   **Blockchain:** Story Protocol (Aeneid Testnet)
*   **Visualization:** React Force Graph
