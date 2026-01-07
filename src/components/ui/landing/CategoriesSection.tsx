import { useRouter } from "next/router";
import { CategoryIcon } from "../../user/dashboard/shared/SharedComponents";

interface CategoriesSectionProps {
  categories: Array<{id: string; name: string; description: string; image: string}>;
  loading: boolean;
}

export default function CategoriesSection({ categories, loading }: CategoriesSectionProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="mt-12 md:mt-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          What can we get you?
        </h2>
        <div className="grid grid-cols-3 gap-6 md:grid-cols-6 max-w-6xl mx-auto">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div 
                className="w-16 h-20 md:w-24 md:h-32 border-2 border-white bg-white animate-pulse"
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

  return (
    <div className="mt-12 md:mt-20">
      <h2 className="mb-8 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
        What can we get you?
      </h2>
      <div className="grid grid-cols-3 gap-6 md:grid-cols-6 max-w-6xl mx-auto">
        {categories.slice(0, 6).map((category) => (
          <button
            key={category.id}
            onClick={() => router.push(`/?category=${category.id}`)}
            className="flex flex-col items-center gap-3 group"
          >
            <div 
              className="w-16 h-20 md:w-24 md:h-32 border-2 border-white bg-white flex items-center justify-center transition-all hover:scale-110 overflow-visible relative"
              style={{
                borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                clipPath: 'ellipse(55% 65% at 50% 50%)',
                boxShadow: '0 0 15px rgba(0, 100, 50, 0.6), 0 0 30px rgba(0, 80, 40, 0.4), 0 0 45px rgba(0, 60, 30, 0.3), inset 0 0 10px rgba(0, 120, 60, 0.2)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'scale(1.8)', zIndex: 10 }}>
                <CategoryIcon category={category.name} />
              </div>
            </div>
            <span className="text-sm md:text-base font-medium text-white group-hover:text-gray-100 transition-colors text-center">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

