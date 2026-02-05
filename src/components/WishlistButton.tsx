/**
 * WishlistButton
 *
 * Heart/bookmark toggle button for adding/removing products from wishlist.
 */

import { useCallback, useMemo } from 'react';

import { useWishlist } from '../hooks/useWishlist.js';

import type { ProductInfo, WishlistItem } from '../types.js';
import type { ReactNode, MouseEvent, CSSProperties } from 'react';

export interface WishlistButtonProps {
  /**
   * Product information
   */
  product: ProductInfo;

  /**
   * Button size (width/height in pixels)
   * @default 40
   */
  size?: number;

  /**
   * Custom icon for wishlisted state
   */
  iconActive?: ReactNode;

  /**
   * Custom icon for non-wishlisted state
   */
  iconInactive?: ReactNode;

  /**
   * Accessible label for the button
   * @default "Toggle wishlist"
   */
  ariaLabel?: string;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Callback when product is added to wishlist
   */
  onAdd?: (item: WishlistItem) => void;

  /**
   * Callback when product is removed from wishlist
   */
  onRemove?: (productId: string, variantId?: string) => void;

  /**
   * Callback on error
   */
  onError?: (error: string) => void;

  /**
   * Disable the button
   */
  disabled?: boolean;
}

/**
 * Default heart icon (outline)
 */
function HeartOutlineIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/**
 * Default heart icon (filled)
 */
function HeartFilledIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/**
 * Wishlist toggle button component
 *
 * @example
 * ```tsx
 * <WishlistButton
 *   product={{
 *     id: product.id,
 *     title: product.title,
 *     variantId: selectedVariant?.id,
 *     image: product.featuredImage,
 *     price: selectedVariant?.price,
 *   }}
 *   onAdd={() => toast('Added to wishlist')}
 *   onRemove={() => toast('Removed from wishlist')}
 * />
 * ```
 */
export function WishlistButton({
  product,
  size = 40,
  iconActive,
  iconInactive,
  ariaLabel = 'Toggle wishlist',
  className,
  style,
  onAdd,
  onRemove,
  onError,
  disabled = false,
}: WishlistButtonProps) {
  const { isWishlisted, toggle, isLoading } = useWishlist({
    onAdd,
    onRemove,
    onError,
  });

  const isActive = isWishlisted(product.id, product.variantId);

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isLoading) return;

      await toggle(product);
    },
    [disabled, isLoading, toggle, product],
  );

  const iconSize = Math.round(size * 0.6);

  const defaultStyles: CSSProperties = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'transform 0.15s ease, opacity 0.15s ease',
      color: isActive ? '#e53e3e' : 'currentColor',
    }),
    [size, disabled, isActive],
  );

  const activeIcon = iconActive ?? <HeartFilledIcon size={iconSize} />;
  const inactiveIcon = iconInactive ?? <HeartOutlineIcon size={iconSize} />;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={className}
      style={{ ...defaultStyles, ...style }}
    >
      {isActive ? activeIcon : inactiveIcon}
    </button>
  );
}
