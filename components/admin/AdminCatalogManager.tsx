"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Search } from "lucide-react";

import AdminProductImageManager from "@/components/admin/AdminProductImageManager";
import AdminImageGenerationPanel from "@/components/admin/AdminImageGenerationPanel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  createAdminCategory,
  createAdminProduct,
  createAdminVariant,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  updateAdminVariant,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import type {
  AdminCatalogProductInput,
  AdminVariantInput,
  Category,
  CategorySlug,
  Product,
} from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";

const defaultProductInput: AdminCatalogProductInput = {
  slug: "",
  name: "",
  brand: "Lady Shelf",
  categorySlug: "casual",
  description: "",
  images: [],
  price: 0,
  originalPrice: null,
  currency: "KES",
  badge: "",
  tags: [],
  rating: 0,
  review_count: 0,
  isFeatured: false,
  isNewArrival: false,
  isPublished: false,
  material: "",
  careInstructions: "",
  created_at: new Date().toISOString(),
};

const defaultVariantInput: AdminVariantInput = {
  size: "M",
  color: "",
  colorHex: "#000000",
  imageUrl: "",
  stock: 0,
};

interface AdminCatalogManagerProps {
  canManage: boolean;
}

interface ProductRowProps {
  hasActiveGeneration: boolean;
  isSelected: boolean;
  canManage: boolean;
  categories: Category[];
  isAlternate: boolean;
  onSave: (
    productId: string,
    input: Partial<AdminCatalogProductInput>,
  ) => Promise<Product>;
  onSelectionChange: (productId: string, selected: boolean) => void;
  product: Product;
}

interface VariantStockProps {
  canManage: boolean;
  color: string;
  imageUrl?: string;
  onSave: (
    variantId: string,
    input: Pick<AdminVariantInput, "imageUrl" | "stock">,
  ) => Promise<void>;
  productImages: string[];
  size: string;
  sku: string;
  stock: number;
  variantId: string;
}

function validateProductInput(productInput: AdminCatalogProductInput): string | null {
  if (!productInput.name.trim()) {
    return "Add a product name before creating the product.";
  }

  if (!productInput.description.trim()) {
    return "Add a product description before creating the product.";
  }

  if (productInput.price <= 0) {
    return "Enter a price greater than zero.";
  }

  return null;
}

function validateProductDraft(product: Product): string | null {
  if (!product.name.trim()) {
    return "Product name cannot be blank.";
  }

  if (!product.slug.trim()) {
    return "Product slug is missing. Update the product name and try again.";
  }

  if (!product.description.trim()) {
    return "Product description cannot be blank.";
  }

  if (product.price <= 0) {
    return "Product price must be greater than zero.";
  }

  if (product.isPublished && product.images.length === 0) {
    return "Keep at least one product image on the product before saving.";
  }

  return null;
}

