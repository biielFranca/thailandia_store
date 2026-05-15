// Server-only adapter that returns Supabase product/category rows in the
// rich `CatalogProduct` / `CatalogCategory` shapes the storefront UI was
// originally written against. Keeps the components untouched while flipping
// the runtime source of truth from `themes/thailandia/content/catalog.ts`
// (static seed) to the database.
//
// Rich fields that aren't first-class columns (sizes, badge, line, status,
// season, isBestseller, team, region, collection, league, tags, shortName,
// cardTitle, priceLabel, displayPrice) live in `products.metadata` JSON.

import { createClient } from "@/lib/supabase/server";
import { storeConfig } from "@/config/store";
import type {
  CatalogCategory,
  CatalogProduct,
} from "@/themes/thailandia/content/catalog";
import { catalogCategories as staticCategories } from "@/themes/thailandia/content/catalog";

type ProductMetadata = {
  sizes?: string[];
  badge?: string;
  line?: string | null;
  status?: string | null;
  season?: string | null;
  isBestseller?: boolean;
  team?: string | null;
  region?: string | null;
  collection?: string | null;
  league?: string | null;
  tags?: string[];
  shortName?: string;
  cardTitle?: string;
  priceLabel?: string;
  displayPrice?: string;
  /** Position in the "Drop da semana" carousel. When set, the product is
   *  pinned and ordered by this value. When absent, the product is not in
   *  the drop. */
  dropPosition?: number | null;
};

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  active: boolean;
  stock_quantity: number;
  metadata: unknown;
  product_images: { url: string; position: number }[];
  categories: { slug: string; name: string } | null;
}

const PRODUCT_SELECT = `
  id, slug, name, description, price, featured, active, stock_quantity, metadata,
  product_images (url, position),
  categories (slug, name)
`;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function asMetadata(raw: unknown): ProductMetadata {
  return raw && typeof raw === "object" ? (raw as ProductMetadata) : {};
}

// Static fallback for category gradient/coverImage/href — those are UI
// metadata, not data, so we hydrate them from the seed file by slug.
function categoryUiExtras(slug: string): Pick<CatalogCategory, "accent" | "href" | "coverImage" | "comingSoon" | "isSpecial" | "gradient"> {
  const base = staticCategories.find((c) => c.slug === slug);
  return {
    accent: base?.accent ?? "",
    href: base?.href ?? `/categorias/${slug}`,
    coverImage: base?.coverImage,
    comingSoon: base?.comingSoon,
    isSpecial: base?.isSpecial,
    gradient: base?.gradient,
  };
}

function mapProduct(row: ProductRow): CatalogProduct {
  const meta = asMetadata(row.metadata);
  const sortedImages = [...row.product_images].sort((a, b) => a.position - b.position);
  const gallery = sortedImages.map((i) => i.url);
  const image = gallery[0] ?? "";
  const priceValue = Number(row.price);
  const priceLabel = meta.priceLabel ?? formatBRL(priceValue);

  return {
    slug: row.slug,
    name: row.name,
    shortName: meta.shortName ?? row.name,
    cardTitle: meta.cardTitle ?? row.name,
    categorySlug: row.categories?.slug ?? "",
    categoryName: row.categories?.name ?? "",
    image,
    gallery: gallery.length > 0 ? gallery : [""],
    priceLabel,
    displayPrice: meta.displayPrice ?? priceLabel,
    priceValue,
    sizes: meta.sizes ?? [],
    badge: meta.badge ?? "",
    description: row.description ?? "",
    line: meta.line ?? undefined,
    status: meta.status ?? undefined,
    season: meta.season ?? undefined,
    isFeatured: row.featured,
    isBestseller: meta.isBestseller ?? false,
    stockQuantity: row.stock_quantity,
    team: meta.team ?? undefined,
    region: meta.region ?? undefined,
    collection: meta.collection ?? undefined,
    tags: meta.tags ?? [],
    league: meta.league ?? undefined,
  };
}

