/**
 * @tempered/hydrogen-wishlist types
 */

/**
 * Wishlist item stored in localStorage or customer metafield
 */
export interface WishlistItem {
  productId: string;
  variantId?: string;
  productTitle: string;
  productHandle?: string;
  variantTitle?: string | null;
  image?: {
    url: string;
    altText?: string;
  };
  price?: {
    amount: string;
    currencyCode: string;
  };
  addedAt: string; // ISO timestamp
}

/**
 * Product info for adding to wishlist
 */
export interface ProductInfo {
  id: string;
  title: string;
  handle?: string;
  variantId?: string;
  variantTitle?: string | null;
  image?: {
    url: string;
    altText?: string;
  };
  price?: {
    amount: string;
    currencyCode: string;
  };
}

/**
 * WishBridge API client configuration
 */
export interface WishBridgeConfig {
  /**
   * API base URL for the WishBridge backend
   * @example "https://wishbridge.temperedtools.xyz"
   */
  apiUrl: string;

  /**
   * API key for authentication
   */
  apiKey?: string;

  /**
   * Shop domain
   * @example "my-store.myshopify.com"
   */
  shopDomain: string;

  /**
   * Shopify customer ID (GID format)
   * When provided, enables metafield sync for logged-in customers
   */
  customerId?: string;

  /**
   * Customer access token from Shopify Storefront API
   * Required for reading customer metafields client-side
   */
  customerAccessToken?: string;

  /**
   * Enable wishlist for guest users (localStorage)
   * @default true
   */
  enableGuestWishlist?: boolean;

  /**
   * Automatically merge guest wishlist on customer login
   * @default true
   */
  enableAutoMerge?: boolean;
}

/**
 * Wishlist state
 */
export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  isSyncing: boolean;
  error?: string;
}

/**
 * Sync wishlist request
 */
export interface SyncWishlistRequest {
  guestItems: WishlistItem[];
}

/**
 * Sync wishlist response
 */
export interface SyncWishlistResponse {
  success: boolean;
  items?: WishlistItem[];
  message?: string;
  error?: string;
}

/**
 * Update wishlist request (add/remove single item)
 */
export interface UpdateWishlistRequest {
  action: 'add' | 'remove';
  item: WishlistItem;
}

/**
 * Update wishlist response
 */
export interface UpdateWishlistResponse {
  success: boolean;
  items?: WishlistItem[];
  message?: string;
  error?: string;
}

/**
 * Analytics event request
 */
export interface AnalyticsEventRequest {
  event: 'add' | 'remove' | 'view' | 'share_create' | 'share_view';
  productId: string;
  variantId?: string;
}

/**
 * Analytics event response
 */
export interface AnalyticsEventResponse {
  success: boolean;
  error?: string;
}

/**
 * Create share link request
 */
export interface CreateShareLinkRequest {
  customerName?: string;
  expiresInDays?: number;
}

/**
 * Create share link response
 */
export interface CreateShareLinkResponse {
  success: boolean;
  token?: string;
  url?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Get share link response
 */
export interface GetShareLinkResponse {
  success: boolean;
  items?: WishlistItem[];
  customerName?: string;
  createdAt?: string;
  error?: string;
}

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  notConfigured: 'WishlistProvider is not configured.',
  network: 'Network error. Please try again.',
  rateLimited: 'Too many requests. Please try again later.',
  syncFailed: 'Failed to sync wishlist. Please try again.',
  unknown: 'An unexpected error occurred.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  added: 'Added to wishlist.',
  removed: 'Removed from wishlist.',
  synced: 'Wishlist synced successfully.',
  shareCreated: 'Share link created.',
} as const;
