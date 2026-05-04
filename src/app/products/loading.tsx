import Skeleton from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <div className="skeleton h-4 w-24 mx-auto rounded mb-3" />
          <div className="skeleton h-10 w-72 mx-auto rounded mb-3" />
          <div className="skeleton h-5 w-96 mx-auto rounded" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0">
            <div className="skeleton h-10 w-full rounded-xl mb-4" />
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="skeleton h-6 w-16 rounded" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-20 rounded-full" />
                ))}
              </div>
              <div className="skeleton h-6 w-16 rounded mt-4" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="skeleton h-5 w-48 rounded mb-4" />
            <Skeleton variant="card" count={6} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
