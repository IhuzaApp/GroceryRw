import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "@components/ui/layout";
import { Input, Button, Panel, Loader } from "rsuite";
import Link from "next/link";
import Image from "next/image";

// Define types for API responses
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

export default function RecipesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch categories on component mount
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
        console.error("Error fetching categories:", err);
        setError("Failed to load recipe categories. Please try again later.");
      }
    };

    const fetchRandomMeals = async () => {
      try {
        // Fetch meals starting with different letters to get a variety
        const letters = ["a", "b", "c", "s", "t"];
        const mealPromises = letters.map((letter) =>
          fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(mealPromises);

        // Combine and shuffle results to get a random selection
        let allMeals: Meal[] = [];
        results.forEach((result) => {
          if (result.meals) {
            allMeals = [...allMeals, ...result.meals];
          }
        });

        // Shuffle and take first 12 meals
        const shuffled = allMeals.sort(() => 0.5 - Math.random());
        setMeals(shuffled.slice(0, 12));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching random meals:", err);
        setError("Failed to load recipes. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategories();
    fetchRandomMeals();
  }, []);

  // Handle search
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
      } else {
        setMeals([]);
        setError(`No recipes found for "${searchTerm}"`);
      }
    } catch (err) {
      console.error("Error searching meals:", err);
      setError("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle category filter
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
      } else {
        setMeals([]);
        setError(`No recipes found in category "${categoryName}"`);
      }
    } catch (err) {
      console.error("Error filtering by category:", err);
      setError("Failed to filter recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Explore Delicious Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Discover recipes from all over the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search for recipes (e.g., Pasta, Chicken)"
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-gray-300 p-4"
              size="lg"
            />
          </div>
          <Button
            appearance="primary"
            color="green"
            onClick={handleSearch}
            size="lg"
            className="w-full md:w-auto"
          >
            Search Recipes
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.idCategory}
                appearance={
                  activeCategory === category.strCategory ? "primary" : "ghost"
                }
                color={
                  activeCategory === category.strCategory ? "green" : undefined
                }
                onClick={() => handleCategoryFilter(category.strCategory)}
                className="mb-2 text-lg"
              >
                {category.strCategory}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">
            <p>{error}</p>
          </div>
        )}

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" content="Loading recipes..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {meals.map((meal) => (
              <Link
                href={`/Recipes/${meal.idMeal}`}
                key={meal.idMeal}
                className="block"
              >
                <Panel
                  shaded
                  bordered
                  className="h-full overflow-hidden rounded-lg transition-all hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">
                      {meal.strMeal}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {meal.strCategory && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          {meal.strCategory}
                        </span>
                      )}
                      {meal.strArea && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {meal.strArea}
                        </span>
                      )}
                    </div>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && meals.length === 0 && !error && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mb-4 h-16 w-16 text-gray-400"
            >
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <h3 className="mb-2 text-2xl font-medium text-gray-600">
              No recipes found
            </h3>
            <p className="text-gray-500">Try searching for something else</p>
          </div>
        )}
      </div>
    </RootLayout>
  );
}

