import CategoriesPanel from "@/components/admin/CategoriesPanel";
import { getCategories } from "@/lib/admin-api";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display text-fluid-h1 italic text-foreground">
        Categories
      </h1>
      <p className="mt-2 text-sm text-muted">
        {categories.length} categories. New products need a category to
        save, so an empty list here blocks product creation.
      </p>

      <div className="mt-8">
        <CategoriesPanel initialCategories={categories} />
      </div>
    </div>
  );
}
