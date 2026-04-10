# PLAN.md — Wahi Fashion Frontend Build Plan

> Execute phases in strict order. Complete and verify each phase before starting the next.
> Read AGENTS.md, context.md, and architecture.md in full before starting Phase 1.

---

## State of the Project When You Receive It

When you start, the project already contains:

```
/
├── AGENTS.md                          ← read first
├── PLAN.md                            ← this file
├── context.md                         ← brand and UX intent
├── architecture.md                    ← technical blueprint
├── lib/
│   │   ├── types/
│   │   │   └── index.ts               ← ALL TypeScript types — DO NOT regenerate
│   │   └── mock/
│   │       ├── categories.ts          ← 5 categories — DO NOT regenerate
│   │       ├── products.ts            ← 28 products — DO NOT regenerate
│   │       ├── users-orders.ts        ← users, cart, orders — DO NOT regenerate
│   │       └── index.ts               ← barrel + helpers — DO NOT regenerate
│   └── styles/
│       └── design-system.md           ← design tokens reference — DO NOT regenerate
└── tailwind.config.ts                 ← exists but NOT yet populated with tokens
```

**Do not regenerate, modify, or move any of the above files.**
Your job starts at Phase 1 below. Where necessary feel free to deviate from the instructions. For example if a tool's latest version does something different than what the instructions dictate, feel free to do what the latest version does - e.g. next.js 16 structure, tailwind v4 etc.

---

## Phase 1 — Project Configuration & Foundation

### Goal

Configure the existing Next.js project with all design tokens, fonts, libraries, and utilities so that every subsequent phase has a solid foundation to build on.

### What To Do

#### 1.1 — Install Dependencies

Run the following installs:

```bash
# Core UI and animation
npm install framer-motion
npm install zustand
npm install clsx tailwind-merge

# shadcn/ui setup
npx shadcn-ui@latest init
# When prompted:
# - TypeScript: yes
# - Style: Default
# - Base color: Stone (closest to our warm palette — we will override)
# - Global CSS: app/globals.css
# - CSS variables: yes
# - Tailwind config: tailwind.config.ts
# - Components: components/ui
# - Utils: lib/utils
# - React Server Components: yes
# - Alias: @/

# Install shadcn components needed across the project
npx shadcn-ui@latest add button input label select sheet dialog dropdown-menu slider checkbox badge separator scroll-area
```

#### 1.2 — Configure `tailwind.config.ts`

Populate with the full token set defined in `architecture.md` under "Tailwind Configuration Architecture".
Replace the entire `theme.extend` section with the tokens specified there.
Set `darkMode` to `false` — this project does not have a dark mode.
Set content paths:

```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
],
```

#### 1.3 — Configure `app/globals.css`

- Add all CSS custom properties from `architecture.md` under "CSS Variables in globals.css"
- Set base body styles:

```css
body {
  font-family: var(--font-dm-sans);
  background-color: var(--color-ivory);
  color: var(--color-obsidian);
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-cormorant);
}
```

- Override shadcn/ui CSS variables to match the Wahi palette

#### 1.4 — Configure Fonts in `app/layout.tsx`

```typescript
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});
```

Apply both font variables to the `<html>` element.

#### 1.5 — Create Utility Files

Create these files exactly as specified in `architecture.md`:

- `lib/utils/cn.ts` — className merge utility
- `lib/utils/format.ts` — formatPrice, formatDate, discountPercent, isInStock, getAvailableSizes, getAvailableColors
- `lib/utils/animations.ts` — all Framer Motion variants (fadeUpVariant, staggerContainer, fadeInVariant, slideInRight, slideUpVariant, scaleInVariant)
- `lib/utils/filter.ts` — getFilteredProducts function

#### 1.6 — Create Zustand Stores

Create all three stores as specified in `architecture.md`:

- `stores/cartStore.ts` — with localStorage persistence via zustand `persist` middleware
- `stores/authStore.ts` — mock login accepts any credentials, sets first mock user from `lib/mock/users-orders.ts`
- `stores/uiStore.ts` — default priceRange `[1800, 12500]` matching mock data

#### 1.7 — Update Root Layout

`app/layout.tsx` should:

- Apply fonts
- Set metadata: `title: 'Wahi Fashion'`, `description: 'Luxury women\'s fashion. More than fashion — a lifestyle.'`
- Have a `<main>` wrapper with min-height 100vh
- Import globals.css
- Leave Navbar and Footer slots as `{/* Phase 3 */}` comments for now

### Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Tailwind tokens are accessible (test by creating a temp `<div className="bg-gold">` in page.tsx)
- [ ] Both fonts load in the browser
- [ ] All three stores are importable without errors
- [ ] All utility files are importable without errors

### Files Created/Modified in This Phase

- `tailwind.config.ts` (modified)
- `app/globals.css` (modified)
- `app/layout.tsx` (modified)
- `lib/utils/cn.ts` (created)
- `lib/utils/format.ts` (created)
- `lib/utils/animations.ts` (created)
- `lib/utils/filter.ts` (created)
- `stores/cartStore.ts` (created)
- `stores/authStore.ts` (created)
- `stores/uiStore.ts` (created)

---

## Phase 2 — Shared Components: Layout Primitives

### Goal

