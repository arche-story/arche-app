# Arche Story API Documentation

## Internal API Routes

This document details the internal API routes used by Arche Story to serve frontend components, manage the indexing process, and interact with our graph database.

## API Base URL

All API endpoints are accessed relative to:
`/api/`

## Authentication

All internal API routes require authentication via session tokens or are restricted to internal server-side calls only. No public endpoints are exposed without proper authentication.

## Indexer API

### POST /api/indexer/sync

Synchronizes the graph database with the latest Story Protocol blockchain events.

**Request Body:**
```json
{
  "eventType": "IPRegistered | LicenseTokensMinted | IPAssetAttachedToIP | RevenueClaimed | DisputeRaised",
  "eventData": {
    "ipId": "string",
    "transactionHash": "string",
    "blockNumber": "number",
    "timestamp": "string",
    "rawEvent": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "processedEvents": 1,
  "graphUpdates": {
    "nodesCreated": 1,
    "relationshipsCreated": 2,
    "nodesUpdated": 0
  },
  "message": "Successfully synchronized blockchain event with graph database"
}
```

**Error Responses:**
- `400`: Invalid request format
- `401`: Unauthorized access
- `500`: Internal server error during sync

### GET /api/indexer/status

Retrieves the current status of the indexing process.

**Response:**
```json
{
  "status": "active | inactive | error",
  "lastSyncBlock": "number",
  "lastSyncTime": "string",
  "eventsProcessed": "number",
  "pendingEvents": "number",
  "healthCheck": {
    "blockchainConnection": "boolean",
    "graphDatabaseConnection": "boolean",
    "healthScore": "number"
  }
}
```

## Graph Data API

### GET /api/graph/data

Retrieves IP asset data and relationships for visualization in the Provenance Gallery.

**Query Parameters:**
- `ipId` (optional): Specific IP asset ID to fetch
- `creatorId` (optional): Filter by creator address
- `limit` (optional): Number of results to return (default: 100, max: 1000)
- `offset` (optional): Offset for pagination (default: 0)
- `includeDerivatives` (optional): Include derivative relationships (default: true)
- `includeMetadata` (optional): Include full metadata in response (default: false)

