export default function HeroSectionSkeleton() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-12 md:mt-20 md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-20">
      {/* Left: Animated Illustrations Skeleton */}
      <div className="w-full md:flex md:w-auto md:flex-1 md:justify-center lg:max-w-md lg:flex-none">
        <div className="h-64 w-64 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Right: Text and Input Skeleton */}
      <div className="flex-1 text-center md:max-w-xl md:text-left">
        <div className="mb-4 h-16 w-full animate-pulse rounded bg-white/20" />
        <div className="mx-auto mb-8 h-6 w-3/4 animate-pulse rounded bg-white/20 md:mx-0" />
        <div className="h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-white/20" />
      </div>
    </div>
  );
}
