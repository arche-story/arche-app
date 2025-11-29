// services/apiService.ts

import { 
  IPAsset, 
  AssetResponse, 
  User, 
  Listing, 
  ProfileData,
  MarketplaceListing
} from '@/types';

// Base API service class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';
  }

  // Generic request method
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Marketplace service
export class MarketplaceService extends ApiService {
  // Get all marketplace listings
  async getMarketplaceListings(): Promise<Listing[]> {
    return this.request<Listing[]>('/api/marketplace/explore');
  }

  // Get user's listings
  async getUserListings(userAddress: string): Promise<MarketplaceListing[]> {
    const response = await this.request<{ listings: MarketplaceListing[] }>(`/api/marketplace/my-listings?userAddress=${userAddress}`);
    return response.listings || [];
  }

  // Create a new listing
  async createListing(
    ipId: string, 
    price: string, 
    sellerAddress: string
  ): Promise<{ success: boolean; listingId?: string }> {
    return this.request('/api/marketplace/list', {
      method: 'POST',
      body: JSON.stringify({ ipId, price, sellerAddress }),
    });
  }

  // Buy an asset
  async buyAsset(
    listingId: string,
    buyerAddress: string,
    txHash: string
  ): Promise<{ success: boolean }> {
    return this.request('/api/marketplace/buy', {
      method: 'POST',
      body: JSON.stringify({ listingId, buyerAddress, txHash }),
    });
  }
}

// User service
export class UserService extends ApiService {
  // Get user profile
  async getUserProfile(address: string): Promise<User> {
    return this.request<User>(`/api/user/profile?address=${address}`);
  }

  // Update user profile
  async updateUserProfile(data: ProfileData & { address: string }): Promise<{ success: boolean }> {
    return this.request('/api/user/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload avatar to IPFS
  async uploadAvatar(file: File): Promise<{ ipfsUri: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

// Graph service (for user assets, explore, etc.)
export class GraphService extends ApiService {
  // Get user's assets
  async getUserAssets(
    userAddress: string,
    status?: 'DRAFT' | 'REGISTERED' | 'FAVORITES',
    page: number = 1,
    limit: number = 9
  ): Promise<AssetResponse> {
    let url = `/api/graph/user-assets?userAddress=${userAddress}&page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    return this.request<AssetResponse>(url);
  }

  // Get explore assets
  async getExploreAssets(
    search?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IPAsset[]> {
    let url = `/api/graph/explore?limit=${limit}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    return this.request<IPAsset[]>(url);
  }

  // Toggle favorite status
  async toggleFavorite(
    userAddress: string,
    ipAssetId: string,
    isFavorite: boolean
  ): Promise<{ success: boolean }> {
    return this.request('/api/graph/favorite', {
      method: 'POST',
      body: JSON.stringify({ userAddress, ipAssetId, isFavorite }),
    });
  }

  // Get parent IP terms
  async getParentTerms(ipAssetId: string): Promise<any> {
    return this.request(`/api/graph/get-parent-terms?ipAssetId=${ipAssetId}`);
  }

  // Save draft
  async saveDraft(draft: Partial<IPAsset> & { userAddress: string }): Promise<IPAsset> {
    return this.request('/api/graph/save-draft', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  }
}

// Story service (for registration/remix)
export class StoryService extends ApiService {
  // Register IP asset
  async registerAsset(
    data: {
      prompt: string;
      imageUri: string;
      title: string;
      ownerAddress: string;
      licenseTermsId?: number;
      parentIpId?: string;
    }
  ): Promise<{ success: boolean; ipId?: string; txHash?: string }> {
    return this.request('/api/story/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remix IP asset
  async remixAsset(data: {
    parentIpId: string;
    childIpId: string;
    ownerAddress: string;
  }): Promise<{ success: boolean }> {
    return this.request('/api/story/remix', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Initialize services
export const marketplaceService = new MarketplaceService();
export const userService = new UserService();
export const graphService = new GraphService();
export const storyService = new StoryService();