Build the Navbar, Footer, CartDrawer, and all shared primitive components. These are used by every page — they must be built and working before any page is built.

### Context

Read `context.md` for the brand voice used in copy.
Read `architecture.md` under "Navbar Behaviour" and "Cart Drawer Architecture".

### What To Do

#### 2.1 — Shared Primitive Components

Build these small, reusable components first. They are building blocks for everything else.

**`components/shared/Badge.tsx`**

- Props: `type: BadgeType`, `className?: string`
- Renders a small pill badge
- Styles per type:
  - `new` → bg-obsidian, text-ivory
  - `sale` → bg-gold, text-obsidian
  - `bestseller` → bg-mahogany, text-ivory
  - `limited` → bg-bark, text-ivory
- Text: uppercase, font-dm-sans, text-label, letter-spacing wide
- Size: px-2 py-0.5

**`components/shared/PriceDisplay.tsx`**

- Props: `price: number`, `originalPrice?: number`, `currency?: string`, `size?: 'sm' | 'md' | 'lg'`
- If `originalPrice` exists: show original struck-through in text-muted, show sale price in gold
- Use `formatPrice()` from utils
- Size variants change font size

**`components/shared/RatingStars.tsx`**

- Props: `rating: number`, `reviewCount?: number`, `showCount?: boolean`
- Renders filled/partial star icons using lucide-react
- Gold filled stars, muted empty stars
- Optionally shows "(N reviews)" beside stars

**`components/shared/SectionHeader.tsx`**

- Props: `label?: string`, `title: string`, `subtitle?: string`, `align?: 'left' | 'center'`
- `label`: small uppercase dm-sans text in gold, shown above title
- `title`: Cormorant Garamond h2, obsidian
- `subtitle`: dm-sans body, text-secondary
- Used on every landing page section

**`components/shared/LoadingSpinner.tsx`**

- Simple animated ring spinner
- Uses gold color
- Sizes: sm, md, lg

**`components/shared/EmptyState.tsx`**

- Props: `title: string`, `description?: string`, `ctaLabel?: string`, `ctaHref?: string`
- Centered layout, Cormorant title, DM Sans description
- Optional CTA button in gold

#### 2.2 — Navbar (`components/layout/Navbar.tsx`)

Follow the exact spec in `architecture.md` under "Navbar Behaviour".

Key requirements:

- Uses `useCartStore()` to display cart item count badge
- Uses `useAuthStore()` to show login vs account icon
- Scroll behaviour: transparent at top, bg-obsidian on scroll (use `useEffect` + `window.addEventListener('scroll')`)
- On mobile: hamburger opens a full-screen `motion.div` overlay (use `AnimatePresence` + `fadeInVariant` from animations.ts)
- Mobile overlay shows: Shop, Collections, About links + "Welcome Back" (login) / "Join Wahi" (register) CTAs
- Logo: "WAHI FASHION" in font-cormorant font-light tracking-widest, text-ivory
- Cart count badge: small circle in bg-gold, text-obsidian, positioned top-right of cart icon
- All nav links: font-dm-sans text-label uppercase tracking-widest text-ivory, hover:text-gold transition
- Height: h-18 (72px) desktop, h-16 (60px) mobile
- Position: fixed top-0 left-0 right-0 z-50

#### 2.3 — Footer (`components/layout/Footer.tsx`)

Design: dark (bg-obsidian), warm, editorial.

Layout (4-column on desktop, stacked on mobile):

```
Column 1: Brand
  - WAHI FASHION logo (large, Cormorant)
  - Brand tagline: "More than fashion. A lifestyle."
  - Social links: Instagram, TikTok, Facebook (lucide icons)

Column 2: Shop
  - Links: All Products, Office & Formal, Casual Wear,
           Party & Evening, Traditional African, Accessories

Column 3: Help
  - Links: About Us, Contact, Sizing Guide,
           Delivery Information, Returns Policy, FAQs

Column 4: Contact
  - Location: Lumumba Drive, Roysambu, Nairobi
  - Website: wahifashion.Africa
  - Hours: Mon–Sat 9am–7pm, Sun 11am–5pm
```

Bottom bar: "© 2026 Wahi Fashion. All rights reserved." centered, text-muted, text-caption.

All text: text-ivory or text-muted. Section headings: text-gold, text-label, uppercase.
Add a subtle top border: border-t border-bark/30.

#### 2.4 — CartDrawer (`components/layout/CartDrawer.tsx`)

Follow the spec in `architecture.md` under "Cart Drawer Architecture".

Key requirements:

- Controlled by `cartStore.isOpen` and `cartStore.toggleCart`
- Uses `AnimatePresence` with `slideInRight` variant (desktop) / `slideUpVariant` (mobile)
- Backdrop: semi-transparent bg-obsidian/60, clicking it closes the drawer
- Width: w-full max-w-sm (desktop), full-width bottom sheet (mobile, max-h-[85vh])
- Uses `shadcn Sheet` component as the base, styled to match Wahi palette
- CartItem sub-component inside: shows product image (60x80px, aspect-product), name, size, color, price, quantity controls, remove button
- Quantity controls: minus button, number, plus button — calls `cartStore.updateQuantity`
- Remove: calls `cartStore.removeItem`
- Footer sticky: subtotal formatted with `formatPrice`, "View Bag" and "Checkout" buttons

