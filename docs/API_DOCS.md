# Arche Story API Documentation

## Internal API Routes

This document details the internal API routes used by Arche Story to serve frontend components, manage the indexing process, and interact with our graph database.

## API Base URL

All API endpoints are accessed relative to:
`/api/`

## Authentication

All internal API routes require authentication via session tokens or are restricted to internal server-side calls only. No public endpoints are exposed without proper authentication.


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
    }
  ]
}
```

## Story Protocol API

### POST /api/story/register

Registers an IP asset on Story Protocol with Programmable IP License (PIL) terms. This endpoint handles both genesis (new) IP assets and derivatives (remixes) of existing IP assets.

**Request Body:**
```json
{
  "metadata": {
    "name": "string",
    "description": "string",
    "created_at": "string",
    "arche_type": "GENESIS | REMIX",
    "ai_context": {
      "model": "string",
      "prompt": "string",
      "negative_prompt": "string",
      "seed": "number",
      "guidance_scale": "number"
    },
    "parent_context": {
      "parent_ip_id": "string",
      "transformation_method": "string"
    },
    "licenseType": "COMMERCIAL_REMIX | NON_COMMERCIAL"
  },
  "imageUrl": "string",
  "recipient": "0x address",
  "parentId": "0x address (optional)",
  "licenseTermsId": "string (optional, default: derived from DB or 1)",
  "draftId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "ipId": "string",
  "txHash": "string",
  "explorerUrl": "string"
}
```

**Error Responses:**
- `400`: Invalid request format or missing required fields
- `401`: Unauthorized access
- `500`: Internal server error (e.g., Insufficient IP tokens for remix)

**Notes:**
- If `parentId` is provided, the endpoint registers a derivative IP (remix).
- If `parentId` is null, the endpoint registers a genesis IP (original).
- For derivatives, the system automatically attempts to mint a license token from the parent IP using the fetched or provided `licenseTermsId`.
- The response includes a link to view the transaction on StoryScan.