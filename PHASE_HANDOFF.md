# Wahi Fashion Fullstack Implementation Handoff

This file is the implementation handoff for continuing work in a new chat.

## Working Mode

This project is being implemented in **fullstack mode**.

That means every phase may involve changes in:

- frontend repo: `C:\Users\gitahi\Development\wahi-fasion`
- backend repo: `C:\Users\gitahi\Development\wahi-backend`

Do **not** assume work happens only in `wahi-backend`.
When implementing a feature, make the backend and frontend work together end to end where applicable.

## Overall Backend Plan

Implementation is being done phase by phase, with each phase tested before moving on.

### Phase 1 - Backend Foundation
Status: `completed`

Implemented:
- standalone Django backend in `C:\Users\gitahi\Development\wahi-backend`
- Docker / Docker Compose
- Postgres-ready settings
- Django admin
- health check endpoint
- OpenAPI schema/docs
- initial backend app scaffold:
  - `common`
  - `customers`
  - `catalog`
  - `wishlist`
  - `orders`
  - `payments`
  - `notifications`

Notes:
- backend is intentionally separated from frontend
- frontend repo only keeps frontend code plus this handoff context

### Phase 2 - Authentication, Profiles, and Customer Data
Status: `mostly completed`

Implemented backend:
- Supabase JWT verification via JWKS
- `CustomerProfile` model
- `Address` model
- `/api/v1/account/me`
- `/api/v1/account/addresses`
- Django admin registration for customers and addresses

Implemented frontend:
- Supabase-backed auth store
- email/password sign up
- email confirmation flow
- email/password login
- forgot password flow
- update password flow
- logout
- account hydration from backend `/account/me`

Working:
- account creation with email/password
- email confirmation
- login with email/password
- password reset
- logout
- Django customer profile creation/sync

Deferred / not resolved yet:
- Google sign-in button remains in UI
- Google OAuth flow is **not working yet**
- current issue: PKCE / callback flow instability with Supabase OAuth in this Next.js setup
- do **not** remove or hide the Google button unless explicitly asked
- do **not** treat Google sign-in as solved

Important decision:
- Google sign-in is **not a blocker** for continuing to later phases

### Phase 3 - Catalog, Search, and Inventory
Status: `completed`

Implemented backend:
- `Category`, `Product`, and `ProductVariant` models
- seeded catalog fixture generated from the approved frontend catalog data
- public catalog endpoints:
  - `/api/v1/catalog/categories`
  - `/api/v1/catalog/products`
  - `/api/v1/catalog/products/<slug>`
- category/product admin registration
- catalog API tests

Implemented frontend:
- landing page, shop page, search page, search overlay, and product detail page now consume catalog data via API helpers
- backend catalog is treated as the primary source of truth, with frontend mock fallback kept in place for resilience
- existing search/filter/sort UX preserved while running against live catalog data

Working:
- category/product catalog loads from backend when available
- shop/search/product detail flows work against backend catalog responses
- out-of-stock items remain visible
- out-of-stock variants are not purchasable

Important decision:
- the approved storefront UX was preserved; the integration replaced data sources carefully instead of redesigning the catalog journey

### Phase 4 - Wishlist and Account History
Status: `completed`

Implemented backend:
- `WishlistItem` model and authenticated wishlist endpoints:
  - `/api/v1/wishlist/`
  - `/api/v1/wishlist/<product_id>`
- `Order` and `OrderItem` models for account-history support
- authenticated order history endpoint:
  - `/api/v1/account/orders`
- wishlist and orders admin registration
- wishlist and order-history API tests

Implemented frontend:
- wishlist store updated to support backend sync for authenticated users
- guests still retain local wishlist behavior
- wishlist page now resolves saved products from live catalog data
- account page now loads recent orders from backend instead of mock orders

Working:
- signed-in users can load, add, remove, and clear wishlist items against backend APIs
- guest users can still save pieces locally before signing in
- account page shows backend-backed order history, or a clean empty state if no orders exist yet

Important decision:
- because checkout/order creation is a later phase, phase 4 establishes real account-history infrastructure now while allowing empty histories until order creation is implemented

