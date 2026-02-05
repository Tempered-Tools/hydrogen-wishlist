/**
 * Constants for @tempered/hydrogen-wishlist
 */

/**
 * Default error messages
 */
export const DEFAULT_ERROR_MESSAGES = {
  notConfigured: 'WishlistProvider is not configured.',
  network: 'Network error. Please try again.',
  rateLimited: 'Too many requests. Please try again later.',
  syncFailed: 'Failed to sync wishlist. Please try again.',
  unknown: 'An unexpected error occurred.',
};

/**
 * Default success messages
 */
export const DEFAULT_SUCCESS_MESSAGES = {
  added: 'Added to wishlist.',
  removed: 'Removed from wishlist.',
  synced: 'Wishlist synced successfully.',
  shareCreated: 'Share link created.',
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  wishlistItems: 'wishbridge_items',
  lastSyncTimestamp: 'wishbridge_last_sync',
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  sync: '/api/v1/sync',
  update: '/api/v1/update',
  event: '/api/v1/event',
  share: '/api/v1/share',
};

/**
 * Default request timeout in milliseconds
 */
export const REQUEST_TIMEOUT_MS = 10000;

/**
 * Metafield namespace for wishlist data
 */
export const METAFIELD_NAMESPACE = 'wishbridge';

/**
 * Metafield key for wishlist items
 */
export const METAFIELD_KEY = 'items';
