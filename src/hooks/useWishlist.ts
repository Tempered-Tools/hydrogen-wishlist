/**
 * useWishlist Hook
 *
 * Core hook for wishlist operations.
 * Provides add, remove, toggle, and check functionality.
 */

import { useCallback, useMemo } from 'react';

import { useWishlistContext } from '../components/WishlistProvider.js';

import type { ProductInfo, WishlistItem } from '../types.js';

export interface UseWishlistOptions {
  /**
   * Callback when an item is added
   */
  onAdd?: (item: WishlistItem) => void;

  /**
   * Callback when an item is removed
   */
  onRemove?: (productId: string, variantId?: string) => void;

  /**
   * Callback on error
   */
  onError?: (error: string) => void;
}

export interface UseWishlistReturn {
  /**
   * All wishlist items
   */
  items: WishlistItem[];

  /**
   * Number of items in wishlist
   */
  count: number;

  /**
   * Whether the wishlist is loading
   */
  isLoading: boolean;

  /**
   * Whether the wishlist is syncing with backend
   */
  isSyncing: boolean;

  /**
   * Current error message, if any
   */
  error: string | undefined;

  /**
   * Add a product to the wishlist
   */
  add: (product: ProductInfo) => Promise<void>;

  /**
   * Remove a product from the wishlist
   */
  remove: (productId: string, variantId?: string) => Promise<void>;

  /**
   * Toggle a product in the wishlist
   */
  toggle: (product: ProductInfo) => Promise<void>;

  /**
   * Check if a product is in the wishlist
   */
  isWishlisted: (productId: string, variantId?: string) => boolean;

  /**
   * Clear all items from the wishlist
   */
  clear: () => Promise<void>;

  /**
   * Manually trigger a sync with the backend
   */
  sync: () => Promise<void>;
}

/**
 * Hook for managing wishlist operations
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   count,
 *   add,
 *   remove,
 *   toggle,
 *   isWishlisted,
 *   isLoading,
 * } = useWishlist();
 *
 * // Check if a product is wishlisted
 * const inWishlist = isWishlisted(product.id, variant?.id);
 *
 * // Toggle wishlist status
 * const handleClick = () => toggle({
 *   id: product.id,
 *   title: product.title,
 *   variantId: variant?.id,
 *   image: product.featuredImage,
 *   price: variant?.price,
 * });
 *
 * return (
 *   <button onClick={handleClick}>
 *     {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
 *   </button>
 * );
 * ```
 */
export function useWishlist(options: UseWishlistOptions = {}): UseWishlistReturn {
  const { onAdd, onRemove, onError } = options;
  const context = useWishlistContext();

  const add = useCallback(
    async (product: ProductInfo) => {
      try {
        await context.add(product);
        onAdd?.({
          productId: product.id,
          variantId: product.variantId,
          productTitle: product.title,
          productHandle: product.handle,
          variantTitle: product.variantTitle,
          image: product.image,
          price: product.price,
          addedAt: new Date().toISOString(),
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add item';
        onError?.(errorMsg);
      }
    },
    [context, onAdd, onError],
  );

  const remove = useCallback(
    async (productId: string, variantId?: string) => {
      try {
        await context.remove(productId, variantId);
        onRemove?.(productId, variantId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to remove item';
        onError?.(errorMsg);
      }
    },
    [context, onRemove, onError],
  );

  const toggle = useCallback(
    async (product: ProductInfo) => {
      const isInWishlist = context.isWishlisted(product.id, product.variantId);
      if (isInWishlist) {
        await remove(product.id, product.variantId);
      } else {
        await add(product);
      }
    },
    [context, add, remove],
  );

  return useMemo(
    () => ({
      items: context.items,
      count: context.count,
      isLoading: context.isLoading,
      isSyncing: context.isSyncing,
      error: context.error,
      add,
      remove,
      toggle,
      isWishlisted: context.isWishlisted,
      clear: context.clear,
      sync: context.sync,
    }),
    [context, add, remove, toggle],
  );
}
