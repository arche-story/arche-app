// types/index.ts

// Core IP Asset type
export interface IPAsset {
  id: string;
  title?: string;
  prompt: string;
  imageUri: string;
  createdAt: string;
  status?: 'DRAFT' | 'REGISTERED';
  type?: 'GENESIS' | 'REMIX' | string;
  txHash?: string;
  owner?: string;
  name?: string;
  label?: string;
  price?: number;
}

// User type
export interface User {
  address: string;
  username?: string;
  bio?: string;
  avatarUri?: string;
  createdAt?: string;
}

// Listing type
export interface Listing {
  listingId: string;
  price: string;
  currency: string;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
  soldAt?: string;
  txHash?: string;
  asset: IPAsset;
  seller: {
    address: string;
    username: string;
  };
}

// Asset response from API
export interface AssetResponse {
  items: IPAsset[];
  totalPages: number;
  totalItems: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Profile types
export interface ProfileData {
  username?: string;
  bio?: string;
  avatarUri?: string;
}

// Marketplace types
export interface MarketplaceListing {
  listingId: string;
  price: string; // Comes as string from API, convert to number as needed
  currency: string;
  status: string;
  createdAt: string;
  asset: {
    id: string;
    title?: string;
    prompt?: string;
    imageUri?: string;
    name?: string;
  };
  seller: {
    address: string;
    username: string;
  };
}

// Graph node type (for provenance) - extends IPAsset with graph-specific properties
export interface GraphNode extends IPAsset {
  label: string;
  type: 'GENESIS' | 'REMIX' | string; // Can be more specific
  isRoot: boolean;
  licenseTermsId: string;
  x?: number;
  y?: number;
  [key: string]: any; // Allow for d3-force internal properties
}

// Graph link type (for provenance)
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

// Graph data type (for provenance)
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Wallet client type
export interface WalletClientType {
  request: (args: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }) => Promise<unknown>;
  chain: {
    id: number;
    name: string;
  };
}