### Phase 5 - Checkout Rules and Delivery Logic
Status: `completed`

Implemented backend:
- new `checkout` app for server-side checkout rules
- `DeliverySettings` model and admin registration for distance-based rider/parcel rules
- `PickupLocation` model and admin registration for store pickup details
- seeded defaults for:
  - Roysambu pickup location
  - primary distance-based delivery settings
- public checkout endpoints:
  - `/api/v1/checkout/quote`
  - `/api/v1/checkout/pickup-info`
- quote validation for:
  - cart lines
  - live variant stock
  - live product pricing
  - distance-based delivery resolution from selected coordinates
  - payment-option validity by fulfillment choice
- checkout API tests for pickup, rider delivery, parcel delivery, and invalid payment combinations

Implemented frontend:
- checkout flow now requests backend quotes instead of relying on fixed local delivery rules
- delivery step now adapts for:
  - Mapbox-powered delivery location search
  - store pickup with server-backed pickup info
- payment step now renders only backend-approved options for the selected quote
- review step now uses backend quote totals, delivery mode, and parcel fee-confirmation state
- cart summary no longer implies a hardcoded delivery fee before checkout

Working:
- pickup is prepay only
- parcel delivery is prepay only
- pay-on-delivery is only available for rider-served locations
- pay-on-delivery is restricted to `mpesa`
- pickup instructions surface:
  - location
  - contact phone
  - Google Maps link
  - 72-hour collection window
- checkout quotes resolve rider vs parcel vs pickup on the backend

Important decision:
- Phase 5 stops at quote/rules authority. The final confirmation screen remains frontend-local for now because real order creation still belongs to Phase 6.
- delivery pricing is no longer manual-town/zone based; rider pricing is calculated from straight-line distance bands and parcel delivery takes over beyond the configured radius

### Phase 6 - Orders and Manual Fulfillment Workflow
Status: `completed`

Implemented backend:
- real order creation from validated checkout selections
- support for both guest and authenticated order creation
- expanded order lifecycle state model:
  - order statuses:
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
    - `refunded`
- added order fields for:
  - `delivery_mode`
  - `payment_timing`
  - `manual_delivery_fee_confirmation_required`
  - `pickup_instructions`
  - internal notes
- transactional order creation service that:
  - revalidates the quote inputs
  - generates order numbers
  - creates `Order` and `OrderItem` rows
  - decrements variant stock
- new order endpoints:
  - `POST /api/v1/checkout/orders`
  - `GET /api/v1/orders`
  - `GET /api/v1/orders/{order_number}`
- kept authenticated account history endpoint:
  - `GET /api/v1/account/orders`
- Django admin updated for operational order fields
- email notifications implemented for:
  - customer order confirmation
  - staff new-order alert
- SMS integration intentionally deferred for now
  - explicit TODO left in notifications service for future Africa's Talking integration
- phase 6 backend tests added and passing

Implemented frontend:
- checkout confirmation now comes from the backend-created order instead of a locally mocked confirmation
- checkout submits real order creation requests to `/api/v1/checkout/orders`
- confirmation screen updated to reflect:
  - awaiting payment
  - awaiting delivery fee confirmation
  - pay-on-delivery rider orders
  - pickup instructions from the backend
- account recent-orders UI updated for the new operational statuses
- frontend order types updated to match the backend phase 6 contract

Working:
- guest and signed-in customers can place valid orders
- rider pay-on-delivery orders are created without online payment
- pickup orders remain prepaid only
- parcel orders can begin in an awaiting-delivery-fee-confirmation state
- newly created authenticated orders appear in account history
- newly created orders appear in Django admin for manual fulfillment
- email notifications fire on order placement

Important decisions:
- because SasaPay belongs to Phase 7, prepaid orders now start in `awaiting_payment` rather than being marked paid immediately
- SMS was not implemented in phase 6 because Africa's Talking arrangements are not yet in place; the code now leaves a clean extension point for it

### Later Phases

Planned after Phase 7 sandbox completion:
- SasaPay production/live-money rollout
- hardening and launch prep

