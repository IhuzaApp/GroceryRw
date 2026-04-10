import React from "react";

interface ExploreMoodChip {
  id: string;
  label: string;
  apiCategory: string;
  icon: React.ReactNode;
}

interface ExploreMoodStripProps {
  isDark: boolean;
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const PopularIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="text-amber-400" />
  </svg>
);

const SweetsIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-7a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4z" className="text-pink-400" />
    <path d="M18 9h1M11 11h1M16 13h1m-7 0h1" className="text-pink-300" />
  </svg>
);

const BreakfastIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13a9 9 0 1 0 18 0" className="text-amber-500" />
    <path d="M12 5V3M5 8l-1.5-1.5M19 8l1.5-1.5M12 21v-8" className="text-orange-400" />
    <circle cx="12" cy="13" r="4" className="text-yellow-400" />
  </svg>
);

const ChocolateIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="16" rx="2" className="text-rose-900" />
    <path d="M5 8h14M5 12h14M9 4v16M14 4v16" className="text-rose-700 opacity-50" />
  </svg>
);

const GreensIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-2.5 4-3 5.5-4.1 11.2A7 7 0 0 1 11 20z" className="text-emerald-500" />
    <path d="M11 20v-5m0 0l-2-2m2 2l2-2" className="text-emerald-400 opacity-50" />
  </svg>
);

const LunchIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" className="text-blue-500" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" className="text-blue-400" />
    <path d="M12 15v2" className="text-blue-200" />
  </svg>
);

const MeatIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 2L8 10M12 6L4 14M20 6l-8 8" className="text-red-500" />
    <path d="M12 14v4a2 2 0 1 1-4 0v-4" className="text-rose-500" />
    <path d="M18 14v4a2 2 0 1 0 4 0v-4" className="text-rose-600" />
  </svg>
);

const moods: ExploreMoodChip[] = [
  {
    id: "popular",
    label: "Popular",
    apiCategory: "Beef",
    icon: <PopularIcon />,
  },
  {
    id: "sweets",
    label: "Sweets",
    apiCategory: "Dessert",
    icon: <SweetsIcon />,
  },
  {
    id: "breakfast",
    label: "Breakfast",
    apiCategory: "Breakfast",
    icon: <BreakfastIcon />,
  },
  {
    id: "chocolate",
    label: "Chocolate",
    apiCategory: "Dessert",
    icon: <ChocolateIcon />,
  },
  {
    id: "greens",
    label: "Greens",
    apiCategory: "Vegan",
    icon: <GreensIcon />,
  },
  {
    id: "lunch",
    label: "Lunch",
    apiCategory: "Pasta",
    icon: <LunchIcon />,
  },
  {
    id: "meat",
    label: "Meat",
    apiCategory: "Chicken",
    icon: <MeatIcon />,
  },
];

const ExploreMoodStrip: React.FC<ExploreMoodStripProps> = ({
  isDark,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section
      className={`mt-4 -mx-4 p-1 py-4 transition-all sm:mx-0 sm:mt-8 sm:rounded-3xl sm:p-2 sm:shadow-lg lg:mt-10 ${
        isDark
          ? "border-y border-white/5 bg-white/5 backdrop-blur-md sm:border"
          : "border-y border-black/5 bg-white sm:border"
      }`}
    >
      <div className="flex flex-col gap-4 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <h2
            className={`text-base font-bold tracking-tight sm:text-xl ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Explore by mood
          </h2>
          <p
            className={`text-xs font-medium sm:text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Fine-tuned for your current craving.
          </p>
        </div>
        <div className="flex-1">
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-end sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {moods.map((chip) => {
              const isActive = activeCategory === chip.apiCategory;
              const baseClasses =
                "flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300";

              const colorClasses = isActive
                ? isDark
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-emerald-600 bg-emerald-600 text-white shadow-md"
                : isDark
                ? "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                : "border-black/5 bg-gray-50 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/50";

              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onSelectCategory(chip.apiCategory)}
                  className={`${baseClasses} ${colorClasses} active:scale-95`}
                >
                  <span className="flex items-center justify-center transition-transform group-hover:scale-110">
                    {chip.icon}
                  </span>
                  <span className="whitespace-nowrap">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreMoodStrip;