**Response:**
```json
{
  "nodes": [
    {
      "id": "string",
      "ipId": "string",
      "creator": "string",
      "timestamp": "string",
      "metadata": {
        "name": "string",
        "description": "string",
        "imageUri": "string"
      },
      "licenseType": "commercial | non-commercial",
      "revenueShare": "number",
      "nodeType": "original | derivative"
    }
  ],
  "links": [
    {
      "source": "string", // ipId
      "target": "string", // ipId
      "type": "derived_from | licensed_to | revenue_flow",
      "timestamp": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "returned": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

**Error Responses:**
- `400`: Invalid query parameters
- `500`: Database query error

### GET /api/graph/provenance/{ipId}

Retrieves the complete provenance chain for a specific IP asset, showing its origin and all derivatives.

**Path Parameters:**
- `ipId`: The ID of the IP asset to trace

**Query Parameters:**
- `depth` (optional): Maximum depth to trace (default: 5, max: 10)
- `includeMetadata` (optional): Include full metadata in response (default: true)

**Response:**
```json
{
  "targetAsset": {
    "id": "string",
    "ipId": "string",
    "creator": "string",
    "timestamp": "string",
    "metadata": {},
    "licenseType": "string"
  },
  "ancestors": [
    {
      "id": "string",
      "ipId": "string",
      "creator": "string",
      "timestamp": "string",
      "relationship": "derived_from",
      "depth": "number"
    }
  ],
  "descendants": [
    {
      "id": "string",
      "ipId": "string",
      "creator": "string",
      "timestamp": "string",
      "relationship": "derived_from",
      "depth": "number"
    }
  ],
  "pathToOrigin": [
    {
      "ipId": "string",
      "creator": "string",
      "timestamp": "string"
    }
  ]
}
```

**Error Responses:**
- `404`: IP asset not found
- `500`: Database query error

### POST /api/graph/search

Search for IP assets based on various criteria.

**Request Body:**
```json
{
  "query": "string",           // Text search in metadata
  "creator": "string",         // Filter by creator address
  "licenseType": "string",     // Filter by license type
  "minTimestamp": "string",    // Filter by minimum creation timestamp
  "maxTimestamp": "string",    // Filter by maximum creation timestamp
  "tags": ["string"],          // Filter by tags
  "limit": "number",           // Number of results to return (default: 50)
  "offset": "number"           // Offset for pagination (default: 0)
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "ipId": "string",
      "creator": "string",
      "timestamp": "string",
      "metadata": {},
      "licenseType": "string",
      "relevanceScore": "number"
    }
  ],
  "totalCount": "number",
  "searchQuery": {
    "query": "string",
    "creator": "string",
    "licenseType": "string"
  }
}
```

## Studio API

### POST /api/studio/remix

Creates a new IP asset as a derivative of existing IP.

**Request Body:**
```json
{
  "parentIpId": "string",      // Parent IP asset ID
  "newMetadata": {
    "name": "string",
    "description": "string",
    "imageUri": "string",
    "prompt": "string",
    "parameters": {}
  },
  "licenseTerms": {
    "licenseType": "commercial | non-commercial",
    "revenueShare": "number",  // Percentage (0-100)
    "restrictions": ["string"] // Additional restrictions
  },
  "storyProtocolTxHash": "string" // Transaction hash from Story Protocol registration
}
```

**Response:**
```json
{
  "success": true,
  "ipId": "string",           // New IP asset ID
  "status": "pending | success | failed",
  "message": "string",
  "graphUpdate": {
    "nodeCreated": "boolean",
    "relationshipCreated": "boolean"
  }
}
```

### GET /api/studio/user/{address}

Retrieves user-specific data including owned IP assets and activity.

**Path Parameters:**
- `address`: The user's wallet address

**Query Parameters:**
- `includeDerivatives` (optional): Include derivative works (default: true)
- `includeLicensees` (optional): Include IPs created from user's IP (default: false)
- `limit` (optional): Number of results per category (default: 50)

**Response:**
```json
{
  "userAddress": "string",
  "profile": {
    "displayName": "string",
    "bio": "string",
    "joinDate": "string"
  },
  "ipAssets": {
    "owned": [
      {
        "id": "string",
        "ipId": "string",
        "metadata": {},
        "timestamp": "string",
        "licenseType": "string",
        "derivativesCount": "number"
      }
    ],
    "derivatives": [
      {
        "id": "string",
        "ipId": "string",
        "parentIpId": "string",
        "metadata": {},
        "timestamp": "string"
      }
    ],
    "licensedToUser": [
      {
        "id": "string",
        "ipId": "string",
        "licenseFrom": "string",
        "timestamp": "string"
      }
    ]
  },
  "stats": {
    "totalIpAssets": "number",
    "totalDerivatives": "number",
    "revenueEarned": "number",
    "revenuePaid": "number"
  }
}
```

## Story Protocol Integration API

### POST /api/story/verify

Verifies that an IP asset exists on the Story Protocol blockchain.

**Request Body:**
```json
{
  "ipId": "string",              // IP asset ID on Story Protocol
  "transactionHash": "string"    // Transaction that registered the IP
}
```

**Response:**
```json
{
  "verified": "boolean",
  "ipData": {
    "ipId": "string",
    "nftContract": "string",
    "tokenId": "string",
    "metadata": {
      "uri": "string",
      "hash": "string"
    },
    "blockNumber": "number",
    "timestamp": "string"
  },
  "blockchainStatus": "registered | not_found | error"
}
```

### GET /api/story/license/{licenseTokenId}

Retrieves license information from Story Protocol for a specific license token.

**Path Parameters:**
- `licenseTokenId`: The license token ID

**Response:**
```json
{
  "licenseTokenId": "string",
  "licensorIpId": "string",
  " licenseeAddress": "string",
  "licenseTemplate": "string",
  "licenseTerms": {},
  "mintTime": "string",
  "expirationTime": "string",
  "status": "active | expired | revoked"
}
```

## Error Handling

### Standard Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" // Optional additional error details
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: Request format is invalid
- `AUTHENTICATION_REQUIRED`: Authentication is required
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `BLOCKCHAIN_VERIFICATION_FAILED`: Could not verify data on Story Protocol
- `GRAPH_DATABASE_ERROR`: Error occurred while querying the graph database
- `INDEXER_ERROR`: Error occurred during indexing process
- `RATE_LIMIT_EXCEEDED`: Request rate limit has been exceeded
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_ERROR`: Generic internal server error

## Rate Limiting

- Standard API endpoints: 100 requests per minute per IP
- Graph data endpoints: 50 requests per minute per IP
- Indexer endpoints: 10 requests per minute (admin only)

## Response Timeouts

- Standard requests: 30 seconds
- Complex graph queries: 60 seconds
- Indexing operations: 5 minutes

## WebSocket Events (for real-time updates)

Arche Story also supports WebSocket connections for real-time updates on IP asset events:

- `ip-registered`: New IP asset registered
- `license-minted`: New license token minted
- `derivative-created`: New derivative IP created
- `revenue-claimed`: Revenue claimed from IP
- `dispute-raised`: IP dispute raised

For WebSocket connection details, refer to the real-time services documentation.