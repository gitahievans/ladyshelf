// ─────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────

export type CategorySlug =
  | "office-formal"
  | "casual"
  | "party-evening"
  | "traditional-african"
  | "accessories";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

// ─────────────────────────────────────────────
// PRODUCT VARIANT
// ─────────────────────────────────────────────

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "One Size";

export type ColorName = string;

export interface ProductVariant {
  id: string;
  adminId?: string;
  size: Size;
  color: ColorName;
  colorHex: string;
  imageUrl?: string;
  stock: number;
  sku: string;
}

// ─────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────

export type BadgeType = "new" | "sale" | "bestseller" | "limited";

export interface Product {
  id: string;
  adminId?: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: CategorySlug;
  description: string;
  images: string[];
  variants: ProductVariant[];
  price: number;
  originalPrice?: number;
  currency: "KES";
  badge?: BadgeType;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished?: boolean;
  material?: string;
  careInstructions?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  cancelledQuantity?: number;
  cancellableQuantity?: number;
  isFullyCancelled?: boolean;
  productName: string;
  productImage: string;
  price: number;
  currency: "KES";
  size: Size;
  color: ColorName;
  colorHex: string;
  imageUrl?: string;
}

// ─────────────────────────────────────────────
// USER & ADDRESS
// ─────────────────────────────────────────────

export interface Address {
  id: string;
  label: "home" | "work" | "other";
  fullName: string;
  phone: string;
  county: string;
  town: string;
  streetAddress: string;
  additionalInfo?: string;
  isDefault: boolean;
}

export interface AddressInput {
  label: Address["label"];
  fullName: string;
  phone: string;
  county: string;
  town: string;
  streetAddress: string;
  additionalInfo?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  addresses: Address[];
  createdAt: string;
}

export interface UpdateCurrentUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export type AdminRole = "owner" | "attendant";

export interface AdminPermissionAccess {
  view: boolean;
  manage: boolean;
}

export interface AdminPermissionSet {
  dashboard: boolean;
  orders: AdminPermissionAccess;
  payments: AdminPermissionAccess;
  customers: AdminPermissionAccess;
  catalog: AdminPermissionAccess;
  inventory: AdminPermissionAccess;
  settings: AdminPermissionAccess;
  staff: AdminPermissionAccess;
}

export interface AdminStaffUser {
  id: string;
  supabaseUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
}

