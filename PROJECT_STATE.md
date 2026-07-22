# Lady Shelf Project State

This is the canonical current-state document for Lady Shelf.

Read this file before using `PLAN.md`, `BACKEND_PLAN.md`, `ADMIN_DASHBOARD_PLAN.md`, or other historical planning documents. Those files explain how the work was planned; this file explains what is true now.

Last updated: 2026-07-22

## Current Working Mode

Lady Shelf is a fullstack e-commerce application.

Work may span both repositories:

- Frontend: `C:\Users\gitahi\Development\wahi-fasion`
- Backend: `C:\Users\gitahi\Development\wahi-backend`

Do not assume this is a frontend-only mock-data application. The frontend began as a mock-data build, but major flows now use the Django backend and Supabase-backed authentication.

## Application Architecture

### Frontend

- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS v4 with Lady Shelf design tokens
- shadcn/ui primitives themed for the project
- Zustand for client state
- Framer Motion for animation
- Supabase Auth client/session handling
- Mapbox geocoding for delivery-location search
- Production frontend: `https://ladyshelf.site`
- Local frontend: `http://localhost:3000`

### Backend

- Separate Django backend in `C:\Users\gitahi\Development\wahi-backend`
- Django REST Framework API under `/api/v1/`
- Postgres-ready Docker setup
- Django admin for operational management
- Supabase JWT verification via JWKS
- SasaPay sandbox integration for prepaid M-Pesa payments
- Local backend: `http://localhost:8000`

## Data Source Rules

- The backend is the source of truth for catalog, categories, variants, stock, checkout quotes, delivery rules, pickup information, order creation, account order history, wishlist for authenticated users, admin operations, and payment status where implemented.
- Frontend mock catalog data may still exist in the repo for historical reference, but live storefront catalog, search, cart stock checks, and checkout stock validation should use backend data rather than mock fallbacks.
- Do not rebuild features as mock-only unless the user explicitly asks for a temporary mock.
- Preserve the approved storefront UX when replacing mock-backed behavior with API-backed behavior.

## Frontend Current State

Implemented customer-facing routes include:

