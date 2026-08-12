"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function OrderStatusFilter({
  statuses,
  current,
}: {
  statuses: string[];
  current?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <select
      value={current ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-sharp border border-border bg-transparent px-3 py-2 font-mono-price text-xs uppercase tracking-widest text-foreground"
    >
      <option value="" className="bg-surface">
        All statuses
      </option>
      {statuses.map((s) => (
        <option key={s} value={s} className="bg-surface">
          {s}
        </option>
      ))}
    </select>
  );
}
