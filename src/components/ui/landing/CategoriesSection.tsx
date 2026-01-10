import { useRouter } from "next/router";
import { CategoryIcon } from "../../user/dashboard/shared/SharedComponents";

interface CategoriesSectionProps {
  categories: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
  }>;
  loading: boolean;
}

export default function CategoriesSection({
  categories,
  loading,
}: CategoriesSectionProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="mt-12 md:mt-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:mb-16 md:text-4xl lg:text-5xl">
          What can we get you?
        </h2>
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 md:grid-cols-6 md:gap-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="relative w-full pt-3 md:pt-4">
                  {/* Basket Handle */}
                  <div
                    className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 animate-pulse border-2 border-white md:h-6 md:w-20"
                    style={{
                      borderRadius: "50% 50% 0 0",
                      borderBottom: "none",
                      background: "transparent",
                    }}
                  />
                  {/* Basket Body */}
                  <div
                    className="relative mx-auto h-16 w-20 animate-pulse overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg md:h-20 md:w-24"
                    style={{
                      borderRadius: "8px 8px 12px 12px",
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

  return (
    <div className="mt-12 md:mt-20">
      <h2 className="mb-12 text-center text-3xl font-bold text-white md:mb-16 md:text-4xl lg:text-5xl">
        What can we get you?
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 md:grid-cols-6 md:gap-8">
        {categories.slice(0, 6).map((category) => (
          <button
            key={category.id}
            onClick={() => router.push(`/?category=${category.id}`)}
            className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative w-full pt-3 md:pt-4">
              {/* Basket Handle */}
              <div
                className="absolute left-1/2 top-0 z-10 h-5 w-16 -translate-x-1/2 border-2 border-white transition-all duration-300 group-hover:border-gray-100 md:h-6 md:w-20"
                style={{
                  borderRadius: "50% 50% 0 0",
                  borderBottom: "none",
                  background: "transparent",
                  filter: "drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))",
                }}
              />
              
              {/* Basket Body */}
              <div
                className="relative mx-auto flex h-16 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-gradient-to-b from-white to-gray-50 transition-all duration-300 md:h-20 md:w-24"
                style={{
                  borderRadius: "8px 8px 12px 12px",
                  boxShadow:
                    "0 0 15px rgba(0, 100, 50, 0.6), 0 0 30px rgba(0, 80, 40, 0.4), 0 0 45px rgba(0, 60, 30, 0.3), inset 0 0 10px rgba(0, 120, 60, 0.2)",
                }}
              >
                {/* Basket Rim/Top Edge */}
                <div
                  className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-b from-gray-200 to-transparent opacity-50"
                  style={{ borderRadius: "8px 8px 0 0" }}
                />
                
                {/* Subtle Basket Texture */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 4px,
                        rgba(0,0,0,0.1) 4px,
                        rgba(0,0,0,0.1) 5px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 4px,
                        rgba(0,0,0,0.1) 4px,
                        rgba(0,0,0,0.1) 5px
                      )
                    `,
                  }}
                />
                
                {/* Category Icon */}
                <div className="relative z-10 flex scale-110 items-center justify-center transition-transform duration-300 group-hover:scale-125">
                  <CategoryIcon category={category.name} />
                </div>
              </div>
            </div>
            <span className="text-center text-xs font-semibold text-white transition-all duration-300 group-hover:text-gray-100 md:text-sm">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
