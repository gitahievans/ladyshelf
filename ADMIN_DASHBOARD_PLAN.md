# Wahi Fashion Admin Dashboard Plan

> Build and evolve the custom staff dashboard in deliberate phases, with each area verified before expanding the next.
> Read `AGENTS.md`, `context.md`, `architecture.md`, and `BACKEND_PLAN.md` before making structural dashboard changes.

---

## Purpose

This plan defines the custom Wahi Fashion admin dashboard that sits on top of the backend admin APIs.
It exists to give store staff a focused operational workspace for catalog, orders, payments, customers, inventory, settings, and staff access without relying on generic Django admin screens for daily work.

The dashboard must feel aligned with the Wahi brand:
- warm, premium, and editorial rather than utilitarian
- mobile-aware but optimized for serious desktop operations
- permission-aware so owners and attendants only see what they should manage
- operationally safe, with admin actions backed by explicit validation and clear status feedback

---

## Current State In This Repo

The custom admin dashboard already has a meaningful foundation in place:

- route shell and overview page under `app/admin/`
- section pages for:
  - `catalog`
  - `orders`
  - `payments`
  - `customers`
  - `inventory`
  - `settings`
  - `staff`
- admin UI components under `components/admin/`
- admin API client helpers in `lib/api/admin.ts`
- permission and staff types in `lib/types/index.ts`

This plan is here to document that dashboard work in the same way `PLAN.md` and `BACKEND_PLAN.md` document the storefront and backend.

---

## Admin Dashboard Goals

### Primary goals

- Give staff one operational workspace for day-to-day commerce tasks
- Reduce reliance on raw backend/admin tooling for common workflows
- Keep critical actions fast, clear, and auditable
- Support permission-based visibility and editing
- Preserve the Wahi visual system even in operational screens

### Non-goals for the current admin dashboard phase

- full analytics warehouse or BI tooling
- multi-location enterprise inventory orchestration
- advanced workflow automation
- bulk CSV import/export tooling
- rich media editing beyond practical product image management

---

## Information Architecture

### Admin areas

1. Dashboard overview
   - KPIs
   - low-stock alerts
   - payment issues
   - recent paid orders

2. Orders
   - search and filter orders
   - inspect order detail
   - update order/payment operational state

3. Payments
   - review payment records
   - inspect payment detail and transaction status

4. Customers
   - search customer records
   - inspect customer profile, recent orders, and wishlist context

5. Catalog
   - manage products and categories
   - edit product data
   - manage product images
   - manage variants

6. Inventory
   - search/filter inventory rows
   - update stock counts quickly
   - prioritize low-stock review

7. Settings
   - delivery zones
   - pickup locations
   - operational settings surfaces added later

8. Staff
   - create staff access
   - assign roles
   - activate/deactivate staff accounts

---

## Route Plan

The dashboard should continue to live under `app/admin/` with one route per operational concern:

```txt
app/admin/page.tsx
app/admin/orders/page.tsx
app/admin/orders/[orderNumber]/page.tsx
app/admin/payments/page.tsx
app/admin/payments/[id]/page.tsx
app/admin/customers/page.tsx
app/admin/customers/[id]/page.tsx
app/admin/catalog/page.tsx
app/admin/inventory/page.tsx
app/admin/settings/page.tsx
app/admin/settings/delivery-zones/page.tsx
app/admin/settings/pickup/page.tsx
app/admin/staff/page.tsx
```

Shared admin layout concerns belong in:

```txt
components/admin/AdminShell.tsx
components/admin/AdminStatus.tsx
components/admin/AdminForbiddenState.tsx
```

---

## Delivery Phases

### Phase 1 — Admin Shell, Auth, and Permissions

**Goal**
Establish the secure operational frame for the whole dashboard.

**Deliverables**
- admin route protection
- current staff identity resolution
- permission fetch and gated navigation
- shared shell with sidebar/topbar
- empty/forbidden/loading states

**Testable outcome**
- signed-out users are redirected away from admin routes
- unauthorized staff cannot access restricted areas
- authorized staff see only the sections allowed by their permission set

---

### Phase 2 — Dashboard Overview

**Goal**
Give staff a clear operational snapshot immediately after entering the dashboard.

**Deliverables**
- KPI cards
- payment issue summary
- fulfillment action summary
- low stock highlights
- recent paid orders panel

**Testable outcome**
- the overview loads from backend summary data
- cards and panels remain readable on laptop and desktop widths
- empty states render cleanly when datasets are sparse

