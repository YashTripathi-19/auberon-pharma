export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <div className="skeleton h-4 w-20 mx-auto rounded mb-3" />
          <div className="skeleton h-10 w-60 mx-auto rounded mb-3" />
          <div className="skeleton h-5 w-80 mx-auto rounded" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="skeleton h-6 w-36 rounded" />
              <div className="skeleton h-10 w-full rounded-xl" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-48 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="skeleton h-6 w-24 rounded" />
              <div className="skeleton h-32 w-full rounded-xl" />
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
