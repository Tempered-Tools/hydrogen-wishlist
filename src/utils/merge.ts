/**
 * Wishlist merge utilities
 *
 * Handles merging guest wishlist with customer metafield wishlist on login.
 */

import type { WishlistItem } from '../types.js';

/**
 * Merge two wishlists, keeping earliest addedAt for duplicates.
 * Union by productId + variantId.
 */
export function mergeWishlists(
  guestItems: WishlistItem[],
  customerItems: WishlistItem[],
): WishlistItem[] {
  const merged = new Map<string, WishlistItem>();

  // Add customer items first (lower priority for addedAt)
  for (const item of customerItems) {
    const key = createItemKey(item);
    merged.set(key, item);
  }

  // Add guest items, keeping earlier addedAt
  for (const item of guestItems) {
    const key = createItemKey(item);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
    } else {
      // Keep the earlier addedAt timestamp
      const existingDate = new Date(existing.addedAt);
      const newDate = new Date(item.addedAt);

      if (newDate < existingDate) {
        // Keep the guest item (earlier addedAt), but preserve any additional data
        merged.set(key, {
          ...existing,
          ...item,
          addedAt: item.addedAt,
        });
      }
    }
  }

  // Return sorted by addedAt (newest first)
  return Array.from(merged.values()).sort((a, b) => {
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });
}

/**
 * Create a unique key for a wishlist item
 */
export function createItemKey(item: WishlistItem): string {
  return `${item.productId}:${item.variantId ?? 'default'}`;
}

/**
 * Find new items that were added during merge
 */
export function findNewItems(
  before: WishlistItem[],
  after: WishlistItem[],
): WishlistItem[] {
  const beforeKeys = new Set(before.map(createItemKey));
  return after.filter((item) => !beforeKeys.has(createItemKey(item)));
}

/**
 * Deduplicate wishlist items by productId + variantId
 * Keeps the first occurrence (typically the one with earlier addedAt)
 */
export function deduplicateItems(items: WishlistItem[]): WishlistItem[] {
  const seen = new Set<string>();
  const result: WishlistItem[] = [];

  for (const item of items) {
    const key = createItemKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * Sort wishlist items by addedAt (newest first)
 */
export function sortByNewest(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => {
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });
}

/**
 * Sort wishlist items by addedAt (oldest first)
 */
export function sortByOldest(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => {
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
  });
}

/**
 * Sort wishlist items alphabetically by product title
 */
export function sortByTitle(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => {
    return a.productTitle.localeCompare(b.productTitle);
  });
}

/**
 * Sort wishlist items by price (low to high)
 */
export function sortByPriceLowToHigh(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => {
    const priceA = a.price ? parseFloat(a.price.amount) : Infinity;
    const priceB = b.price ? parseFloat(b.price.amount) : Infinity;
    return priceA - priceB;
  });
}

/**
 * Sort wishlist items by price (high to low)
 */
export function sortByPriceHighToLow(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => {
    const priceA = a.price ? parseFloat(a.price.amount) : 0;
    const priceB = b.price ? parseFloat(b.price.amount) : 0;
    return priceB - priceA;
  });
}
