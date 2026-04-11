import React, { useEffect, useState } from "react";
import { Loader, Input, Button } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import ExploreMoodStrip from "./ExploreMoodStrip";
import RecipeCard from "./RecipeCard";
import RecipesHero from "./RecipesHero";

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
    <div className={`pb-16 pt-0 transition-colors duration-200 md:pt-10`}>
      {/* Mobile header + search (hero is hidden on mobile) */}
      <div className="md:hidden">
        <div
          className="relative mb-8 h-64 overflow-hidden rounded-b-[3rem] shadow-2xl"
          style={{
            marginTop: "-44px",
            marginLeft: "-16px",
            marginRight: "-16px",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'url("https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=1200")',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          {/* Header content */}
          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 opacity-90">
              Easy Home Cooking
            </p>
            <h1
              className="text-4xl font-black leading-none tracking-tighter text-white"
              style={{ color: "#ffffff" }}
            >
              Over 200+ <br /> Recipes
            </h1>

            <div className="group mt-6 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 pl-4 pr-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all duration-500 focus-within:scale-[1.03] focus-within:border-emerald-500/50 focus-within:bg-white/[0.15] focus-within:shadow-2xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes..."
                onKeyPress={handleKeyPress}
                className="w-full flex-1 border-none bg-transparent p-0 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={handleSearch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all active:scale-95"
              >
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-6 2xl:max-w-[1700px]">
        {/* Hero */}
        <RecipesHero
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={handleSearch}
          onKeyPress={handleKeyPress}
        />

        {/* Featured categories strip */}
        <ExploreMoodStrip
          isDark={isDark}
          activeCategory={activeCategory}
          onSelectCategory={handleCategoryFilter}
        />

        {/* All API categories as subtle pills (optional) */}
        {categories.length > 0 && (
          <section className="-mx-4 mt-8 sm:mx-0">
            <div className="flex flex-nowrap gap-3 overflow-x-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => {
                const isActive = activeCategory === category.strCategory;
                return (
                  <button
                    key={category.idCategory}
                    type="button"
                    onClick={() => handleCategoryFilter(category.strCategory)}
                    className={`shrink-0 rounded-2xl border-2 px-5 py-2 text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "border-emerald-600 bg-emerald-600 text-white shadow-lg"
                        : isDark
                        ? "border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:text-gray-300"
                        : "border-black/5 bg-white text-gray-600 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
                    } active:scale-95`}
                  >
                    {category.strCategory}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8">
            <div
              className={`rounded-[2rem] border-2 px-6 py-4 text-sm font-medium ${
                isDark
                  ? "border-red-900/30 bg-red-950/20 text-red-400 backdrop-blur-md"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Latest Recipes */}
        <section className="-mx-4 mt-12 sm:mx-0">
          <div className="mb-8 flex items-center justify-between gap-2 px-4 sm:px-0">
            <div>
              <h2
                className={`text-2xl font-black tracking-tight sm:text-4xl ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Featured Recipes
              </h2>
              <p
                className={`mt-1 text-sm font-medium ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Hand-picked recipes for the best home cooking experience.
              </p>
            </div>
            <div className="ml-8 hidden h-0.5 flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent lg:block" />
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Loader size="lg" />
              <p
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Curating your feed...
              </p>
            </div>
          ) : meals.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 px-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {meals.map((meal) => (
                <RecipeCard
                  key={meal.idMeal}
                  id={meal.idMeal}
                  title={meal.strMeal}
                  imageUrl={meal.strMealThumb}
                  category={meal.strCategory}
                  area={meal.strArea}
                  isDark={isDark}
                />
              ))}
            </div>
          ) : (
            !error && (
              <div
                className={`flex h-80 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center ${
                  isDark
                    ? "border-white/5 bg-white/5 text-slate-200"
                    : "border-black/5 bg-white"
                }`}
              >
                <div className="mb-4 text-4xl opacity-50">🍽️</div>
                <h3 className="mb-1 text-xl font-bold">No results found</h3>
                <p
                  className={`max-w-xs text-sm ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  We couldn't find a match. Try exploring our mood categories
                  instead.
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
