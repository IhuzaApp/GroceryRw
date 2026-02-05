import React from "react";
import { Input, Button } from "rsuite";
import { useTheme } from "../../context/ThemeContext";

interface RecipesHeroProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const RecipesHero: React.FC<RecipesHeroProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  onKeyPress,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={`relative hidden overflow-hidden rounded-3xl px-6 py-10 md:block lg:flex lg:items-stretch lg:gap-10 lg:px-10 lg:py-14 ${
        isDark
          ? "bg-gradient-to-r from-slate-900 via-slate-950 to-black"
          : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
      }`}
    >
      <div
        className="relative z-10 max-w-xl space-y-5 text-white lg:flex lg:flex-1 lg:flex-col lg:justify-center"
        style={{ color: "#ffffff" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300"
          style={{ color: "#ffffff" }}
        >
          Easy Home Cooking
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          style={{ color: "#ffffff" }}
        >
          Over 200+ Recipes
        </h1>
        <p
          className="text-sm text-white/80 sm:text-base"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Discover simple, step-by-step recipes you can cook at home, curated
          from around the world and tailored for everyday meals.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="cursor-not-allowed rounded-full bg-emerald-500/40 px-6 py-3 text-sm font-semibold text-white/70 opacity-70"
            title="Coming soon"
          >
            Join us
          </button>
          <span
            className="text-xs text-white/70 sm:text-sm"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            New recipes every week • Trusted by home cooks
          </span>
        </div>

        {/* Search inside hero */}
        <div className="mt-4 rounded-full bg-white/10 p-1.5 pl-4 pr-1.5 backdrop-blur">
          <div className="flex items-center gap-2">
            <Input
              value={searchTerm}
              onChange={onSearchTermChange}
              placeholder="Search for recipes (e.g., Pasta, Chicken)"
              onKeyPress={onKeyPress}
              className="!border-0 !bg-transparent !text-sm !text-white placeholder:!text-white/80"
              style={{ color: "#ffffff" }}
              size="lg"
            />
            <Button
              appearance="primary"
              color="green"
              onClick={onSearch}
              size="lg"
              className="rounded-full px-6 text-sm font-semibold"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none mt-10 w-full lg:pointer-events-auto lg:mt-0 lg:flex lg:flex-1 lg:items-center">
        <div className="relative h-64 w-full lg:h-72">
          <div className="absolute inset-0 -translate-y-6 translate-x-6 rounded-3xl bg-gradient-to-tr from-emerald-400/40 via-rose-400/30 to-amber-300/40 blur-3xl" />
          <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-2xl shadow-black/50">
            <img
              src="https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Delicious pizza with toppings"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipesHero;
