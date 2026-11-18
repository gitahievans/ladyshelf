import type { MetadataRoute } from "next";

const SITE_URL = "https://ladyshelf.site";

// AI-training and bulk SEO crawlers bring no shoppers but crawl every page.
const blockedCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Timpibot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/auth/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/search",
        ],
      },
      { userAgent: blockedCrawlers, disallow: "/" },
    ],
    host: SITE_URL,
  };
}