function mapCategory(row: { slug: string; name: string; description: string | null; active: boolean }): CatalogCategory {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    ...categoryUiExtras(row.slug),
  };
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description, active")
    .eq("active", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getCatalogCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("slug, name, description, active")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data ? mapCategory(data) : null;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getCatalogProductsByCategory(slug: string): Promise<CatalogProduct[]> {
  // World Cup 2026 mixes products from any category whose metadata.collection
  // marks them as part of the cup. Mirrors the original static helper.
  if (slug === "world-cup-2026") {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .or("metadata->>collection.eq.world-cup-2026,categories.slug.eq.world-cup-2026", { foreignTable: "categories" })
      .order("created_at", { ascending: false });
    if (error) {
      // Fallback: filter on the client side if the OR query is rejected.
      const all = await getCatalogProducts();
      return all.filter((p) => p.collection === "world-cup-2026" || p.categorySlug === "world-cup-2026");
    }
    return ((data ?? []) as ProductRow[]).map(mapProduct);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("categories.slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[])
    // Filter out rows whose join didn't match (`!inner` is preferred but
    // breaks the type inference; this is equivalent and explicit).
    .filter((row) => row.categories?.slug === slug)
    .map(mapProduct);
}

export async function getFeaturedCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getBestsellerCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("metadata->>isBestseller", "true")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

/**
 * "Drop da semana" carousel: products the admin pinned via
 * metadata.dropPosition (number), ordered by that position. When no product
 * is pinned, returns an empty array so the home can hide the entire section.
 */
export async function getDropCatalogProducts(): Promise<CatalogProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .not("metadata->>dropPosition", "is", null);
  if (error) return [];

  return ((data ?? []) as ProductRow[])
    .slice()
    .sort((a, b) => {
      const aPos = Number(asMetadata(a.metadata).dropPosition ?? 999);
      const bPos = Number(asMetadata(b.metadata).dropPosition ?? 999);
      return aPos - bPos;
    })
    .map(mapProduct);
}

// ─── Hero slides ──────────────────────────────────────────────────────────────

export interface HeroSlideRow {
  id: string;
  position: number;
  title: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  productSlug: string | null;
  active: boolean;
}

async function resolveStoreId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeConfig.slug)
    .maybeSingle();
  return data?.id ?? null;
}

interface RawHeroSlide {
  id: string;
  position: number;
  title: string;
  description: string;
  button_label: string;
  image_url: string;
  product_slug: string | null;
  active: boolean;
}

function mapHeroSlide(r: RawHeroSlide): HeroSlideRow {
  return {
    id: r.id,
    position: r.position,
    title: r.title,
    description: r.description,
    buttonLabel: r.button_label,
    imageUrl: r.image_url,
    productSlug: r.product_slug,
    active: r.active,
  };
}

/**
 * Active hero slides ordered by position. Used by the public storefront.
 */
export async function getHeroSlides(): Promise<HeroSlideRow[]> {
  const supabase = await createClient();
  const storeId = await resolveStoreId();
  if (!storeId) return [];

  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, position, title, description, button_label, image_url, product_slug, active")
    .eq("store_id", storeId)
    .eq("active", true)
    .order("position", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapHeroSlide);
}

/**
 * Admin-only: returns every slide (including inactive). Used by /admin/vitrine.
 * RLS still enforces admin gating.
 */
export async function getAllHeroSlides(): Promise<HeroSlideRow[]> {
  const supabase = await createClient();
  const storeId = await resolveStoreId();
  if (!storeId) return [];

  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, position, title, description, button_label, image_url, product_slug, active")
    .eq("store_id", storeId)
    .order("position", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapHeroSlide);
}

export async function getCatalogProductsByCollection(collection: string): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .eq("metadata->>collection", collection)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

// Escapes characters that PostgREST interprets as filter syntax so that raw
// user input cannot alter the structure of .or() / .ilike() expressions.
function escapePostgrestLike(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll(",", "\\,")
    .replaceAll(".", "\\.")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("*", "\\*");
}

export async function searchCatalogProducts(query: string): Promise<CatalogProduct[]> {
  const q = query.trim();
  if (!q) return [];
  const escaped = escapePostgrestLike(q);
  const supabase = await createClient();
  // ilike on name/description; UI-side matching extends to team/league/etc.
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
    .order("featured", { ascending: false })
    .limit(50);
  if (error) throw error;
  const lower = q.toLowerCase();
  return ((data ?? []) as ProductRow[])
    .map(mapProduct)
    .filter((p) =>
      [p.name, p.cardTitle, p.shortName, p.categoryName, p.badge, p.line ?? "", p.season ?? "", p.team ?? "", p.league ?? "", p.region ?? ""]
        .some((field) => field.toLowerCase().includes(lower))
    );
}
