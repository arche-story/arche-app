# Arche Story - Developer & Run Guide

This guide provides step-by-step instructions for running the Arche Story application, including the Frontend, Backend, and Database components.

## 1. Prerequisites

Before you start, ensure you have the following installed:

*   **Node.js**: Version 20 or higher (`node -v`).
*   **Docker**: Installed and running (for the local Neo4j database).
*   **Git**: For cloning the repository.
*   **Wallet**: A browser wallet like Metamask installed with Story Protocol Aeneid Testnet funds ($IP).

## 2. Database Setup (Neo4j)

We use Neo4j as our Graph Database. The recommended way to run it locally is via Docker.

### Option A: Using Docker Command (Quick Start)

Run this command in your terminal to start a Neo4j instance:

```bash
docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --env NEO4J_AUTH=neo4j/password123 \
    neo4j:latest
```

*   **UI Access:** `http://localhost:7474`
*   **Bolt Port:** `7687` (Used by the app)
*   **Username:** `neo4j`
*   **Password:** `password123` (Matches default `.env.local` config)

### Option B: Using Docker Compose (Recommended for Persistence)

Create a `docker-compose.yml` file in the root directory if it doesn't exist:

```yaml
version: '3.8'
services:
  neo4j:
    image: neo4j:latest
    container_name: arche-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password123
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs
```

Then run:
```bash
docker-compose up -d
```

## 3. Application Setup (Frontend & Backend)

Arche Story is a Next.js application where the frontend and backend API run together.

### Step 1: Environment Variables

Create a `.env.local` file in the project root. You can copy `.env.example` if available, or use this template:

```bash
# --- Story Protocol ---
# Public SPG NFT Contract on Aeneid Testnet
NEXT_PUBLIC_SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io

# WIP (Wrapped IP) Token Address on Aeneid Testnet - REQUIRED for PIL terms
# Official WIP token address for Aeneid Testnet
NEXT_PUBLIC_WIP_TOKEN_ADDRESS=0x1514000000000000000000000000000000000000

# License Template Address - REQUIRED for remix functionality
NEXT_PUBLIC_LICENSE_TEMPLATE_ADDRESS=0x... # Get from deployed contracts doc

# --- Wallet & Security ---
# Private Key for Server-Side operations (Minting/Gas)
# WARNING: Use a DEV wallet with NO real funds. Must have Aeneid Testnet $IP.
WALLET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# --- IPFS (Pinata) ---
# JWT for uploading metadata and images
PINATA_JWT=YOUR_PINATA_JWT_HERE

# --- Neo4j Database ---
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 4. Workflow Verification

To ensure everything is running correctly:

1.  **Connect Wallet:** Go to `http://localhost:3000`, click "Start Creating" or use the "Connect Wallet" button. Ensure you are on the **Aeneid Testnet**.
2.  **Create Draft:** Go to Studio, enter a prompt, and click "Paint it".
    *   *Check:* Loading spinner appears, image generates (via Pollinations), and "Preview generated" toast appears.
3.  **Save Version:** Click "Commit Version".
    *   *Check:* "Saving version history..." toast appears. Data is written to Neo4j.
4.  **Register IP:** Click "Sign on Story".
    *   *Check:* Wallet prompts for signature/transaction. "IP Registered!" toast appears with ID.
    *   *Check:* Redirects to Profile page.
5.  **View Profile:**
    *   *Check:* The new asset appears under "Verified Collection".
6.  **Explore:** Go to Explore page.
    *   *Check:* The asset appears in the grid. Click "Remix" to test the remix flow.

## 5. Troubleshooting

*   **Neo4j Connection Error:** Ensure Docker container is running (`docker ps`) and credentials in `.env.local` match `NEO4J_AUTH`.
*   **"Bytes32" Error:** This usually means an issue with metadata hashing format. Ensure `api/story/register/route.ts` uses `keccak256` correctly (already fixed in latest build).
*   **Image Not Loading:** Check `next.config.ts` includes `image.pollinations.ai` and `ipfs.io` in `remotePatterns`.
*   **Redirect Loop:** If stuck on `/?connect=true`, clear Local Storage (`arche.wallet.connected`) and refresh.

## 6. Deployment

To deploy to Vercel/Netlify:

1.  Ensure all environment variables in `.env.local` are added to the deployment platform's settings.
2.  You will need a cloud-hosted Neo4j instance (e.g., **Neo4j AuraDB**) instead of local Docker. Update `NEO4J_URI` and credentials accordingly.
3.  Run build check: `npm run build`.
