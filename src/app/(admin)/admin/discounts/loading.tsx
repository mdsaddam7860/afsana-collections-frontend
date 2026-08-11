import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-pill" />
      </div>
      <div className="mt-6">
        <TableSkeleton rows={6} cols={6} />
      </div>
    </div>
  );
}
