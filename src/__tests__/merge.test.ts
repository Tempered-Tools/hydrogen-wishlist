/**
 * hydrogen-wishlist merge utility tests
 */

import { describe, it, expect } from 'vitest';

import {
  mergeWishlists,
  createItemKey,
  findNewItems,
  deduplicateItems,
  sortByNewest,
  sortByOldest,
  sortByTitle,
  sortByPriceLowToHigh,
  sortByPriceHighToLow,
} from '../utils/merge.js';

import type { WishlistItem } from '../types.js';

const makeItem = (overrides: Partial<WishlistItem> = {}): WishlistItem => ({
  productId: 'gid://shopify/Product/1',
  productTitle: 'Product A',
  addedAt: '2024-01-15T12:00:00Z',
  ...overrides,
});

// ---------------------------------------------------------------------------
// createItemKey
// ---------------------------------------------------------------------------

describe('createItemKey', () => {
  it('creates key from productId and variantId', () => {
    expect(
      createItemKey(makeItem({ productId: 'p1', variantId: 'v1' })),
    ).toBe('p1:v1');
  });

  it('uses default when variantId is undefined', () => {
    expect(
      createItemKey(makeItem({ productId: 'p1', variantId: undefined })),
    ).toBe('p1:default');
  });
});

// ---------------------------------------------------------------------------
// mergeWishlists
// ---------------------------------------------------------------------------

