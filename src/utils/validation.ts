/**
 * Validation utilities for @tempered/hydrogen-wishlist
 */

/**
 * Validate Shopify product GID
 */
export function isValidProductId(productId: string): boolean {
  if (!productId || typeof productId !== 'string') {
    return false;
  }

  // Shopify GID format: gid://shopify/Product/123456789
  const gidRegex = /^gid:\/\/shopify\/Product\/\d+$/;

  // Also accept numeric IDs
  const numericRegex = /^\d+$/;

  return gidRegex.test(productId) || numericRegex.test(productId);
}

/**
 * Validate Shopify variant GID
 */
export function isValidVariantId(variantId: string): boolean {
  if (!variantId || typeof variantId !== 'string') {
    return false;
  }

  // Shopify GID format: gid://shopify/ProductVariant/123456789
  const gidRegex = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

  // Also accept numeric IDs
  const numericRegex = /^\d+$/;

  return gidRegex.test(variantId) || numericRegex.test(variantId);
}

/**
 * Validate Shopify customer GID
 */
export function isValidCustomerId(customerId: string): boolean {
  if (!customerId || typeof customerId !== 'string') {
    return false;
  }

  // Shopify GID format: gid://shopify/Customer/123456789
  const gidRegex = /^gid:\/\/shopify\/Customer\/\d+$/;

  // Also accept numeric IDs
  const numericRegex = /^\d+$/;

  return gidRegex.test(customerId) || numericRegex.test(customerId);
}

/**
 * Extract numeric ID from Shopify GID
 */
export function extractNumericId(gid: string): string {
  if (!gid) return '';

  const match = gid.match(/\/(\d+)$/);
  return match?.[1] ?? gid;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 500); // Limit length
}

/**
 * Validate wishlist item structure
 */
export function isValidWishlistItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Required fields
  if (!obj['productId'] || typeof obj['productId'] !== 'string') {
    return false;
  }

  if (!obj['productTitle'] || typeof obj['productTitle'] !== 'string') {
    return false;
  }

  if (!obj['addedAt'] || typeof obj['addedAt'] !== 'string') {
    return false;
  }

  return true;
}
