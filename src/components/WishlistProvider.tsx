/**
 * WishlistProvider
 *
 * Context provider for WishBridge configuration and wishlist state.
 * Wrap your Hydrogen app with this provider to enable wishlists.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { API_ENDPOINTS, DEFAULT_ERROR_MESSAGES } from '../utils/constants.js';
import {
  addStoredItem,
  clearStoredItems,
  getStoredItems,
  removeStoredItem,
} from '../utils/storage.js';

import type { ReactNode } from 'react';
import type {
  ProductInfo,
  SyncWishlistResponse,
  UpdateWishlistResponse,
  WishBridgeConfig,
  WishlistItem,
} from '../types.js';

interface WishlistContextValue {
  config: WishBridgeConfig;
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | undefined;
  add: (product: ProductInfo) => Promise<void>;
  remove: (productId: string, variantId?: string) => Promise<void>;
  toggle: (product: ProductInfo) => Promise<void>;
  isWishlisted: (productId: string, variantId?: string) => boolean;
  clear: () => Promise<void>;
  sync: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export interface WishlistProviderProps {
  /**
   * WishBridge configuration
   */
  config: WishBridgeConfig;

  /**
   * Child components
   */
  children: ReactNode;
}

/**
 * Provider component for WishBridge context.
 *
 * @example
 * ```tsx
 * import { WishlistProvider } from '@tempered/hydrogen-wishlist';
 *
 * export default function App() {
 *   const customer = useCustomer(); // from your Hydrogen setup
 *
 *   return (
 *     <WishlistProvider
 *       config={{
 *         apiUrl: 'https://wishbridge.temperedtools.xyz',
 *         shopDomain: 'my-store.myshopify.com',
 *         customerId: customer?.id,
 *         customerAccessToken: customer?.accessToken,
 *       }}
 *     >
 *       <Outlet />
 *     </WishlistProvider>
 *   );
 * }
 * ```
 */
