export default function CategoriesSectionSkeleton() {
  return (
    <div className="mt-12 md:mt-20">
      <div className="mx-auto mb-12 h-12 w-64 animate-pulse rounded bg-white/20 md:mb-16" />
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 md:grid-cols-6 md:gap-8">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="relative w-full pt-3 md:pt-4">
                {/* Basket Handle Skeleton */}
                <div
                  className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 animate-pulse border-2 border-white md:h-6 md:w-20"
                  style={{
                    borderRadius: "50% 50% 0 0",
                    borderBottom: "none",
                    background: "transparent",
                  }}
                />

                {/* Basket Body Skeleton */}
                <div
                  className="relative mx-auto h-16 w-20 animate-pulse overflow-hidden rounded-lg border-2 border-white bg-white/10 md:h-20 md:w-24"
                  style={{
                    borderRadius: "8px 8px 12px 12px",
                    boxShadow:
                      "0 0 15px rgba(0, 100, 50, 0.6), 0 0 30px rgba(0, 80, 40, 0.4), 0 0 45px rgba(0, 60, 30, 0.3), inset 0 0 10px rgba(0, 120, 60, 0.2)",
                  }}
                />
              </div>
              <div className="h-4 w-20 animate-pulse rounded bg-white/20" />
            </div>
          ))}
      </div>
    </div>
  );
}
