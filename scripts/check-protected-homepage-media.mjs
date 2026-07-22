import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const protectedFiles = new Map([
  [
    "components/landing/HeroCarousel.tsx",
    "af231ce0e1a36f15b4b83cac1455cf7d6e0f393ef74b1657c9e759a11fdfc235",
  ],
  [
    "components/landing/BrandStory.tsx",
    "2d33b987ad72715ce614c28b12039ee51e9ec66a79c452c8bfa09960f8d052a7",
  ],
  [
    "lib/mock/media.ts",
    "a61de83b3b4c063db727d7094a90469cec53bd8d3ea224e47c3737dfba84095f",
  ],
]);

const changedFiles = [];

for (const [filePath, expectedHash] of protectedFiles) {
  const contents = await readFile(new URL(`../${filePath}`, import.meta.url));
  const actualHash = createHash("sha256").update(contents).digest("hex");

  if (actualHash !== expectedHash) {
    changedFiles.push(filePath);
  }
}

if (changedFiles.length > 0) {
  throw new Error(
    `Protected homepage media source changed: ${changedFiles.join(", ")}`,
  );
}

console.log("Protected Hero and Our Story media sources are unchanged.");
