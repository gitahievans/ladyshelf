import type { CartItem, Order, Product, User } from "@/lib/types";

const SUPABASE_STORAGE_BASE_URL =
  "https://icdvsrhauwfomggyswbt.supabase.co/storage/v1/object/public/wahi";

const productImageFileNames = [
  "1.jpg",
  "12.jpg",
  "14.jpg",
  "15.png",
  "16.jpg",
  "17.jpg",
  "18.jpg",
  "19.jpg",
  "2.jpg",
  "20.jpg",
  "23.jpg",
  "25.jpg",
  "27.jpg",
  "28.png",
  "29.jpg",
  "3.jpg",
  "30.jpg",
  "31.jpg",
  "32.jpg",
  "34.jpg",
  "35.jpg",
  "36.jpg",
  "4.png",
  "40.jpg",
  "42.jpg",
] as const;

function buildStorageUrl(fileName: string): string {
  return `${SUPABASE_STORAGE_BASE_URL}/${encodeURIComponent(fileName)}`;
}

export const brandMedia = {
  hero: buildStorageUrl("hero.jpg"),
  heroSlides: [
    buildStorageUrl("hero.jpg"),
    buildStorageUrl("20.jpg"),
    buildStorageUrl("hero3.jpg"),
    buildStorageUrl("hero4.jpg"),
    buildStorageUrl("12.jpg"),
  ],
  logo: "https://nehcexpdaoypguejwnvg.supabase.co/storage/v1/object/public/product-images/Logo.png",
  logoTransparent: buildStorageUrl("logo transparent.png"),
} as const;

export const productImageUrls = productImageFileNames.map(buildStorageUrl);

export const categoryImageUrls = [
  productImageUrls[0] ?? brandMedia.hero,
  productImageUrls[1] ?? brandMedia.hero,
  productImageUrls[2] ?? brandMedia.hero,
  productImageUrls[3] ?? brandMedia.hero,
  productImageUrls[10] ?? brandMedia.hero,
] as const;

export const landingImageUrls = {
  brandStory: productImageUrls[5] ?? brandMedia.hero,
  lookbook: [
    productImageUrls[6] ?? brandMedia.hero,
    productImageUrls[9] ?? brandMedia.hero,
    productImageUrls[10] ?? brandMedia.hero,
    productImageUrls[9] ?? brandMedia.hero,
    productImageUrls[10] ?? brandMedia.hero,
    productImageUrls[11] ?? brandMedia.hero,
  ],
} as const;

export function getRotatedProductImages(productIndex: number): string[] {
  return Array.from({ length: 3 }, (_, offset) => {
    const imageIndex = (productIndex * 3 + offset) % productImageUrls.length;

    return productImageUrls[imageIndex] ?? brandMedia.hero;
  });
}

export function assignProductImages(
  products: Product[],
  startIndex = 0,
): Product[] {
  return products.map((product, index) => ({
    ...product,
    images: getRotatedProductImages(startIndex + index),
  }));
}

export function assignUserAvatars(users: User[]): User[] {
  return users.map((user, index) => ({
    ...user,
    avatarUrl: productImageUrls[index % productImageUrls.length] ?? brandMedia.hero,
  }));
}

export function assignCartItemImages(
  cartItems: CartItem[],
  productsById: Map<string, Product>,
): CartItem[] {
  return cartItems.map((item, index) => ({
    ...item,
    productImage:
      productsById.get(item.productId)?.images[0] ??
      productImageUrls[index % productImageUrls.length] ??
      brandMedia.hero,
  }));
}

export function assignOrderImages(
  orders: Order[],
  productsById: Map<string, Product>,
): Order[] {
  return orders.map((order) => ({
    ...order,
    items: assignCartItemImages(order.items, productsById),
  }));
}