- `/`
- `/collections`
- `/shop`
- `/shop/[slug]`
- `/search`
- `/wishlist`
- `/cart`
- `/checkout`
- `/account`
- `/account/orders`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/update-password`
- `/auth/complete-profile`
- `/auth/callback`
- `/contact`
- `/delivery-info`
- `/faq`
- `/returns`

Implemented admin-facing routes include:

- `/admin`
- `/admin/catalog`
- `/admin/customers`
- `/admin/customers/[id]`
- `/admin/inventory`
- `/admin/orders`
- `/admin/orders/[orderNumber]`
- `/admin/payments`
- `/admin/payments/[id]`
- `/admin/settings`
- `/admin/settings/delivery-zones`
- `/admin/settings/pickup`
- `/admin/staff`

Important frontend integration files:

- `lib/api/catalog.ts`
- `lib/api/account.ts`
- `lib/api/addresses.ts`
- `lib/api/wishlist.ts`
- `lib/api/orders.ts`
- `lib/api/checkout.ts`
- `lib/api/admin.ts`
- `lib/utils/cartStock.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`
- `stores/authStore.ts`
- `stores/wishlistStore.ts`
- `stores/cartStore.ts`

Variant-specific product imagery is now supported end-to-end:

- Product variants include an optional `imageUrl` field.
- Product detail pages default to the first available variant and prioritize the selected color's variant image over product-level gallery images.
- Size selection preserves stock/SKU selection behavior but does not drive gallery image changes.
- Admin catalog management can associate each variant with one of the product's uploaded Supabase-backed image URLs.
- Checkout/cart/order validation snapshots the variant image when present, falling back to the first product image for older products.

AI-assisted catalog image generation is implemented on the feature branch:

- Admins can manually select batches of one to five products and queue asynchronous generation.
- Each product receives an all-or-nothing review set of three 768x1024 candidates: Hero, Alternate, and Detail.
- Candidate review supports approval, rejection, regeneration, atomic publication, and restoration of the previous gallery.
- New batches use the `v2-controlled-variety` prompt policy: Hero and Alternate receive distinct
  adult Black-woman representation profiles and Detail is product-only.
- Frozen real catalog colors are allocated deterministically across the three shots, using distinct
  colors whenever at least three exist.
- Owner regeneration uses a guarded per-shot dialog for catalog color, body/skin/composition or
  detail focus, and bounded creative notes. Hero regeneration always replaces the full dependent set;
  Alternate and Detail regeneration remain isolated.
- Explicit regeneration records normalized controls, increments the prompt revision, and derives a
  new seed. Automatic retries continue using the stored prompt and seed.
- Draft candidate URLs remain separate from public product galleries until explicit publication.
- AI publication requires an explicit per-publication choice to append the fixed Hero, Alternate,
  and Detail set to the current gallery or replace the complete current gallery. The locked
  publication-time gallery is retained exactly for rollback, and the chosen mode is stored for audit.
- Append publication preserves variant image assignments. Replace publication clears only variant
  assignments that point to gallery URLs removed by the replacement.
- Product galleries may contain any number and mixture of manual and AI images. Successfully
  published generations are hidden from the active Catalog workspace while their audit and rollback
  records remain stored.
- Products require at least one nonblank catalog variant color before AI generation can be queued.
- Manual product-image upload and manual draft publication remain available.
- The protected homepage Hero and Our Story media sources are guarded by `npm run check:protected-media`.

## Backend Current State

Completed backend capabilities:

- Health check and API documentation
- Supabase-authenticated customer profile sync
- Customer address book
- Catalog categories, products, and variants
- Stock-aware product variants
- Authenticated wishlist
- Account order history
- Checkout quote authority
- Pickup information
- Distance-based rider delivery and parcel fallback logic
- Guest and authenticated order creation
- Order lifecycle statuses for manual fulfillment
- Stock decrement on order creation
- Customer item-level cancellation for eligible pay-on-delivery orders, with stock restoration
- Email notifications for order/payment events
- Branded HTML receipt emails after payment confirmation
- SasaPay sandbox payment initiation
- SasaPay callback handling
- SasaPay payment status sync
- Payment transaction persistence
- Expiry flow for unpaid prepaid orders with stock restoration
- Admin APIs for dashboard, staff permissions, catalog, customers, inventory, orders, payments, delivery settings, and pickup settings
- Variant-level image URLs for color-specific storefront display, with product-image fallback for existing catalog items
- Draft/published catalog visibility, with unpublished products excluded from public catalog, wishlist, and checkout validation paths
- Asynchronous Cloudflare Workers AI product-image jobs, Supabase draft/final storage, review state, retries, rollback, cleanup tracking, and admin APIs
- A bounded worker command and inactive systemd service/timer templates for processing queued image generations

Key backend API areas currently consumed by the frontend:

- `GET /api/v1/account/me`
- `GET/POST/PATCH/DELETE /api/v1/account/addresses`
- `GET /api/v1/account/orders`
- `POST /api/v1/account/orders/<order_number>/cancellations`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/<slug>`
- `GET/POST/DELETE /api/v1/wishlist/`
- `GET /api/v1/checkout/pickup-info`
- `POST /api/v1/checkout/quote`
- `POST /api/v1/checkout/orders`
- `POST /api/v1/payments/sasapay/checkout`
- `POST /api/v1/payments/sasapay/callback`
- `POST /api/v1/payments/sasapay/status-sync`
- Admin endpoints under `/api/v1/admin/...`

## Auth State

- Supabase Auth is the identity source of truth.
- Django owns customer profile and business data.
- Email/password registration, confirmation, login, logout, forgot password, and update password flows are implemented.
- Account hydration from backend `/api/v1/account/me` is implemented.
- Google sign-in may still appear in the UI, but the OAuth callback flow is not considered solved. Do not treat Google OAuth as working unless it has been explicitly fixed and verified.

## Checkout, Orders, and Payments