#### 2.5 — Update Root Layout

Add Navbar and CartDrawer to `app/layout.tsx`.
Footer will be added at the page level (not root layout) so it appears below page content.

### Verification Checklist

- [ ] Navbar renders correctly on mobile and desktop
- [ ] Navbar scroll behaviour works (transparent → obsidian)
- [ ] Mobile hamburger menu opens and closes
- [ ] Cart icon shows correct item count from store
- [ ] CartDrawer opens/closes when cart icon is clicked
- [ ] CartDrawer shows empty state when cart is empty
- [ ] All primitive components render without errors
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/shared/Badge.tsx`
- `components/shared/PriceDisplay.tsx`
- `components/shared/RatingStars.tsx`
- `components/shared/SectionHeader.tsx`
- `components/shared/LoadingSpinner.tsx`
- `components/shared/EmptyState.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- `components/layout/CartDrawer.tsx`
- `app/layout.tsx` (modified — add Navbar and CartDrawer)

---

## Phase 3 — Landing Page

### Goal

Build the landing page (`app/page.tsx`) as a flowing editorial experience that immediately communicates the Wahi brand. This is the most important page — it must evoke desire and make the visitor want to stay.

### Context

Re-read `context.md` before building this page, especially "Emotional Goals" and "Stay Longer Principle".
The landing page flows: Hero → Categories → Featured Products → Brand Story → New Arrivals → Lookbook Strip → Footer.

### What To Do

#### 3.1 — HeroCarousel (`components/landing/HeroCarousel.tsx`)

The hero takes up the full viewport height (100vh) on desktop, 80vh on mobile.

Content:

- Background: a full-bleed dark image with a warm overlay (bg-mahogany/40 over the image)
- 3 slides, auto-advancing every 5 seconds with a manual dot indicator
- Each slide has:
  - A label in gold (text-label uppercase): e.g. "New Collection 2026"
  - A headline in Cormorant (text-display-xl or text-display-lg on mobile): e.g. "Dressing Like A Main Character"
  - A subtitle in DM Sans (text-body, text-ivory/80): 1 sentence brand copy
  - Two CTAs: primary "Shop Now" (gold button) → /shop, secondary "Explore Collections" (ghost button) → /shop

Slide images — use these Unsplash URLs as hero backgrounds:

1. `https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=80`
2. `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80`
3. `https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80`

Slide content:

1. Label: "New Season 2026" | Headline: "The Future of Fashion Is Here" | Sub: "Premium women's fashion, curated for every chapter of your story."
2. Label: "Luxury African Wear" | Headline: "Your Heritage, Elevated" | Sub: "Kitenge, ankara, and fusion pieces designed for the modern African woman."
3. Label: "Office to Evening" | Headline: "Dressing Like A Main Character" | Sub: "She doesn't dress for the job she has. She dresses for the story she's writing."

Animation: slides fade in, text animates up with staggered delay using `fadeUpVariant`.
Dot indicators: small circles in gold (active) and ivory/40 (inactive), positioned bottom-center.
Scroll indicator: a subtle animated down-arrow at the very bottom of the hero.

#### 3.2 — CategoryGrid (`components/landing/CategoryGrid.tsx`)

Props: `categories: Category[]`
Data: import `categories` from `lib/mock/index.ts`

Layout: horizontal scroll on mobile, 5-column grid on desktop.

Each category card:

- Full-bleed image (aspect-category 4:3)
- Dark overlay gradient (bottom to top: from-obsidian/80 to-transparent)
- Category name overlaid bottom-left in Cormorant, text-ivory, text-h4
- Arrow icon bottom-right in gold
- On hover: image scales to 1.05, overlay darkens slightly
- Clicking → `/shop?category={slug}`
- Use `motion.div` with `fadeUpVariant` and stagger

Section header above the grid:

- Label: "Shop by Category"
- Title: "Every Look, Every Occasion"

#### 3.3 — FeaturedProducts (`components/landing/FeaturedProducts.tsx`)

Props: `products: Product[]`
Data: import `featuredProducts` from `lib/mock/index.ts` (max 8 products)

Layout: 4-column grid desktop, 2-column mobile.

Each product uses `ProductCard` component (built in Phase 4, but create a stub/placeholder card here that will be replaced).

Actually: build the ProductCard in this phase since it's needed here. See ProductCard spec below.

Section header:

- Label: "Hand-Picked For You"
- Title: "Featured Collection"

CTA below the grid: "View All Products" button (secondary style) → /shop

#### 3.4 — ProductCard (`components/shop/ProductCard.tsx`)

This component is needed on the landing page so build it here.

Props: `product: Product`, `viewMode?: 'grid' | 'list'`, `className?: string`

Grid mode (default):

- Container: bg-cream, rounded-sm, overflow-hidden, cursor-pointer
- Image: aspect-product (3:4), full-width, `next/image` with objectFit cover
  - On hover: scale to 1.04 (motion transition 300ms)
- Badge: positioned top-left, absolute, using `Badge` component
- Quick-add overlay: on hover, a subtle bar slides up from the bottom with "Quick Add" button
  - Quick-add opens a minimal size/color selector (use a popover or inline expand)
  - On add: calls `cartStore.addItem`, shows a brief success state