---

### Phase 3 — Orders and Payments Workspace

**Goal**
Support the core operational loop from order intake through payment verification and fulfillment readiness.

**Deliverables**
- searchable orders list
- order detail page with internal notes and status controls
- searchable payments list
- payment detail view
- clear status presentation components

**Testable outcome**
- staff can find an order quickly
- order status updates persist correctly
- payment records and transaction details are visible without leaving the dashboard

---

### Phase 4 — Customers Workspace

**Goal**
Give attendants and owners enough customer context to support service and resolution workflows.

**Deliverables**
- searchable customer table
- customer detail screen
- recent orders section
- wishlist context for merchandising/support conversations

**Testable outcome**
- staff can locate customers by query
- customer detail pages show account and commerce context without data duplication bugs

---

### Phase 5 — Catalog and Image Management

**Goal**
Enable practical product operations directly inside the custom dashboard.

**Deliverables**
- product search/listing
- product create/edit flows
- category creation
- variant creation and stock visibility
- product image upload, delete, and reorder

**Testable outcome**
- staff can update product content and images successfully
- catalog edits persist through the backend admin APIs
- validation errors surface with useful messages

**Known integration note**
- product and variant mutations depend on the backend exposing stable route identifiers for admin endpoints

---

### Phase 6 — Inventory Controls

**Goal**
Make stock correction and low-stock review fast enough for day-to-day retail operations.

**Deliverables**
- inventory table
- low-stock filter
- inline stock adjustments
- update state feedback

**Testable outcome**
- staff can filter low-stock rows
- stock saves update the row and preserve list stability

---

### Phase 7 — Settings and Staff Administration

**Goal**
Move operational configuration and staff access into the custom dashboard.

**Deliverables**
- delivery zone management
- pickup location management
- staff role management
- staff active/inactive controls

**Testable outcome**
- owners can manage staff access safely
- delivery and pickup operational settings persist through the backend APIs

---

## Component Ownership Map

### Overview
- `app/admin/page.tsx`

### Orders
- `components/admin/AdminOrdersManager.tsx`
- `components/admin/AdminOrderDetailManager.tsx`

### Payments
- `components/admin/AdminPaymentsManager.tsx`
- `components/admin/AdminPaymentDetail.tsx`

### Customers
- `components/admin/AdminCustomersManager.tsx`
- `components/admin/AdminCustomerDetail.tsx`

### Catalog
- `components/admin/AdminCatalogManager.tsx`
- `components/admin/AdminProductImageManager.tsx`

### Inventory
- `components/admin/AdminInventoryManager.tsx`

### Settings
- `components/admin/AdminSettingsManager.tsx`

### Staff
- `components/admin/AdminStaffManager.tsx`

---

## Backend Dependencies

The admin dashboard relies on these backend capabilities already reflected in the repo:

- `GET /api/v1/admin/me`
- `GET /api/v1/admin/permissions`
- `GET /api/v1/admin/dashboard-summary`
- orders list/detail/update endpoints
- payments list/detail endpoints
- customers list/detail endpoints
- categories list/create/update endpoints
- products list/create/update endpoints
- product variants create endpoint
- variant update and stock update endpoints
- inventory list endpoint
- delivery zones list/create/update endpoints
- pickup locations list/create/update endpoints
- staff list/create/update endpoints

The frontend admin workspace should remain thin:
- pages compose admin components
- API shape translation stays in `lib/api/admin.ts`
- reusable admin status rendering stays in shared admin components

---

## Design Principles

- Use the existing Wahi tokens and typography instead of generic enterprise admin styles
- Keep dense information readable with strong spacing and typographic contrast
- Favor clarity over decoration in operational tables and forms
- Show explicit success/error states after every write action
- Preserve mobile resilience, but optimize heavy workflows for desktop first

---

## Definition of Done

An admin dashboard task is done when:

1. The relevant admin page compiles with zero TypeScript errors
2. Permission gating works correctly for the affected route or action
3. Loading, empty, success, and error states are present
4. The UI is responsive at mobile and desktop breakpoints
5. Admin actions use the correct backend endpoint and identifier shape
6. No generic placeholder styling breaks the Wahi design system

---

## Near-Term Backlog

- strengthen product/variant identifier handling between frontend and backend admin APIs
- add richer filtering on orders, payments, and customers
- add bulk admin actions only where operationally safe
- expand settings coverage beyond delivery and pickup
- improve dashboard instrumentation once real operational usage patterns are known

