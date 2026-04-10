# architecture.md — Wahi Fashion Technical Architecture

> The technical blueprint. Follow every pattern defined here consistently across all phases.

---

## Application Type

**Next.js 14 App Router** — single repository, frontend only for this phase.
This is a UI/POC build. There is no backend. All data comes from mock files in `lib/mock/`.
The architecture is designed so that replacing mock data with real API calls requires changing only the data-access layer — no component rewrites.

---

## Routing Structure

```
/                          → Landing page
/shop                      → Catalog / shop page
/shop/[slug]               → Product detail page
/cart                      → Cart page
/checkout                  → Checkout flow (multi-step, single page)
/auth/login                → Login page
/auth/register             → Register page
/order-confirmation        → Order confirmed page (post-checkout)
```

All routes use the **App Router** (`app/`). No Pages Router.

---

## Data Flow Architecture

```
lib/mock/index.ts          ← single source of all mock data + helpers
        ↓
  Page components              ← fetch/filter data at the page level
        ↓
  Feature components           ← receive data as props
        ↓
  Shared/UI components         ← purely presentational, no data access
```

**Rule:** Only page-level files (`page.tsx`) and Zustand stores access mock data directly. Components receive data via props only. This mirrors how real API calls will work when the backend is added.

---

## State Management Architecture

Three Zustand stores. Each has a single concern.

### `stores/cartStore.ts`

```typescript
// Manages: cart items, cart drawer open/close
// Persisted: yes (localStorage via zustand/middleware persist)
// Accessed by: CartDrawer, CartItem, CartSummary, ProductInfo, Navbar (item count)

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: number; // derived
  subtotal: number; // derived
}
```

### `stores/authStore.ts`

```typescript
// Manages: current user session (mocked)
// Persisted: yes (localStorage)
// Accessed by: Navbar, auth pages, checkout (to pre-fill delivery details)

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterPayload) => Promise<void>;
}

// Mock login: accepts any email/password, sets mock user from users-orders.ts
// Mock register: creates a temporary user object, does not persist across refresh
```

### `stores/uiStore.ts`

```typescript
// Manages: catalog filter/sort state
// Persisted: no (resets on navigation)
// Accessed by: shop/page.tsx, FilterSidebar, FilterBottomSheet, SortDropdown, ViewToggle

interface UIStore {
  selectedCategory: CategorySlug | "all";
  sortBy: "newest" | "price-asc" | "price-desc" | "rating" | "bestseller";
  viewMode: "grid" | "list";
  filters: {
    sizes: Size[];
    colors: ColorName[];
    priceRange: [number, number]; // default: [1800, 12500] — from mock data range
    badges: BadgeType[];
    inStockOnly: boolean;
  };
  setCategory: (category: CategorySlug | "all") => void;
  setSortBy: (sort: UIStore["sortBy"]) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}
```

---

## Component Architecture Patterns

### Pattern 1 — Page Component (data owner)

```tsx
// app/shop/page.tsx
// - Imports data from mock
// - Reads from uiStore for filter/sort state
// - Applies filtering/sorting logic
// - Passes results down to ProductGrid

export default function ShopPage(): JSX.Element {
  const { selectedCategory, sortBy, filters } = useUIStore();
  const products = getFilteredProducts(selectedCategory, sortBy, filters);

  return (
    <main>
      <FilterSidebar /> {/* reads/writes uiStore directly */}
      <ProductGrid products={products} /> {/* purely props-driven */}
    </main>
  );
}
```

### Pattern 2 — Feature Component (logic + presentation)

```tsx
// components/shop/ProductCard.tsx
// - Receives product as prop
// - Handles its own hover state (useState)
// - Calls cartStore.addItem on quick-add
// - No data fetching

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  className?: string;
}
```

### Pattern 3 — Shared/Primitive Component (pure presentation)

```tsx
// components/shared/Badge.tsx
// - Receives only primitive props
// - No store access
// - No data access

interface BadgeProps {
  type: BadgeType;
  className?: string;
}
```

---

## Animation System

All animations use **Framer Motion**. Define reusable variants here and import them.

### Create `lib/utils/animations.ts` with these standard variants:

```typescript
// Fade up — used for page section entrances
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Stagger container — wraps a list of animated children
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Fade in — used for overlays, modals, drawers
export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Slide in from right — used for cart drawer
export const slideInRight = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: { x: "100%", transition: { duration: 0.2 } },
};

// Slide up from bottom — used for mobile bottom sheets
export const slideUpVariant = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

// Scale in — used for modals, popovers
export const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};
```

