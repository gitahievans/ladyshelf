import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPermissionSet, AdminUploadedProductImage } from "@/lib/types";
import { createAdminStorageClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const PRODUCT_IMAGES_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function sanitizeFileName(fileName: string): string {
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
    : "";
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBase = slugify(baseName) || "image";

  return `${safeBase}${extension}`;
}

async function getAuthorizedSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/admin/permissions`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const permissions = (await response.json()) as AdminPermissionSet;
  if (!permissions.catalog.manage) {
    return null;
  }

  return session;
}

function buildFilePath(productSlug: string | null, fileName: string): string {
  const slug = slugify(productSlug ?? "") || "draft";
  const uniquePart = `${Date.now()}-${crypto.randomUUID()}`;

  return `products/${slug}/${uniquePart}-${sanitizeFileName(fileName)}`;
}

async function ensureProductImagesBucket(
  supabaseAdmin: SupabaseClient,
): Promise<void> {
  const { data, error } = await supabaseAdmin.storage.getBucket(PRODUCT_IMAGES_BUCKET);

  if (data && !error) {
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    PRODUCT_IMAGES_BUCKET,
    {
      public: true,
      allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
      fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    },
  );

  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw createError;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ detail: "You are not allowed to upload product images." }, { status: 403 });
  }

  const formData = await request.formData();
  const productSlug = String(formData.get("productSlug") ?? "").trim() || null;
  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ detail: "Choose at least one image to upload." }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { detail: "Only JPG, PNG, and WEBP images are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { detail: "Each image must be smaller than 8MB." },
        { status: 400 },
      );
    }
  }

  const supabaseAdmin = createAdminStorageClient();
  await ensureProductImagesBucket(supabaseAdmin);
  const uploadedImages: AdminUploadedProductImage[] = [];

  for (const file of files) {
    const path = buildFilePath(productSlug, file.name);
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      if (uploadedImages.length > 0) {
        await supabaseAdmin.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove(uploadedImages.map((image) => image.path));
      }

      return NextResponse.json(
        { detail: "We could not upload those images right now. Please try again." },
        { status: 500 },
      );
    }

    const { data } = supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);

    uploadedImages.push({
      name: file.name,
      path,
      url: data.publicUrl,
    });
  }

  return NextResponse.json({ images: uploadedImages });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ detail: "You are not allowed to remove product images." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { paths?: string[] }
    | null;
  const paths = payload?.paths?.filter((path) => path.startsWith("products/")) ?? [];

  if (paths.length === 0) {
    return NextResponse.json({ detail: "No uploaded product images were selected." }, { status: 400 });
  }

  const supabaseAdmin = createAdminStorageClient();
  await ensureProductImagesBucket(supabaseAdmin);
  const { error } = await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);

  if (error) {
    return NextResponse.json(
      { detail: "We could not remove those images right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ removed: paths });
}
