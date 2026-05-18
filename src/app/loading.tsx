export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="container mx-auto space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-12 bg-white/5 rounded-2xl w-full" />

        {/* Vital signs skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="h-16 bg-white/5 rounded-[32px] max-w-4xl mx-auto" />

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mt-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