function validateVariantInput(variantInput: AdminVariantInput): string | null {
  if (!variantInput.color.trim()) {
    return "Add a color before creating the variant.";
  }

  if (!variantInput.size.trim()) {
    return "Add a size before creating the variant.";
  }

  if (variantInput.stock < 0) {
    return "Stock quantity cannot be negative.";
  }

  return null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProductUpdateInput(product: Product): AdminCatalogProductInput {
  return {
    name: product.name,
    external_id: product.id,
    slug: product.slug,
    brand: product.brand,
    categorySlug: product.categorySlug,
    description: product.description,
    images: product.images,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    currency: product.currency,
    badge: product.badge ?? "",
    tags: product.tags,
    rating: product.rating,
    review_count: product.reviewCount,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isPublished: product.isPublished ?? false,
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    created_at: product.createdAt,
  };
}

function FieldLabel({ children }: { children: string }): ReactElement {
  return (
    <label className="mb-2 block font-dm-sans text-caption uppercase tracking-[0.24em] text-text-muted">
      {children}
    </label>
  );
}

function HiddenFieldLabel({ children }: { children: string }): ReactElement {
  return (
    <label className="mb-2 block font-dm-sans text-caption uppercase tracking-[0.24em] text-transparent">
      {children}
    </label>
  );
}

export default function AdminCatalogManager({
  canManage,
}: AdminCatalogManagerProps): ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [productInput, setProductInput] = useState<AdminCatalogProductInput>(defaultProductInput);
  const [categoryName, setCategoryName] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeProductIds, setActiveProductIds] = useState<string[]>([]);

  async function loadCatalog(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const [nextCategories, nextProducts] = await Promise.all([
        fetchAdminCategories(),
        fetchAdminProducts({ q: query }),
      ]);

      setCategories(nextCategories);
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load catalog.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadCatalog();
  }, []);

  async function saveProduct(
    productId: string,
    input: Partial<AdminCatalogProductInput>,
  ): Promise<Product> {
    const updated = await updateAdminProduct(productId, input);

    setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    return updated;
  }

  async function addProduct(): Promise<void> {
    setProductError(null);
    setProductMessage(null);

    const validationError = validateProductInput(productInput);
    if (validationError) {
      setProductError(validationError);
      return;
    }

    try {
      const name = productInput.name.trim();
      const created = await createAdminProduct({
        ...productInput,
        slug: slugify(name),
      });

      setProducts((current) => [created, ...current]);
      setProductInput({
        ...defaultProductInput,
        created_at: new Date().toISOString(),
      });
      setProductMessage("Unpublished product draft created. Add images, then publish when ready.");
    } catch (createError) {
      setProductError(createError instanceof Error ? createError.message : "Unable to create product.");
    }
  }

  async function addCategory(): Promise<void> {
    const slug = slugify(categoryName);
    if (!slug) {
      setCategoryError("Add a category name before creating the category.");
      return;
    }

    setCategoryError(null);
    setCategoryMessage(null);

    try {
      const created = await createAdminCategory({
        external_id: `cat-${slug}`,
        slug,
        name: categoryName,
        description: "",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
      });

      setCategories((current) => [...current, created]);
      setCategoryName("");
      setCategoryMessage("Category created.");
    } catch (createError) {
      setCategoryError(createError instanceof Error ? createError.message : "Unable to create category.");
    }
  }

  function handleSelectionChange(productId: string, selected: boolean): void {
    setProductError(null);
    setSelectedProductIds((current) => {
      if (!selected) return current.filter((id) => id !== productId);
      if (current.includes(productId)) return current;
      if (current.length >= 5) {
        setProductError("A generation batch can contain no more than five products.");
        return current;
      }
      return [...current, productId];
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">Catalog management</h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          {canManage
            ? "Manage products, categories, variants, feature flags, and storefront catalog fields."
            : "View products and variants here. Use Inventory for stock updates."}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">
          {error}
        </div>
      ) : null}

      <AdminImageGenerationPanel
        canManage={canManage}
        onActiveProductIdsChange={setActiveProductIds}
        onGalleryChanged={loadCatalog}
        onSelectionCleared={() => setSelectedProductIds([])}
        selectedProductIds={selectedProductIds}
      />

      {canManage ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Create category</h3>
            <div className="mt-4 flex gap-3">
              <div className="flex-1">
                <FieldLabel>Category name</FieldLabel>
                <Input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Accessories"
                  className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm"
                />
              </div>
              <div className="flex w-full max-w-40 items-end">
                <Button
                  type="button"
                  onClick={() => void addCategory()}
                  className="h-11 w-full rounded-sm bg-gold px-4 text-obsidian hover:bg-sand"
                >
                  Add
                </Button>
              </div>
            </div>
            {categoryError ? (
              <div className="mt-3 rounded-sm border border-error bg-ivory p-3 font-dm-sans text-caption text-error">
                {categoryError}
              </div>
            ) : null}
            {categoryMessage ? (
              <div className="mt-3 rounded-sm border border-success bg-ivory p-3 font-dm-sans text-caption text-success">
                {categoryMessage}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card xl:col-span-2">
            <h3 className="font-cormorant text-h4 text-obsidian">Create product</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Product name</FieldLabel>
                <Input
                  value={productInput.name}
                  onChange={(event) =>
                    setProductInput({
                      ...productInput,
                      name: event.target.value,
                      slug: slugify(event.target.value),
                    })
                  }
                  placeholder="Gold Statement Necklace"
                  className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                />
              </div>

              <div>
                <FieldLabel>Category</FieldLabel>
                <select
                  value={productInput.categorySlug}
                  onChange={(event) =>
                    setProductInput({
                      ...productInput,
                      categorySlug: event.target.value as CategorySlug,
                    })
                  }
                  className="h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Price (KES)</FieldLabel>
                <Input
                  value={productInput.price}
                  onChange={(event) =>
                    setProductInput({
                      ...productInput,
                      price: Number(event.target.value) || 0,
                    })
                  }
                  type="number"
                  placeholder="3200"
                  className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={productInput.description}
                  onChange={(event) =>
                    setProductInput({
                      ...productInput,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the product, fabric, fit, and styling notes for the attendant and storefront."
                  rows={4}
                  className="w-full rounded-sm border border-border-warm bg-cream px-3 py-3 font-dm-sans text-body-sm text-obsidian outline-none focus:border-gold"
                />
              </div>

              <div className="md:col-span-2">
                <AdminProductImageManager
                  canManage={canManage}
                  images={productInput.images}
                  onChange={(images) =>
                    setProductInput({
                      ...productInput,
                      images,
                    })
                  }
                  productLabel={productInput.name.trim() || "New product"}
                  productSlug={productInput.slug}
                />
              </div>

              <Button
                type="button"
                onClick={() => void addProduct()}
                className="h-11 rounded-sm bg-gold text-obsidian hover:bg-sand md:col-span-2"
              >
                Create Product
              </Button>
              {productError ? (
                <div className="md:col-span-2 rounded-sm border border-error bg-ivory p-3 font-dm-sans text-caption text-error">
                  {productError}
                </div>
              ) : null}
              {productMessage ? (
                <div className="md:col-span-2 rounded-sm border border-success bg-ivory p-3 font-dm-sans text-caption text-success">
                  {productMessage}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex gap-3 rounded-lg border border-border-warm bg-ivory p-4 shadow-card">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or SKU"
          className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm"
        />
        <Button
          type="button"
          onClick={() => void loadCatalog()}
          className="h-11 rounded-sm bg-gold px-4 text-obsidian hover:bg-sand"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 font-dm-sans text-body text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading catalog...
          </div>
        ) : (
          <div className="divide-y divide-border-warm">
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                categories={categories}
                canManage={canManage}
                hasActiveGeneration={activeProductIds.includes(product.adminId ?? product.id)}
                isSelected={selectedProductIds.includes(product.adminId ?? product.id)}
                isAlternate={index % 2 === 1}
                onSave={saveProduct}
                onSelectionChange={handleSelectionChange}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductRow({
  canManage,
  categories,
  hasActiveGeneration,
  isSelected,
  isAlternate,
  onSave,
  onSelectionChange,
  product,
}: ProductRowProps): ReactElement {
  const [draft, setDraft] = useState<Product>(product);
  const [savedProduct, setSavedProduct] = useState<Product>(product);
  const [variantDraft, setVariantDraft] = useState<AdminVariantInput>(defaultVariantInput);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect((): void => {
    setDraft(product);
    setSavedProduct(product);
  }, [product]);

  async function save(): Promise<void> {
    setLocalError(null);
    setLocalMessage(null);
    setIsSaving(true);
    try {
      const validationError = validateProductDraft(draft);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      const updated = await onSave(draft.adminId ?? draft.id, buildProductUpdateInput(draft));
      setDraft(updated);
      setSavedProduct(updated);
      setLocalMessage("Product saved.");
    } catch (saveError) {
      setLocalError(
        saveError instanceof Error ? saveError.message : "Unable to save product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function addVariant(): Promise<void> {
    const validationError = validateVariantInput(variantDraft);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    setLocalMessage(null);
    setIsSaving(true);

    try {
      const variant = await createAdminVariant(product.adminId ?? product.id, {
        ...variantDraft,
      });

      setDraft({ ...draft, variants: [...draft.variants, variant] });
      setVariantDraft(defaultVariantInput);
      setLocalMessage("Variant created.");
    } catch (createError) {
      setLocalError(
        createError instanceof Error
          ? createError.message
          : "Unable to create variant.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveVariant(
    variantId: string,
    input: Pick<AdminVariantInput, "imageUrl" | "stock">,
  ): Promise<void> {
    setLocalError(null);
    setLocalMessage(null);

    try {
      const variantAdminId =
        draft.variants.find((variant) => variant.id === variantId)?.adminId ?? variantId;
      const updated = await updateAdminVariant(variantAdminId, input);
      const nextDraft = {
        ...draft,
        variants: draft.variants.map((variant) =>
          variant.id === updated.id ? updated : variant,
        ),
      };
      setDraft(nextDraft);
      setLocalMessage("Variant saved.");
    } catch (saveError) {
      setLocalError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update variant stock.",
      );
    }
  }

  async function handleProductImagesChange(images: string[]): Promise<void> {
    const nextDraft = { ...draft, images };
    setDraft(nextDraft);

    if (!canManage) {
      return;
    }

    const updated = await onSave(savedProduct.adminId ?? savedProduct.id, { images });
    setDraft((current) => ({ ...current, images: updated.images }));
    setSavedProduct(updated);
  }

  async function publishManualProduct(): Promise<void> {
    if (draft.images.length === 0) {
      setLocalError("Upload at least one product image before publishing.");
      return;
    }
    if (!window.confirm("Publish this product with its current manual image gallery?")) return;
    setIsSaving(true);
    setLocalError(null);
    try {
      const updated = await onSave(savedProduct.adminId ?? savedProduct.id, {
        isPublished: true,
      });
      setDraft(updated);
      setSavedProduct(updated);
      setLocalMessage("Product published.");
    } catch (publishError) {
      setLocalError(
        publishError instanceof Error ? publishError.message : "Unable to publish product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cn("space-y-4 p-5", isAlternate ? "bg-cream/60" : "bg-ivory")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {canManage ? (
            <Checkbox
              aria-label={`Select ${draft.name} for image generation`}
              checked={isSelected}
              disabled={hasActiveGeneration}
              onCheckedChange={(checked) =>
                onSelectionChange(draft.adminId ?? draft.id, checked === true)
              }
            />
          ) : null}
          <span className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">
            {draft.isPublished ? "Published" : "Draft"}
            {hasActiveGeneration ? " · generation active" : ""}
          </span>
        </div>
        {canManage && !draft.isPublished && draft.images.length > 0 ? (
          <Button
            disabled={isSaving}
            onClick={() => void publishManualProduct()}
            size="sm"
            type="button"
            variant="outline"
          >
            Publish manual gallery
          </Button>
        ) : null}
      </div>
      {localError ? (
        <div className="rounded-sm border border-error bg-ivory p-3 font-dm-sans text-body-sm text-error">
          {localError}
        </div>
      ) : null}
      {localMessage ? (
        <div className="rounded-sm border border-success bg-ivory p-3 font-dm-sans text-body-sm text-success">
          {localMessage}
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] xl:items-start">
        <div>
          <FieldLabel>Product name</FieldLabel>
          <Input
            disabled={!canManage}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm font-semibold"
          />
          {draft.isPublished ? (
            <Link href={`/shop/${draft.slug}`} className="mt-1 block font-dm-sans text-caption text-gold">
              {draft.slug}
            </Link>
          ) : (
            <p className="mt-1 font-dm-sans text-caption text-text-muted">{draft.slug} · not visible in shop</p>
          )}
        </div>

        <div>
          <FieldLabel>Category</FieldLabel>
          <select
            disabled={!canManage}
            value={draft.categorySlug}
            onChange={(event) =>
              setDraft({
                ...draft,
                categorySlug: event.target.value as CategorySlug,
              })
            }
            className="h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Price (KES)</FieldLabel>
          <Input
            disabled={!canManage}
            value={draft.price}
            onChange={(event) =>
              setDraft({
                ...draft,
                price: Number(event.target.value) || 0,
              })
            }
            type="number"
            className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
          />
        </div>

        <div>
          <FieldLabel>Price preview</FieldLabel>
          <div className="flex h-11 items-center rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm font-semibold text-obsidian">
            {formatPrice(draft.price, draft.currency)}
          </div>
        </div>

        <div>
          <HiddenFieldLabel>Actions</HiddenFieldLabel>
          {canManage ? (
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void save()}
              className="h-11 rounded-sm bg-gold font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          ) : (
            <div className="flex h-11 items-center font-dm-sans text-caption uppercase tracking-widest text-text-muted">
              Read only
            </div>
          )}
        </div>
      </div>

      <AdminProductImageManager
        canManage={canManage}
        images={draft.images}
        onChange={handleProductImagesChange}
        productLabel={draft.name}
        productSlug={draft.slug}
        successMessage="Product images saved."
      />

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          disabled={!canManage}
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          rows={4}
          className="w-full rounded-sm border border-border-warm bg-cream px-3 py-3 font-dm-sans text-body-sm text-obsidian outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-80"
        />
      </div>

      <div className="rounded-sm bg-cream p-4">
        <p className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">Variants</p>
        <div className="mt-3 grid gap-3">
          {draft.variants.map((variant) => (
            <VariantStock
              key={variant.id}
              canManage={canManage}
              variantId={variant.id}
              sku={variant.sku}
              color={variant.color}
              imageUrl={variant.imageUrl}
              productImages={draft.images}
              size={variant.size}
              stock={variant.stock}
              onSave={saveVariant}
            />
          ))}
        </div>

        {canManage ? (
          <div className="mt-5 rounded-sm border border-border-warm bg-ivory p-4">
            <p className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">Add variant</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_auto] xl:items-end">
              <div>
                <FieldLabel>Color</FieldLabel>
                <Input
                  value={variantDraft.color}
                  onChange={(event) =>
                    setVariantDraft({ ...variantDraft, color: event.target.value })
                  }
                  placeholder="Gold"
                  className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                />
              </div>

              <div>
                <FieldLabel>Size</FieldLabel>
                <Input
                  value={variantDraft.size}
                  onChange={(event) =>
                    setVariantDraft({ ...variantDraft, size: event.target.value })
                  }
                  placeholder="One Size"
                  className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                />
              </div>

              <div>
                <FieldLabel>Stock quantity</FieldLabel>
                <Input
                  value={variantDraft.stock}
                  onChange={(event) =>
                    setVariantDraft({
                      ...variantDraft,
                      stock: Number(event.target.value) || 0,
                    })
                  }
                  type="number"
                  placeholder="8"
                  className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                />
              </div>

              <div>
                <FieldLabel>Variant image</FieldLabel>
                <select
                  value={variantDraft.imageUrl ?? ""}
                  onChange={(event) =>
                    setVariantDraft({
                      ...variantDraft,
                      imageUrl: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
                >
                  <option value="">Use product image fallback</option>
                  {draft.images.map((image, index) => (
                    <option key={`${image}-${index}`} value={image}>
                      Product image {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                onClick={() => void addVariant()}
                className="h-11 rounded-sm bg-obsidian px-6 font-dm-sans text-caption uppercase tracking-widest text-ivory hover:bg-bark"
              >
                Add
              </Button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}

function VariantStock({
  canManage,
  color,
  imageUrl,
  onSave,
  productImages,
  size,
  sku,
  stock,
  variantId,
}: VariantStockProps): ReactElement {
  const [nextStock, setNextStock] = useState(String(stock));
  const [nextImageUrl, setNextImageUrl] = useState(imageUrl ?? "");

  return (
    <div className="grid gap-4 rounded-sm border border-border-warm bg-ivory p-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_auto] xl:items-end">
      <div>
        <FieldLabel>SKU</FieldLabel>
        <div className="flex h-11 items-center rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm text-text-secondary">
          {sku || "Not set"}
        </div>
      </div>

      <div>
        <FieldLabel>Color</FieldLabel>
        <div className="flex h-11 items-center rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm text-text-secondary">
          {color || "Not set"}
        </div>
      </div>

      <div>
        <FieldLabel>Size</FieldLabel>
        <div className="flex h-11 items-center rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm text-text-secondary">
          {size || "Not set"}
        </div>
      </div>

      <div>
        <FieldLabel>Stock quantity</FieldLabel>
        <Input
          disabled={!canManage}
          value={nextStock}
          type="number"
          onChange={(event) => setNextStock(event.target.value)}
          className="h-11 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm"
        />
      </div>

      <div>
        <FieldLabel>Variant image</FieldLabel>
        <select
          disabled={!canManage}
          value={nextImageUrl}
          onChange={(event) => setNextImageUrl(event.target.value)}
          className="h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm disabled:cursor-not-allowed disabled:opacity-80"
        >
          <option value="">Use product image fallback</option>
          {productImages.map((image, index) => (
            <option key={`${variantId}-${image}-${index}`} value={image}>
              Product image {index + 1}
            </option>
          ))}
        </select>
      </div>

      {canManage ? (
        <Button
          type="button"
          onClick={() =>
            void onSave(variantId, {
              imageUrl: nextImageUrl,
              stock: Number(nextStock) || 0,
            })
          }
          className="h-11 rounded-sm bg-gold px-6 font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand"
        >
          Save Variant
        </Button>
      ) : (
        <div className="flex h-11 items-center">
          <Link href="/admin/inventory" className="font-dm-sans text-caption uppercase tracking-widest text-gold">
            Adjust in Inventory
          </Link>
        </div>
      )}
    </div>
  );
}
