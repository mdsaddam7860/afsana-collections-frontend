import Skeleton from "@/components/ui/Skeleton";

// Fires during the route transition into /account. AccountPage itself is
// a Client Component with its own session-based loading gate — this only
// covers the brief window before that component mounts.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full max-w-sm rounded-soft" />
        </div>
      </div>
    </div>
  );
}
