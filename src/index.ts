/**
 * @tempered/hydrogen-wishlist
 *
 * Wishlist components for Shopify Hydrogen storefronts.
 * Stores wishlist data in Shopify customer metafields for logged-in users,
 * with localStorage fallback for guest users.
 *
 * @example
 * ```tsx
 * import {
 *   WishlistProvider,
 *   WishlistButton,
 *   WishlistDrawer,
 *   WishlistPage,
 *   WishlistCount,
 *   useWishlist,
 * } from '@tempered/hydrogen-wishlist';
 *
 * // In your root layout
 * export default function App() {
 *   const customer = useCustomer();
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
 *
 * // On a product page
 * export default function ProductPage({ product }) {
 *   return (
 *     <div>
 *       <h1>{product.title}</h1>
 *       <WishlistButton
 *         product={{
 *           id: product.id,
 *           title: product.title,
 *           handle: product.handle,
 *           image: product.featuredImage,
 *           price: product.variants[0]?.price,
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

// Components
export { WishlistProvider, useWishlistContext } from './components/WishlistProvider.js';
export { WishlistButton } from './components/WishlistButton.js';
export { WishlistCount } from './components/WishlistCount.js';
export { WishlistDrawer } from './components/WishlistDrawer.js';
export { WishlistPage } from './components/WishlistPage.js';

// Hooks
export { useWishlist } from './hooks/useWishlist.js';
export { useWishlistSync } from './hooks/useWishlistSync.js';
export { useWishlistCount } from './hooks/useWishlistCount.js';

// Utils
export {
  isValidProductId,
  isValidVariantId,
  isValidCustomerId,
  extractNumericId,
  sanitizeInput,
  isValidWishlistItem,
} from './utils/validation.js';
export {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_SUCCESS_MESSAGES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  METAFIELD_NAMESPACE,
  METAFIELD_KEY,
} from './utils/constants.js';
export {
  mergeWishlists,
  createItemKey,
  findNewItems,
  deduplicateItems,
  sortByNewest,
  sortByOldest,
  sortByTitle,
  sortByPriceLowToHigh,
  sortByPriceHighToLow,
} from './utils/merge.js';
export {
  isStorageAvailable,
  getStoredItems,
  setStoredItems,
  clearStoredItems,
  addStoredItem,
  removeStoredItem,
  isItemStored,
} from './utils/storage.js';

// Types
export type {
  WishlistItem,
  ProductInfo,
  WishBridgeConfig,
  WishlistState,
  SyncWishlistRequest,
  SyncWishlistResponse,
  UpdateWishlistRequest,
  UpdateWishlistResponse,
  AnalyticsEventRequest,
  AnalyticsEventResponse,
  CreateShareLinkRequest,
  CreateShareLinkResponse,
  GetShareLinkResponse,
} from './types.js';

// Component props types
export type { WishlistProviderProps } from './components/WishlistProvider.js';
export type { WishlistButtonProps } from './components/WishlistButton.js';
export type { WishlistCountProps } from './components/WishlistCount.js';
export type { WishlistDrawerProps } from './components/WishlistDrawer.js';
export type { WishlistPageProps, SortOption } from './components/WishlistPage.js';

// Hook return types
export type { UseWishlistOptions, UseWishlistReturn } from './hooks/useWishlist.js';
export type { UseWishlistSyncOptions, UseWishlistSyncReturn } from './hooks/useWishlistSync.js';
export type { UseWishlistCountReturn } from './hooks/useWishlistCount.js';
