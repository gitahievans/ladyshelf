# Wahi Fashion Backend MVP Plan

> Historical planning document. Do not treat this as the current implementation state.
> Read `PROJECT_STATE.md` first. `PROJECT_STATE.md` is the canonical current-state document for the fullstack application.

## Summary
- Build the backend in testable phases so each phase can be implemented, verified, and approved before the next one starts.
- Use `Django + Django REST Framework + Postgres + Docker` as the application core, `Supabase Auth` for customer identity, `Supabase Storage` for media, `SasaPay` for prepaid checkout, `Africa’s Talking` for SMS, and `email` for store/customer notifications.
- Keep the current frontend cart as the initial cart source of truth. The backend becomes the pricing, stock, order, delivery-rule, and payment authority at checkout.
- Use `Django admin` for v1 operations. A custom staff dashboard is explicitly deferred to a later phase after the MVP backend is working.
- Customer-facing scope includes catalog, search, authentication, account/profile, addresses, wishlist, guest checkout, account checkout, delivery/pickup logic, prepay checkout, pay-on-delivery order capture, and order history. Returns/refunds remain manual and no customer-facing tracking is built in v1.

## Implementation Phases

### Phase 1 — Backend Foundation
**Goal**
Create the backend skeleton, local environment, shared conventions, and operational baseline.

**Tools / Technologies**
- Django
- Django REST Framework
- Postgres
- Docker / Docker Compose
- `django-cors-headers`
- `drf-spectacular`
- `psycopg`
- environment management via `.env`
- optional early monitoring hook: `sentry-sdk`

**Deliverables**
- Django project with apps for `catalog`, `customers`, `wishlist`, `orders`, `payments`, `notifications`, and `common`
- Dockerized local stack with app + database
- DRF configured with API versioning under `/api/v1/`
- OpenAPI schema and browsable docs
- base settings for CORS, secrets, logging, health check, and environment separation
- Django admin enabled and structured for future models

**Testable outcome**
- Backend boots locally in Docker
- Postgres connects successfully
- `/api/v1/health` and API docs load
- Admin login page is accessible

---

### Phase 2 — Authentication, Profiles, and Customer Data
**Goal**
Replace mock auth behavior with real customer identity and server-side customer records.

**Tools / Technologies**
- Supabase Auth
- DRF custom authentication class for Supabase JWT verification
- Postgres
- Django admin

**Deliverables**
- `CustomerProfile` model linked to `supabase_user_id`
- authenticated `/api/v1/account/me`
- automatic customer profile bootstrap on first authenticated request
- address book models and endpoints
- guest checkout remains allowed without authentication

**Public interfaces**
- `GET /api/v1/account/me`
- `GET /api/v1/account/addresses`
- `POST /api/v1/account/addresses`
- `PATCH /api/v1/account/addresses/{id}`
- `DELETE /api/v1/account/addresses/{id}`

**Testable outcome**
- A Supabase-authenticated user can hit `/account/me`
- First authenticated request creates or resolves a matching customer profile
- Address CRUD works for signed-in users
- Unauthenticated users are blocked from account endpoints and still allowed to continue as guests

---

### Phase 3 — Catalog, Search, and Inventory
**Goal**
Make the backend the source of truth for products, categories, variants, stock, and search/filtering.

**Tools / Technologies**
- Django admin
- DRF
- `django-filter`
- Supabase Storage for media references

**Deliverables**
- models for `Category`, `Product`, `ProductImage`, `ProductVariant`, and any lightweight tagging needed for search/filtering
- catalog seeded from current mock data
- public product listing, product detail, category listing, and search/filter/sort endpoints
- inventory fields on variants
- out-of-stock products remain visible but non-purchasable
- admin workflows for product, media, variant, and stock management

**Public interfaces**
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{slug}`
- `GET /api/v1/catalog/search`

**Testable outcome**
- Frontend-equivalent filters work: category, size, color, badge, price range, in-stock, sort
- Product detail returns live variant stock
- An out-of-stock variant cannot be purchased even though the product still appears in listings
- Admin users can update stock and see those changes reflected in the API

---

### Phase 4 — Wishlist and Account History
**Goal**
Move persistent customer data into the backend before checkout work expands.

**Tools / Technologies**
- Django admin
- DRF
- Postgres

**Deliverables**
- server-backed wishlist for authenticated users
- order history placeholder endpoints ready to be populated once orders exist
- clear separation between guest browsing and authenticated saved data

**Public interfaces**
- `GET /api/v1/account/wishlist`
- `POST /api/v1/account/wishlist`
- `DELETE /api/v1/account/wishlist/{product_id}`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`

**Testable outcome**
- Signed-in users can save/remove products and retrieve wishlist state across sessions
- Guests can still browse without backend wishlist persistence
- Authenticated users can reach empty order-history endpoints successfully before order creation is wired in later phases

---

### Phase 5 — Checkout Rules, Delivery Logic, and Quotes
**Goal**
Introduce the server-side commerce rules that decide what the customer is allowed to do before any payment is attempted.

**Tools / Technologies**
- Django admin
- DRF
- Postgres

**Deliverables**
- structured checkout models and services for:
  - fulfillment method: `delivery` or `pickup`
  - delivery mode: `rider`, `parcel`, or `pickup`
  - payment timing: `prepay` or `pay_on_delivery`
  - payment method: `mpesa` or `card`
- delivery rule tables in admin:
  - rider-served Nairobi / nearby zones
  - parcel-served rest-of-Kenya zones
  - pickup location details for Lumumba Drive, Roysambu
