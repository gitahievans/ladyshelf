import type { CategorySlug, Product } from "@/lib/types";

import { categories } from "./categories";
import {
  assignCartItemImages,
  assignOrderImages,
  assignProductImages,
  assignUserAvatars,
} from "./media";
import {
  accessoryProducts as baseAccessoryProducts,
  casualProducts as baseCasualProducts,
  officeProducts as baseOfficeProducts,
  partyProducts as basePartyProducts,
  traditionalProducts as baseTraditionalProducts,
} from "./products";
import {
  mockCartItems as baseMockCartItems,
  mockOrders as baseMockOrders,
  mockUsers as baseMockUsers,
} from "./users-orders";

const officeProducts = assignProductImages(baseOfficeProducts, 0);
const casualProducts = assignProductImages(baseCasualProducts, officeProducts.length);
const partyProducts = assignProductImages(
  basePartyProducts,
  officeProducts.length + casualProducts.length,
);
const traditionalProducts = assignProductImages(
  baseTraditionalProducts,
  officeProducts.length + casualProducts.length + partyProducts.length,
);
const accessoryProducts = assignProductImages(
  baseAccessoryProducts,
  officeProducts.length +
    casualProducts.length +
    partyProducts.length +
    traditionalProducts.length,
);

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

const productsById = new Map(allProducts.map((product) => [product.id, product]));
const mockUsers = assignUserAvatars(baseMockUsers);
const mockCartItems = assignCartItemImages(baseMockCartItems, productsById);
const mockOrders = assignOrderImages(baseMockOrders, productsById);

function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

function getProductsByCategory(categorySlug: CategorySlug): Product[] {
  return allProducts.filter((product) => product.categorySlug === categorySlug);
}

function getAllColors(): { hex: string; name: string }[] {
  const seen = new Map<string, { hex: string; name: string }>();

  allProducts.forEach((product) => {
    product.variants.forEach((variant) => {
      if (!seen.has(variant.color)) {
        seen.set(variant.color, {
          hex: variant.colorHex,
          name: variant.color,
        });
      }
    });
  });

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export {
  accessoryProducts,
  allProducts,
  categories,
  casualProducts,
  featuredProducts,
  getAllColors,
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
