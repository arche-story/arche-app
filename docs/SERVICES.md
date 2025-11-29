# Arche Story Service Layer Documentation

## Overview

The service layer provides a structured way to interact with various backend APIs through dedicated service classes that encapsulate API calls and data transformations. This layer sits between the React hooks/components and the raw API endpoints.

## Architecture

```
Components/Hooks -> Services -> API endpoints
```

## Core Services

### ApiService (Base Class)
**Location**: `services/apiService.ts`

**Purpose**: Provides base functionality for all services including error handling and request methods.

**Methods**:
- `request<T>()`: Generic request method with error handling

### MarketplaceService
**Location**: `services/apiService.ts`

**Purpose**: Handles all marketplace-related API interactions.

**Methods**:
- `getMarketplaceListings()`: Gets all active marketplace listings
- `getUserListings(userAddress)`: Gets listings created by a specific user
- `createListing(ipId, price, sellerAddress)`: Creates a new listing
- `buyAsset(listingId, buyerAddress, txHash)`: Processes asset purchase

**Usage Example**:
```typescript
import { marketplaceService } from '@/services/apiService';

const listings = await marketplaceService.getMarketplaceListings();
```

### UserService
**Location**: `services/apiService.ts`

**Purpose**: Manages user profile and authentication API interactions.

**Methods**:
- `getUserProfile(address)`: Gets user profile data
- `updateUserProfile(data)`: Updates user profile
- `uploadAvatar(file)`: Uploads avatar to IPFS

**Usage Example**:
```typescript
import { userService } from '@/services/apiService';

const profile = await userService.getUserProfile(userAddress);
```

### GraphService
**Location**: `services/apiService.ts`

**Purpose**: Handles graph database interactions for IP Assets, favorites, and exploration.

**Methods**:
- `getUserAssets(userAddress, status, page, limit)`: Gets user's IP assets with pagination
- `getExploreAssets(search, limit, offset)`: Gets public IP assets for exploration
- `toggleFavorite(userAddress, ipAssetId, isFavorite)`: Toggles favorite status
- `getParentTerms(ipAssetId)`: Gets parent IP license terms
- `saveDraft(draft)`: Saves draft IP asset

**Usage Example**:
```typescript
import { graphService } from '@/services/apiService';

const assets = await graphService.getUserAssets(userAddress, 'REGISTERED', 1, 9);
```

### StoryService
**Location**: `services/apiService.ts`

**Purpose**: Handles Story Protocol blockchain interactions.

**Methods**:
- `registerAsset(data)`: Registers new IP asset on blockchain
- `remixAsset(data)`: Creates remix relationship between IP assets

**Usage Example**:
```typescript
import { storyService } from '@/services/apiService';

const result = await storyService.registerAsset({
  prompt: "My IP prompt",
  imageUri: "ipfs://...",
  title: "My IP Title",
  ownerAddress: userAddress
});
```

## Type Safety

All services use strongly-typed interfaces defined in `types/index.ts` ensuring:
- Compile-time type checking
- Better IDE autocompletion
- Reduced runtime errors
- Clear API contracts

**Key Interfaces**:
- `IPAsset`: IP Asset data structure
- `User`: User profile data structure
- `Listing`: Marketplace listing data structure
- `AssetResponse`: Standardized asset response format

## SWR Integration

Services work seamlessly with SWR for:
- Client-side caching
- Request deduplication
- Automatic revalidation
- Error recovery

**Integration Pattern**:
```typescript
const { data, isLoading, error } = useSWR(
  account ? ['user-assets', account, page] : null,
  async () => graphService.getUserAssets(account, 'REGISTERED', page, 9)
);
```

## Error Handling

Services implement consistent error handling:
- Network error detection and reporting
- Specific error messages for different failure modes
- Fallback mechanisms for failed requests
- User-friendly error presentation through UI components

## Performance Optimization

### Request Deduplication
Services prevent duplicate requests for the same data through SWR's built-in deduplication.

### Caching Strategy
- Short TTL for frequently changing data (e.g., marketplace listings)
- Longer TTL for static data (e.g., user profiles)
- Smart invalidation on user actions (e.g., updating profile invalidates cached profile data)

### Batch Operations
Where possible, services support batch operations to minimize network requests.

## Security Considerations

### Input Validation
- All service methods validate inputs before API calls
- Proper sanitization of user inputs
- Parameter checking to prevent injection attacks

### Authentication
- Services work with authenticated contexts
- Proper wallet address validation
- Secure transaction handling

## Best Practices

### Separation of Concerns
Each service handles a specific domain (marketplace, user, graph, story) keeping responsibilities clear.

### Consistent Error Handling
Standardized error patterns across all services for predictable behavior.

### Type Safety
Comprehensive TypeScript interfaces ensure type safety throughout the application.

### Extensibility
Base ApiService class allows easy extension for new service types.

### API Consistency
Uniform API patterns make services easy to learn and use.