import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="h-screen bg-primary flex items-center justify-center">
        <div className="max-w-2xl w-full px-8 space-y-6">
          <div className="skeleton h-4 w-48 mx-auto rounded" />
          <div className="skeleton h-12 w-full rounded" />
          <div className="skeleton h-6 w-3/4 mx-auto rounded" />
          <div className="flex gap-4 justify-center mt-8">
            <div className="skeleton h-12 w-40 rounded-lg" />
            <div className="skeleton h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Skeleton variant="card" count={3} className="grid grid-cols-1 md:grid-cols-3 gap-6" />
      </div>
    </div>
  );
}