## Locked Business Decisions

These have already been discussed and should be treated as current product decisions unless the user says otherwise.

### Authentication
- Supabase Auth is the identity source of truth
- Django owns business/customer profile data
- auth methods:
  - email/password
  - Google
- email confirmation required
- password reset enabled

### Customer Accounts
- both guest checkout and account checkout are required

### Payments
- prepaid online payments will use SasaPay
- pay-on-delivery is manual and **not** processed on the website
- pay-on-delivery supports:
  - `mpesa` only
- pay-on-delivery does **not** support:
  - card
- store pickup is prepay only

### Fulfillment
- delivery and store pickup are both required
- pickup location:
  - Lumumba Drive, Roysambu
- pickup instructions should include:
  - location
  - contact details
  - Google Maps link
  - collection within 72 hours

### Delivery Model
- rider delivery uses straight-line distance from the shop location
- parcel delivery begins beyond the configured rider/parcel switch radius
- parcel delivery is prepay only
- parcel dispatch is arranged manually by the store after payment confirmation
- pay-on-delivery only applies to rider-served areas
- current seeded delivery settings:
  - rider max radius: `50 km`
  - parcel switch radius: `50 km`
  - rider base fee for `0-10 km`: `KES 200`
  - each additional `10 km` band: `+KES 200`
  - these values are editable from the admin dashboard

### Notifications
- customer notifications:
  - email
  - SMS
- staff notifications:
  - email
  - SMS
- WhatsApp was removed from MVP due to cost
- SMS provider planned for MVP:
  - Africa's Talking

### Inventory
- in-stock only for purchase
- out-of-stock products should still be visible on the storefront
- out-of-stock products/variants must not be purchasable

### Tracking / Returns
- no customer-facing order tracking in MVP
- returns / exchanges / refunds are manual and not handled on the website in MVP

## Environment / Integration Context

### Frontend
- local URL: `http://localhost:3000`
- Vercel production URL: `https://wahi-fashion.vercel.app`

### Supabase
- project URL: `https://nehcexpdaoypguejwnvg.supabase.co`
- frontend uses publishable key
- backend verifies tokens with JWKS

### Backend
- local backend URL: `http://localhost:8000`
- backend repo path: `C:\Users\gitahi\Development\wahi-backend`

## Important Technical Context

- The frontend was originally mock-data driven.
- The backend is being introduced incrementally while preserving the approved frontend UX.
- When implementing future phases, prefer replacing mock-backed flows with real API-backed flows carefully rather than rewriting the UI unnecessarily.
- The client has already approved the frontend mockup/MVP journey.
- Preserve the current user experience unless backend-driven changes are necessary.
- authenticated wishlist is now backend-backed; guest wishlist remains local until sign-in
- checkout now creates real backend orders, so account order history should begin populating for authenticated customers

## Phase 2 Verification Notes

Known good:
- email/password auth flow works
- account confirmation works
- backend customer profile sync works

Known broken:
- Google OAuth sign-in callback flow

If revisiting Google later:
- investigate Supabase SSR cookie flow and callback/session exchange
- do not assume the current callback implementation is final

## Phase 3 Verification Notes

Known good:
- frontend `tsc --noEmit` passed after catalog integration
- backend catalog tests passed
- backend `manage.py check` passed

Implemented endpoints:
- `/api/v1/catalog/categories`
- `/api/v1/catalog/products`
- `/api/v1/catalog/products/<slug>`

## Phase 4 Verification Notes

Known good:
- frontend `tsc --noEmit` passed after wishlist/account-history integration
- backend wishlist and order-history tests passed
- backend `manage.py check` passed

Implemented endpoints:
- `/api/v1/wishlist/`
- `/api/v1/wishlist/<product_id>`
- `/api/v1/account/orders`

Known limitation:
- order history read APIs exist, but checkout has not yet been converted to create backend orders

## Phase 5 Verification Notes

Known good:
- frontend `tsc --noEmit` passed after checkout quote integration
- backend quote/pickup files passed Python syntax compilation
- checkout frontend now changes correctly for pickup, rider delivery, and parcel delivery scenarios