- quote endpoint that validates cart lines, stock, prices, and address-derived delivery rules
- business rules enforced by backend:
  - pickup is `prepay only`
  - parcel delivery is `prepay only`
  - pay on delivery is `mpesa only`
  - pay on delivery allowed only for rider-served areas
  - parcel delivery fee may require manual confirmation
- pickup instructions include location, maps link, contact details, and 72-hour collection window

**Public interfaces**
- `POST /api/v1/checkout/quote`
- `GET /api/v1/checkout/pickup-info`

**Testable outcome**
- Frontend can send the local cart and receive a server quote
- Invalid payment options are rejected based on selected address/fulfillment choice
- Parcel destinations return a quote shape that indicates manual delivery-fee confirmation when applicable
- Pickup quotes return zero delivery fee and prepay-only rules

---

### Phase 6 — Orders and Manual Fulfillment Workflow
**Goal**
Create real orders and support the store’s actual operational flow for both prepaid and pay-on-delivery orders.

**Tools / Technologies**
- Django admin
- DRF
- Postgres
- email notifications
- Africa’s Talking SMS integration

**Deliverables**
- models for `Order`, `OrderItem`, `DeliveryRule/Zone`, and lightweight operational notes if needed
- order-number generation
- internal order statuses:
  - `new`
  - `awaiting_payment`
  - `paid`
  - `awaiting_delivery_fee_confirmation`
  - `ready_for_dispatch`
  - `out_for_delivery`
  - `ready_for_pickup`
  - `completed`
  - `cancelled`
- payment statuses:
  - `pending`
  - `paid`
  - `failed`
  - `manual_on_delivery`
  - `refunded` reserved for later/manual operations
- order creation flow for:
  - prepaid delivery
  - prepaid pickup
  - pay-on-delivery rider delivery
  - parcel delivery awaiting fee confirmation when needed
- staff notifications on new order via email and SMS
- customer confirmation notification via SMS and email

**Public interfaces**
- `POST /api/v1/checkout/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`

**Testable outcome**
- Guest and authenticated customers can create valid orders
- Order records appear in Django admin with correct operational status
- Rider-delivery pay-on-delivery orders are created without online payment
- Pickup orders are created as prepaid-only
- Staff and customer notifications fire on order placement

---

### Phase 7 — Prepaid Payments with SasaPay
**Goal**
Add real online payment only after the order and rules engine is working.

**Tools / Technologies**
- SasaPay
- Django / DRF
- Postgres
- email + Africa’s Talking SMS for payment outcomes
- optional `redis + celery` only if callback retries or async notification handling becomes necessary during implementation

**Deliverables**
- `PaymentTransaction` model for auditability
- SasaPay payment session creation for `prepay` orders
- callback / webhook handling
- idempotent payment confirmation processing
- order state transitions after successful or failed payment
- support for prepaid delivery and prepaid pickup
- no SasaPay flow for pay-on-delivery orders

**Public interfaces**
- `POST /api/v1/payments/sasapay/checkout`
- `POST /api/v1/payments/sasapay/callback`
- `POST /api/v1/payments/sasapay/status-sync`

**Testable outcome**
- A prepaid order can create a SasaPay transaction
- Successful callback marks payment paid and advances order status
- Failed payment leaves order in a recoverable unpaid state
- Replayed callbacks do not duplicate transactions or corrupt order state
- Pay-on-delivery orders never invoke SasaPay

---

### Phase 8 — Hardening, Backoffice Readiness, and Launch Prep
**Goal**
Prepare the backend for stable use by the store before later building a custom staff dashboard.

**Tools / Technologies**
- Django admin
- DRF throttling / permissions
- backup and logging configuration
- optional Sentry
- optional Redis/Celery if operationally justified by earlier phases

**Deliverables**
- admin permissions and role separation for owners/attendants
- API throttling on public and auth-adjacent endpoints
- structured logs and error monitoring
- seed/fixture or management-command story for loading catalog data
- documentation for environment variables, admin workflows, and webhook setup
- explicit backlog handoff for later custom staff dashboard

**Testable outcome**
- Admin roles can be limited appropriately
- Core flows are documented end to end
- Operational runbook exists for products, stock, orders, and notifications
- System is ready for MVP deployment without requiring the future custom staff dashboard

## Test Plan by Phase
- **Phase 1:** container boot, DB connection, health check, schema docs, admin reachability
- **Phase 2:** valid/invalid Supabase token cases, profile bootstrap, address CRUD, guest restrictions
- **Phase 3:** category/product reads, filter/sort parity with frontend, stock visibility, out-of-stock purchase rejection
- **Phase 4:** wishlist persistence for authenticated users, empty order history access, auth guards
- **Phase 5:** quote validation, delivery-mode resolution, parcel vs rider rules, pickup prepay enforcement, manual-fee flags
- **Phase 6:** guest vs signed-in order creation, status initialization, staff/customer notifications, admin visibility
- **Phase 7:** SasaPay checkout creation, callback success/failure, idempotency, order/payment state transitions
- **Phase 8:** permissions, throttling, monitoring, docs, and basic operational smoke tests

## Assumptions and Defaults
- `Supabase Auth` remains the identity source of truth; Django does not manage passwords.
- `Supabase Storage` stores product media; Django stores metadata and references.
- `Django admin` is the operational interface for v1; the custom staff dashboard is deferred.
- The cart remains frontend-managed in MVP; the backend validates and prices it during quote/order creation.
- Reviews, ratings, promo codes, returns/refunds workflows, and customer-facing order tracking are out of MVP scope.
- Notifications are `email + SMS`; WhatsApp is removed from MVP due to cost.
- `Africa’s Talking` is the planned SMS provider.
- `Redis/Celery` are not mandatory from day one; add them only if notification retries, webhook processing, or async tasks become operationally necessary during implementation.
