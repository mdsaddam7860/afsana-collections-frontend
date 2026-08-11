import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-soft" />
        ))}
      </div>
    </div>
  );
}
