import { categories } from "./categories";
import {
  accessoryProducts,
  casualProducts,
  officeProducts,
  partyProducts,
  traditionalProducts,
} from "./products";
import { mockCartItems, mockOrders, mockUsers } from "./users-orders";
import type { CategorySlug, Product } from "@/lib/types";

const allProducts = [
  ...officeProducts,
  ...casualProducts,
  ...partyProducts,
  ...traditionalProducts,
  ...accessoryProducts,
];

const featuredProducts = allProducts
  .filter((product) => product.isFeatured)
  .slice(0, 8);

const newArrivals = allProducts.filter((product) => product.isNewArrival);

function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

function getProductsByCategory(categorySlug: CategorySlug): Product[] {
  return allProducts.filter((product) => product.categorySlug === categorySlug);
}

export {
  accessoryProducts,
  allProducts,
  categories,
  casualProducts,
  featuredProducts,
  getProductBySlug,
  getProductsByCategory,
  mockCartItems,
  mockOrders,
  mockUsers,
  newArrivals,
  officeProducts,
  partyProducts,
  traditionalProducts,
};
