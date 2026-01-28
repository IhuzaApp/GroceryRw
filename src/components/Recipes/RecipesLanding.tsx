import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input, Button, Loader } from "rsuite";
import { useTheme } from "../../context/ThemeContext";

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

const featuredCategoryChips = [
  { id: "popular", label: "Popular", icon: "⚡", apiCategory: "Beef" },
  { id: "sweets", label: "Sweets", icon: "🍰", apiCategory: "Dessert" },
  { id: "breakfast", label: "Breakfast", icon: "🍳", apiCategory: "Breakfast" },
  { id: "chocolate", label: "Chocolate", icon: "🍫", apiCategory: "Dessert" },
  { id: "greens", label: "Greens", icon: "🥗", apiCategory: "Vegan" },
  { id: "lunch", label: "Lunch", icon: "🍽️", apiCategory: "Pasta" },
  { id: "meat", label: "Meat", icon: "🥩", apiCategory: "Chicken" },
];

const RecipesLanding: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/categories.php"
        );
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        // keep this silent in UI, page has its own error messaging
        // eslint-disable-next-line no-console
        console.error("Error fetching categories:", err);
        setError("Failed to load recipe categories. Please try again later.");
      }
    };

    const fetchRandomMeals = async () => {
      try {
        const letters = ["a", "b", "c", "s", "t"];
        const mealPromises = letters.map((letter) =>
          fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(mealPromises);

        let allMeals: Meal[] = [];
        results.forEach((result) => {
          if (result.meals) {
            allMeals = [...allMeals, ...result.meals];
          }
        });

        const shuffled = allMeals.sort(() => 0.5 - Math.random());
        setMeals(shuffled.slice(0, 12));
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching random meals:", err);
        setError("Failed to load recipes. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategories();
    fetchRandomMeals();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      );
      const data = await response.json();

      if (data.meals) {
        setMeals(data.meals);
        setActiveCategory(null);
        setError(null);
      } else {
        setMeals([]);
        setError(`No recipes found for "${searchTerm}"`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error searching meals:", err);
      setError("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryName: string) => {
    setLoading(true);
    setActiveCategory(categoryName);

    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
      );
      const data = await response.json();

      if (data.meals) {
        setMeals(data.meals);
        setError(null);
      } else {
        setMeals([]);
        setError(`No recipes found in category "${categoryName}"`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error filtering by category:", err);
      setError("Failed to filter recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`pb-16 pt-10 transition-colors duration-200`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6 2xl:max-w-[1700px]">
        {/* Hero */}
        <section
          className={`relative overflow-hidden rounded-3xl px-6 py-10 lg:flex lg:items-center lg:gap-10 lg:px-10 lg:py-14 ${
            isDark
              ? "bg-gradient-to-r from-slate-900 via-slate-950 to-black"
              : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
          }`}
        >
          <div className="relative z-10 max-w-xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Easy Home Cooking
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Over 200+ Recipes
            </h1>
            <p className="text-sm text-slate-200 sm:text-base">
              Discover simple, step-by-step recipes you can cook at home,
              curated from around the world and tailored for everyday meals.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-300">
                Join us
              </button>
              <span className="text-xs text-slate-300 sm:text-sm">
                New recipes every week • Trusted by home cooks
              </span>
            </div>

            {/* Search inside hero */}
            <div className="mt-4 rounded-full bg-white/10 p-1.5 pl-4 pr-1.5 backdrop-blur">
              <div className="flex items-center gap-2">
                <Input
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search for recipes (e.g., Pasta, Chicken)"
                  onKeyPress={handleKeyPress}
                  className="!border-0 !bg-transparent !text-sm !text-white placeholder:!text-slate-300"
                  size="lg"
                />
                <Button
                  appearance="primary"
                  color="green"
                  onClick={handleSearch}
                  size="lg"
                  className="rounded-full px-6 text-sm font-semibold"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none mt-10 w-full max-w-md lg:pointer-events-auto lg:mt-0 lg:flex-1">
            <div className="relative">
              <div className="absolute inset-0 -translate-y-6 translate-x-6 rounded-3xl bg-gradient-to-tr from-emerald-400/40 via-rose-400/30 to-amber-300/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-2xl shadow-black/50">
                <img
                  src="https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Delicious pizza with toppings"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured categories strip */}
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
              {featuredCategoryChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleCategoryFilter(chip.apiCategory)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                    activeCategory === chip.apiCategory
                      ? isDark
                        ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                        : "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : isDark
                      ? "border-gray-700 bg-gray-900 text-slate-200 hover:border-emerald-400 hover:bg-emerald-950/60"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  <span className="text-lg">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All API categories as subtle pills (optional) */}
        {categories.length > 0 && (
          <section className="mt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.idCategory}
                  type="button"
                  onClick={() => handleCategoryFilter(category.strCategory)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    activeCategory === category.strCategory
                      ? isDark
                        ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                        : "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : isDark
                      ? "border-gray-700 bg-gray-900 text-slate-200 hover:border-emerald-400 hover:bg-emerald-950/60"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
                  }`}
                >
                  {category.strCategory}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div
            className={`mt-8 rounded-2xl border px-4 py-3 text-sm ${
              isDark
                ? "border-red-900 bg-red-950/70 text-red-300"
                : "border-red-100 bg-red-50 text-red-800"
            }`}
          >
            {error}
          </div>
        )}

        {/* Latest Recipes */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2
              className={`text-xl font-semibold sm:text-2xl ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              Latest Recipes
            </h2>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader size="lg" content="Loading recipes..." />
            </div>
          ) : meals.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {meals.map((meal) => (
                <Link
                  href={`/Recipes/${meal.idMeal}`}
                  key={meal.idMeal}
                  className="group block"
                >
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      isDark
                        ? "border-gray-800 bg-gray-900"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
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
                        {meal.strMeal}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {meal.strCategory && (
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                              isDark
                                ? "bg-emerald-900/40 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {meal.strCategory}
                          </span>
                        )}
                        {meal.strArea && (
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                              isDark
                                ? "bg-sky-900/40 text-sky-300"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {meal.strArea}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            !error && (
              <div
                className={`flex h-64 flex-col items-center justify-center rounded-2xl text-center shadow-inner ${
                  isDark ? "bg-gray-900 text-slate-200" : "bg-white"
                }`}
              >
                <h3 className="mb-1 text-lg font-semibold">
                  No recipes found
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Try searching for something else or pick another category.
                </p>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
};

export default RecipesLanding;

