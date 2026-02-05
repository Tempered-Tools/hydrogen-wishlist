/**
 * WishlistCount
 *
 * Badge counter for displaying wishlist item count.
 */

import { useWishlistCount } from '../hooks/useWishlistCount.js';

import type { ReactNode, CSSProperties } from 'react';

export interface WishlistCountProps {
  /**
   * Show badge when count is zero
   * @default false
   */
  showZero?: boolean;

  /**
   * Maximum number to display before showing "99+"
   * @default 99
   */
  maxDisplay?: number;

  /**
   * Enable pulse animation when count changes
   * @default false
   */
  animate?: boolean;

  /**
   * Custom render function for count
   */
  children?: (count: number, isLoading: boolean) => ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;
}

/**
 * Wishlist count badge component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <WishlistCount />
 *
 * // Custom render
 * <WishlistCount>
 *   {(count) => count > 0 && <span>({count})</span>}
 * </WishlistCount>
 *
 * // In a header
 * <Link to="/wishlist">
 *   <HeartIcon />
 *   <WishlistCount showZero={false} maxDisplay={99} />
 * </Link>
 * ```
 */
export function WishlistCount({
  showZero = false,
  maxDisplay = 99,
  animate: _animate = false,
  children,
  className,
  style,
}: WishlistCountProps) {
  const { count, isLoading } = useWishlistCount();

  // Custom render function
  if (children) {
    return <>{children(count, isLoading)}</>;
  }

  // Don't show if count is zero and showZero is false
  if (!showZero && count === 0) {
    return null;
  }

  // Don't show while loading
  if (isLoading) {
    return null;
  }

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

  const defaultStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.25rem',
    height: '1.25rem',
    padding: '0 0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1,
    color: '#fff',
    backgroundColor: '#e53e3e',
    borderRadius: '9999px',
  };

  return (
    <span
      className={className}
      style={{ ...defaultStyles, ...style }}
      aria-label={`${count} items in wishlist`}
    >
      {displayCount}
    </span>
  );
}
