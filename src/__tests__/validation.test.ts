/**
 * hydrogen-wishlist validation utility tests
 */

import { describe, it, expect } from 'vitest';

import {
  isValidProductId,
  isValidVariantId,
  isValidCustomerId,
  extractNumericId,
  sanitizeInput,
  isValidWishlistItem,
} from '../utils/validation.js';

// ---------------------------------------------------------------------------
// isValidProductId
// ---------------------------------------------------------------------------

describe('isValidProductId', () => {
  it('accepts Shopify GID format', () => {
    expect(isValidProductId('gid://shopify/Product/123456789')).toBe(true);
  });

  it('accepts numeric ID', () => {
    expect(isValidProductId('123456789')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidProductId('')).toBe(false);
  });

  it('rejects wrong GID resource type', () => {
    expect(isValidProductId('gid://shopify/ProductVariant/123')).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(isValidProductId('abc')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidProductId(null as unknown as string)).toBe(false);
    expect(isValidProductId(undefined as unknown as string)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidVariantId
// ---------------------------------------------------------------------------

describe('isValidVariantId', () => {
  it('accepts Shopify variant GID', () => {
    expect(isValidVariantId('gid://shopify/ProductVariant/123456789')).toBe(true);
  });

  it('accepts numeric ID', () => {
    expect(isValidVariantId('123456789')).toBe(true);
  });

  it('rejects wrong GID type', () => {
    expect(isValidVariantId('gid://shopify/Product/123')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidVariantId('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidCustomerId
// ---------------------------------------------------------------------------

describe('isValidCustomerId', () => {
  it('accepts Shopify customer GID', () => {
    expect(isValidCustomerId('gid://shopify/Customer/123456789')).toBe(true);
  });

  it('accepts numeric ID', () => {
    expect(isValidCustomerId('123456789')).toBe(true);
  });

  it('rejects wrong GID resource type', () => {
    expect(isValidCustomerId('gid://shopify/Product/123')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCustomerId('')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isValidCustomerId(null as unknown as string)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractNumericId
// ---------------------------------------------------------------------------

describe('extractNumericId', () => {
  it('extracts from product GID', () => {
    expect(extractNumericId('gid://shopify/Product/123')).toBe('123');
  });

  it('extracts from customer GID', () => {
    expect(extractNumericId('gid://shopify/Customer/456')).toBe('456');
  });

  it('returns input if already numeric', () => {
    expect(extractNumericId('789')).toBe('789');
  });

  it('returns empty string for falsy input', () => {
    expect(extractNumericId('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('removes angle brackets', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('limits length to 500 characters', () => {
    const long = 'x'.repeat(600);
    expect(sanitizeInput(long)).toHaveLength(500);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// isValidWishlistItem
// ---------------------------------------------------------------------------

describe('isValidWishlistItem', () => {
  it('validates a complete wishlist item', () => {
    expect(
      isValidWishlistItem({
        productId: 'gid://shopify/Product/123',
        productTitle: 'Test Product',
        addedAt: '2024-01-15T12:00:00Z',
      }),
    ).toBe(true);
  });

  it('validates item with optional fields', () => {
    expect(
      isValidWishlistItem({
        productId: '123',
        productTitle: 'Test',
        addedAt: '2024-01-15T12:00:00Z',
        variantId: 'v1',
        image: { url: 'https://example.com/img.jpg' },
      }),
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidWishlistItem(null)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(isValidWishlistItem('string')).toBe(false);
    expect(isValidWishlistItem(123)).toBe(false);
  });

  it('rejects missing productId', () => {
    expect(
      isValidWishlistItem({
        productTitle: 'Test',
        addedAt: '2024-01-15T12:00:00Z',
      }),
    ).toBe(false);
  });

  it('rejects missing productTitle', () => {
    expect(
      isValidWishlistItem({
        productId: '123',
        addedAt: '2024-01-15T12:00:00Z',
      }),
    ).toBe(false);
  });

  it('rejects missing addedAt', () => {
    expect(
      isValidWishlistItem({
        productId: '123',
        productTitle: 'Test',
      }),
    ).toBe(false);
  });

  it('rejects non-string required fields', () => {
    expect(
      isValidWishlistItem({
        productId: 123,
        productTitle: 'Test',
        addedAt: '2024-01-15',
      }),
    ).toBe(false);
  });
});
