import type { Category } from "../types";

import { categoryImageUrls } from "./media";

export const categories: Category[] = [
  {
    id: "cat-001",
    slug: "office-formal",
    name: "Office & Formal",
    description:
      "Sharp tailoring meets modern elegance. Polished blouses, sleek skirts, structured trousers, and impeccably cut blazers that honour corporate dress codes while embracing a distinctly fashion-forward edge.",
    image: categoryImageUrls[0] ?? "",
    productCount: 7,
  },
  {
    id: "cat-002",
    slug: "casual",
    name: "Casual Wear",
    description:
      "Elevate your everyday style with premium tops, designer-inspired jeans, and versatile day dresses that combine all-day comfort with modern, contemporary aesthetics.",
    image: categoryImageUrls[1] ?? categoryImageUrls[0] ?? "",
    productCount: 6,
  },
  {
    id: "cat-003",
    slug: "party-evening",
    name: "Party & Evening",
    description:
      "Make an entrance in sophisticated cocktail dresses and statement jumpsuits perfect for celebrations, social events, and evening occasions.",
    image: categoryImageUrls[2] ?? categoryImageUrls[0] ?? "",
    productCount: 6,
  },
  {
    id: "cat-004",
    slug: "traditional-african",
    name: "Traditional African",
    description:
      "Celebrate the beauty of African heritage with vibrant kitenge and ankara dresses, contemporary kaftans, and thoughtfully designed fusion pieces.",
    image: categoryImageUrls[3] ?? categoryImageUrls[0] ?? "",
    productCount: 5,
  },
  {
    id: "cat-005",
    slug: "accessories",
    name: "Accessories",
    description:
      "Elevate every ensemble with our carefully curated selection of designer-inspired bags, luxurious silk scarves, and timeless jewelry pieces.",
    image: categoryImageUrls[4] ?? categoryImageUrls[0] ?? "",
    productCount: 4,
  },
];
