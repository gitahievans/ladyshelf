import type {
  AdminCategoryInput,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminDeliverySettings,
  AdminDeliverySettingsInput,
  AdminDeliveryZone,
  AdminDeliveryZoneInput,
  AdminDashboardSummary,
  AdminCatalogProductInput,
  AdminInventoryRow,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminManualPaymentInput,
  AdminOrderUpdateInput,
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPermissionSet,
  AdminPickupLocation,
  AdminPickupLocationInput,
  AdminVariantInput,
  AdminStaffInput,
  AdminStaffRecord,
  AdminStaffUser,
  AdminUploadedProductImage,
  Category,
  Product,
  ProductVariant,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

function humanizeAdminFieldName(fieldName: string): string {
  return fieldName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\bid\b/gi, "ID")
    .replace(/\bsku\b/gi, "SKU")
    .replace(/\burl\b/gi, "URL")
    .replace(/\bapi\b/gi, "API")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

function formatAdminErrorValue(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => formatAdminErrorValue(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([field, nestedValue]) =>
      formatAdminFieldErrors(field, nestedValue),
    );
  }

  return [];
}

function formatAdminFieldErrors(field: string, value: unknown): string[] {
  const label = humanizeAdminFieldName(field);
  const messages = formatAdminErrorValue(value);

  if (messages.length === 0) {
    return [];
  }

  return messages.map((message) => `${label}: ${message}`);
}

function summarizeAdminValidationErrors(payload: Record<string, unknown>): string | null {
  const preferredKeys = ["detail", "nonFieldErrors", "non_field_errors"];

  for (const key of preferredKeys) {
    const value = payload[key];
    const messages = formatAdminErrorValue(value);

    if (messages.length > 0) {
      return messages[0];
    }
  }

  const fieldMessages = Object.entries(payload).flatMap(([field, value]) =>
    preferredKeys.includes(field) ? [] : formatAdminFieldErrors(field, value),
  );

  if (fieldMessages.length === 0) {
    return null;
  }

  return fieldMessages.join(" ");
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

async function parseAdminError(response: Response): Promise<AdminApiError> {
  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | string[]
    | string
    | null;

  if (typeof payload === "string" && payload.trim()) {
    return new AdminApiError(payload.trim(), response.status);
  }

  if (Array.isArray(payload) && payload[0]) {
    const messages = formatAdminErrorValue(payload);
    return new AdminApiError(messages[0] ?? "Unable to complete this admin action.", response.status);
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const message =
      summarizeAdminValidationErrors(payload) ??
      "Unable to complete this admin action.";

    return new AdminApiError(message, response.status);
  }

  return new AdminApiError("Unable to complete this admin action.", response.status);
}

async function fetchAdminResource<T>({
  accessToken,
  body,
  method = "GET",
  path,
}: {
  accessToken: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseAdminError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchAdminMe(
  accessToken: string,
): Promise<AdminStaffUser> {
  return fetchAdminResource<AdminStaffUser>({
    accessToken,
    path: "/api/v1/admin/me",
  });
}

export async function fetchAdminPermissions(
  accessToken: string,
): Promise<AdminPermissionSet> {
  return fetchAdminResource<AdminPermissionSet>({
    accessToken,
    path: "/api/v1/admin/permissions",
  });
}

export async function fetchAdminDashboardSummary(
  accessToken: string,
): Promise<AdminDashboardSummary> {
  return fetchAdminResource<AdminDashboardSummary>({
    accessToken,
    path: "/api/v1/admin/dashboard-summary",
  });
}

export async function fetchAdminMeFromSession(): Promise<AdminStaffUser | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  return fetchAdminMe(accessToken);
}

export async function fetchAdminPermissionsFromSession(): Promise<AdminPermissionSet | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  return fetchAdminPermissions(accessToken);
}

export async function fetchAdminStaff(): Promise<AdminStaffRecord[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to manage staff.", 401);
  }

  return fetchAdminResource<AdminStaffRecord[]>({
    accessToken,
    path: "/api/v1/admin/staff",
  });
}

