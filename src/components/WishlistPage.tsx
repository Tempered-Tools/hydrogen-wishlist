/**
 * WishlistPage
 *
 * Full-page wishlist view component.
 */

import { useCallback, useMemo, useState } from 'react';

import { useWishlist } from '../hooks/useWishlist.js';
import {
  sortByNewest,
  sortByOldest,
  sortByTitle,
  sortByPriceLowToHigh,
  sortByPriceHighToLow,
} from '../utils/merge.js';

import type { WishlistItem } from '../types.js';
import type { CSSProperties, ReactNode } from 'react';

export type SortOption = 'newest' | 'oldest' | 'title' | 'price-low' | 'price-high';

export interface WishlistPageProps {
  /**
   * Page title
   * @default "My Wishlist"
   */
  title?: string;

  /**
   * Empty state message
   * @default "Your wishlist is empty"
   */
  emptyMessage?: string;

  /**
   * Empty state description
   */
  emptyDescription?: string;

  /**
   * Continue shopping link text
   * @default "Continue Shopping"
   */
  continueShoppingText?: string;

  /**
   * Continue shopping URL
   * @default "/collections/all"
   */
  continueShoppingUrl?: string;

  /**
   * Layout mode
   * @default "grid"
   */
  layout?: 'grid' | 'list';

  /**
   * Number of columns in grid layout
   * @default 4
   */
  columns?: 2 | 3 | 4 | 5 | 6;

  /**
   * Show sort dropdown
   * @default true
   */
  showSort?: boolean;

  /**
   * Show share button
   * @default false
   */
  showShare?: boolean;

  /**
   * Add to cart handler
   */
  onAddToCart?: (item: WishlistItem) => void;

  /**
   * View product handler
   */
  onViewProduct?: (item: WishlistItem) => void;

  /**
   * Share wishlist handler
   */
  onShare?: () => void;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Custom item renderer
   */
  renderItem?: (item: WishlistItem, actions: ItemActions) => ReactNode;

  /**
   * Custom empty state renderer
   */
  renderEmpty?: () => ReactNode;
}

interface ItemActions {
  remove: () => void;
  addToCart: () => void;
  viewProduct: () => void;
}

/**
 * Full-page wishlist component
 *
 * @example
 * ```tsx
 * // In your /wishlist route
 * export default function WishlistRoute() {
 *   const navigate = useNavigate();
 *   const { addToCart } = useCart();
 *
 *   return (
 *     <WishlistPage
 *       onAddToCart={(item) => {
 *         addToCart(item.variantId || item.productId);
 *       }}
 *       onViewProduct={(item) => {
 *         navigate(`/products/${item.productHandle}`);
 *       }}
 *       showShare
 *       layout="grid"
 *       columns={4}
 *     />
 *   );
 * }
 * ```
 */
export function WishlistPage({
  title = 'My Wishlist',
  emptyMessage = 'Your wishlist is empty',
  emptyDescription,
  continueShoppingText = 'Continue Shopping',
  continueShoppingUrl = '/collections/all',
  layout = 'grid',
  columns = 4,
  showSort = true,
  showShare = false,
  onAddToCart,
  onViewProduct,
  onShare,
  className,
  renderItem,
  renderEmpty,
}: WishlistPageProps) {
  const { items, count, remove, isLoading } = useWishlist();
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const sortedItems = useMemo(() => {
    switch (sortBy) {
      case 'oldest':
        return sortByOldest(items);
      case 'title':
        return sortByTitle(items);
      case 'price-low':
        return sortByPriceLowToHigh(items);
      case 'price-high':
        return sortByPriceHighToLow(items);
      case 'newest':
      default:
        return sortByNewest(items);
    }
  }, [items, sortBy]);

  const handleRemove = useCallback(
    (item: WishlistItem) => {
      remove(item.productId, item.variantId);
    },
    [remove],
  );

  const handleAddToCart = useCallback(
    (item: WishlistItem) => {
      onAddToCart?.(item);
    },
    [onAddToCart],
  );

  const handleViewProduct = useCallback(
    (item: WishlistItem) => {
      onViewProduct?.(item);
    },
    [onViewProduct],
  );

  const containerStyles: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '1.5rem',
  };

  const listStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const cardStyles: CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  };

  const emptyStyles: CSSProperties = {
    textAlign: 'center',
    padding: '4rem 2rem',
  };

  if (isLoading) {
    return (
      <div className={className} style={containerStyles}>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    if (renderEmpty) {
      return (
        <div className={className} style={containerStyles}>
          {renderEmpty()}
        </div>
      );
    }

    return (
      <div className={className} style={containerStyles}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
          {title}
        </h1>
        <div style={emptyStyles}>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '0.5rem' }}>
            {emptyMessage}
          </p>
          {emptyDescription && (
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {emptyDescription}
            </p>
          )}
          <a
            href={continueShoppingUrl}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#111827',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {continueShoppingText}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {title} ({count})
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showSort && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#fff',
                fontSize: '0.875rem',
              }}
              aria-label="Sort wishlist"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          )}

          {showShare && (
            <button
              type="button"
              onClick={onShare}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Share Wishlist
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={layout === 'grid' ? gridStyles : listStyles}>
        {sortedItems.map((item) => {
          const actions: ItemActions = {
            remove: () => handleRemove(item),
            addToCart: () => handleAddToCart(item),
            viewProduct: () => handleViewProduct(item),
          };

          if (renderItem) {
            return (
              <div key={`${item.productId}-${item.variantId ?? ''}`}>
                {renderItem(item, actions)}
              </div>
            );
          }

          return (
            <div
              key={`${item.productId}-${item.variantId ?? ''}`}
              style={cardStyles}
            >
              {item.image && (
                <button
                  type="button"
                  onClick={() => handleViewProduct(item)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={item.image.url}
                    alt={item.image.altText ?? item.productTitle}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                    }}
                  />
                </button>
              )}

              <div style={{ padding: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleViewProduct(item)}
                  style={{
                    display: 'block',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 500,
                    marginBottom: '0.25rem',
                    width: '100%',
                  }}
                >
                  {item.productTitle}
                </button>

                {item.variantTitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}
                  >
                    {item.variantTitle}
                  </p>
                )}

                {item.price && (
                  <p
                    style={{
                      margin: '0.5rem 0 0',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.price.currencyCode,
                    }).format(parseFloat(item.price.amount))}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '1rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#111827',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.875rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      background: '#fff',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
