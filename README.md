# @tempered/hydrogen-wishlist

Wishlist components for Shopify Hydrogen storefronts. Data stored in Shopify customer metafields - zero vendor lock-in.

## Features

- **Metafield Storage**: Wishlist data stored in Shopify customer metafields, not a third-party database
- **Guest Support**: localStorage fallback for non-logged-in users with automatic merge on login
- **Zero Lock-in**: Your data stays in Shopify even if you uninstall
- **Bundle Size**: < 15KB gzipped
- **SSR Compatible**: Works with Hydrogen's server-side rendering

## Installation

```bash
npm install @tempered/hydrogen-wishlist
```

## Quick Start

### 1. Add the Provider

Wrap your app with `WishlistProvider`:

```tsx
import { WishlistProvider } from '@tempered/hydrogen-wishlist';

export default function App() {
  const customer = useCustomer(); // Your customer hook

  return (
    <WishlistProvider
      config={{
        apiUrl: 'https://wishbridge.temperedtools.xyz',
        shopDomain: 'my-store.myshopify.com',
        apiKey: 'wb_live_...', // From WishBridge dashboard
        customerId: customer?.id,
        customerAccessToken: customer?.accessToken,
      }}
    >
      <Outlet />
    </WishlistProvider>
  );
}
```

### 2. Add Wishlist Button to Products

```tsx
import { WishlistButton } from '@tempered/hydrogen-wishlist';

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.title}</h1>
      <WishlistButton
        product={{
          id: product.id,
          title: product.title,
          handle: product.handle,
          variantId: selectedVariant?.id,
          image: product.featuredImage,
          price: selectedVariant?.price,
        }}
      />
    </div>
  );
}
```

### 3. Add Wishlist Count Badge

```tsx
import { WishlistCount } from '@tempered/hydrogen-wishlist';

function Header() {
  return (
    <nav>
      <Link to="/wishlist">
        <HeartIcon />
        <WishlistCount />
      </Link>
    </nav>
  );
}
```

### 4. Create a Wishlist Page

```tsx
import { WishlistPage } from '@tempered/hydrogen-wishlist';

export default function WishlistRoute() {
  const navigate = useNavigate();

  return (
    <WishlistPage
      onAddToCart={(item) => {
        // Add to your cart
      }}
      onViewProduct={(item) => {
        navigate(`/products/${item.productHandle}`);
      }}
      showShare
    />
  );
}
```

## Components

### WishlistProvider

Configuration provider. Required at root.

```tsx
<WishlistProvider
  config={{
    apiUrl: string;           // WishBridge backend URL
    apiKey?: string;          // API key for authentication
    shopDomain: string;       // your-store.myshopify.com
    customerId?: string;      // Shopify customer GID
    customerAccessToken?: string; // For Storefront API reads
    enableGuestWishlist?: boolean; // Default: true
    enableAutoMerge?: boolean;    // Default: true
  }}
>
  {children}
</WishlistProvider>
```

### WishlistButton

Heart toggle button for adding/removing products.

```tsx
<WishlistButton
  product={ProductInfo}
  size={40}
  iconActive={<CustomIcon />}
  iconInactive={<CustomIcon />}
  onAdd={(item) => {}}
  onRemove={(productId, variantId) => {}}
/>
```

### WishlistCount

Badge showing item count.

```tsx
<WishlistCount
  showZero={false}
  maxDisplay={99}
/>
```

### WishlistDrawer

Slide-out panel for viewing wishlist.

```tsx
<WishlistDrawer
  isOpen={boolean}
  onClose={() => {}}
  position="right"
  onAddToCart={(item) => {}}
  onViewProduct={(item) => {}}
/>
```

### WishlistPage

Full-page wishlist view.

```tsx
<WishlistPage
  layout="grid"
  columns={4}
  showSort
  showShare
  onAddToCart={(item) => {}}
  onViewProduct={(item) => {}}
/>
```

## Hooks

### useWishlist

Core hook for wishlist operations.

```tsx
const {
  items,           // WishlistItem[]
  count,           // number
  isLoading,       // boolean
  isSyncing,       // boolean
  error,           // string | undefined
  add,             // (product: ProductInfo) => Promise<void>
  remove,          // (productId, variantId?) => Promise<void>
  toggle,          // (product: ProductInfo) => Promise<void>
  isWishlisted,    // (productId, variantId?) => boolean
  clear,           // () => Promise<void>
  sync,            // () => Promise<void>
} = useWishlist();
```

### useWishlistCount

Optimized hook for count only.

```tsx
const { count, isLoading } = useWishlistCount();
```

### useWishlistSync

Handle guest-to-customer merge.

```tsx
const {
  isSyncing,
  syncError,
  triggerSync,
} = useWishlistSync({
  autoSync: true,
  onSyncSuccess: () => {},
  onSyncError: (error) => {},
});
```

## Storage Strategy

### Guest Users (not logged in)
- Data stored in localStorage
- Key: `wishbridge_items`
- Instant operations, no network calls

### Logged-in Customers
- Data stored in Shopify customer metafields
- Namespace: `wishbridge`, Key: `items`
- Read via Storefront API, write via Admin API through backend

### Login Merge
When a guest logs in:
1. Guest items read from localStorage
2. Customer metafield read via backend
3. Items merged (keeping earliest `addedAt`)
4. Merged result written to metafield
5. localStorage cleared

## Plans

| Feature | Free | Pro ($9/mo) | Agency ($29/mo) |
|---------|------|-------------|-----------------|
| Guest wishlist (localStorage) | ✓ | ✓ | ✓ |
| Customer metafield sync | - | ✓ | ✓ |
| Shareable wishlist links | - | ✓ | ✓ |
| Analytics dashboard | - | ✓ | ✓ |
| Multi-site support | - | - | ✓ |
| Advanced analytics | - | - | ✓ |
| White-label | - | - | ✓ |
| Public API | - | - | ✓ |

## License

MIT
