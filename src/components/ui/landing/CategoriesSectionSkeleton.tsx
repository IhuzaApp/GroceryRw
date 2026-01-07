export default function CategoriesSectionSkeleton() {
  return (
    <div className="mt-12 md:mt-20">
      <div className="mx-auto mb-8 h-12 w-64 animate-pulse rounded bg-white/20" />
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 md:grid-cols-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div
                className="h-20 w-16 animate-pulse border-2 border-white bg-white/10 md:h-32 md:w-24"
                style={{
                  borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                  clipPath: "ellipse(55% 65% at 50% 50%)",
                }}
              />
              <div className="h-4 w-20 animate-pulse rounded bg-white/20" />
            </div>
          ))}
      </div>
    </div>
  );
}
