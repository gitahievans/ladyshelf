import { User, Order, CartItem } from '../types'

// ─────────────────────────────────────────────
// MOCK USERS
// ─────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'amina.wanjiru@gmail.com',
    firstName: 'Amina',
    lastName: 'Wanjiru',
    phone: '+254 712 345 678',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    addresses: [
      {
        id: 'addr-001',
        label: 'home',
        fullName: 'Amina Wanjiru',
        phone: '+254 712 345 678',
        county: 'Nairobi',
        town: 'Westlands',
        streetAddress: '14 Peponi Road, Spring Valley',
        additionalInfo: 'Green gate, second house on the left',
        isDefault: true,
      },
      {
        id: 'addr-002',
        label: 'work',
        fullName: 'Amina Wanjiru',
        phone: '+254 712 345 678',
        county: 'Nairobi',
        town: 'Upper Hill',
        streetAddress: 'Britam Tower, 12th Floor, Hospital Road',
        isDefault: false,
      },
    ],
    createdAt: '2025-09-15T08:00:00Z',
  },
  {
    id: 'user-002',
    email: 'zawadi.ochieng@outlook.com',
    firstName: 'Zawadi',
    lastName: 'Ochieng',
    phone: '+254 722 987 654',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80',
    addresses: [
      {
        id: 'addr-003',
        label: 'home',
        fullName: 'Zawadi Ochieng',
        phone: '+254 722 987 654',
        county: 'Kiambu',
        town: 'Kiambu Town',
        streetAddress: '7 Thika Road, Ruiru',
        isDefault: true,
      },
    ],
    createdAt: '2026-01-03T08:00:00Z',
  },
]

// ─────────────────────────────────────────────
// MOCK CART ITEMS (for a sample filled cart)
// ─────────────────────────────────────────────

export const mockCartItems: CartItem[] = [
  {
    id: 'cart-line-001',
    productId: 'prod-001',
    variantId: 'v-001-2',
    quantity: 1,
    productName: 'Obsidian Power Blazer',
    productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    price: 7800,
    currency: 'KES',
    size: 'M',
    color: 'Obsidian Black',
    colorHex: '#1A1009',
  },
  {
    id: 'cart-line-002',
    productId: 'prod-002',
    variantId: 'v-002-3',
    quantity: 1,
    productName: 'Mahogany Wrap Skirt',
    productImage: 'https://images.unsplash.com/photo-1583496661160-fb5218ees7e0?w=800&q=80',
    price: 4200,
    currency: 'KES',
    size: 'M',
    color: 'Deep Mahogany',
    colorHex: '#3D1F0D',
  },
  {
    id: 'cart-line-003',
    productId: 'prod-027',
    variantId: 'v-027-1',
    quantity: 2,
    productName: 'Silk Print Headwrap',
    productImage: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&q=80',
    price: 2200,
    currency: 'KES',
    size: 'One Size',
    color: 'Nairobi Gold',
    colorHex: '#D4A853',
  },
]

// ─────────────────────────────────────────────
// MOCK ORDER
// ─────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    orderNumber: 'WF-2026-00089',
    userId: 'user-001',
    items: mockCartItems,
    deliveryDetails: {
      fullName: 'Amina Wanjiru',
      email: 'amina.wanjiru@gmail.com',
      phone: '+254 712 345 678',
      county: 'Nairobi',
      town: 'Westlands',
      streetAddress: '14 Peponi Road, Spring Valley',
      additionalInfo: 'Green gate, second house on the left',
      deliveryMethod: 'delivery',
    },
    subtotal: 16400,
    deliveryFee: 300,
    discount: 0,
    total: 16700,
    currency: 'KES',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    createdAt: '2026-04-01T14:32:00Z',
    updatedAt: '2026-04-03T09:15:00Z',
  },
  {
    id: 'order-002',
    orderNumber: 'WF-2026-00102',
    guestEmail: 'guest.shopper@gmail.com',
    items: [
      {
        id: 'cart-line-004',
        productId: 'prod-014',
        variantId: 'v-014-3',
        quantity: 1,
        productName: 'Midnight Gown',
        productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
        price: 9800,
        currency: 'KES',
        size: 'M',
        color: 'Obsidian Black',
        colorHex: '#1A1009',
      },
    ],
    deliveryDetails: {
      fullName: 'Brenda Otieno',
      email: 'guest.shopper@gmail.com',
      phone: '+254 733 111 222',
      county: 'Mombasa',
      town: 'Nyali',
      streetAddress: 'Links Road, Nyali Centre',
      deliveryMethod: 'delivery',
    },
    subtotal: 9800,
    deliveryFee: 500,
    discount: 0,
    total: 10300,
    currency: 'KES',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    createdAt: '2026-04-08T10:20:00Z',
    updatedAt: '2026-04-08T10:25:00Z',
  },
]