### Usage Pattern

```tsx
// Page section entrance — wrap each section
<motion.section
  variants={fadeUpVariant}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>

// Staggered list — product grid
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {products.map(product => (
    <motion.div key={product.id} variants={fadeUpVariant}>
      <ProductCard product={product} />
    </motion.div>
  ))}
</motion.div>
```

---

## Tailwind Configuration Architecture

The `tailwind.config.ts` must extend the default theme with these custom tokens.
Codex will populate this file from the design system. Structure:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'obsidian': '#1A1009',
      'mahogany': '#3D1F0D',
      'bark': '#7A4522',
      'sand': '#C9A87C',
      'gold': '#D4A853',
      'ivory': '#FAF6F0',
      'cream': '#F2EAD8',
      'border-warm': '#E0D5C5',
      // text colors
      'text-primary': '#1A1009',
      'text-secondary': '#5C3D1E',
      'text-muted': '#9C7E5F',
      // semantic
      'success': '#3A6B4A',
      'error': '#8B2E2E',
      'warning': '#C47F17',
    },
    fontFamily: {
      'cormorant': ['Cormorant Garamond', 'Georgia', 'serif'],
      'dm-sans': ['DM Sans', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'display-2xl': ['96px', { lineHeight: '1.0' }],
      'display-xl':  ['72px', { lineHeight: '1.05' }],
      'display-lg':  ['56px', { lineHeight: '1.1' }],
      'h1': ['48px', { lineHeight: '1.15' }],
      'h2': ['36px', { lineHeight: '1.2' }],
      'h3': ['28px', { lineHeight: '1.25' }],
      'h4': ['22px', { lineHeight: '1.3' }],
      'body-lg': ['18px', { lineHeight: '1.6' }],
      'body': ['16px', { lineHeight: '1.6' }],
      'body-sm': ['14px', { lineHeight: '1.5' }],
      'label': ['13px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      'caption': ['12px', { lineHeight: '1.4' }],
      'price': ['20px', { lineHeight: '1.2' }],
    },
    spacing: {
      '1': '4px',   '2': '8px',   '3': '12px',  '4': '16px',
      '5': '20px',  '6': '24px',  '8': '32px',  '10': '40px',
      '12': '48px', '16': '64px', '20': '80px', '24': '96px',
      '32': '128px',
    },
    maxWidth: {
      'container': '1280px',
    },
    borderRadius: {
      'none': '0',
      'sm': '2px',
      'DEFAULT': '4px',
      'md': '6px',
      'lg': '8px',
      'full': '9999px',
    },
    boxShadow: {
      'card': '0 8px 32px rgba(26,16,9,0.12)',
      'card-hover': '0 16px 48px rgba(26,16,9,0.18)',
      'drawer': '-4px 0 32px rgba(26,16,9,0.16)',
      'bottom-sheet': '0 -4px 32px rgba(26,16,9,0.12)',
    },
    aspectRatio: {
      'product': '3/4',
      'category': '4/3',
    }
  }
}
```

---

## CSS Variables in globals.css

In addition to Tailwind tokens, define these CSS variables in `app/globals.css` for use in complex components:

```css
:root {
  --color-obsidian: #1a1009;
  --color-mahogany: #3d1f0d;
  --color-bark: #7a4522;
  --color-sand: #c9a87c;
  --color-gold: #d4a853;
  --color-ivory: #faf6f0;
  --color-cream: #f2ead8;
  --color-border: #e0d5c5;

  --font-cormorant: "Cormorant Garamond", Georgia, serif;
  --font-dm-sans: "DM Sans", system-ui, sans-serif;

  --section-padding-y-desktop: 96px;
  --section-padding-y-mobile: 64px;
  --section-padding-x-desktop: 80px;
  --section-padding-x-mobile: 24px;
  --container-max: 1280px;
  --navbar-height: 72px;
}
```

---

## Utility Functions

### `lib/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### `lib/utils/format.ts`

```typescript
// Format price in KES
export function formatPrice(amount: number, currency: string = "KES"): string {
  return `${currency} ${amount.toLocaleString("en-KE")}`;
}

// Format date
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Calculate discount percentage
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

// Check if any variant is in stock
export function isInStock(variants: ProductVariant[]): boolean {
  return variants.some((v) => v.stock > 0);
}

// Get available sizes for a product
export function getAvailableSizes(variants: ProductVariant[]): Size[] {
  return [...new Set(variants.filter((v) => v.stock > 0).map((v) => v.size))];
}

// Get available colors for a product
export function getAvailableColors(
  variants: ProductVariant[],
): { name: string; hex: string }[] {
  const seen = new Set<string>();
  return variants
    .filter((v) => v.stock > 0)
    .filter((v) => {
      const key = v.color;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((v) => ({ name: v.color, hex: v.colorHex }));
}
```

