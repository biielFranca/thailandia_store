import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  ProductEditorClient,
  type EditorCategory,
  type EditorProduct,
} from "@/components/admin/product-editor-client";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminProductEditorPage({ params }: Props) {
  await requireAdmin();
  const { slug } = await params;

  // /admin/produtos/novo has its own dedicated route; redirect if someone
  // lands here so URLs stay canonical.
  if (slug === "novo") redirect("/admin/produtos/novo");

  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, description, price, active, featured, stock_quantity, sku, metadata, customization_enabled, customization_price, product_images (url, position), categories (slug)")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("slug, name")
      .order("position", { ascending: true }),
  ]);

  if (!product) notFound();

  const sortedImages = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position);
  const editor: EditorProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    price: Number(product.price),
    active: product.active,
    featured: product.featured,
    stockQuantity: product.stock_quantity,
    sku: product.sku,
    categorySlug: product.categories?.slug ?? "",
    customizationEnabled: !!product.customization_enabled,
    customizationPrice: product.customization_price !== null ? Number(product.customization_price) : null,
    metadata: (product.metadata ?? {}) as Record<string, unknown>,
    imageUrls: sortedImages.map((i) => i.url),
  };

  const categoryOptions: EditorCategory[] = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return <ProductEditorClient product={editor} categories={categoryOptions} />;
}
