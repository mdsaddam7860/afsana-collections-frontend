import type { ReactNode } from "react";

// One shared shape for every "nothing here yet" moment (empty cart, empty
// wishlist, no orders, no search/filter results, admin table with zero
// rows) — so these don't each get a slightly different look/copy tone.
export default function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <p className="font-display text-lg italic text-foreground">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
