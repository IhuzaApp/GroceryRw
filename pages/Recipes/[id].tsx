import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "@components/ui/layout";
import { Loader } from "rsuite";
import Link from "next/link";
import { useTheme } from "../../src/context/ThemeContext";
import RecipeDetailContent from "../../src/components/Recipes/RecipeDetailContent";
import type { MealDetail } from "../../src/components/Recipes/types";

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
          <RecipeDetailContent meal={meal} ingredients={ingredients} />
        ) : null}
      </div>
    </RootLayout>
  );
}
