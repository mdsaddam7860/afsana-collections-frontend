import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-52" />
      <div className="mt-6">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
