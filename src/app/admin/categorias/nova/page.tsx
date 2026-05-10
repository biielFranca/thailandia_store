import { requireAdmin } from "@/lib/auth/require-admin";
import { CategoryEditorClient } from "@/components/admin/category-editor-client";

export default async function AdminNewCategoryPage() {
  await requireAdmin();
  return <CategoryEditorClient category={null} />;
}
