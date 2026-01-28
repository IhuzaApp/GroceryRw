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
          className="relative mb-6 h-48 overflow-hidden rounded-b-3xl"
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
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Header content */}
          <div className="relative z-10 flex h-full flex-col justify-center px-4 pt-6">
            <h1
              className="text-2xl font-semibold text-white"
              style={{ color: "#ffffff" }}
            >
              Easy Home Cooking
            </h1>
            <p
              className="mt-1 text-sm text-white/80"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Over 200+ recipes you can cook at home.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Input
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search for recipes (e.g., Pasta, Chicken)"
                onKeyPress={handleKeyPress}
                size="lg"
                className="w-full flex-1 !rounded-2xl !bg-white/95 !text-gray-900 placeholder:!text-gray-500"
              />
              <Button
                appearance="primary"
                color="green"
                onClick={handleSearch}
                size="lg"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full !p-0"
              >
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
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
                className={`flex h-64 flex-col items-center justify-center rounded-2xl text-center shadow-inner ${
                  isDark ? "bg-gray-900 text-slate-200" : "bg-white"
                }`}
              >
                <h3 className="mb-1 text-lg font-semibold">No recipes found</h3>
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