- Product info below image:
  - Category: text-caption text-muted uppercase
  - Name: text-body-sm font-medium text-primary, truncated to 2 lines
  - Rating: `RatingStars` component, small
  - Price: `PriceDisplay` component

List mode:

- Horizontal layout: image left (fixed 120px wide, aspect-product), info right
- Shows more info: description truncated to 2 lines, size availability
- Same hover and add-to-bag behaviour

Clicking the card (not the quick-add) → `/shop/{product.slug}`

#### 3.5 — BrandStory (`components/landing/BrandStory.tsx`)

Two-column layout on desktop (image left, text right), stacked on mobile.

Left: a large editorial image (use `https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80`)
Right:

- Label: "Our Story"
- Title: "More Than Fashion. A Lifestyle." (Cormorant, text-h1)
- Body: use the brand story copy from `context.md`:
  "Nairobi's fashion scene is alive, dynamic, and ever-evolving — and Wahi Fashion was created to be at the centre of it all. We saw a gap in the market. A woman who wanted more than what was on offer..."
- CTA: "Meet Wahi Fashion" (ghost button)

Background: bg-cream (slightly off-white, warm)
Image has a subtle warm overlay

#### 3.6 — NewArrivals (`components/landing/NewArrivals.tsx`)

Props: `products: Product[]`
Data: `newArrivals` from `lib/mock/index.ts`

Layout on mobile: horizontal scroll carousel (swipeable, `overflow-x-auto snap-x snap-mandatory`).
Layout on desktop: 4-column grid.

Each product: `ProductCard` component.

Section header:

- Label: "Just Landed"
- Title: "New Arrivals"

#### 3.7 — LookbookStrip (`components/landing/LookbookStrip.tsx`)

A horizontal strip of 6 editorial-style images in a flowing, slightly overlapping layout.

Use these Unsplash URLs:

1. `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80`
2. `https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80`
3. `https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80`
4. `https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80`
5. `https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80`
6. `https://images.unsplash.com/photo-1544441452-d1cbe79fe5a7?w=600&q=80`

Layout: horizontal scroll strip, all images same height (400px desktop, 280px mobile), varying widths.
Images have no gap between them — a seamless editorial strip.
On hover: individual image scales slightly (1.02) with a gold overlay tint.
Overlay text on the strip: "Follow Our World — @wahifashion" centered over the strip in Cormorant italic, text-ivory.

This section has bg-obsidian background above and below it — creating a dark band across the page.

#### 3.8 — Assemble Landing Page (`app/page.tsx`)

```tsx
import { categories } from "@/lib/mock";
import { featuredProducts, newArrivals } from "@/lib/mock";
// Import all landing sections
// Compose in order with Footer at the bottom

export default function LandingPage() {
  return (
    <>
      <HeroCarousel />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <BrandStory />
      <NewArrivals products={newArrivals} />
      <LookbookStrip />
      <Footer />
    </>
  );
}
```

All sections wrapped in `motion.section` with `fadeUpVariant` and `whileInView`.

### Verification Checklist

