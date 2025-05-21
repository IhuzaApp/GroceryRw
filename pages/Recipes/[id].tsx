import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "@components/ui/layout";
import { Button, Panel, Loader } from "rsuite";
import Link from "next/link";

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
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{ name: string; measure: string }[]>([]);

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
      .filter(step => step.trim() !== "")
      .map(step => step.trim());
  };

  // Extract YouTube video ID
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader size="lg" content="Loading recipe..." />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <h3 className="mb-2 font-medium">Error</h3>
            <p>{error}</p>
            <div className="mt-4">
              <Link href="/Recipes" className="flex items-center text-gray-700 w-fit">
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
              <Link href="/Recipes" className="flex items-center text-gray-700">
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
              <h1 className="ml-4 text-2xl font-bold">{meal.strMeal}</h1>
            </div>

            {/* Recipe header */}
            <div className="mb-8 flex flex-col items-start gap-6 md:flex-row">
              <div className="w-full overflow-hidden rounded-lg md:w-1/2 lg:w-2/5">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="h-auto w-full rounded-lg object-cover shadow-lg hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="flex-1">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    {meal.strCategory}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {meal.strArea}
                  </span>
                  {meal.strTags && meal.strTags.split(',').map(tag => (
                    <span
                      key={tag}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>

                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold text-gray-800">Ingredients</h2>
                  <ul className="list-inside list-disc space-y-2 text-gray-700">
                    {ingredients.map((item, index) => (
                      <li key={index}>
                        <span className="font-medium">{item.name}</span>
                        {item.measure && <span> - {item.measure}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Panel
              header={<h2 className="text-xl font-semibold text-gray-800">Instructions</h2>}
              bordered
              className="mb-8 shadow-lg"
            >
              <ol className="list-inside list-decimal space-y-4 text-gray-700">
                {formatInstructions(meal.strInstructions).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Panel>

            {/* YouTube video if available */}
            {meal.strYoutube && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Watch Video Tutorial</h2>
                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg shadow-lg">
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(meal.strYoutube)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </RootLayout>
  );
}
