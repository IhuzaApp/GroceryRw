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

const LightningIcon = () => (
  <svg
    className="h-6 w-6 sm:h-5 sm:w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill="url(#lightning-premium)"
      stroke="#ffffff20"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id="lightning-premium" x1="3" y1="2" x2="21" y2="22">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const CakeIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21V19C20 17.8954 19.1046 17 18 17H6C4.89543 17 4 17.8954 4 19V21"
      stroke="#F472B6"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M12 17V7M12 7L10 9M12 7L14 9"
      stroke="#EC4899"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="7" y="11" width="10" height="6" rx="2" fill="url(#cake-grad)" />
    <defs>
      <linearGradient id="cake-grad" x1="7" y1="11" x2="17" y2="17">
        <stop offset="0%" stopColor="#FBCFE8" />
        <stop offset="100%" stopColor="#F9A8D4" />
      </linearGradient>
    </defs>
  </svg>
);

const BreakfastIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="url(#egg-white)" />
    <circle cx="12" cy="12" r="4" fill="url(#egg-yolk)" />
    <defs>
      <linearGradient id="egg-white" x1="3" y1="3" x2="21" y2="21">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
      <linearGradient id="egg-yolk" x1="8" y1="8" x2="16" y2="16">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const DonutIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" fill="url(#donut-grad)" />
    <circle cx="12" cy="12" r="3" fill="#00000030" />
    <path d="M10 8L11 9.5M14 10L13 11.5M11 15L12 13.5" stroke="#ffffff80" strokeLinecap="round" />
    <defs>
      <linearGradient id="donut-grad" x1="4" y1="4" x2="20" y2="20">
        <stop offset="0%" stopColor="#DB2777" />
        <stop offset="100%" stopColor="#9D174D" />
      </linearGradient>
    </defs>
  </svg>
);

const SaladIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 11C4 11 5 3 12 3C19 3 20 11 20 11"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 11V21M12 21H4C4 21 4 17 8 17M12 21H20C20 21 20 17 16 17"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="7" r="2" fill="#34D399" />
    <circle cx="16" cy="7" r="2" fill="#34D399" />
  </svg>
);

const LunchIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="10" rx="2" fill="url(#lunch-grad)" />
    <path d="M7 11V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V11" stroke="#475569" strokeWidth="2" />
    <defs>
      <linearGradient id="lunch-grad" x1="3" y1="11" x2="21" y2="21">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

const MeatIcon = () => (
  <svg className="h-6 w-6 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 3C15 3 13 5 13 8C13 11 15 13 15 13M9 3C9 3 11 5 11 8C11 11 9 13 9 13"
      stroke="#EF4444"
      strokeWidth="1.5"
    />
    <rect x="6" y="14" width="12" height="7" rx="3" fill="url(#meat-grad)" />
    <defs>
      <linearGradient id="meat-grad" x1="6" y1="14" x2="18" y2="21">
        <stop offset="0%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
    </defs>
  </svg>
);

const moods: ExploreMoodChip[] = [
  {
    id: "popular",
    label: "Popular",
    apiCategory: "Beef",
    icon: <LightningIcon />,
  },
  {
    id: "sweets",
    label: "Sweets",
    apiCategory: "Dessert",
    icon: <CakeIcon />,
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
    icon: <DonutIcon />,
  },
  {
    id: "greens",
    label: "Greens",
    apiCategory: "Vegan",
    icon: <SaladIcon />,
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
