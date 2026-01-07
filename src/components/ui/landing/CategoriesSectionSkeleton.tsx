export default function CategoriesSectionSkeleton() {
  return (
    <div className="mt-12 md:mt-20">
      <div className="mb-8 h-12 w-64 mx-auto bg-white/20 rounded animate-pulse" />
      <div className="grid grid-cols-3 gap-6 md:grid-cols-6 max-w-6xl mx-auto">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div 
              className="w-16 h-20 md:w-24 md:h-32 border-2 border-white bg-white/10 animate-pulse"
              style={{
                borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                clipPath: 'ellipse(55% 65% at 50% 50%)',
              }}
            />
            <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