export async function createAdminStaff(
  input: AdminStaffInput,
): Promise<AdminStaffRecord> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to manage staff.", 401);
  }

  return fetchAdminResource<AdminStaffRecord>({
    accessToken,
    method: "POST",
    path: "/api/v1/admin/staff",
    body: input,
  });
}

export async function updateAdminStaff({
  id,
  input,
}: {
  id: string;
  input: Pick<AdminStaffInput, "role" | "isActive">;
}): Promise<AdminStaffRecord> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to manage staff.", 401);
  }

  return fetchAdminResource<AdminStaffRecord>({
    accessToken,
    method: "PATCH",
    path: `/api/v1/admin/staff/${encodeURIComponent(id)}`,
    body: input,
  });
}

function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value?.trim()) {
      searchParams.set(key, value.trim());
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

function resolveAdminProductRouteId(id: string): string {
  const trimmedId = id.trim();
  const numericMatch = /^prod-(\d+)$/i.exec(trimmedId);

  if (numericMatch?.[1]) {
    return String(Number.parseInt(numericMatch[1], 10));
  }

  return trimmedId;
}

function normalizeAdminVariant(
  variant: ProductVariant & {
    adminId?: string;
    external_id?: string;
    externalId?: string;
    pk?: number | string;
  },
): ProductVariant {
  const backendId = variant.adminId ?? variant.pk ?? variant.id;
  const storefrontId = variant.external_id ?? variant.externalId ?? variant.id;

  return {
    ...variant,
    adminId: String(backendId),
    id: String(storefrontId),
  };
}

function normalizeAdminProduct(
  product: Product & {
    adminId?: string;
    external_id?: string;
    externalId?: string;
    pk?: number | string;
    variants?: Array<
      ProductVariant & {
        adminId?: string;
        external_id?: string;
        externalId?: string;
        pk?: number | string;
      }
    >;
  },
): Product {
  const backendId = product.adminId ?? product.pk ?? product.id;
  const storefrontId = product.external_id ?? product.externalId ?? product.id;

  return {
    ...product,
    adminId: String(backendId),
    id: String(storefrontId),
    variants: (product.variants ?? []).map(normalizeAdminVariant),
  };
}

export async function fetchAdminOrders(
  filters: Record<string, string | undefined> = {},
): Promise<AdminOrderListItem[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view orders.", 401);
  }

  return fetchAdminResource<AdminOrderListItem[]>({
    accessToken,
    path: `/api/v1/admin/orders${buildQueryString(filters)}`,
  });
}

export async function fetchAdminOrderDetail(
  orderNumber: string,
): Promise<AdminOrderDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view this order.", 401);
  }

  return fetchAdminResource<AdminOrderDetail>({
    accessToken,
    path: `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}`,
  });
}

export async function updateAdminOrder({
  input,
  orderNumber,
}: {
  input: AdminOrderUpdateInput;
  orderNumber: string;
}): Promise<AdminOrderDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to update this order.", 401);
  }

  return fetchAdminResource<AdminOrderDetail>({
    accessToken,
    method: "PATCH",
    path: `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}`,
    body: input,
  });
}

export async function markAdminOrderPaid({
  input,
  orderNumber,
}: {
  input: AdminManualPaymentInput;
  orderNumber: string;
}): Promise<AdminOrderDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to mark this order as paid.", 401);
  }

  return fetchAdminResource<AdminOrderDetail>({
    accessToken,
    method: "POST",
    path: `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}/mark-paid`,
    body: input,
  });
}

export async function resendAdminOrderReceipt(
  orderNumber: string,
): Promise<AdminOrderDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to resend this receipt.", 401);
  }

  return fetchAdminResource<AdminOrderDetail>({
    accessToken,
    method: "POST",
    path: `/api/v1/admin/orders/${encodeURIComponent(orderNumber)}/receipt/resend`,
  });
}

export async function fetchAdminPayments(
  filters: Record<string, string | undefined> = {},
): Promise<AdminPaymentListItem[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view payments.", 401);
  }

  return fetchAdminResource<AdminPaymentListItem[]>({
    accessToken,
    path: `/api/v1/admin/payments${buildQueryString(filters)}`,
  });
}

