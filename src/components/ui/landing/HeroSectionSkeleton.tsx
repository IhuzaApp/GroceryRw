export default function HeroSectionSkeleton() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-12 md:mt-20 md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-20">
      {/* Left: Animated Illustrations Skeleton */}
      <div className="w-full md:w-auto md:flex-1 md:flex md:justify-center lg:flex-none lg:max-w-md">
        <div className="w-64 h-64 bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Right: Text and Input Skeleton */}
      <div className="flex-1 text-center md:text-left md:max-w-xl">
        <div className="mb-4 h-16 w-full bg-white/20 rounded animate-pulse" />
        <div className="mb-8 h-6 w-3/4 bg-white/20 rounded animate-pulse mx-auto md:mx-0" />
        <div className="w-full max-w-2xl h-16 bg-white/20 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