- [ ] Landing page renders end-to-end without errors
- [ ] Hero carousel auto-advances and manual dots work
- [ ] Category cards link to `/shop?category=X`
- [ ] Featured products render with badges and pricing
- [ ] Product cards have hover states and quick-add
- [ ] Brand story section renders correctly
- [ ] New arrivals horizontal scroll works on mobile
- [ ] Lookbook strip renders
- [ ] All section animations trigger on scroll
- [ ] Page is responsive at 375px and 1280px
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/landing/HeroCarousel.tsx`
- `components/landing/CategoryGrid.tsx`
- `components/landing/FeaturedProducts.tsx`
- `components/landing/BrandStory.tsx`
- `components/landing/NewArrivals.tsx`
- `components/landing/LookbookStrip.tsx`
- `components/shop/ProductCard.tsx` (needed here, used in Phase 4 too)
- `app/page.tsx`

---

## Phase 4 — Shop / Catalog Page

### Goal

Build the full catalog experience at `/shop` with category filtering, multi-filter sidebar, sort, and grid/list view toggle.

### Context

Read `architecture.md` under "Filtering Logic" for the filter implementation.
All filter state lives in `uiStore`. The page reads from it, doesn't own it.

### What To Do

#### 4.1 — FilterSidebar (`components/shop/FilterSidebar.tsx`)

Desktop only (hidden on mobile — mobile gets FilterBottomSheet).
Fixed left column, 280px wide.

Sections (each collapsible with an expand/collapse chevron):

**Categories**

- "All" + each of the 5 categories
- Active category highlighted in gold
- Shows product count per category
- Calls `uiStore.setCategory()`

**Price Range**

- Dual-handle range slider (use shadcn `Slider` component)
- Min: 1800, Max: 12500
- Shows current range: "KES 2,500 — KES 9,000"
- Calls `uiStore.setFilters({ priceRange: [min, max] })`

**Sizes**

- Checkbox grid of all sizes: XS S M L XL XXL One Size
- Calls `uiStore.setFilters({ sizes: [...] })`

**Colors**

- Row of color swatches (circle, 24px, border if selected)
- Derive available colors from `getAllColors()` helper in mock/index.ts
- Calls `uiStore.setFilters({ colors: [...] })`

**Badges**

- Checkboxes: New, Sale, Bestseller, Limited
- Calls `uiStore.setFilters({ badges: [...] })`

**Stock**

- Single checkbox: "In Stock Only"
- Calls `uiStore.setFilters({ inStockOnly: true/false })`

At the bottom:

- Active filter count badge
- "Reset All Filters" button (text-gold, only visible when filters are active)

#### 4.2 — FilterBottomSheet (`components/shop/FilterBottomSheet.tsx`)

Mobile only. Same filter sections as FilterSidebar but presented as a bottom sheet.
Triggered by a "Filter" button in the mobile shop header.
Uses `slideUpVariant` animation.
Full height, scrollable content, sticky "Apply Filters" + "Reset" buttons at bottom.

#### 4.3 — SortDropdown (`components/shop/SortDropdown.tsx`)

A dropdown using shadcn `DropdownMenu`.
Options: Newest First | Price: Low to High | Price: High to Low | Top Rated | Best Selling
Current selection shown on the trigger button.
Calls `uiStore.setSortBy()`.

#### 4.4 — ViewToggle (`components/shop/ViewToggle.tsx`)

Two icon buttons: grid icon and list icon (lucide-react).
Active mode highlighted in gold.
Calls `uiStore.setViewMode()`.

#### 4.5 — ProductGrid (`components/shop/ProductGrid.tsx`)

Props: `products: Product[]`, `viewMode: 'grid' | 'list'`

Grid mode: responsive grid

- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns

List mode: single column, uses ProductCard in list mode.

Wrap in staggerContainer + staggerChildren for animated entrance.

Empty state: use `EmptyState` component with title "Nothing found" and description "Try adjusting your filters."

Shows product count: "Showing 24 products" above the grid.

#### 4.6 — ProductListItem (`components/shop/ProductListItem.tsx`)

The list-mode variant of a product card.
Horizontal layout: image (150px wide) | product info | price + CTA.
Product info: name, category, rating, brief description (2 lines), available sizes.
CTA: "Add to Bag" button (gold).

#### 4.7 — Assemble Shop Page (`app/shop/page.tsx`)

```tsx
"use client";

// Read URL search params for initial category (from CategoryGrid links)
// Apply to uiStore.setCategory on mount

// Layout:
// Desktop: 2-column — FilterSidebar (280px) | ProductGrid (flex-1)
// Mobile: single column — Filter/Sort bar at top | ProductGrid

// Mobile filter/sort bar: "Filter (N)" button | SortDropdown | ViewToggle

export default function ShopPage() {
  // Read searchParams for ?category=X
  // Initialize uiStore from URL params on mount
  // Get filtered products using getFilteredProducts()
  // Pass to ProductGrid
}
```

Shop page header:

- Title: "The Collection" (Cormorant, text-h1)
- Subtitle: "Every look, every occasion." (DM Sans, text-body, text-secondary)
- Breadcrumb: Home / Shop

### Verification Checklist

- [ ] All 28 products render in grid mode
- [ ] Category filter works and updates product count
- [ ] Price range slider filters correctly
- [ ] Size filter works
- [ ] Color filter works
- [ ] Badge filter works
- [ ] In stock filter works
- [ ] Sort works for all 5 options
- [ ] Grid/list view toggle works
- [ ] Filter sidebar visible on desktop, hidden on mobile
- [ ] Filter bottom sheet opens on mobile
- [ ] "Reset All Filters" clears all filters
- [ ] URL param `?category=X` sets the category on page load
- [ ] Empty state shows when no products match filters
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/shop/FilterSidebar.tsx`
- `components/shop/FilterBottomSheet.tsx`
- `components/shop/SortDropdown.tsx`
- `components/shop/ViewToggle.tsx`
- `components/shop/ProductGrid.tsx`
- `components/shop/ProductListItem.tsx`
- `app/shop/page.tsx`

---

## Phase 5 — Product Detail Page

### Goal

Build the product detail page at `/shop/[slug]`. This is where purchase decisions are made — it must be rich, confident, and frictionless.

### What To Do

#### 5.1 — ProductImageGallery (`components/product/ProductImageGallery.tsx`)

Props: `images: string[]`, `productName: string`

Desktop layout:

- Large primary image on the left (takes 60% of width)
- Vertical thumbnail strip on the right (3-4 thumbnails, 80px wide each)
- Clicking thumbnail updates the primary image
- Primary image transition: crossfade animation (300ms)

Mobile layout:

- Full-width horizontal swipe carousel
- Dot indicators below
- Swipeable via touch (use CSS scroll-snap)

All images: `next/image`, aspect-product (3:4), objectFit cover.

#### 5.2 — ColorSelector (`components/product/ColorSelector.tsx`)

Props: `variants: ProductVariant[]`, `selectedColor: string`, `onColorChange: (color: string) => void`

Renders a row of circular color swatches (32px each).
Selected: gold ring border (ring-2 ring-gold ring-offset-2).
Out of stock for all sizes in this color: show with a diagonal line through the swatch.
Tooltip on hover: shows color name.

