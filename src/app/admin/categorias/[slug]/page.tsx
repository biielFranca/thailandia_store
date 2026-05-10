import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { CategoryEditorClient, type EditorCategoryFull } from "@/components/admin/category-editor-client";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminCategoryEditorPage({ params }: Props) {
  await requireAdmin();
  const { slug } = await params;
  if (slug === "nova") redirect("/admin/categorias/nova");

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, description, image_url, active, position")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();

  const editor: EditorCategoryFull = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    imageUrl: data.image_url,
    active: data.active,
    position: data.position,
  };

  return <CategoryEditorClient category={editor} />;
}