export async function fetchAdminPaymentDetail(
  id: string,
): Promise<AdminPaymentDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view this payment.", 401);
  }

  return fetchAdminResource<AdminPaymentDetail>({
    accessToken,
    path: `/api/v1/admin/payments/${encodeURIComponent(id)}`,
  });
}

export async function fetchAdminCustomers(
  filters: Record<string, string | undefined> = {},
): Promise<AdminCustomerListItem[]> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view customers.", 401);
  }

  return fetchAdminResource<AdminCustomerListItem[]>({
    accessToken,
    path: `/api/v1/admin/customers${buildQueryString(filters)}`,
  });
}

export async function fetchAdminCustomerDetail(
  id: string,
): Promise<AdminCustomerDetail> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new AdminApiError("Please sign in to view this customer.", 401);
  }

  return fetchAdminResource<AdminCustomerDetail>({
    accessToken,
    path: `/api/v1/admin/customers/${encodeURIComponent(id)}`,
  });
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view categories.", 401);
  return fetchAdminResource<Category[]>({ accessToken, path: "/api/v1/admin/categories" });
}

export async function createAdminCategory(input: AdminCategoryInput): Promise<Category> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage categories.", 401);
  return fetchAdminResource<Category>({ accessToken, method: "POST", path: "/api/v1/admin/categories", body: input });
}

export async function updateAdminCategory(id: string, input: Partial<AdminCategoryInput>): Promise<Category> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage categories.", 401);
  return fetchAdminResource<Category>({ accessToken, method: "PATCH", path: `/api/v1/admin/categories/${encodeURIComponent(id)}`, body: input });
}

export async function fetchAdminProducts(filters: Record<string, string | undefined> = {}): Promise<Product[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view products.", 401);
  const products = await fetchAdminResource<
    Array<
      Product & {
        adminId?: string;
        external_id?: string;
        externalId?: string;
        pk?: number | string;
        variants?: Array<
          ProductVariant & {
            adminId?: string;
            external_id?: string;
            externalId?: string;
            pk?: number | string;
          }
        >;
      }
    >
  >({ accessToken, path: `/api/v1/admin/products${buildQueryString(filters)}` });
  return products.map(normalizeAdminProduct);
}

export async function createAdminProduct(input: AdminCatalogProductInput): Promise<Product> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage products.", 401);
  const product = await fetchAdminResource<
    Product & {
      adminId?: string;
      external_id?: string;
      externalId?: string;
      pk?: number | string;
      variants?: Array<
        ProductVariant & {
          adminId?: string;
          external_id?: string;
          externalId?: string;
          pk?: number | string;
        }
      >;
    }
  >({ accessToken, method: "POST", path: "/api/v1/admin/products", body: input });
  return normalizeAdminProduct(product);
}

export async function updateAdminProduct(id: string, input: Partial<AdminCatalogProductInput>): Promise<Product> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage products.", 401);
  const product = await fetchAdminResource<
    Product & {
      adminId?: string;
      external_id?: string;
      externalId?: string;
      pk?: number | string;
      variants?: Array<
        ProductVariant & {
          adminId?: string;
          external_id?: string;
          externalId?: string;
          pk?: number | string;
        }
      >;
    }
  >({
    accessToken,
    method: "PATCH",
    path: `/api/v1/admin/products/${encodeURIComponent(resolveAdminProductRouteId(id))}`,
    body: input,
  });
  return normalizeAdminProduct(product);
}

export async function createAdminVariant(productId: string, input: AdminVariantInput): Promise<ProductVariant> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage variants.", 401);
  const variant = await fetchAdminResource<
    ProductVariant & {
      adminId?: string;
      external_id?: string;
      externalId?: string;
      pk?: number | string;
    }
  >({
    accessToken,
    method: "POST",
    path: `/api/v1/admin/products/${encodeURIComponent(resolveAdminProductRouteId(productId))}/variants`,
    body: input,
  });
  return normalizeAdminVariant(variant);
}

