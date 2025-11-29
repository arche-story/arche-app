# Arche Story Backend Documentation

## Architecture Overview

The backend follows a Next.js API routes pattern with:
- `/app/api/` endpoints for main API functionality
- Neo4j graph database for data persistence
- Story Protocol TypeScript SDK for blockchain interactions
- Viem for blockchain operations

## API Routes

### Story Registration & Manipulation (`/app/api/story/`)

#### `/register/route.ts` - IP Asset Registration
**Purpose**: Registers IP assets on Story Protocol and persists to Neo4j.

**Method**: POST

**Input**:
```json
{
  "prompt": "string",
  "imageUri": "string",
  "title": "string",
  "ownerAddress": "string",
  "licenseTermsId": "number", // Optional, defaults to 0
  "parentIpId": "string" // Optional, for derivatives
}
```

**Flow**:
1. Validates input parameters
2. Constructs metadata with proper hashing
3. Calls Story Protocol `register()` or `registerDerivative()` 
4. Creates Neo4j nodes: `(:User)` and `(:IPAsset)`
5. Creates relationships: `[:CREATED]` and `[:OWNS]`
6. Returns transaction hash and Neo4j asset ID

**Key Features**:
- Genesis and derivative registration support
- Proper metadata hashing with keccak256
- Error handling for blockchain and database operations
- Ownership transfer upon registration

#### `/remix/route.ts` - IP Remixing
**Purpose**: Creates remix relationships in the graph database.

**Method**: POST

**Input**:
```json
{
  "parentIpId": "string",
  "childIpId": "string",
  "ownerAddress": "string"
}
```

**Flow**:
1. Validates parent asset exists
2. Creates `[:REMIXED_FROM]` relationship in Neo4j
3. Updates ownership for child asset
4. Returns success status

### Graph Database Operations (`/app/api/graph/`)

#### `/explore/route.ts` - Explore IP Assets
**Purpose**: Fetches public IP assets for exploration.

**Method**: GET

**Query Parameters**:
- `search` (optional): Search term for title/prompt
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Flow**:
1. Constructs Cypher query to find registered IP assets
2. Optionally applies search filtering
3. Limits results for performance
4. Returns assets with provenance relationships

#### `/user-assets/route.ts` - User's IP Assets
**Purpose**: Fetches user's IP assets with filtering and pagination.

**Method**: GET

**Query Parameters**:
- `userAddress`: Wallet address
- `status`: "DRAFT", "REGISTERED", "FAVORITES" (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 9)

**Flow**:
1. Maps status to Neo4j query filters
2. Calculates offset based on page/limit
3. Executes query with pagination
4. Returns assets with `isFavorited` status
5. Includes total count for UI pagination

#### `/favorite/route.ts` - Favorite Management
**Purpose**: Toggle favorite status for IP assets.

**Method**: POST

**Input**:
```json
{
  "userAddress": "string",
  "ipAssetId": "string",
  "isFavorite": "boolean"
}
```

**Flow**:
1. Validates user and asset exist
2. Creates/deletes `[:FAVORITED]` relationship
3. Returns updated status

#### `/get-parent-terms/route.ts` - Parent IP Terms
**Purpose**: Fetches license terms for parent IP assets.

**Method**: GET

**Query Parameters**:
- `ipAssetId`: The child IP asset ID

**Flow**:
1. Traverses `[:REMIXED_FROM]` relationships to find parents
2. Returns license terms information for remix validation

#### `/save-draft/route.ts` - Draft Management
**Purpose**: Save/update draft IP assets.

**Method**: POST

**Input**:
```json
{
  "id": "string",
  "userAddress": "string", 
  "prompt": "string",
  "imageUri": "string",
  "title": "string",
  "status": "DRAFT" | "REGISTERED",
  "parentIpId": "string" // Optional
}
```

**Flow**:
1. Creates or updates `(:IPAsset)` node
2. Creates `[:CREATED]` relationship if user is new
3. Handles parent relationship for derivatives
4. Returns success with Neo4j ID

### Marketplace Operations (`/app/api/marketplace/`)

#### `/list/route.ts` - Create Listing
**Purpose**: Creates a new marketplace listing.

**Method**: POST

**Input**:
```json
{
  "ipId": "string",
  "price": "string", // In WIP
  "sellerAddress": "string"
}
```

**Output**:
```json
{
  "success": true,
  "listingId": "string"
}
```

**Flow**:
1. Validates asset exists and user is owner
2. Creates `(:Listing)` node with unique ID
3. Creates `[:LISTED]` relationship (Seller -> Listing)
4. Creates `[:SELLS]` relationship (Listing -> IPAsset)
5. Sets listing status to "ACTIVE"
6. Returns success with listing ID

#### `/my-listings/route.ts` - Get User's Listings
**Purpose**: Retrieves all listings created by a specific user.

**Method**: GET

**Query Parameters**:
- `userAddress`: Wallet address of the user

**Output**:
```json
{
  "listings": [
    {
      "listingId": "string",
      "price": "string",
      "currency": "string",
      "status": "string",
      "createdAt": "string",
      "asset": {
        "id": "string",
        "title": "string",
        "prompt": "string",
        "imageUri": "string",
        "name": "string"
      },
      "seller": {
        "address": "string",
        "username": "string"
      }
    }
  ]
}
```

