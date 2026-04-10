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
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "mpesa" | "card" | "cash-on-delivery";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterPayload) => Promise<void>;
}

export interface FilterState {
  sizes: Size[];
  colors: ColorName[];
  priceRange: [number, number];
  badges: BadgeType[];
  inStockOnly: boolean;
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
