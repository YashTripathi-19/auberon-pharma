export default function SupportLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <div className="skeleton h-4 w-28 mx-auto rounded mb-3" />
          <div className="skeleton h-10 w-72 mx-auto rounded mb-3" />
          <div className="skeleton h-5 w-80 mx-auto rounded" />
        </div>
        <div className="skeleton h-48 w-full rounded-2xl mb-12" />
        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
