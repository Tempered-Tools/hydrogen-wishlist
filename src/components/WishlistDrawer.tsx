/**
 * WishlistDrawer
 *
 * Slide-out panel for viewing wishlist items.
 */

import { useCallback, useEffect, useRef } from 'react';

import { useWishlist } from '../hooks/useWishlist.js';

import type { WishlistItem } from '../types.js';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';

export interface WishlistDrawerProps {
  /**
   * Whether the drawer is open
   */
  isOpen: boolean;

  /**
   * Callback when drawer should close
   */
  onClose: () => void;

  /**
   * Drawer position
   * @default "right"
   */
  position?: 'left' | 'right';

  /**
   * Show product images
   * @default true
   */
  showProductImage?: boolean;

  /**
   * Show add to cart button
   * @default true
   */
  showAddToCart?: boolean;

  /**
   * Add to cart handler
   */
  onAddToCart?: (item: WishlistItem) => void;

  /**
   * View product handler
   */
  onViewProduct?: (item: WishlistItem) => void;

  /**
   * Drawer title
   * @default "My Wishlist"
   */
  title?: string;

  /**
   * Empty state message
   * @default "Your wishlist is empty"
   */
  emptyMessage?: string;

  /**
   * Additional CSS class name for the overlay
   */
  overlayClassName?: string;

  /**
   * Additional CSS class name for the drawer
   */
  drawerClassName?: string;

  /**
   * Custom header content
   */
  header?: ReactNode;

  /**
   * Custom footer content
   */
  footer?: ReactNode;

  /**
   * Custom item renderer
   */
  renderItem?: (item: WishlistItem, actions: ItemActions) => ReactNode;
}

interface ItemActions {
  remove: () => void;
  addToCart: () => void;
  viewProduct: () => void;
}

/**
 * Close icon
 */
function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Wishlist drawer component
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <button onClick={() => setIsOpen(true)}>Open Wishlist</button>
 *
 * <WishlistDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onAddToCart={(item) => {
 *     addToCart(item.variantId || item.productId);
 *     setIsOpen(false);
 *   }}
 *   onViewProduct={(item) => {
 *     navigate(`/products/${item.productHandle}`);
 *     setIsOpen(false);
 *   }}
 * />
 * ```
 */
export function WishlistDrawer({
  isOpen,
  onClose,
  position = 'right',
  showProductImage = true,
  showAddToCart = true,
  onAddToCart,
  onViewProduct,
  title = 'My Wishlist',
  emptyMessage = 'Your wishlist is empty',
  overlayClassName,
  drawerClassName,
  header,
  footer,
  renderItem,
}: WishlistDrawerProps) {
  const { items, count, remove, isLoading } = useWishlist();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

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

  if (!isOpen) {
    return null;
  }

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  };

  const drawerStyles: CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    [position]: 0,
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
  };

  const contentStyles: CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
  };

  const footerStyles: CSSProperties = {
    padding: '1rem',
    borderTop: '1px solid #e5e7eb',
  };

  const itemStyles: CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e5e7eb',
  };

  const imageStyles: CSSProperties = {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={overlayClassName}
        style={overlayStyles}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={drawerClassName}
        style={drawerStyles}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div style={headerStyles}>
          {header ?? (
            <>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                {title} ({count})
              </h2>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                aria-label="Close wishlist"
              >
                <CloseIcon />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div style={contentStyles}>
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              {emptyMessage}
            </p>
          ) : (
            <div>
              {items.map((item) => {
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
                    style={itemStyles}
                  >
                    {showProductImage && item.image && (
                      <img
                        src={item.image.url}
                        alt={item.image.altText ?? item.productTitle}
                        style={imageStyles}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
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
                            margin: '0.25rem 0 0',
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
                          marginTop: '0.5rem',
                        }}
                      >
                        {showAddToCart && (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.75rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Add to Cart
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            border: 'none',
                            borderRadius: '4px',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#ef4444',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && <div style={footerStyles}>{footer}</div>}
      </div>
    </>
  );
}
