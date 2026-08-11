"use client";

import { useState } from "react";
import type { Category } from "@/lib/admin-api";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/store/toast-store";

const EMPTY_FORM = { name: "", slug: "" };

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesPanel({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState<
    string | null
  >(null);
  const [deactivating, setDeactivating] = useState(false);

  const reload = async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.label, slug: c.slug });
    setSlugTouched(true);
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are both required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, slug: form.slug }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save category.");
      }
      setShowForm(false);
      toast.success(editing ? "Category updated." : "Category created.");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmingDeactivate) return;
    setDeactivating(true);
    const res = await fetch(`/api/admin/categories/${confirmingDeactivate}`, {
      method: "DELETE",
    }).catch(() => null);
    setDeactivating(false);
    setConfirmingDeactivate(null);
    if (!res?.ok) {
      toast.error("Couldn't deactivate this category.");
      return;
    }
    toast.success("Category deactivated.");
    reload();
  };

  return (
    <div>
      <button
        onClick={openNew}
        className="btn-fill rounded-pill border border-accent px-6 py-2.5 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground"
      >
        + New category
      </button>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-soft border border-border bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-display italic text-foreground">{c.label}</p>
              <p className="mt-0.5 truncate font-mono-price text-[10px] uppercase tracking-widest text-muted">
                {c.slug}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {c.isActive === false && (
                <span className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  Inactive
                </span>
              )}
              <button
                onClick={() => openEdit(c)}
                className="font-mono-price text-[11px] uppercase tracking-widest text-accent hover:opacity-70"
              >
                Edit
              </button>
              {c.isActive !== false && (
                <button
                  onClick={() => setConfirmingDeactivate(c.id)}
                  className="font-mono-price text-[11px] uppercase tracking-widest text-muted hover:text-accent"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted">No categories yet — create one to unblock product creation.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-soft border border-border bg-background p-5 sm:p-6">
            <h3 className="font-display text-xl italic text-foreground">
              {editing ? "Edit category" : "New category"}
            </h3>

            <div className="mt-5 space-y-3">
              <div>
                <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: slugTouched ? f.slug : slugify(name),
                    }));
                  }}
                  placeholder="e.g. Scrunchies"
                  className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div>
                <label className="font-mono-price text-[10px] uppercase tracking-widest text-muted">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  placeholder="e.g. scrunchies"
                  className="mt-1 w-full rounded-sharp border border-border bg-transparent px-3 py-2 font-mono-price text-sm text-foreground placeholder:text-muted"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 font-mono-price text-xs text-accent">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="font-mono-price text-xs uppercase tracking-widest text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.slug}
                className="btn-fill rounded-pill border border-accent px-6 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground transition-colors hover:text-accent-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save category"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmingDeactivate}
        title="Deactivate this category?"
        description="Existing products keep their category, but it won't be selectable for new ones."
        confirmLabel="Deactivate"
        busy={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmingDeactivate(null)}
      />
    </div>
  );
}