**Flow**:
1. Validates userAddress parameter
2. Executes Cypher query to match user with their listed items
3. Returns listings with associated asset and seller information
4. Orders results by creation date (newest first)

#### `/buy/route.ts` - Purchase Asset
**Purpose**: Processes asset purchase and updates ownership.

**Method**: POST

**Input**:
```json
{
  "listingId": "string",
  "buyerAddress": "string",
  "txHash": "string" // Transaction hash from wallet
}
```

**Flow**:
1. Finds listing and associated asset
2. Creates buyer user node if it doesn't exist
3. Updates listing status to "SOLD"
4. Records transaction hash and timestamp
5. Creates `[:BOUGHT]` relationship (Buyer -> Listing)
6. Removes previous `[:OWNS]` relationship for asset
7. Creates new `[:OWNS]` relationship (Buyer -> Asset)
8. Returns success status

**Key Features**:
- Robust Cypher query that doesn't depend on seller relationship
- Handles zero-price items with mock transaction hashes
- Ownership transfer logic with proper relationship management
- Error handling for missing listings or assets

#### `/explore/route.ts` - Marketplace Explore
**Purpose**: Fetch all active marketplace listings.

**Method**: GET

**Flow**:
1. Matches active listings with assets and sellers
2. Returns listings with asset details, price, and seller info
3. Orders by creation date (newest first)

#### `/my-listings/route.ts` - User's Listings
**Purpose**: Fetch listings created by a specific user.

**Method**: GET

**Query Parameters**:
- `userAddress`: Wallet address

**Flow**:
1. Finds all listings by seller address
2. Returns listing details with asset information
3. Includes listing status and timestamps

### User Management (`/app/api/user/`)

#### `/profile/route.ts` - User Profile
**Purpose**: Manage user profile information.

**Method**: GET / POST

**GET Query Parameters**:
- `address`: Wallet address

**POST Input**:
```json
{
  "address": "string",
  "username": "string",
  "bio": "string", 
  "avatarUri": "string"
}
```

**Flow**:
1. For GET: Retrieves user profile data from Neo4j
2. For POST: Updates user node properties
3. Creates user node if it doesn't exist
4. Returns updated profile data

### IPFS Upload (`/app/api/ipfs/upload`)

**Purpose**: Uploads files to IPFS via Pinata.

**Method**: POST (multipart/form-data)

**Flow**:
1. Receives file upload
2. Validates file type and size
3. Uploads to Pinata using JWT
4. Returns IPFS URI in format `ipfs://CID`

## Database Schema (Neo4j)

### Node Types
- `(:User)`: Wallet addresses with profile data
- `(:IPAsset)`: IP Assets with metadata and status
- `(:Listing)`: Marketplace listings with price and status

### Relationships
- `[:CREATED]`: User created IP Asset
- `[:OWNS]`: User owns IP Asset (current ownership)  
- `[:REMIXED_FROM]`: Child asset remixed from parent
- `[:FORKED_FROM]`: Child asset forked from inspiration
- `[:FAVORITED]`: User favorited IP Asset
- `[:LISTED]`: User created Listing
- `[:SELLS]`: Listing sells IP Asset
- `[:BOUGHT]`: User bought Listing (with transaction data)

### Cypher Query Patterns

#### Safe Ownership Transfer
```cypher
// Remove old ownership
OPTIONAL MATCH (oldOwner)-[r:OWNS]->(a)
DELETE r

// Add new ownership
MERGE (buyer)-[:OWNS {since: $soldAt}]->(a)
```

#### Robust Purchase Query
```cypher
MATCH (l:Listing {id: $listingId})
MATCH (l)-[:SELLS]->(a:IPAsset)
MERGE (buyer:User {address: $buyerAddress})

// Update listing status
SET l.status = 'SOLD', 
    l.soldAt = $soldAt,
    l.buyerAddress = $buyerAddress,
    l.txHash = $txHash

// Record transaction
MERGE (buyer)-[:BOUGHT {txHash: $txHash, price: l.price, timestamp: $soldAt}]->(l)

// Transfer ownership
WITH a, buyer, l
OPTIONAL MATCH (oldOwner)-[r:OWNS]->(a)
DELETE r
MERGE (buyer)-[:OWNS {since: $soldAt}]->(a)
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

### Database Connection
- Session management with proper closing in `finally` blocks
- Connection pooling handled by neo4j-driver
- Timeout handling for long-running queries

### Blockchain Integration
- Proper error propagation from Story Protocol SDK
- Transaction hash validation
- Fallback mechanisms for network issues

## Security Considerations

### Input Validation
- All user inputs validated before database operations
- Sanitized Cypher parameters to prevent injection
- Proper authentication via wallet signatures

### Rate Limiting
- Built-in Next.js rate limiting for public endpoints
- Database query limits to prevent resource exhaustion

### Wallet Verification
- All blockchain operations verified through wallet connections
- Asset ownership validation before transfers

## Performance Optimizations

### Database Queries
- Proper indexing on frequently queried properties
- LIMIT clauses on all list operations
- Efficient relationship traversal

### API Endpoints
- Caching headers where appropriate
- Pagination for large result sets
- Optimized query patterns for common operations