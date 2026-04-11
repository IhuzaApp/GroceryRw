import React from "react";
import Link from "next/link";

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  area?: string;
  isDark: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  imageUrl,
  category,
  area,
  isDark,
}) => {
  return (
    <Link href={`/Recipes/${id}`} className="group block">
      <article
        className={`flex h-full flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
          isDark
            ? "border-white/5 bg-[#171717] shadow-black/40 hover:border-emerald-500/30"
            : "border-black/5 bg-white shadow-slate-200/50 hover:border-emerald-500/30"
        }`}
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

          <div className="absolute left-4 top-4 flex gap-2">
            {category && (
              <span className="rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                {category}
              </span>
            )}
          </div>

          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-emerald-500 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {area || "Global"} Cuisine
            </span>
          </div>

          <h3
            className={`line-clamp-2 text-lg font-bold leading-tight transition-colors duration-300 ${
              isDark
                ? "text-white group-hover:text-emerald-400"
                : "text-gray-900 group-hover:text-emerald-600"
            }`}
          >
            {title}
          </h3>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span
              className={`text-xs font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              View details →
            </span>
            <div className="flex -space-x-2">
              {/* Decorative avatars for 'premium' feel */}
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-[#171717] bg-gray-500 text-[8px] text-white"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      i * 10
                    }`}
                    alt="user"
                  />
                </div>
              ))}
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#171717] bg-emerald-500 text-[8px] text-white">
                +1k
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default RecipeCard;