---

## Filtering Logic (for ShopPage)

Implement this function in `lib/utils/filter.ts`:

```typescript
export function getFilteredProducts(
  products: Product[],
  category: CategorySlug | "all",
  sortBy: UIStore["sortBy"],
  filters: FilterState,
): Product[] {
  let result = [...products];

  // Category
  if (category !== "all") {
    result = result.filter((p) => p.categorySlug === category);
  }

  // Sizes
  if (filters.sizes.length > 0) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.sizes.includes(v.size) && v.stock > 0),
    );
  }

  // Colors
  if (filters.colors.length > 0) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.colors.includes(v.color) && v.stock > 0),
    );
  }

  // Price range
  result = result.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
  );

  // Badges
  if (filters.badges.length > 0) {
    result = result.filter((p) => p.badge && filters.badges.includes(p.badge));
  }

  // In stock only
  if (filters.inStockOnly) {
    result = result.filter((p) => p.variants.some((v) => v.stock > 0));
  }

  // Sort
  switch (sortBy) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "bestseller":
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return result;
}
```

---

## Checkout Flow Architecture

The checkout is a **multi-step flow on a single page** (`/checkout`).
Local state manages the current step. No routing between steps.

```
Step 1: Delivery Details
  - Full name, email, phone
  - County (dropdown — Kenyan counties)
  - Town, Street address, Additional info
  - Delivery method: Standard Delivery / Pickup from store

Step 2: Payment Method
  - M-Pesa (primary — show phone number input)
  - Card (secondary — show card fields)
  - Cash on Delivery (tertiary)

Step 3: Review Order
  - Order summary (items, quantities, prices)
  - Delivery details summary
  - Payment method summary
  - Place Order button

Step 4: Confirmation
  - Order number (generated: WF-2026-XXXXX)
  - "Order confirmed. It's on its way to you."
  - Continue shopping CTA
```

Guest checkout: the checkout page is accessible without login.
If user is logged in, pre-fill delivery details from their default address.
If guest, show optional "Save your details — Join Wahi" prompt after step 1.

---

## Navbar Behaviour

```
Desktop (≥1024px):
  Left:   Wahi Fashion logo
  Center: Shop | Collections | About
  Right:  Search icon | Wishlist icon | Account icon | Cart icon (with count badge)

Mobile (<1024px):
  Left:   Hamburger menu
  Center: Wahi Fashion logo
  Right:  Cart icon (with count badge)

  Hamburger opens: full-screen overlay menu with all nav links + auth CTAs

Scroll behaviour:
  - At top of page: transparent background over hero
  - On scroll down: transitions to bg-obsidian with shadow
  - Transition: smooth 300ms
```

---

## Cart Drawer Architecture

The cart is a **slide-in drawer from the right** (desktop) and a **bottom sheet** (mobile).
Triggered by clicking the cart icon in the navbar.
Controlled by `cartStore.isOpen` and `cartStore.toggleCart`.

```
Drawer contents:
  Header: "Your Bag (N items)" + close button
  Body (scrollable): CartItem list
  Footer (sticky):
    Subtotal: KES X,XXX
    "View Bag" button → /cart
    "Checkout" button → /checkout
```

When cart is empty:
Show empty state: "Your cart is ready for something great."
With a CTA: "Shop the Collection" → /shop

---

## Kenyan Counties List

Use this list for the county dropdown in the checkout form:
Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Kiambu, Machakos, Nyeri,
Meru, Embu, Kitui, Makueni, Kajiado, Narok, Kericho, Bomet, Nandi, Uasin Gishu,
Trans Nzoia, Bungoma, Kakamega, Vihiga, Siaya, Kisii, Nyamira, Migori, Homa Bay,
Kilifi, Kwale, Taita Taveta, Tana River, Lamu, Garissa, Wajir, Mandera, Marsabit,
Isiolo, Tharaka Nithi, Kirinyaga, Murang'a, Nyandarua, Laikipia, Samburu,
Baringo, West Pokot, Turkana, Elgeyo Marakwet, Nyamira