export async function updateAdminVariant(id: string, input: Partial<AdminVariantInput>): Promise<ProductVariant> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage variants.", 401);
  const variant = await fetchAdminResource<
    ProductVariant & {
      adminId?: string;
      external_id?: string;
      externalId?: string;
      pk?: number | string;
    }
  >({ accessToken, method: "PATCH", path: `/api/v1/admin/variants/${encodeURIComponent(id)}`, body: input });
  return normalizeAdminVariant(variant);
}

export async function fetchAdminInventory(filters: Record<string, string | undefined> = {}): Promise<AdminInventoryRow[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view inventory.", 401);
  return fetchAdminResource<AdminInventoryRow[]>({ accessToken, path: `/api/v1/admin/inventory${buildQueryString(filters)}` });
}

export async function updateAdminVariantStock(id: string, stock: number): Promise<AdminInventoryRow> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to update stock.", 401);
  return fetchAdminResource<AdminInventoryRow>({ accessToken, method: "PATCH", path: `/api/v1/admin/variants/${encodeURIComponent(id)}/stock`, body: { stock } });
}

export async function fetchAdminDeliveryZones(): Promise<AdminDeliveryZone[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view delivery zones.", 401);
  return fetchAdminResource<AdminDeliveryZone[]>({ accessToken, path: "/api/v1/admin/delivery-zones" });
}

export async function fetchAdminDeliverySettings(): Promise<AdminDeliverySettings> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view delivery settings.", 401);
  return fetchAdminResource<AdminDeliverySettings>({ accessToken, path: "/api/v1/admin/delivery-settings" });
}

export async function updateAdminDeliverySettings(
  input: Partial<AdminDeliverySettingsInput>,
): Promise<AdminDeliverySettings> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage delivery settings.", 401);
  return fetchAdminResource<AdminDeliverySettings>({
    accessToken,
    method: "PATCH",
    path: "/api/v1/admin/delivery-settings",
    body: input,
  });
}

export async function createAdminDeliveryZone(input: AdminDeliveryZoneInput): Promise<AdminDeliveryZone> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage delivery zones.", 401);
  return fetchAdminResource<AdminDeliveryZone>({ accessToken, method: "POST", path: "/api/v1/admin/delivery-zones", body: input });
}

export async function updateAdminDeliveryZone(id: string, input: Partial<AdminDeliveryZoneInput>): Promise<AdminDeliveryZone> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage delivery zones.", 401);
  return fetchAdminResource<AdminDeliveryZone>({ accessToken, method: "PATCH", path: `/api/v1/admin/delivery-zones/${encodeURIComponent(id)}`, body: input });
}

export async function fetchAdminPickupLocations(): Promise<AdminPickupLocation[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to view pickup locations.", 401);
  return fetchAdminResource<AdminPickupLocation[]>({ accessToken, path: "/api/v1/admin/pickup-locations" });
}

export async function createAdminPickupLocation(input: AdminPickupLocationInput): Promise<AdminPickupLocation> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage pickup locations.", 401);
  return fetchAdminResource<AdminPickupLocation>({ accessToken, method: "POST", path: "/api/v1/admin/pickup-locations", body: input });
}

export async function updateAdminPickupLocation(id: string, input: Partial<AdminPickupLocationInput>): Promise<AdminPickupLocation> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new AdminApiError("Please sign in to manage pickup locations.", 401);
  return fetchAdminResource<AdminPickupLocation>({ accessToken, method: "PATCH", path: `/api/v1/admin/pickup-locations/${encodeURIComponent(id)}`, body: input });
}

export async function uploadAdminProductImages({
  files,
  productSlug,
}: {
  files: File[];
  productSlug?: string;
}): Promise<AdminUploadedProductImage[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  if (productSlug?.trim()) {
    formData.append("productSlug", productSlug.trim());
  }

  const response = await fetch("/api/admin/product-images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await parseAdminError(response);
  }

  const payload = (await response.json()) as { images: AdminUploadedProductImage[] };

  return payload.images;
}

export async function deleteAdminProductImages(paths: string[]): Promise<void> {
  const response = await fetch("/api/admin/product-images", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paths }),
  });

  if (!response.ok) {
    throw await parseAdminError(response);
  }
}
