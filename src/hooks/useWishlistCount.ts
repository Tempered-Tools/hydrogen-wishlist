/**
 * useWishlistCount Hook
 *
 * Optimized hook for accessing just the wishlist count.
 * Useful for header badges that don't need full wishlist data.
 */

import { useWishlistContext } from '../components/WishlistProvider.js';

export interface UseWishlistCountReturn {
  /**
   * Number of items in wishlist
   */
  count: number;

  /**
   * Whether the wishlist is loading
   */
  isLoading: boolean;
}

/**
 * Hook for accessing wishlist count only
 *
 * @example
 * ```tsx
 * function HeaderWishlistBadge() {
 *   const { count, isLoading } = useWishlistCount();
 *
 *   if (isLoading) return null;
 *
 *   return (
 *     <Link to="/wishlist">
 *       <HeartIcon />
 *       {count > 0 && <span className="badge">{count}</span>}
 *     </Link>
 *   );
 * }
 * ```
 */
export function useWishlistCount(): UseWishlistCountReturn {
  const context = useWishlistContext();

  return {
    count: context.count,
    isLoading: context.isLoading,
  };
}
