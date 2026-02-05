/**
 * localStorage adapter for guest wishlist
 */

import { STORAGE_KEYS } from './constants.js';
import { isValidWishlistItem } from './validation.js';

import type { WishlistItem } from '../types.js';

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__wishbridge_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wishlist items from localStorage
 */
export function getStoredItems(): WishlistItem[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.wishlistItems);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate each item
    return parsed.filter(isValidWishlistItem) as WishlistItem[];
  } catch {
    return [];
  }
}

/**
 * Save wishlist items to localStorage
 */
export function setStoredItems(items: WishlistItem[]): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.wishlistItems, JSON.stringify(items));
  } catch {
    // Storage quota exceeded or other error
    console.warn('WishBridge: Failed to save wishlist to localStorage');
  }
}

/**
 * Clear wishlist from localStorage
 */
export function clearStoredItems(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.wishlistItems);
    window.localStorage.removeItem(STORAGE_KEYS.lastSyncTimestamp);
  } catch {
    // Ignore errors
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTimestamp(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEYS.lastSyncTimestamp);
  } catch {
    return null;
  }
}

/**
 * Set last sync timestamp
 */
export function setLastSyncTimestamp(timestamp: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.lastSyncTimestamp, timestamp);
  } catch {
    // Ignore errors
  }
}

/**
 * Add item to stored wishlist
 */
export function addStoredItem(item: WishlistItem): WishlistItem[] {
  const items = getStoredItems();

  // Check if already exists
  const exists = items.some(
    (existing) =>
      existing.productId === item.productId &&
      existing.variantId === item.variantId,
  );

  if (exists) {
    return items;
  }

  const newItems = [...items, item];
  setStoredItems(newItems);
  return newItems;
}

/**
 * Remove item from stored wishlist
 */
export function removeStoredItem(productId: string, variantId?: string): WishlistItem[] {
  const items = getStoredItems();
  const newItems = items.filter(
    (item) =>
      !(item.productId === productId && item.variantId === variantId),
  );
  setStoredItems(newItems);
  return newItems;
}

/**
 * Check if item is in stored wishlist
 */
export function isItemStored(productId: string, variantId?: string): boolean {
  const items = getStoredItems();
  return items.some(
    (item) =>
      item.productId === productId && item.variantId === variantId,
  );
}
