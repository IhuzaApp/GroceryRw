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
    <div className="mx-auto max-w-4xl pb-12">
      {/* Dynamic Header / Back Button */}
      <div className="sticky top-0 z-50 -mx-4 mb-4 flex items-center justify-between bg-black/5 px-4 py-4 backdrop-blur-xl dark:bg-white/5 sm:relative sm:mx-0 sm:top-auto sm:z-0 sm:mb-8 sm:rounded-3xl sm:px-6">
        <Link
          href="/Recipes"
          className={`group flex items-center gap-2 text-sm font-bold transition-all ${
            isDark ? "text-emerald-400" : "text-emerald-600"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 transition-all group-hover:bg-emerald-500/20 active:scale-90">
             <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              className="h-4 w-4"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="hidden sm:inline">Back to Recipes</span>
        </Link>
        <div className="flex items-center gap-3">
           <button className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-black/5 bg-white text-gray-700 hover:bg-gray-50"}`}>
             <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
           </button>
           <button className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-black/5 bg-white text-gray-700 hover:bg-gray-50"}`}>
             <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
           </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative -mx-4 overflow-hidden shadow-2xl sm:mx-0 sm:rounded-[3rem]">
        <div className="relative h-[25rem] w-full sm:h-[35rem]">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                {meal.strCategory}
              </span>
              <span className="rounded-full bg-white/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20">
                {meal.strArea} Origin
              </span>
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl lg:text-7xl">
              {meal.strMeal}
            </h1>
            
            {meal.strTags && (
              <div className="mt-6 flex flex-wrap gap-2">
                {meal.strTags.split(",").map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="mt-8 space-y-8 px-0">
        
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Prep", value: "15m", icon: "⏳" },
            { label: "Cook", value: "45m", icon: "🔥" },
            { label: "Serves", value: "4 ppl", icon: "👥" },
            { label: "Level", value: "Entry", icon: "⭐" },
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-center justify-center rounded-[2rem] border-2 py-6 transition-all hover:scale-105 ${
                isDark 
                  ? "border-white/5 bg-[#171717] shadow-lg shadow-black/20" 
                  : "border-black/5 bg-white shadow-sm"
              }`}
            >
              <span className="mb-2 text-2xl">{item.icon}</span>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {item.label}
              </p>
              <p className={`mt-1 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Ingredients & Instructions */}
        <div className="grid gap-8 lg:grid-cols-5">
          
          {/* Ingredients Column */}
          <section className="lg:col-span-2">
            <div className={`sticky top-8 rounded-[2.5rem] border-2 p-8 ${
              isDark ? "border-white/5 bg-[#171717]" : "border-black/5 bg-white"
            }`}>
              <div className="mb-8 flex items-center justify-between">
                <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  Ingredients
                </h2>
                <span className={`rounded-full bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500`}>
                  {ingredients.length} items
                </span>
              </div>
              
              <ul className="space-y-3">
                {ingredients.map((item, index) => (
                  <li
                    key={index}
                    className={`flex items-center justify-between gap-4 rounded-2xl border-2 px-4 py-4 transition-all hover:border-emerald-500/30 ${
                      isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" />
                       <span className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.measure && (
                      <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        {item.measure}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Instructions Column */}
          <section className="lg:col-span-3">
            <div className={`rounded-[2.5rem] border-2 p-8 ${
              isDark ? "border-white/5 bg-[#171717]" : "border-black/5 bg-white"
            }`}>
              <h2 className={`mb-8 text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Method
              </h2>
              
              <div className="space-y-10">
                {formatInstructions(meal.strInstructions).map((step, index) => (
                  <div key={index} className="group relative flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
                        {index + 1}
                      </div>
                      <div className="mt-4 h-full w-[2px] bg-gradient-to-b from-emerald-500/30 to-transparent" />
                    </div>
                    <div>
                      <h4 className={`mb-2 text-xs font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Step {index + 1}
                      </h4>
                      <p className={`text-base leading-relaxed ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video tutorial (if available) - Moved to bottom of method */}
              {youtubeId && (
                <div className="mt-12 rounded-[2rem] overflow-hidden border-2 border-white/5 bg-black/20">
                   <div className="p-6">
                      <h3 className="text-lg font-black text-white mb-2">Watch Tutorial</h3>
                      <p className="text-sm text-white/60 mb-6">Learn the exact techniques used in this recipe.</p>
                      <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        ></iframe>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RecipeDetailContent;
