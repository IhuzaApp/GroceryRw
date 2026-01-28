import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "@components/ui/layout";
import { Button, Loader } from "rsuite";
import Link from "next/link";
import { useTheme } from "../../src/context/ThemeContext";

// Define types for API responses
interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  [key: string]: string | null; // For dynamic ingredient and measure properties
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<
    { name: string; measure: string }[]
  >([]);

  // Mobile collapsible sections
  const [metaOpen, setMetaOpen] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          const mealData = data.meals[0];
          setMeal(mealData);

          // Extract ingredients and measures
          const ingredientList = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = mealData[`strIngredient${i}`];
            const measure = mealData[`strMeasure${i}`];

            if (ingredient && ingredient.trim() !== "") {
              ingredientList.push({
                name: ingredient,
                measure: measure || "",
              });
            }
          }
          setIngredients(ingredientList);
        } else {
          setError("Recipe not found");
        }
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError("Failed to load recipe details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  // Format instructions into steps
  const formatInstructions = (instructions: string) => {
    return instructions
      .split(/\r\n|\n|\r/)
      .filter((step) => step.trim() !== "")
      .map((step) => step.trim());
  };

  // Extract YouTube video ID
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  return (
    <RootLayout>
      <div
        className={`mx-auto max-w-7xl px-4 py-6 md:py-10 2xl:max-w-[1700px] ${
          isDark ? "text-slate-50" : "text-slate-900"
        }`}
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" content="Loading recipe..." />
          </div>
        ) : error ? (
          <div
            className={`rounded-lg p-4 ${
              isDark
                ? "bg-red-950/60 text-red-200"
                : "bg-red-50 text-red-800"
            }`}
          >
            <h3 className="mb-2 font-medium">Error</h3>
            <p>{error}</p>
            <div className="mt-4">
              <Link
                href="/Recipes"
                className="flex w-fit items-center text-gray-700"
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
                <span className="hover:underline">Back to Recipes</span>
              </Link>
            </div>
          </div>
        ) : meal ? (
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
                Detailed steps, ingredients, and video walkthrough for this
                recipe.
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
                    Fluffy and flavorful {meal.strMeal.toLowerCase()} made with
                    simple pantry ingredients. Perfect for busy weeknights or
                    weekend treats, this recipe is easy to follow and always a
                    crowd-pleaser.
                  </p>

                  {/* Video tutorial (desktop within card) */}
                  {meal.strYoutube && (
                    <div className="mt-4 hidden md:block">
                      <h2 className="text-sm font-semibold sm:text-base">
                        Video tutorial
                      </h2>
                      <div className="mt-2 flex items-stretch gap-3">
                        <div className="overflow-hidden rounded-2xl bg-black/60 w-40 flex-shrink-0">
                          <div className="aspect-square">
                            <iframe
                              width="200"
                              height="200"
                              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                                meal.strYoutube
                              )}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="h-full w-full"
                            ></iframe>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <p
                            className={
                              isDark ? "text-slate-200" : "text-slate-700"
                            }
                          >
                            Watch a quick step-by-step walkthrough for this
                            recipe. See the texture, timing, and pan movement so
                            it is easier to follow along while you cook.
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

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                      appearance="primary"
                      color="green"
                      size="lg"
                      className="rounded-full px-6 text-sm font-semibold"
                    >
                      Start making
                    </Button>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        isDark ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Step-by-step cooking guide included</span>
                    </div>
                  </div>
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
                    <h2 className="text-sm font-semibold sm:text-base">
                      Overview
                    </h2>
                    <span className="md:hidden">
                      {metaOpen ? "−" : "+"}
                    </span>
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
                    <h2 className="text-sm font-semibold sm:text-base">
                      Summary
                    </h2>
                    <span className="md:hidden">
                      {ingredientsOpen ? "−" : "+"}
                    </span>
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
                      <p className="mt-1 text-lg font-semibold">
                        Basic kitchen
                      </p>
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
                    <span className="md:hidden">
                      {ingredientsOpen ? "−" : "+"}
                    </span>
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
                <h2 className="text-sm font-semibold sm:text-base">
                  Instructions
                </h2>
                <span className="md:hidden">
                  {instructionsOpen ? "−" : "+"}
                </span>
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
            {meal.strYoutube && (
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
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                          meal.strYoutube
                        )}`}
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
                      Watch the full walkthrough for timing, textures and
                      plating tips while you cook.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </RootLayout>
  );
}
