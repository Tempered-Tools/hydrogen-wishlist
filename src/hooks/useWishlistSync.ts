/**
 * useWishlistSync Hook
 *
 * Handles guest-to-customer wishlist merge on login.
 */

import { useCallback, useEffect, useState } from 'react';

import { useWishlistContext } from '../components/WishlistProvider.js';

export interface UseWishlistSyncOptions {
  /**
   * Automatically sync when customer logs in
   * @default true
   */
  autoSync?: boolean;

  /**
   * Callback on successful sync
   */
  onSyncSuccess?: () => void;

  /**
   * Callback on sync error
   */
  onSyncError?: (error: string) => void;
}

export interface UseWishlistSyncReturn {
  /**
   * Whether sync is in progress
   */
  isSyncing: boolean;

  /**
   * Current sync error, if any
   */
  syncError: string | undefined;

  /**
   * Manually trigger sync
   */
  triggerSync: () => Promise<void>;
}

/**
 * Hook for managing wishlist sync between guest localStorage and customer metafields
 *
 * @example
 * ```tsx
 * // In your login success handler
 * const { triggerSync, isSyncing } = useWishlistSync({
 *   onSyncSuccess: () => {
 *     console.log('Wishlist synced to your account!');
 *   },
 *   onSyncError: (error) => {
 *     console.error('Failed to sync wishlist:', error);
 *   },
 * });
 *
 * const handleLoginSuccess = async () => {
 *   // ... login logic
 *   await triggerSync();
 * };
 * ```
 */
export function useWishlistSync(
  options: UseWishlistSyncOptions = {},
): UseWishlistSyncReturn {
  const { autoSync = true, onSyncSuccess, onSyncError } = options;
  const context = useWishlistContext();

  const [hasTriggeredAutoSync, setHasTriggeredAutoSync] = useState(false);

  // Auto-sync when customer is detected
  useEffect(() => {
    if (!autoSync) return;
    if (hasTriggeredAutoSync) return;
    if (!context.config.customerId) return;

    // Customer is logged in and we haven't synced yet
    setHasTriggeredAutoSync(true);

    context
      .sync()
      .then(() => {
        onSyncSuccess?.();
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : 'Sync failed';
        onSyncError?.(errorMsg);
      });
  }, [
    autoSync,
    hasTriggeredAutoSync,
    context,
    onSyncSuccess,
    onSyncError,
  ]);

  const triggerSync = useCallback(async () => {
    try {
      await context.sync();
      onSyncSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      onSyncError?.(errorMsg);
    }
  }, [context, onSyncSuccess, onSyncError]);

  return {
    isSyncing: context.isSyncing,
    syncError: context.error,
    triggerSync,
  };
}
