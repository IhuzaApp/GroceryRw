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
        className={`flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
          isDark ? "border-gray-800 bg-gray-900" : "border-slate-100 bg-white"
        }`}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition group-hover:bg-emerald-50 group-hover:text-emerald-600"
          >
            <span className="text-lg">🔖</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3
            className={`line-clamp-2 text-sm font-semibold sm:text-base ${
              isDark ? "text-slate-50" : "text-slate-900"
            }`}
          >
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {category && (
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  isDark
                    ? "bg-emerald-900/40 text-emerald-300"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {category}
              </span>
            )}
            {area && (
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  isDark
                    ? "bg-sky-900/40 text-sky-300"
                    : "bg-sky-50 text-sky-700"
                }`}
              >
                {area}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default RecipeCard;