describe('mergeWishlists', () => {
  it('returns union of items', () => {
    const guest = [makeItem({ productId: 'p1' })];
    const customer = [makeItem({ productId: 'p2' })];

    const result = mergeWishlists(guest, customer);
    expect(result).toHaveLength(2);
  });

  it('deduplicates by productId + variantId', () => {
    const guest = [makeItem({ productId: 'p1', variantId: 'v1' })];
    const customer = [makeItem({ productId: 'p1', variantId: 'v1' })];

    const result = mergeWishlists(guest, customer);
    expect(result).toHaveLength(1);
  });

  it('keeps earliest addedAt for duplicates', () => {
    const guest = [
      makeItem({
        productId: 'p1',
        addedAt: '2024-01-10T00:00:00Z',
      }),
    ];
    const customer = [
      makeItem({
        productId: 'p1',
        addedAt: '2024-01-15T00:00:00Z',
      }),
    ];

    const result = mergeWishlists(guest, customer);
    expect(result).toHaveLength(1);
    expect(result[0]!.addedAt).toBe('2024-01-10T00:00:00Z');
  });

  it('keeps customer addedAt when it is earlier', () => {
    const guest = [
      makeItem({ productId: 'p1', addedAt: '2024-02-01T00:00:00Z' }),
    ];
    const customer = [
      makeItem({ productId: 'p1', addedAt: '2024-01-01T00:00:00Z' }),
    ];

    const result = mergeWishlists(guest, customer);
    expect(result[0]!.addedAt).toBe('2024-01-01T00:00:00Z');
  });

  it('sorts result newest first', () => {
    const guest = [
      makeItem({ productId: 'p1', addedAt: '2024-01-01T00:00:00Z' }),
    ];
    const customer = [
      makeItem({ productId: 'p2', addedAt: '2024-02-01T00:00:00Z' }),
    ];

    const result = mergeWishlists(guest, customer);
    expect(result[0]!.productId).toBe('p2');
    expect(result[1]!.productId).toBe('p1');
  });

  it('handles empty guest list', () => {
    const customer = [makeItem({ productId: 'p1' })];
    const result = mergeWishlists([], customer);
    expect(result).toHaveLength(1);
  });

  it('handles empty customer list', () => {
    const guest = [makeItem({ productId: 'p1' })];
    const result = mergeWishlists(guest, []);
    expect(result).toHaveLength(1);
  });

  it('handles both empty lists', () => {
    const result = mergeWishlists([], []);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// findNewItems
// ---------------------------------------------------------------------------

describe('findNewItems', () => {
  it('finds items present in after but not before', () => {
    const before = [makeItem({ productId: 'p1' })];
    const after = [
      makeItem({ productId: 'p1' }),
      makeItem({ productId: 'p2' }),
    ];

    const newItems = findNewItems(before, after);
    expect(newItems).toHaveLength(1);
    expect(newItems[0]!.productId).toBe('p2');
  });

  it('returns empty array when no new items', () => {
    const items = [makeItem({ productId: 'p1' })];
    const result = findNewItems(items, items);
    expect(result).toHaveLength(0);
  });

  it('returns all items when before is empty', () => {
    const after = [makeItem({ productId: 'p1' }), makeItem({ productId: 'p2' })];
    const result = findNewItems([], after);
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// deduplicateItems
// ---------------------------------------------------------------------------

describe('deduplicateItems', () => {
  it('removes duplicate items by key', () => {
    const items = [
      makeItem({ productId: 'p1', addedAt: '2024-01-01T00:00:00Z' }),
      makeItem({ productId: 'p1', addedAt: '2024-02-01T00:00:00Z' }),
    ];

    const result = deduplicateItems(items);
    expect(result).toHaveLength(1);
  });

  it('keeps first occurrence', () => {
    const items = [
      makeItem({ productId: 'p1', productTitle: 'First' }),
      makeItem({ productId: 'p1', productTitle: 'Second' }),
    ];

    const result = deduplicateItems(items);
    expect(result[0]!.productTitle).toBe('First');
  });

  it('returns empty array for empty input', () => {
    expect(deduplicateItems([])).toHaveLength(0);
  });

  it('treats different variantIds as different items', () => {
    const items = [
      makeItem({ productId: 'p1', variantId: 'v1' }),
      makeItem({ productId: 'p1', variantId: 'v2' }),
    ];

    const result = deduplicateItems(items);
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Sort Functions
// ---------------------------------------------------------------------------

describe('sortByNewest', () => {
  it('sorts newest first', () => {
    const items = [
      makeItem({ productId: 'p1', addedAt: '2024-01-01T00:00:00Z' }),
      makeItem({ productId: 'p2', addedAt: '2024-03-01T00:00:00Z' }),
      makeItem({ productId: 'p3', addedAt: '2024-02-01T00:00:00Z' }),
    ];
    const result = sortByNewest(items);
    expect(result[0]!.productId).toBe('p2');
    expect(result[2]!.productId).toBe('p1');
  });

  it('does not mutate original array', () => {
    const items = [
      makeItem({ productId: 'p1', addedAt: '2024-01-01T00:00:00Z' }),
      makeItem({ productId: 'p2', addedAt: '2024-02-01T00:00:00Z' }),
    ];
    const result = sortByNewest(items);
    expect(result).not.toBe(items);
    expect(items[0]!.productId).toBe('p1');
  });

  it('handles empty array', () => {
    expect(sortByNewest([])).toHaveLength(0);
  });
});

describe('sortByOldest', () => {
  it('sorts oldest first', () => {
    const items = [
      makeItem({ productId: 'p1', addedAt: '2024-03-01T00:00:00Z' }),
      makeItem({ productId: 'p2', addedAt: '2024-01-01T00:00:00Z' }),
    ];
    const result = sortByOldest(items);
    expect(result[0]!.productId).toBe('p2');
  });
});

describe('sortByTitle', () => {
  it('sorts alphabetically by product title', () => {
    const items = [
      makeItem({ productTitle: 'Zebra' }),
      makeItem({ productId: 'p2', productTitle: 'Apple' }),
      makeItem({ productId: 'p3', productTitle: 'Mango' }),
    ];
    const result = sortByTitle(items);
    expect(result[0]!.productTitle).toBe('Apple');
    expect(result[2]!.productTitle).toBe('Zebra');
  });
});

describe('sortByPriceLowToHigh', () => {
  it('sorts by price ascending', () => {
    const items = [
      makeItem({ productId: 'p1', price: { amount: '30.00', currencyCode: 'USD' } }),
      makeItem({ productId: 'p2', price: { amount: '10.00', currencyCode: 'USD' } }),
      makeItem({ productId: 'p3', price: { amount: '20.00', currencyCode: 'USD' } }),
    ];
    const result = sortByPriceLowToHigh(items);
    expect(result[0]!.productId).toBe('p2');
    expect(result[2]!.productId).toBe('p1');
  });

  it('puts items without price at the end', () => {
    const items = [
      makeItem({ productId: 'p1' }), // no price
      makeItem({ productId: 'p2', price: { amount: '10.00', currencyCode: 'USD' } }),
    ];
    const result = sortByPriceLowToHigh(items);
    expect(result[0]!.productId).toBe('p2');
    expect(result[1]!.productId).toBe('p1');
  });
});

describe('sortByPriceHighToLow', () => {
  it('sorts by price descending', () => {
    const items = [
      makeItem({ productId: 'p1', price: { amount: '10.00', currencyCode: 'USD' } }),
      makeItem({ productId: 'p2', price: { amount: '30.00', currencyCode: 'USD' } }),
    ];
    const result = sortByPriceHighToLow(items);
    expect(result[0]!.productId).toBe('p2');
    expect(result[1]!.productId).toBe('p1');
  });

  it('puts items without price at the end', () => {
    const items = [
      makeItem({ productId: 'p1' }), // no price
      makeItem({ productId: 'p2', price: { amount: '10.00', currencyCode: 'USD' } }),
    ];
    const result = sortByPriceHighToLow(items);
    expect(result[0]!.productId).toBe('p2');
    expect(result[1]!.productId).toBe('p1');
  });
});
