import Skeleton from "@/components/ui/Skeleton";

// Checkout page is a Client Component; this covers the brief window
// during route transition before it mounts (StepIndicator + two-column
// form/summary layout).
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32">
      <div className="flex justify-center gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-full rounded-sharp" />
          <Skeleton className="h-12 w-full rounded-sharp" />
        </div>
        <Skeleton className="h-64 w-full rounded-soft" />
      </div>
    </div>
  );
}
