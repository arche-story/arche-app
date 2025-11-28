# User Testing Guide - Phase 2: Story Protocol Integration

This document outlines the user testing flow for the Story Protocol integration features implemented in Phase 2.

## 🎯 Testing Objectives

Verify that users can:
1. Create genesis IP assets with proper PIL terms
2. Remix existing IP assets using the license token workflow
3. See proper representation of IP relationships in the graph database
4. Experience smooth UI workflows for both genesis and remix scenarios

## 🧪 Testing Scenarios

### Scenario 1: Genesis IP Creation (Commercial Remix Terms)

**Objective:** Verify the full flow of creating a new IP asset from scratch with commercial remix terms.

**Steps:**
1. Navigate to `/studio`
2. Connect wallet (ensure on Aeneid testnet)
3. Enter a prompt and generate an image
4. Commit the version to save to Neo4j
5. Click "Sign on Story" button
6. Verify in the UI:
   - Loading spinner appears during registration
   - Success toast shows IP ID and explorer link
   - Redirect to profile page occurs
7. Check transaction on StoryScan explorer
8. Verify IP asset appears in graph visualization

**Expected Results:**
- IP is registered with commercial remix PIL terms
- IP has 10% commercial revenue share
- Neo4j graph shows new IPAsset node connected to User via CREATOR relationship
- `isRoot` property is set to true

### Scenario 2: Genesis IP Creation (Non-Commercial Terms)

**Objective:** Verify creating a new IP asset with non-commercial terms.

**Steps:**
1. Navigate to `/studio`
2. Connect wallet (ensure on Aeneid testnet)
3. Enter a prompt and generate an image
4. Switch to "Rights & Terms" tab in Asset Config
5. Select "Non-Commercial" license type
6. Commit the version
7. Click "Sign on Story" button
8. Verify success and explorer link

**Expected Results:**
- IP is registered with non-commercial PIL terms
- No revenue sharing is configured
- Neo4j graph shows proper node creation

### Scenario 3: Remix Workflow (License -> Derivative)

**Objective:** Test the complete remix workflow with license token minting and derivative registration.

**Steps:**
1. Navigate to `/gallery` or `/explore` to find an existing IP asset
2. Copy the IP ID of an asset (should be visible in details)
3. Go to `/studio` and enter "Remix Mode"
4. In the "Provenance" tab in Asset Config, paste the parent IP ID
5. Verify UI shows "REMIX MODE" indicator and parent IP ID
6. Generate a new image based on the parent
7. Commit the version
8. Click "Register Remix" button (instead of "Sign on Story")
9. Verify in logs/wallet that two transactions occurred:
   - License token minting from parent IP
   - Derivative IP registration
10. Check transaction on StoryScan explorer
11. Verify relationships in graph visualization

**Expected Results:**
- License token is minted from the parent IP
- New derivative IP is created linking back to parent
- Neo4j shows `REMIXED_FROM` relationship between child and parent IPAssets
- Proper royalty percentage flows from child to parent

### Scenario 4: Remix with Different License Types

**Objective:** Verify remixing works with different parent license types.

**Steps:**
1. Find a parent IP with commercial license terms
2. Follow remix workflow from Scenario 3
3. Find a parent IP with non-commercial license
4. Attempt to remix and verify restrictions are enforced

**Expected Results:**
- Commercial parent IPs allow remixing
- Non-commercial parent IPs show proper limitations
- Derivative inherits license restrictions from parent

### Scenario 5: Graph Visualization Verification

**Objective:** Ensure the graph database properly reflects on-chain relationships.

**Steps:**
1. Create/Remix several IP assets following above scenarios
2. Navigate to `/gallery` or `/explore`
3. Use graph visualization tools to:
   - Explore parent-child relationships
   - Click on nodes to see IP details
   - Trace lineage back to genesis IPs
4. Verify correct relationship types (`REMIXED_FROM`, `CREATED_BY`)

**Expected Results:**
- All on-chain relationships are properly reflected in Neo4j
- Graph visualization shows accurate IP genealogy
- Node properties match on-chain data (IP ID, timestamps, etc.)

## 🧾 Test Data

### Pre-test Setup:
- Ensure wallet has Aeneid testnet $IP tokens
- Verify SPG NFT contract address is properly configured
- Confirm Neo4j database is accessible and synced

### Test Cases:
| Test ID | Description | Input | Expected Output |
|---------|-------------|--------|-----------------|
| T001 | Genesis Commercial IP | New prompt, Commercial license | IP registered with revenue share |
| T002 | Genesis Non-Commercial IP | New prompt, Non-commercial license | IP registered without revenue share |
| T003 | Remix from Commercial | Parent IP ID, new image | License + Derivative registration |
| T004 | Remix from Non-Commercial | Non-compliant parent IP | Proper restrictions enforced |
| T005 | Graph Sync | Multiple IP relationships | Accurate Neo4j representation |

## 🐞 Known Issues & Workarounds

### Issue 1: Wallet Connection Timeout
- **Symptoms:** Wallet takes too long to connect
- **Workaround:** Refresh page and try different RPC endpoint

### Issue 2: Gas Estimation Failure
- **Symptoms:** Transaction fails with gas estimation error
- **Solution:** Manually set gas limit in wallet settings

### Issue 3: Graph Sync Delays
- **Symptoms:** New IPs don't immediately appear in gallery
- **Workaround:** Wait up to 30 seconds for indexer to sync

## 📊 Success Metrics

- [ ] 100% success rate for genesis IP registration
- [ ] 100% success rate for derivative IP registration
- [ ] <5% failure rate due to network/gas issues
- [ ] Graph visualization updates within 30 seconds
- [ ] User completes workflow without confusion
- [ ] All PIL terms are correctly applied on-chain