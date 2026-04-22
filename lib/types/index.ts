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
  size: Size;
  color: ColorName;
  colorHex: string;
  stock: number;
  sku: string;
}

// ─────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────

export type BadgeType = "new" | "sale" | "bestseller" | "limited";

export interface Product {
  id: string;
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
  productName: string;
  productImage: string;
  price: number;
  currency: "KES";
  size: Size;
  color: ColorName;
  colorHex: string;
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
  streetAddress: string;
  additionalInfo?: string;
  deliveryMethod: "pickup" | "delivery";
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
  createdAt: string;
  updatedAt: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    data: RegisterPayload,
  ) => Promise<{ emailConfirmationRequired: boolean }>;
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
