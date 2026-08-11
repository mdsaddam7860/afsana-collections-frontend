import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-pill" />
      </div>
      <div className="mt-6">
        <TableSkeleton rows={8} cols={7} />
      </div>
    </div>
  );
}
