import React, { useState } from "react";
import Link from "next/link";
import { Button } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import type { MealDetail } from "./types";

interface IngredientItem {
  name: string;
  measure: string;
}

interface RecipeDetailContentProps {
  meal: MealDetail;
  ingredients: IngredientItem[];
}

const RecipeDetailContent: React.FC<RecipeDetailContentProps> = ({
  meal,
  ingredients,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mobile collapsible sections
  const [metaOpen, setMetaOpen] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Helpers
  const formatInstructions = (instructions: string) =>
    instructions
      .split(/\r\n|\n|\r/)
      .filter((step) => step.trim() !== "")
      .map((step) => step.trim());

  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const youtubeId = getYoutubeVideoId(meal.strYoutube);

  return (
    <div>
      {/* Back button */}
      <div className="mb-6 flex items-center">
        <Link
          href="/Recipes"
          className={`flex items-center text-sm ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-2 h-5 w-5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hover:underline">Back</span>
        </Link>
      </div>

      {/* Mobile header with recipe name */}
      <div className="mb-4 md:hidden">
        <h1 className="text-xl font-semibold">{meal.strMeal}</h1>
        <p
          className={`mt-1 text-sm ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Detailed steps, ingredients, and video walkthrough for this recipe.
        </p>
      </div>

      {/* Main layout: left details + right meta/ingredients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: hero card */}
        <section
          className={`flex flex-col overflow-hidden rounded-3xl border ${
            isDark
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-100 bg-white"
          } shadow-sm`}
        >
          <div className="relative">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="h-64 w-full object-cover sm:h-72 lg:h-80"
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {meal.strArea}
              </span>
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {meal.strCategory}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <h1 className="text-xl font-semibold sm:text-2xl">
              {meal.strMeal}
            </h1>
            {meal.strTags && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {meal.strTags.split(",").map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 font-medium ${
                      isDark
                        ? "bg-emerald-900/40 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <p
              className={`mt-4 text-sm leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Fluffy and flavorful {meal.strMeal.toLowerCase()} made with simple
              pantry ingredients. Perfect for busy weeknights or weekend treats,
              this recipe is easy to follow and always a crowd-pleaser.
            </p>

            {/* Video tutorial (desktop within card) */}
            {youtubeId && (
              <div className="mt-4 hidden md:block">
                <h2 className="text-sm font-semibold sm:text-base">
                  Video tutorial
                </h2>
                <div className="mt-2 flex items-stretch gap-3">
                  <div className="w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-black/60">
                    <div className="aspect-square">
                      <iframe
                        width="200"
                        height="200"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      ></iframe>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <p className={isDark ? "text-slate-200" : "text-slate-700"}>
                      Watch a quick step-by-step walkthrough for this recipe.
                      See the texture, timing, and pan movement so it is easier
                      to follow along while you cook.
                    </p>
                    <p
                      className={`mt-2 text-[11px] uppercase tracking-wide ${
                        isDark ? "text-emerald-300" : "text-emerald-600"
                      }`}
                    >
                      Plays directly from YouTube
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right: stats, ingredients */}
        <section className="space-y-4">
          {/* Time / meta row */}
          <div
            className={`rounded-3xl border p-4 text-xs sm:text-sm ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white"
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setMetaOpen((v) => !v)}
            >
              <h2 className="text-sm font-semibold sm:text-base">Overview</h2>
              <span className="md:hidden">{metaOpen ? "−" : "+"}</span>
            </button>
            <div
              className={`mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 ${
                metaOpen ? "block" : "hidden md:block"
              }`}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Prep
                </p>
                <p className="mt-1 font-semibold">10 min</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Cook
                </p>
                <p className="mt-1 font-semibold">20 min</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Serves
                </p>
                <p className="mt-1 font-semibold">4 people</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Difficulty
                </p>
                <p className="mt-1 font-semibold">Easy</p>
              </div>
            </div>
          </div>

          {/* Ingredients / equipment summary */}
          <div
            className={`grid grid-cols-2 gap-3 rounded-3xl border p-4 text-xs sm:text-sm ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white"
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setIngredientsOpen((v) => !v)}
            >
              <h2 className="text-sm font-semibold sm:text-base">Summary</h2>
              <span className="md:hidden">{ingredientsOpen ? "−" : "+"}</span>
            </button>
            <div
              className={`mt-3 grid grid-cols-2 gap-3 ${
                ingredientsOpen ? "block" : "hidden md:block"
              }`}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Ingredients
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {ingredients.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Equipment
                </p>
                <p className="mt-1 text-lg font-semibold">Basic kitchen</p>
              </div>
            </div>
          </div>

          {/* Ingredients list */}
          <div
            className={`rounded-3xl border p-4 ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white"
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setIngredientsOpen((v) => !v)}
            >
              <h2 className="text-sm font-semibold sm:text-base">
                Ingredients
              </h2>
              <span className="md:hidden">{ingredientsOpen ? "−" : "+"}</span>
            </button>
            <ul
              className={`mt-3 space-y-2 text-xs sm:text-sm ${
                isDark ? "text-slate-200" : "text-slate-700"
              } ${ingredientsOpen ? "block" : "hidden md:block"}`}
            >
              {ingredients.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/40 px-3 py-2 dark:bg-slate-800/60"
                >
                  <span className="font-medium">{item.name}</span>
                  {item.measure && (
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                      {item.measure}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Instructions full-width below */}
      <div
        className={`mt-6 rounded-3xl border p-4 ${
          isDark
            ? "border-slate-800 bg-slate-900/70"
            : "border-slate-100 bg-white"
        }`}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setInstructionsOpen((v) => !v)}
        >
          <h2 className="text-sm font-semibold sm:text-base">Instructions</h2>
          <span className="md:hidden">{instructionsOpen ? "−" : "+"}</span>
        </button>
        <ol
          className={`mt-3 space-y-3 text-xs sm:text-sm ${
            isDark ? "text-slate-200" : "text-slate-700"
          } ${instructionsOpen ? "block" : "hidden md:block"}`}
        >
          {formatInstructions(meal.strInstructions).map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile-only video section at bottom */}
      {youtubeId && (
        <div
          className={`mt-4 rounded-3xl border p-4 md:hidden ${
            isDark
              ? "border-slate-800 bg-slate-900/70"
              : "border-slate-100 bg-white"
          }`}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setVideoOpen((v) => !v)}
          >
            <h2 className="text-sm font-semibold sm:text-base">
              Video tutorial
            </h2>
            <span>{videoOpen ? "−" : "+"}</span>
          </button>
          {videoOpen && (
            <div className="mt-3">
              <div className="aspect-video overflow-hidden rounded-2xl">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                ></iframe>
              </div>
              <p
                className={`mt-2 text-xs ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                Watch the full walkthrough for timing, textures and plating tips
                while you cook.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeDetailContent;
