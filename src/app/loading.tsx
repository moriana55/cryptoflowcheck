export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="container mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="h-12 skeleton rounded-xl w-full" />

        {/* Vital signs skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="h-16 skeleton rounded-xl max-w-4xl mx-auto" />

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mt-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 skeleton rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
