import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { keyword, category } = req.body;
    console.log(`[AI Recipes API] Searching recipes: keyword="${keyword}", category="${category}"`);

    let url = "";

    if (category) {
      // Filter by category (e.g. "Seafood", "Chicken", "Vegan")
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
    } else if (keyword) {
      // Search by name
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`;
    } else {
      // Return random recipe if nothing specified
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;
    }

    const response = await fetch(url);
    const data = await response.json();

    const meals = (data.meals || []).slice(0, 10);

    const results = meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory || category || "Miscellaneous",
      area: meal.strArea,
      instructions: meal.strInstructions || null,
      image: meal.strMealThumb,
      tags: meal.strTags,
      youtube: meal.strYoutube || null,
      source: meal.strSource || null,
      link: `/Recipes/${meal.idMeal}`,
    }));

    console.log(`[AI Recipes API] Returning ${results.length} recipes`);
    return res.status(200).json({ results });
  } catch (error: any) {
    console.error("AI Recipes Search Error:", error);
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
}
