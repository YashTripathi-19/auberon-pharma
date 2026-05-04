import Skeleton from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 space-y-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="skeleton h-6 w-32 rounded mb-4" />
          <div className="skeleton h-48 w-full rounded" />
        </div>
        <div className="bg-white rounded-2xl p-6">
          <div className="skeleton h-6 w-32 rounded mb-4" />
          <Skeleton variant="table-row" count={5} />
        </div>
      </div>
    </div>
  );
}