#### 5.3 — SizeSelector (`components/product/SizeSelector.tsx`)

Props: `variants: ProductVariant[]`, `selectedColor: string`, `selectedSize: string`, `onSizeChange: (size: string) => void`

Renders sizes available for the selected color as pill buttons.
Available: bg-cream, border-border-warm, hover:border-gold.
Selected: bg-obsidian, text-ivory.
Out of stock for this color: text-muted, line-through, not clickable.

Includes "Size Guide" text link below (non-functional, just UI).

#### 5.4 — VariantSelector (`components/product/VariantSelector.tsx`)

Combines ColorSelector and SizeSelector.
Manages selected color and size state.
Exposes selected variant to parent via callback.
When color changes: reset size selection if current size not available in new color.

#### 5.5 — ProductInfo (`components/product/ProductInfo.tsx`)

Props: `product: Product`, `selectedVariant: ProductVariant | null`

Contains:

- Breadcrumb: Home / Shop / {Category} / {Product Name}
- Badge (if exists)
- Product name: Cormorant text-h1
- Rating: `RatingStars` with review count
- Price: `PriceDisplay` — show original + sale if applicable
- Description: DM Sans text-body, text-secondary
- `VariantSelector` component
- Stock indicator: "Only 3 left" (if stock ≤ 3), "In Stock" (if > 3), "Sold Out" (if 0)
- "Add to Bag" button (full-width, gold, large) — disabled if no variant selected or out of stock
  - On click: calls `cartStore.addItem()` + opens cart drawer (`cartStore.toggleCart()`)
  - Brief loading/success animation on button
- Material and care information in an expandable accordion (shadcn Accordion)
- Delivery info note: "Free delivery on orders over KES 5,000. Delivery within Nairobi 2-3 days."

#### 5.6 — RelatedProducts (`components/product/RelatedProducts.tsx`)

Props: `currentProduct: Product`
Data: get up to 4 products from the same category, excluding the current product.

Horizontal scroll carousel on mobile, 4-column grid on desktop.
Uses `ProductCard` component.

Section header: "You May Also Like"

#### 5.7 — Assemble Product Detail Page (`app/shop/[slug]/page.tsx`)

```tsx
// Get product by slug from mock data
// If not found: return notFound() (Next.js 404)
// Layout: image gallery left, product info right (desktop)
//         stacked image then info (mobile)
// RelatedProducts section below
// Footer at the bottom
```

### Verification Checklist

- [ ] Page loads for all 28 product slugs
- [ ] Image gallery renders and thumbnail selection works
- [ ] Mobile image carousel is swipeable
- [ ] Color selector shows available colors
- [ ] Size selector updates when color changes
- [ ] Out of stock variants are visually disabled
- [ ] Add to Bag button adds to cart and opens drawer
- [ ] Stock indicator shows correctly
- [ ] Related products show same-category products
- [ ] Product not found → 404 page
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/product/ProductImageGallery.tsx`
- `components/product/ColorSelector.tsx`
- `components/product/SizeSelector.tsx`
- `components/product/VariantSelector.tsx`
- `components/product/ProductInfo.tsx`
- `components/product/RelatedProducts.tsx`
- `app/shop/[slug]/page.tsx`

---

## Phase 6 — Cart Page

### Goal

Build the full cart page at `/cart`. This is separate from the CartDrawer — it's the full dedicated cart view.

### What To Do

#### 6.1 — CartItem Component (`components/cart/CartItem.tsx`)

Props: `item: CartItem`

Horizontal layout:

- Product image (80px wide, aspect-product, rounded-sm)
- Product details: name (text-body-sm font-medium), size + color (text-caption text-muted), price per item
- Quantity controls: [-] [number] [+] — calls `cartStore.updateQuantity()`
- Line total: price × quantity (text-price font-dm-sans font-semibold)
- Remove button: trash icon in text-muted, hover:text-error

#### 6.2 — CartSummary (`components/cart/CartSummary.tsx`)

Props: `subtotal: number`, `itemCount: number`

Sticky on desktop (right column).
Contents:

- "Order Summary" heading
- Subtotal: KES X,XXX
- Delivery: "Calculated at checkout" or "Free" if subtotal > 5000
- Divider
- Total: KES X,XXX (larger, font-semibold)
- "Proceed to Checkout" → /checkout (full-width gold button)
- "Continue Shopping" → /shop (ghost link below button)
- Accepted payment methods icons: M-Pesa | Visa | Mastercard (small icon row)

#### 6.3 — Assemble Cart Page (`app/cart/page.tsx`)

Layout: 2-column desktop (cart items left, order summary right), stacked mobile.

Header: "Your Bag ({N} items)"

If cart is empty: `EmptyState` with "Your cart is ready for something great." + "Shop the Collection" CTA.

Reads from `cartStore.items`, `cartStore.totalItems`, `cartStore.subtotal`.

Add Footer at the bottom.

### Verification Checklist

- [ ] Cart page renders items from cartStore
- [ ] Quantity controls update item quantities
- [ ] Remove button removes items
- [ ] Subtotal recalculates on quantity/removal change
- [ ] Empty cart state shows correctly
- [ ] Proceed to Checkout button links to /checkout
- [ ] Page is responsive
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/cart/CartItem.tsx`
- `components/cart/CartSummary.tsx`
- `app/cart/page.tsx`