- Checkout no longer relies on fixed frontend-only delivery rules.
- Backend quote responses control fulfillment mode, available payment options, delivery fees, and totals.
- Cart and checkout stock validation should reconcile against backend catalog stock before the customer proceeds, with backend checkout/order creation remaining the final authority.
- Store pickup is prepay only.
- Parcel delivery is prepay only.
- Pay-on-delivery is available only for rider-served locations and only with M-Pesa.
- Order creation is backend-backed for guest and authenticated customers.
- Prepaid orders use SasaPay sandbox/test-mode integration.
- Prepaid orders are not live-money production payments yet.
- Rider pay-on-delivery orders notify immediately on placement.
- Prepaid customer/staff notifications happen after payment confirmation.
- Prepaid customers receive branded receipt emails after confirmed SasaPay payment; pending-payment customer emails are not sent for prepaid orders.
- Pay-on-delivery orders send the existing order confirmation/delivery note at placement, then staff can mark the order paid from the admin order detail page to generate and email the receipt.
- Authenticated customers can cancel item quantities from pay-on-delivery orders while the order is still `new`; cancellation restores stock, adjusts the payable total, records an audit trail, and emails customer/staff.
- Admin order detail supports receipt status display and receipt resend.
- Admin order detail displays item cancellation quantities and cancellation history.
- Unpaid prepaid orders can expire after 30 minutes through the backend expiry command, restoring stock and retaining admin history.

## Fulfillment and Operations

- Django admin remains available for backend operations.
- A frontend admin dashboard also exists and consumes backend admin APIs.
- Pickup location is Roysambu / Lumumba Drive.
- Pickup instructions should include location, contact details, Google Maps link, and a 72-hour collection window.
- Rider delivery uses straight-line distance from the shop location.
- Parcel delivery begins beyond the configured rider/parcel switch radius.
- Current seeded delivery setting context:
  - rider max radius: `50 km`
  - parcel switch radius: `50 km`
  - rider base fee for `0-10 km`: `KES 200`
  - each additional `10 km` band: `+KES 200`
  - settings are editable from admin interfaces

## Known Limitations / Deferred Work

- SasaPay is still sandbox/test-mode, not production live money.
- Production SasaPay credentials, callback URLs, merchant setup, live transaction reconciliation, and go-live verification remain deferred.
- SMS notifications are planned through Africa's Talking but are not implemented as the active notification channel yet.
- Google OAuth is not verified as working.
- Returns, exchanges, prepaid cancellations, and refunds remain manual for MVP.
- There is no customer-facing real-time order tracking in MVP.
- Some frontend mock data still exists and should not be mistaken for the primary source of truth.
- Repo-wide frontend lint may include unrelated existing issues; check the latest task context before treating lint as a clean global signal.
- AI product-image generation remains disabled until its protected backend credentials and bucket name are configured.
- The image-generation systemd timer is supplied as a template only and must not be activated without a separately approved deployment phase.
- A real Cloudflare/Supabase smoke test and production migration remain deferred until separately approved.

## Historical Plan Status

The original frontend-only plan has been superseded by the fullstack implementation.

Completed major phases:

- Phase 1: Django backend foundation
- Phase 2: Authentication, profiles, and customer data, except unresolved Google OAuth
- Phase 3: Catalog, search, and inventory integration
- Phase 4: Wishlist and account order history
- Phase 5: Checkout rules and delivery logic
- Phase 6: Orders and manual fulfillment workflow
- Phase 7 sandbox: SasaPay test-mode payment initiation, callbacks, status sync, transaction persistence, and unpaid prepaid expiry

Main remaining payment work:

- SasaPay production/live-money rollout
- production callback verification
- final merchant credential setup
- live payment reconciliation checks

## Verification Commands

Frontend:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run check:protected-media
```

Backend, from `C:\Users\gitahi\Development\wahi-backend`:

```powershell
docker compose run --rm backend python manage.py test
docker compose run --rm backend python manage.py makemigrations --check
docker compose run --rm backend python manage.py check
```

Use the narrower backend test command when working in a specific app, for example:

```powershell
docker compose run --rm backend python manage.py test payments checkout orders
```

## Documentation Maintenance Rule

After any major change, update this file in the same task.

Major changes include:

- backend schema/model changes
- new or changed API endpoints
- auth flow changes
- checkout, payment, order, delivery, inventory, or notification changes
- frontend data-source changes from mock to API or API to mock
- admin dashboard capability changes
- deployment, environment, or production integration changes
- resolved or newly discovered limitations

When a plan file disagrees with this file, treat this file as current and the plan file as historical.