Implemented endpoints:
- `/api/v1/checkout/quote`
- `/api/v1/checkout/pickup-info`

Known limitation:
- backend `manage.py check` and Django tests still need to be run in an environment where Django is installed
- checkout still does not create backend orders yet; order history remains empty until Phase 6

## Phase 6 Verification Notes

Known good:
- backend `manage.py test` passed in an environment with Django installed
- backend `manage.py makemigrations --check` passed
- frontend `tsc --noEmit` passed after the checkout order-creation integration
- order creation tests passed for:
  - guest parcel orders
  - authenticated rider pay-on-delivery orders
  - pickup prepaid orders
- notification tests confirmed email dispatch on order placement

Implemented endpoints:
- `POST /api/v1/checkout/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order_number}`
- `GET /api/v1/account/orders`

Known limitation:
- full prepaid payment collection is still deferred to Phase 7, so `prepay` orders begin in `awaiting_payment`
- SMS notifications are still deferred pending Africa's Talking setup; email notifications are implemented now
- repo-wide frontend lint is not yet a clean signal because there are unrelated existing lint issues elsewhere in the workspace

## Phase 7 Verification Notes

Known good:
- frontend `tsc --noEmit` passed after the SasaPay checkout/status-handling integration
- backend `manage.py test payments checkout orders` passed in Docker
- backend `manage.py makemigrations --check` passed after payment/expiry changes
- sandbox SasaPay checkout initiation, callback handling, status sync, and transaction persistence are implemented
- prepaid orders now notify customer/staff only after payment confirmation
- rider pay-on-delivery orders still notify immediately on order placement
- unpaid prepaid orders now auto-expire after 30 minutes when the expiry command runs:
  - order marked `cancelled`
  - stock restored
  - order retained in admin history

Implemented endpoints:
- `POST /api/v1/payments/sasapay/checkout`
- `POST /api/v1/payments/sasapay/callback`
- `POST /api/v1/payments/sasapay/status-sync`

Known limitation:
- SasaPay is still configured for sandbox/testing mode, not live production money
- live transaction behavior, production callback verification, and final merchant go-live setup still remain for a later production rollout step

## Recommended Next Phase

### Phase 7 - Prepaid Payments with SasaPay
Status: `partially completed`

Phase 7 is no longer at the discovery-only stage.
Sandbox integration and MVP payment handling have already been implemented.
What remains later is the production/live-money rollout after the merchant/account side is ready.

Implemented so far:
- SasaPay sandbox credential/config setup in backend env handling
- backend payment transaction audit model
- SasaPay token/auth integration
- checkout/session initiation for eligible prepaid M-Pesa orders
- callback handling and status sync endpoints
- replay-safe callback processing
- frontend redirect flow to SasaPay and return-to-checkout handling
- Gmail SMTP-backed email delivery for testing
- payment confirmation notifications for prepaid orders
- immediate notifications kept only for rider pay-on-delivery orders
- 30-minute expiry for unpaid prepaid orders:
  - auto-cancel
  - stock restoration
  - retained admin history
- parcel flow updated:
  - prepaid on the website
  - manual dispatch arrangement after payment

Still deferred for later:
- switch SasaPay from sandbox/testing mode to production/live-money mode
- production credential management and final live callback URLs
- confirm real-world callback behavior and live transaction reconciliation
- optional extra hardening around retries/ops monitoring if needed

Phase 7 was approached in two sub-steps:

#### Phase 7A - SasaPay Discovery and Integration Prep
- review official SasaPay docs first:
  - Introduction: [https://docs.sasapay.app/docs/introduction](https://docs.sasapay.app/docs/introduction)
  - Customer to Business (C2B): [https://docs.sasapay.app/docs/customerTobusiness](https://docs.sasapay.app/docs/customerTobusiness)
- help the user understand what SasaPay requires before implementation
- confirm whether the MVP should use:
  - SasaPay C2B payment request flow
  - SasaPay Checkout flow
  - or a narrower first implementation around M-Pesa C2B only
- identify all merchant/account/application prerequisites
- confirm sandbox testing path before touching live funds

#### Phase 7B - Payment Implementation
Completed in sandbox/test mode:
- token/auth flow
- payment initiation for eligible `prepay` orders
- callback/IPN handling
- order/payment state updates
- frontend/backend payment status handling
- unpaid prepaid expiry handling

Key business rules to implement next:
- production/live-money SasaPay activation
- production callback URL and credential rollout
- final verification against real payment confirmations before launch

## Phase 7 Discovery Notes

These notes came from the official SasaPay docs linked above and guided the original setup conversation before sandbox implementation.

### Merchant / business arrangements
- SasaPay docs say you must first register as a SasaPay merchant
- their introduction page says the business flow is:
  - download SasaPay business application forms
  - fill the forms
  - email the forms and KYC documents to `merchants@sasapay.co.ke`
- once the merchant account is created, login details for the merchant portal are issued
- production app creation appears to require OTP verification sent to the owner of the paybill

### Developer setup
- SasaPay docs say a developer must first have an active SasaPay user account
- after that, register on the SasaPay Developer Portal
- create a `SANDBOX APP`
- when creating the app, provide:
  - application name
  - callback URL
  - subscribed service such as `C2B/B2C/B2B`
- sandbox app creation yields:
  - `CLIENT ID`
  - `CLIENT SECRET`

### Sandbox / test-money path
- SasaPay docs explicitly document sandbox endpoints such as:
  - `https://sandbox.sasapay.app/api/v1/payments/request-payment/`
  - `https://sandbox.sasapay.app/api/v1/payments/process-payment/`
- this strongly suggests there is a test/sandbox path for development before going live
- the next chat should clarify exactly how sandbox transactions behave in practice:
  - whether they are fully simulated
  - whether they require test phone numbers
  - whether they trigger real STK prompts or mocked flows
  - whether callbacks/IPNs can be replayed safely in sandbox
- until that is confirmed, treat sandbox as the correct first implementation target and do **not** assume live money should be used during development

### C2B flow details relevant to implementation
- the C2B docs describe two collection patterns:
  - SasaPay user payment request
  - mobile money payment request for non-SasaPay users
- for SasaPay users:
  - a payment request can send an OTP
  - the OTP is then submitted to the `process-payment` endpoint
- for mobile money:
  - the same request-payment endpoint is used
  - the docs say no OTP is sent
  - instead the customer receives an STK prompt depending on `NetworkCode`
- the docs list callback/IPN result payloads and make callback URL setup mandatory

### Integration assumptions to validate in the next chat
- whether Wahi Fashion should use:
  - M-Pesa via SasaPay C2B first
  - card rails as well
  - or only one prepaid method for MVP launch
- note: current agreed implementation is `M-Pesa only` for MVP sandbox
- note: parcel orders are now prepaid on the website, with dispatch arranged manually after payment
- what public callback URL should be used in sandbox and in production
- whether SasaPay requires a paybill/till already assigned before production activation
- how order expiry / abandoned pending payments should be handled operationally
- whether customer-facing UI should show:
  - awaiting payment
  - payment initiated
  - payment confirmed
  - payment failed

Recommended next task in the next chat:
- treat Phase 7 sandbox work as already implemented
- only revisit SasaPay onboarding/setup if the user wants to prepare the live production rollout
- otherwise continue with production rollout planning or move to the next phase

## Instruction For The Next Chat

Unless the user says otherwise:

1. Read this file first.
2. Treat the work as **fullstack**, spanning both frontend and backend repos.
3. Treat **Phase 7 sandbox/test-mode work as already partially completed**.
4. The main remaining Phase 7 task is the later production/live-money SasaPay rollout.
5. Use the completed Phase 6 + Phase 7 sandbox order/payment flow as the operational base.
6. If the user wants to continue Phase 7 later, focus on production credentials, live callback URLs, and go-live verification.
7. Otherwise continue to the next planned phase or the user’s redirected task.
8. Do not spend the next phase trying to finish Google auth unless the user explicitly asks for that.