---

## Phase 7 — Checkout Flow

### Goal

Build the multi-step checkout at `/checkout`. Must work for both authenticated users and guests.

### Context

Read `architecture.md` under "Checkout Flow Architecture" for the 4-step spec.
Read `context.md` for Wahi voice in copy.
Read `architecture.md` for the Kenyan counties list.

### What To Do

#### 7.1 — DeliveryForm (`components/checkout/DeliveryForm.tsx`)

Props: `onSubmit: (data: DeliveryDetails) => void`, `defaultValues?: Partial<DeliveryDetails>`

Fields (use shadcn Input and Label, styled to Wahi palette):

- Full Name (required)
- Email (required, email validation)
- Phone (required, format hint: +254 XXX XXX XXX)
- County (required, shadcn Select, use Kenyan counties list from architecture.md)
- Town (required, text input)
- Street Address (required)
- Additional Info (optional, textarea)
- Delivery Method (radio group):
  - Standard Delivery — "2-3 business days within Nairobi, 3-5 days upcountry"
  - Pickup from Store — "Lumumba Drive, Roysambu — Mon-Sat 9am-7pm"

If user is authenticated: pre-fill from `authStore.user.addresses[0]` (default address).

Validation: all required fields must be filled before form submits.
On submit: calls `onSubmit(data)` to advance to next step.

#### 7.2 — PaymentMethod (`components/checkout/PaymentMethod.tsx`)

Props: `onSubmit: (method: PaymentMethod) => void`

Three payment options as large clickable cards:

**M-Pesa** (default, most prominent)

- M-Pesa logo/icon + "Pay with M-Pesa"
- Description: "Enter your Safaricom number and confirm the payment prompt"
- Input field: M-Pesa phone number (shown when selected)
- Helper: "You will receive a payment prompt on your phone"

**Card**

- Card icon + "Pay with Card"
- Fields when selected: Card number, Expiry (MM/YY), CVV, Name on card
- Note: UI only — no real payment processing

**Cash on Delivery**

- Cash icon + "Cash on Delivery"
- Note: "Pay when your order arrives. Available within Nairobi only."

Selected card: border-gold, bg-cream.
Unselected: border-border-warm, bg-ivory.

#### 7.3 — OrderSummary (`components/checkout/OrderSummary.tsx`)

Props: `items: CartItem[]`, `deliveryDetails: DeliveryDetails`, `paymentMethod: PaymentMethod`, `subtotal: number`, `deliveryFee: number`, `total: number`

A review panel showing:

- Items list (compact: image thumbnail + name + size + price)
- Delivery address summary
- Payment method summary
- Price breakdown: Subtotal | Delivery | Total
- "Place Order" button (large, gold, full-width)
- "Edit" links next to delivery and payment sections that go back to those steps

#### 7.4 — OrderConfirmation (`components/checkout/OrderConfirmation.tsx`)

Props: `order: Order`

A celebratory confirmation screen.

- Large checkmark icon animated in (scale + fade, use scaleInVariant)
- "Order Confirmed." — Cormorant text-h1
- "It's on its way to you." — DM Sans, text-secondary
- Order number: "WF-2026-XXXXX" in gold, prominent
- Summary: items, delivery address, payment method
- Delivery estimate: "Expected delivery: 2-3 business days"
- Two CTAs: "Track Your Order" (non-functional, just UI) + "Continue Shopping" → /shop
- If guest: soft prompt "Save time next time — Join Wahi" with register link

#### 7.5 — Assemble Checkout Page (`app/checkout/page.tsx`)

Multi-step on a single page. Use local state for current step.

```
Step indicator at the top: 1. Delivery → 2. Payment → 3. Review → 4. Confirmed
                            (numbered dots connected by a line, gold = active/complete)
```

Layout: single centered column, max-width 720px, with a compact order sidebar on desktop showing item count and subtotal throughout.

Step logic:

- Step 1: `DeliveryForm` — on submit, save delivery details to local state, advance to step 2
- Step 2: `PaymentMethod` — on submit, save payment method to local state, advance to step 3
- Step 3: `OrderSummary` — on "Place Order", generate mock order, advance to step 4
- Step 4: `OrderConfirmation` — shows confirmed order, calls `cartStore.clearCart()`

Mock order generation:

