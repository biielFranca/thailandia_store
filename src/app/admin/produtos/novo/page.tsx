import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  ProductEditorClient,
  type EditorCategory,
} from "@/components/admin/product-editor-client";

export default async function AdminNewProductPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name")
    .order("position", { ascending: true });

  const categoryOptions: EditorCategory[] = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return <ProductEditorClient product={null} categories={categoryOptions} />;
}
