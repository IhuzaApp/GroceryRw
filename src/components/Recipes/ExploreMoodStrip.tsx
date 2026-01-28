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
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lightning-grad" x1="3" y1="2" x2="21" y2="22">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="50%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    <path
      d="M13 2 3 14h8l-2 8 12-12h-8z"
      fill="url(#lightning-grad)"
      stroke="rgba(15,23,42,0.3)"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CakeIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <rect
      x="4"
      y="11"
      width="16"
      height="8"
      rx="3"
      fill="#f97316"
      opacity={0.18}
    />
    <path
      d="M4 14c1.2 1.1 2.4 1.6 3.6 1.6S10 15 11 14.4c1-.6 2.2-.6 3.4 0 1.2.6 2.4 1.1 3.6 1.1"
      fill="none"
      stroke="#facc15"
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <path
      d="M8 11h8a4 4 0 0 1 4 4v4H4v-4a4 4 0 0 1 4-4Z"
      fill="#f97316"
      opacity={0.8}
    />
    <path
      d="M12 2v4"
      stroke="#fb7185"
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="1" fill="#fb7185" />
  </svg>
);

const BreakfastIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <circle cx="9" cy="10" r="5.2" fill="#fef9c3" />
    <circle cx="9" cy="10" r="2.2" fill="#facc15" />
    <path
      d="M3 20h16"
      stroke="#e5e7eb"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <path
      d="M13 8h6a2 2 0 0 1 2 2v1.5a5 5 0 0 1-5 5H13"
      fill="#e5f2ff"
      stroke="#38bdf8"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DonutIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="8" fill="#f9a8d4" />
    <circle cx="12" cy="12" r="3" fill="#fef9c3" />
    <circle cx="9.5" cy="9.5" r="0.6" fill="#ec4899" />
    <circle cx="14.5" cy="10" r="0.6" fill="#0ea5e9" />
    <circle cx="10" cy="14.2" r="0.6" fill="#22c55e" />
    <path
      d="M5.5 10c1 .5 1.6.5 2.6 0s1.7-.5 2.7 0 1.7.5 2.7 0 1.7-.5 2.7 0"
      fill="none"
      stroke="#fdf2f8"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

const SaladIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 11a7 7 0 0 1 13-3"
      fill="#bbf7d0"
      stroke="#22c55e"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <path
      d="M5 22h10a5 5 0 0 0 5-5v-3H4v3a5 5 0 0 0 1 3"
      fill="#16a34a"
      opacity={0.9}
    />
    <path
      d="M8 15c0 1.4.5 2.4 1.5 3"
      fill="none"
      stroke="#bbf7d0"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </svg>
);

const LunchIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="11" width="18" height="4" rx="1.5" fill="#38bdf8" />
    <rect x="5" y="15" width="14" height="4" rx="1.5" fill="#0f172a" />
    <path
      d="M7 11V7.2a1.2 1.2 0 0 1 2.4 0V11"
      fill="#e5e7eb"
      stroke="#0f172a"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 11V6.5a1.2 1.2 0 0 1 2.4 0V11"
      fill="#e5e7eb"
      stroke="#0f172a"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MeatIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 5c3-3 8-3 11 0s3 8 0 11-8 3-11 0-3-8 0-11Z"
      fill="#f97373"
      stroke="#b91c1c"
      strokeWidth={1.6}
    />
    <circle cx="12" cy="12" r="2.7" fill="#fee2e2" />
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
      className={`mt-10 rounded-2xl p-4 shadow-sm sm:p-6 ${
        isDark
          ? "border border-gray-800 bg-gray-900/70"
          : "bg-white border border-slate-100"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className={`text-base font-semibold sm:text-lg ${
              isDark ? "text-slate-50" : "text-slate-900"
            }`}
          >
            Explore by mood
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Find the perfect dish for any craving.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap justify-center gap-3 lg:justify-end">
          {moods.map((chip) => {
            const isActive = activeCategory === chip.apiCategory;
            const baseClasses =
              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition";

            const colorClasses = isActive
              ? isDark
                ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                : "border-emerald-500 bg-emerald-50 text-emerald-700"
              : isDark
              ? "border-gray-700 bg-gray-900 text-slate-200 hover:border-emerald-400 hover:bg-emerald-950/60"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60";

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelectCategory(chip.apiCategory)}
                className={`${baseClasses} ${colorClasses}`}
              >
                <span className="flex items-center justify-center">
                  {chip.icon}
                </span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreMoodStrip;