```typescript
const mockOrder: Order = {
  id: `order-${Date.now()}`,
  orderNumber: `WF-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`,
  userId: authStore.user?.id,
  guestEmail: !authStore.user ? deliveryDetails.email : undefined,
  items: cartStore.items,
  deliveryDetails,
  subtotal: cartStore.subtotal,
  deliveryFee: cartStore.subtotal >= 5000 ? 0 : 300,
  discount: 0,
  total: cartStore.subtotal + (cartStore.subtotal >= 5000 ? 0 : 300),
  currency: "KES",
  paymentMethod,
  paymentStatus: "paid",
  orderStatus: "confirmed",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

Redirect to step 1 if cart is empty and not on step 4.

### Verification Checklist

- [ ] Step indicator shows correct active step
- [ ] Delivery form validates all required fields
- [ ] Pre-fills from logged-in user's address
- [ ] Guest can complete checkout without logging in
- [ ] Payment method selection works for all 3 methods
- [ ] Order summary shows correct totals
- [ ] Free delivery applied for orders over KES 5,000
- [ ] Place Order generates order and clears cart
- [ ] Confirmation screen shows order number
- [ ] Guest sees "Join Wahi" prompt on confirmation
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `components/checkout/DeliveryForm.tsx`
- `components/checkout/PaymentMethod.tsx`
- `components/checkout/OrderSummary.tsx`
- `components/checkout/OrderConfirmation.tsx`
- `app/checkout/page.tsx`

---

## Phase 8 — Authentication Pages

### Goal

Build the login and register pages. These are the simplest pages in the project but must match the premium aesthetic.

### What To Do

#### 8.1 — Login Page (`app/auth/login/page.tsx`)

Layout: centered card on a warm bg-cream page.
Card: bg-ivory, rounded, subtle shadow-card, max-width 420px, generous padding.

Contents:

- Logo: "WAHI FASHION" in Cormorant at the top
- Heading: "Welcome Back" (Cormorant text-h2)
- Subheading: "Sign in to your account" (DM Sans text-body-sm text-muted)
- Email input (shadcn Input, styled to Wahi tokens)
- Password input with show/hide toggle
- "Forgot password?" link (text-gold, right-aligned)
- "Welcome Back" submit button (full-width, gold)
- Divider: "or"
- "Continue as Guest" ghost button → /checkout
- "Join Wahi" link below: "Don't have an account? **Join Wahi**" → /auth/register

On submit: calls `authStore.login(email, password)`.
Mock behaviour: any credentials succeed. Show loading spinner on button during "login". After 800ms redirect to `/`.
Show error state if `authStore.isLoading` fails (simulate with a specific email: `error@test.com`).

#### 8.2 — Register Page (`app/auth/register/page.tsx`)

Same card layout as login.

Contents:

- Logo + "Join Wahi" heading + "Create your account" subheading
- First name + Last name (side by side, 2-column)
- Email
- Phone (optional)
- Password + Confirm password (with strength indicator for password)
- "Join Wahi" submit button
- "Already have an account? **Welcome Back**" → /auth/login

Password strength indicator: a small progress bar below the password field.

- Weak (red): < 6 chars
- Medium (gold): 6-10 chars, or has numbers
- Strong (green): > 10 chars with mixed characters

On submit: calls `authStore.register(data)`. Mock: 800ms delay, then redirect to `/`.

### Verification Checklist

- [ ] Login page renders and is responsive
- [ ] Form validation works (required fields)
- [ ] Submit shows loading state
- [ ] Successful login redirects to home
- [ ] Register page renders and is responsive
- [ ] Password show/hide toggle works
- [ ] Password strength indicator works
- [ ] Successful register redirects to home
- [ ] Links between login and register work
- [ ] `npx tsc --noEmit` passes

### Files Created in This Phase

- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`

---

## Final Phase — Polish & Consistency Pass

### Goal

After all phases are complete, do a full pass across the entire site for consistency, polish, and correctness.

### What To Do

#### P.1 — Typography & Spacing Audit

Go through every page and verify:

- All headings use Cormorant Garamond
- All body text uses DM Sans
- No arbitrary font sizes — only tokens from the scale
- Consistent section padding across all pages
- No orphaned text (single words on their own line) in headings

#### P.2 — Color Audit

- No raw hex values anywhere in the codebase
- All colors reference Tailwind tokens
- Hover states are consistent (gold highlight for interactive elements)
- Text contrast is readable (ivory on dark, obsidian on light)

#### P.3 — Animation Audit

- Every page section animates in on scroll with `fadeUpVariant`
- Product grids stagger their children
- Cart drawer and bottom sheet animate in/out correctly
- No animation is jarring or too slow (max duration 500ms for most)

#### P.4 — Mobile Audit

Test every page at 375px width:

- Navbar collapses correctly
- No horizontal scroll on any page
- Touch targets are at least 44px
- Filter bottom sheet works
- Image carousels are swipeable
- Cart drawer becomes a bottom sheet

#### P.5 — Copy Audit

Check every piece of UI text against the Wahi voice table in `context.md`.
Replace any generic copy with Wahi-voice equivalents.

#### P.6 — Final TypeScript Check

```bash
npx tsc --noEmit
```

Zero errors required before project is considered complete.

---

## Summary: Phase Execution Order

| Phase | What              | Key Output                                |
| ----- | ----------------- | ----------------------------------------- |
| 1     | Configuration     | Tailwind tokens, fonts, stores, utilities |
| 2     | Shared components | Navbar, Footer, CartDrawer, primitives    |
| 3     | Landing page      | Full editorial landing experience         |
| 4     | Shop/Catalog      | Filtered, sorted product catalog          |
| 5     | Product detail    | Full purchase decision page               |
| 6     | Cart page         | Dedicated cart view                       |
| 7     | Checkout flow     | 4-step checkout with guest support        |
| 8     | Auth pages        | Login and register                        |
| Final | Polish pass       | Consistency, mobile, copy, TS             |

**Execute phases strictly in order. Do not begin Phase N+1 until Phase N passes its verification checklist.**