export interface AdminStaffRecord extends AdminStaffUser {
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaffInput {
  supabaseUserId?: string;
  email?: string;
  role: AdminRole;
  isActive: boolean;
}

export interface AdminDashboardOrder {
  orderNumber: string;
  customerLabel: string;
  total: number;
  currency: "KES";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMode: CheckoutDeliveryMode;
  createdAt: string;
}

export interface AdminDashboardPayment {
  id: string;
  orderNumber: string;
  status: PaymentTransactionStatus;
  amount: number;
  currency: "KES";
  provider: "sasapay";
  createdAt: string;
}

export interface AdminLowStockVariant {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export interface AdminDashboardSummary {
  awaitingPaymentOrders: number;
  fulfillmentActionOrders: number;
  lowStockVariants: number;
  recentPaidOrders: AdminDashboardOrder[];
  paymentIssueCount: number;
  paymentIssues: AdminDashboardPayment[];
  lowStockItems: AdminLowStockVariant[];
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerLabel: string;
  total: number;
  currency: "KES";
  deliveryMode: CheckoutDeliveryMode;
  paymentMethod: PaymentMethod;
  paymentTiming: CheckoutPaymentTiming;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  manualDeliveryFeeConfirmationRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetail extends Order {
  internalNotes: string;
  paymentTransactions: PaymentTransaction[];
  receipt?: Receipt | null;
}

export interface AdminOrderUpdateInput {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  internalNotes?: string;
}

export interface AdminManualPaymentInput {
  amountCollected?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  staffNote?: string;
}

export interface AdminPaymentListItem {
  id: string;
  orderNumber: string;
  provider: "sasapay";
  status: PaymentTransactionStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: "KES";
  merchantReference: string;
  transactionCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentDetail extends PaymentTransaction {
  id: string;
  orderNumber: string;
}

export interface AdminCustomerListItem {
  id: string;
  supabaseUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderCount: number;
  createdAt: string;
}

export interface AdminWishlistProduct {
  id: string;
  name: string;
  slug: string;
}

export interface AdminCustomerDetail extends User {
  supabaseUserId: string;
  emailConfirmedAt: string | null;
  updatedAt: string;
  recentOrders: AdminOrderListItem[];
  wishlist: AdminWishlistProduct[];
}

export interface AdminCatalogProductInput {
  external_id?: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: CategorySlug;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number | null;
  currency: "KES";
  badge?: BadgeType | "";
  tags: string[];
  rating: number;
  review_count: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished?: boolean;
  material?: string;
  careInstructions?: string;
  created_at: string;
}

export interface AdminCategoryInput {
  external_id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface AdminVariantInput {
  external_id?: string;
  size: string;
  color: string;
  colorHex: string;
  imageUrl?: string;
  stock: number;
  sku?: string;
}

export interface AdminUploadedProductImage {
  name: string;
  path: string;
  url: string;
}

export type ImageGenerationBatchStatus =
  | "queued"
  | "processing"
  | "ready_for_review"
  | "partially_failed"
  | "completed"
  | "cancelled";

export type ProductImageGenerationStatus =
  | "queued"
  | "generating"
  | "ready_for_review"
  | "needs_regeneration"
  | "approved"
  | "published"
  | "failed"
  | "cancelled";

export type ProductImagePublicationMode = "append" | "replace";

export type ProductImageCandidateStatus =
  | "queued"
  | "generating"
  | "ready"
  | "approved"
  | "rejected"
  | "failed";

export type ProductImageShotType = "hero" | "alternate" | "detail";

export type ProductImageBodyProfile = "automatic" | "slim" | "curvy" | "athletic";
export type ProductImageSkinTone =
  | "automatic"
  | "light_brown"
  | "medium_brown"
  | "deep_brown";
export type ProductImageComposition =
  | "automatic"
  | "standing"
  | "seated"
  | "walking"
  | "three_quarter";
export type ProductImageDetailFocus =
  | "automatic"
  | "fabric"
  | "pattern"
  | "stitching"
  | "closure"
  | "construction";

export interface ProductImageModelRegenerationSettings {
  color: string | null;
  bodyProfile: ProductImageBodyProfile;
  skinTone: ProductImageSkinTone;
  composition: ProductImageComposition;
  instruction: string;
}

export interface ProductImageDetailRegenerationSettings {
  color: string | null;
  detailFocus: ProductImageDetailFocus;
  instruction: string;
}

export interface ProductImageSetRegenerationRequest {
  scope: "set";
  shots: {
    hero: ProductImageModelRegenerationSettings;
    alternate: ProductImageModelRegenerationSettings;
    detail: ProductImageDetailRegenerationSettings;
  };
}

export interface ProductImageAlternateRegenerationRequest {
  scope: "shot";
  shots: { alternate: ProductImageModelRegenerationSettings };
}

export interface ProductImageDetailRegenerationRequest {
  scope: "shot";
  shots: { detail: ProductImageDetailRegenerationSettings };
}

export type ProductImageRegenerationRequest =
  | ProductImageSetRegenerationRequest
  | ProductImageAlternateRegenerationRequest
  | ProductImageDetailRegenerationRequest;

export interface ProductImageCandidateOverrides {
  requested?: Partial<
    ProductImageModelRegenerationSettings & ProductImageDetailRegenerationSettings
  >;
  resolved?: {
    color?: string | null;
    bodyProfile?: Exclude<ProductImageBodyProfile, "automatic">;
    skinTone?: Exclude<ProductImageSkinTone, "automatic"> | "dark_brown";
    composition?: ProductImageComposition;
    detailFocus?: ProductImageDetailFocus;
    identity?: string;
    hair?: string;
    stature?: string;
    pose?: string;
  };
}

export interface ProductImageCandidate {
  id: string;
  shotType: ProductImageShotType;
  status: ProductImageCandidateStatus;
  prompt: string;
  promptPolicyVersion: string;
  regenerationRevision: number;
  manualOverrides: ProductImageCandidateOverrides;
  publicUrl: string;
  mimeType: string;
  width: number;
  height: number;
  attemptCount: number;
  errorCode: string;
  errorMessage: string;
  reviewedAt: string | null;
}

export interface ProductImageGeneration {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  status: ProductImageGenerationStatus;
  model: string;
  attemptCount: number;
  nextAttemptAt: string | null;
  errorCode: string;
  errorMessage: string;
  previousImages: string[];
  publicationMode: ProductImagePublicationMode | null;
  currentGalleryCount: number;
  catalogColors: string[];
  canPublish: boolean;
  canRestore: boolean;
  candidates: ProductImageCandidate[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ImageGenerationBatch {
  id: string;
  status: ImageGenerationBatchStatus;
  provider: "cloudflare";
  model: string;
  productCount: number;
  generations: ProductImageGeneration[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface AdminInventoryRow {
  id: string;
  externalId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  colorHex: string;
  imageUrl: string;
  stock: number;
  sku: string;
}

export interface AdminDeliverySettings {
  id: string;
  name: string;
  shopName: string;
  shopCounty: string;
  shopTown: string;
  shopStreetAddress: string;
  shopLatitude: number;
  shopLongitude: number;
  riderMaxRadiusKm: number;
  parcelSwitchRadiusKm: number;
  riderBaseFee: number;
  riderIncrementPer10Km: number;
  riderEstimatedWindow: string;
  parcelEstimatedWindow: string;
  allowPayOnDelivery: boolean;
  parcelManualFeeConfirmationRequired: boolean;
  isActive: boolean;
}

export type AdminDeliverySettingsInput = Omit<AdminDeliverySettings, "id">;

export interface AdminDeliveryZone {
  id: string;
  name: string;
  deliveryMode: "rider" | "parcel";
  counties: string[];
  towns: string[];
  deliveryFee: number;
  manualFeeConfirmationRequired: boolean;
  allowPayOnDelivery: boolean;
  estimatedWindow: string;
  priority: number;
  isActive: boolean;
}

export type AdminDeliveryZoneInput = Omit<AdminDeliveryZone, "id">;

export interface AdminPickupLocation {
  id: string;
  name: string;
  county: string;
  town: string;
  streetAddress: string;
  contactName: string;
  contactPhone: string;
  mapsUrl: string;
  openingHours: string;
  collectionWindowHours: number;
  notes: string;
  isActive: boolean;
}

export type AdminPickupLocationInput = Omit<AdminPickupLocation, "id">;

// ─────────────────────────────────────────────
// ORDER & CHECKOUT
// ─────────────────────────────────────────────

export type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "awaiting_delivery_fee_confirmation"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type PaymentMethod = "mpesa" | "card";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "manual_on_delivery"
  | "refunded";

export type PaymentTransactionStatus =
  | "initiated"
  | "pending"
  | "paid"
  | "failed";

export type CheckoutPaymentMethod = "mpesa" | "card";

export type CheckoutPaymentTiming = "prepay" | "pay_on_delivery";

export type CheckoutDeliveryMode = "rider" | "parcel" | "pickup";

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  county: string;
  town: string;
  locationLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
  streetAddress: string;
  additionalInfo?: string;
  deliveryMethod: "pickup" | "delivery";
}

export interface MapboxLocationSuggestion {
  id: string;
  label: string;
  county: string;
  town: string;
  latitude: number;
  longitude: number;
}

export interface CheckoutPaymentSelection {
  method: CheckoutPaymentMethod;
  timing: CheckoutPaymentTiming;
}

export interface CheckoutPaymentOption extends CheckoutPaymentSelection {
  key: string;
  label: string;
  description: string;
}

export interface CheckoutQuoteItem extends CartItem {
  availableStock: number;
  lineTotal: number;
}

export interface PickupInfo {
  name: string;
  county: string;
  town: string;
  streetAddress: string;
  contactName: string;
  contactPhone: string;
  mapsUrl: string;
  openingHours: string;
  collectionWindowHours: number;
  notes: string;
}

export interface CheckoutQuote {
  currency: "KES";
  items: CheckoutQuoteItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfillmentMethod: DeliveryDetails["deliveryMethod"];
  deliveryMode: CheckoutDeliveryMode;
  estimatedWindow: string;
  distanceKm?: number | null;
  deliveryRuleLabel?: string;
  manualDeliveryFeeConfirmationRequired: boolean;
  availablePaymentOptions: CheckoutPaymentOption[];
  paymentSelection?: CheckoutPaymentSelection | null;
  messages: string[];
  pickupInstructions?: PickupInfo | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  items: CartItem[];
  deliveryDetails: DeliveryDetails;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: "KES";
  paymentMethod: PaymentMethod;
  paymentTiming: CheckoutPaymentTiming;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMode: CheckoutDeliveryMode;
  manualDeliveryFeeConfirmationRequired: boolean;
  pickupInstructions?: PickupInfo | null;
  paymentExpiresAt?: string | null;
  canCancel?: boolean;
  cancellationUnavailableReason?: string;
  cancellations?: OrderCancellation[];
  createdAt: string;
  updatedAt: string;
}

export type OrderCancellationReason =
  | "ordered_by_mistake"
  | "changed_mind"
  | "wrong_size_or_color"
  | "delivery_timing"
  | "found_another_option"
  | "other";

export interface OrderCancellationItem {
  orderItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderCancellation {
  id: string;
  source: "customer" | "staff";
  reason: OrderCancellationReason;
  reasonLabel: string;
  note: string;
  items: OrderCancellationItem[];
  createdAt: string;
}

export interface OrderCancellationInput {
  orderNumber: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;
  reason: OrderCancellationReason;
  note?: string;
}

export interface PaymentTransaction {
  provider: "sasapay";
  status: PaymentTransactionStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: "KES";
  merchantReference: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  transactionCode: string;
  checkoutUrl: string;
  providerResponse: Record<string, unknown>;
  callbackPayload: Record<string, unknown>;
  lastStatusPayload: Record<string, unknown>;
  verificationPayload: Record<string, unknown>;
  paidAt?: string | null;
  failedAt?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: number;
  receiptNumber: string;
  status: "issued" | "sent" | "failed";
  paymentTransactionId?: string | null;
  issuedAt: string;
  sentAt?: string | null;
  sentToEmail: string;
  totalPaid: number;
  currency: "KES";
  paymentMethod: PaymentMethod;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSessionResponse {
  order: Order;
  transaction: PaymentTransaction;
}

// ─────────────────────────────────────────────
// ZUSTAND STORE SHAPES
// ─────────────────────────────────────────────

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  replaceItems: (items: CartItem[]) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    data: RegisterPayload,
  ) => Promise<{ emailConfirmationRequired: boolean }>;
  updateProfile: (data: UpdateCurrentUserPayload) => Promise<User>;
  updatePhone: (phone: string) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export interface FilterState {
  sizes: Size[];
  colors: ColorName[];
  priceRange: [number, number];
  badges: BadgeType[];
  inStockOnly: boolean;
}

export interface SearchFiltersState extends FilterState {
  category: CategorySlug | "all";
}

export interface SearchResultGroup {
  title: string;
  items: string[];
}

export interface UIStore {
  selectedCategory: CategorySlug | "all";
  sortBy: "newest" | "price-asc" | "price-desc" | "rating" | "bestseller";
  viewMode: "grid" | "list";
  filters: FilterState;
  setCategory: (category: CategorySlug | "all") => void;
  setSortBy: (sort: UIStore["sortBy"]) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

export interface WishlistStore {
  productIds: string[];
  count: number;
  isLoaded: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  syncWishlist: (options?: { mergeLocal?: boolean }) => Promise<void>;
  setProductIds: (productIds: string[]) => void;
}
