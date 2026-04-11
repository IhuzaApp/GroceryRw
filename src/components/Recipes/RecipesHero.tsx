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
      className={`relative hidden overflow-hidden rounded-[3rem] px-8 py-12 md:block lg:flex lg:items-center lg:gap-16 lg:px-16 lg:py-20 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-2xl shadow-black/60"
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-slate-200"
      }`}
    >
      {/* Decorative background glow */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative z-10 max-w-xl space-y-8 text-white lg:flex-1">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 opacity-80">
            Premium Home Cooking
          </p>
          <h1
            className="text-5xl font-black leading-[1.1] tracking-tighter sm:text-6xl lg:text-7xl"
            style={{ color: "#ffffff" }}
          >
            Over 200+ <br />
            <span className="text-emerald-400">Masterpieces</span>
          </h1>
          <p
            className="max-w-md text-base leading-relaxed text-white/70"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Discover simple, step-by-step recipes curated from around the world.
            Tailored for everyday meals and extraordinary occasions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  i + 20
                }`}
                className="h-8 w-8 rounded-full border-2 border-slate-900"
                alt="user"
              />
            ))}
          </div>
          <span className="text-xs font-bold text-white/50">
            Joined by 12k+ home cooks this month
          </span>
        </div>

        {/* Search inside hero */}
        <div className="space-y-4">
          <div className="group relative flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 pl-6 pr-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-3xl transition-all duration-500 focus-within:scale-[1.02] focus-within:border-emerald-500/50 focus-within:bg-white/[0.15] focus-within:shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
            <svg
              className="h-5 w-5 text-white/50 transition-colors group-focus-within:text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="What are we cooking today?"
              onKeyPress={onKeyPress}
              className="flex-1 border-none bg-transparent p-0 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={onSearch}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
              Trending:
            </span>
            <div className="flex gap-2">
              {["Pasta", "Burger", "Vegan", "Dessert"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchTermChange(tag)}
                  className="text-[10px] font-bold text-white/50 transition-colors hover:text-emerald-400"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none mt-10 w-full lg:pointer-events-auto lg:mt-0 lg:flex lg:flex-1 lg:items-center">
        <div className="relative h-80 w-full lg:h-[28rem]">
          <div className="absolute inset-0 -translate-y-8 translate-x-8 rounded-[3rem] bg-gradient-to-tr from-emerald-400/20 via-rose-400/10 to-transparent blur-3xl" />
          <div className="relative h-full overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 shadow-2xl">
            <img
              src="https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Delicious dish"
              className="duration-[2s] pointer-events-auto h-full w-full object-cover transition-transform hover:scale-110"
            />
            {/* Floating micro-card */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-xl">
                🥗
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Recipe of the day
                </p>
                <p className="text-sm font-bold text-white">
                  Classic Italian Pesto Pasta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipesHero;