export function WishlistProvider({ config, children }: WishlistProviderProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isGuest = !config.customerId;
  const enableGuestWishlist = config.enableGuestWishlist ?? true;
  const enableAutoMerge = config.enableAutoMerge ?? true;

  // Load initial items
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        if (isGuest && enableGuestWishlist) {
          // Guest: load from localStorage
          const storedItems = getStoredItems();
          setItems(storedItems);
        } else if (!isGuest) {
          // Customer: load from metafield via Storefront API
          // This would be handled by the parent component passing the data
          // For now, we'll check localStorage and sync if needed
          const storedItems = getStoredItems();

          if (storedItems.length > 0 && enableAutoMerge) {
            // Trigger sync to merge guest items with customer metafield
            await syncWishlist(storedItems);
          } else {
            // Just load from localStorage for now (backend will handle metafield read)
            setItems(storedItems);
          }
        }
      } catch (err) {
        setError(DEFAULT_ERROR_MESSAGES.unknown);
        console.error('WishBridge: Failed to load wishlist', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [isGuest, enableGuestWishlist, enableAutoMerge]);

  // Sync with backend
  const syncWishlist = useCallback(
    async (guestItems: WishlistItem[]) => {
      if (!config.customerId || !config.apiKey) {
        return;
      }

      setIsSyncing(true);
      setError(undefined);

      try {
        const url = `${config.apiUrl}${API_ENDPOINTS.sync}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            customerId: config.customerId,
            guestItems,
            shop: config.shopDomain,
          }),
        });

        if (res.status === 429) {
          setError(DEFAULT_ERROR_MESSAGES.rateLimited);
          return;
        }

        const result: SyncWishlistResponse = await res.json();

        if (!res.ok || !result.success) {
          setError(result.error ?? DEFAULT_ERROR_MESSAGES.syncFailed);
          return;
        }

        // Update state with merged items from backend
        if (result.items) {
          setItems(result.items);
          // Clear localStorage after successful sync
          clearStoredItems();
        }
      } catch {
        setError(DEFAULT_ERROR_MESSAGES.network);
      } finally {
        setIsSyncing(false);
      }
    },
    [config.apiUrl, config.apiKey, config.customerId, config.shopDomain],
  );

  // Add item to wishlist
  const add = useCallback(
    async (product: ProductInfo) => {
      const item: WishlistItem = {
        productId: product.id,
        variantId: product.variantId,
        productTitle: product.title,
        productHandle: product.handle,
        variantTitle: product.variantTitle,
        image: product.image,
        price: product.price,
        addedAt: new Date().toISOString(),
      };

      // Optimistic update
      setItems((prev) => {
        const exists = prev.some(
          (existing) =>
            existing.productId === item.productId &&
            existing.variantId === item.variantId,
        );
        if (exists) return prev;
        return [item, ...prev];
      });

      if (isGuest && enableGuestWishlist) {
        // Guest: save to localStorage
        addStoredItem(item);
      } else if (!isGuest && config.apiKey) {
        // Customer: update metafield via backend
        try {
          const url = `${config.apiUrl}${API_ENDPOINTS.update}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              customerId: config.customerId,
              action: 'add',
              item,
              shop: config.shopDomain,
            }),
          });

          const result: UpdateWishlistResponse = await res.json();

          if (!res.ok || !result.success) {
            // Rollback optimistic update
            setItems((prev) =>
              prev.filter(
                (existing) =>
                  !(
                    existing.productId === item.productId &&
                    existing.variantId === item.variantId
                  ),
              ),
            );
            setError(result.error ?? DEFAULT_ERROR_MESSAGES.unknown);
          }
        } catch {
          // Rollback optimistic update
          setItems((prev) =>
            prev.filter(
              (existing) =>
                !(
                  existing.productId === item.productId &&
                  existing.variantId === item.variantId
                ),
            ),
          );
          setError(DEFAULT_ERROR_MESSAGES.network);
        }
      }
    },
    [
      isGuest,
      enableGuestWishlist,
      config.apiUrl,
      config.apiKey,
      config.customerId,
      config.shopDomain,
    ],
  );

  // Remove item from wishlist
  const remove = useCallback(
    async (productId: string, variantId?: string) => {
      // Optimistic update
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId),
        ),
      );

      if (isGuest && enableGuestWishlist) {
        // Guest: remove from localStorage
        removeStoredItem(productId, variantId);
      } else if (!isGuest && config.apiKey) {
        // Customer: update metafield via backend
        try {
          const url = `${config.apiUrl}${API_ENDPOINTS.update}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              customerId: config.customerId,
              action: 'remove',
              item: { productId, variantId },
              shop: config.shopDomain,
            }),
          });

          const result: UpdateWishlistResponse = await res.json();

          if (!res.ok || !result.success) {
            // Rollback: we'd need to store the removed item to rollback
            setError(result.error ?? DEFAULT_ERROR_MESSAGES.unknown);
          }
        } catch {
          setError(DEFAULT_ERROR_MESSAGES.network);
        }
      }
    },
    [
      isGuest,
      enableGuestWishlist,
      config.apiUrl,
      config.apiKey,
      config.customerId,
      config.shopDomain,
    ],
  );

  // Toggle item in wishlist
  const toggle = useCallback(
    async (product: ProductInfo) => {
      const wishlisted = items.some(
        (item) =>
          item.productId === product.id && item.variantId === product.variantId,
      );

      if (wishlisted) {
        await remove(product.id, product.variantId);
      } else {
        await add(product);
      }
    },
    [items, add, remove],
  );

  // Check if item is wishlisted
  const isWishlisted = useCallback(
    (productId: string, variantId?: string): boolean => {
      return items.some(
        (item) =>
          item.productId === productId && item.variantId === variantId,
      );
    },
    [items],
  );

  // Clear all items
  const clear = useCallback(async () => {
    setItems([]);

    if (isGuest && enableGuestWishlist) {
      clearStoredItems();
    } else if (!isGuest && config.apiKey) {
      // Would need a clear endpoint on backend
      // For now, just clear local state
    }
  }, [isGuest, enableGuestWishlist, config.apiKey]);

  // Manual sync trigger
  const sync = useCallback(async () => {
    const storedItems = getStoredItems();
    await syncWishlist(storedItems);
  }, [syncWishlist]);

  const value = useMemo(
    () => ({
      config,
      items,
      count: items.length,
      isLoading,
      isSyncing,
      error,
      add,
      remove,
      toggle,
      isWishlisted,
      clear,
      sync,
    }),
    [
      config,
      items,
      isLoading,
      isSyncing,
      error,
      add,
      remove,
      toggle,
      isWishlisted,
      clear,
      sync,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

/**
 * Hook to access WishBridge configuration and state.
 * Must be used within a WishlistProvider.
 */
export function useWishlistContext(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }

  return context;
}

export { WishlistContext };
