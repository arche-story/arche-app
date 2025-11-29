# Arche Story Frontend Documentation

## Architecture Overview

The Arche Story frontend follows a clean architecture pattern with:

```
page.tsx -> (components)/[Feature]Main.tsx -> (hooks)/use[Feature].tsx
```

This separation ensures UI, business logic, and data fetching are properly decoupled.

## Core Components

### Wallet Integration (`components/wrapper/WalletProvider.tsx`)

**Purpose**: Manages wallet connection state, Story Protocol client, and provides wallet data throughout the app.

**Key Features**:
- Wallet connection/disconnection management
- Story Protocol client initialization
- Storage of connection state in localStorage
- Exposure of wagmi clients (`walletClient`, `publicClient`) for contract interactions
- Loading states for initialization

**API**:
```typescript
interface WalletContextType {
  account: Address | null;
  storyClient: StoryClient | null;
  walletClient: any | null;
  publicClient: any | null;
  isWalletClientLoading: boolean;
  connectWallet: () => void;
  isConnecting: boolean;
  isReconnecting: boolean;
  shouldBeConnected: boolean;
  isInitialized: boolean;
  disconnectWallet: () => void;
}
```

### Marketplace Components (`components/marketplace/`)

#### `ListingCard.tsx`
**Purpose**: Displays individual marketplace listings with purchase functionality.

**Key Features**:
- Displays asset information (image, price, title)
- Handles purchase flow with race condition fixes
- Uses imperative wagmi actions (`getWalletClient`, `switchChain`)
- Contextual "Add WIP to Wallet" button in success notifications
- Zero-price listing support (auto-skips token transfer)

**Data Flow**:
1. Fetches current wallet client imperatively via `getWalletClient(config)`
2. Switches to Aeneid Testnet if needed via `switchChain(config)`
3. Executes token transfer for paid items or creates mock hash for free items
4. Calls `/api/marketplace/buy` to update ownership in Neo4j

#### `ListingModal.tsx`
**Purpose**: Modal form for creating new marketplace listings.

**Key Features**:
- Price input with zero validation
- Proper error handling and user feedback
- Automatic success messaging

### Navigation Components (`components/site-header.tsx`)

**Purpose**: Implements the main navigation with dropdown menus for better UX.

**Key Features**:
- Grouped navigation items (Discover: Explore/Marketplace, Create: Studio/Collection/Profile)
- Wallet connection UI
- Dropdown menus with proper state management
- Outside click detection for dropdowns

### UI Components (`components/ui/`)

#### `add-wip-button.tsx`
**Purpose**: Provides UI for adding WIP token to user's wallet.

**Key Features**:
- Uses `wallet_watchAsset` RPC method
- LocalStorage tracking to avoid repetitive prompts
- Clean integration with Arche's design system

#### `confirmation-dialog.tsx`
**Purpose**: Standardized confirmation dialogs throughout the app.

**Key Features**:
- Replaces native `window.confirm`/`alert`
- Animated transitions
- Consistent styling across all confirmation actions

## Data Management Hooks

### `useWallet` (Global)
**Purpose**: Provides wallet state throughout the application.

### Feature-Specific Hooks (e.g. `useProfile`, `useCollection`, etc.)
**Purpose**: Handle data fetching and state management for specific features.

### SWR Integration
**Purpose**: Provides caching, deduplication, and automatic revalidation of API requests.

**Key Features**:
- Client-side caching with automatic revalidation
- Request deduplication to minimize network requests
- Error handling and retry mechanisms
- Optimistic UI updates
- Pagination support

**Implementation Pattern**:
```typescript
const { data, error, isLoading, mutate } = useSWR(
  key,           // Cache key (or null to disable)
  fetcher,       // Async function returning data
  options        // Configuration options
);
```

**Usage Example**:
```typescript
const { data: items, isLoading, mutate } = useSWR(
  account ? `user-${account}-assets-${activeTab}-${page}` : null,
  async () => {
    // Fetch data using service layer
    return graphService.getUserAssets(account, status, page);
  },
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
  }
);
```

## Utility Functions (`lib/utils.ts`)

### `addWipTokenToMetaMask`
**Purpose**: Imperatively adds WIP token to user's wallet via `wallet_watchAsset`.

### `hasAddedWipToken`
**Purpose**: Checks if user has already added WIP token using localStorage.

### `cn`
**Purpose**: Utility for conditional class names using `clsx` and `tailwind-merge`.

## API Integration

### Fetching Strategies
- SWR for data that might be updated by user actions
- useEffect for initial data loading
- Imperative calls for transaction-related actions

### Error Handling
- Toast notifications for user-facing errors
- Console logging for debugging
- Graceful fallbacks for network issues

## Styling System

### Design Tokens
- Background: `bg-arche-navy` #0C1B33
- Accent: `text-arche-gold` #F8E473
- Text: `text-white` with opacity variations

### Tailwind Configuration
- Custom colors added to theme
- Consistent spacing and sizing
- Responsive design patterns

## Key Flows

### Purchase Flow
1. User clicks "Buy Now" on `ListingCard`
2. Imperative wallet client fetching via `getWalletClient`
3. Network validation and switching if needed
4. Token transfer execution (or mock for zero-price)
5. API call to `/api/marketplace/buy`
6. Ownership update in Neo4j
7. Contextual success message with "Add WIP" option

### Listing Creation Flow
1. User opens `ListingModal` from Collection page
2. Enters price (validates >= 0)
3. API call to `/api/marketplace/list`
4. Listing added to Neo4j with `[:LISTED]` relationship
5. Success notification

## Best Practices Implemented

1. **No Race Conditions**: Using imperative wagmi actions instead of state dependencies
2. **Type Safety**: Comprehensive TypeScript usage throughout
3. **Error Handling**: Proper try/catch blocks with user feedback
4. **Performance**: Conditional loading, SWR for data fetching
5. **UX Consistency**: Standardized components and interactions
6. **Accessibility**: Proper ARIA labels, keyboard navigation