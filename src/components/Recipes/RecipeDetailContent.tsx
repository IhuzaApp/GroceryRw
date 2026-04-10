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
    <div className="mx-auto max-w-7xl pb-12">
      {/* Hero Section - Full Bleed on Mobile */}
      <section className="relative -mx-4 -mt-6 overflow-hidden shadow-2xl sm:mx-0 sm:mt-0 sm:rounded-[3rem]">
        <div className="relative h-[20rem] w-full sm:h-[30rem]">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          {/* Integrated Action Buttons (Glass Mode) */}
          <div className="absolute top-8 left-6 right-6 flex items-center justify-between">
            <Link
              href="/Recipes"
              className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-emerald-500 hover:border-emerald-500 active:scale-90"
            >
               <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                className="h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="flex items-center gap-3">
               <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95">
                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
               </button>
               <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95">
                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
               </button>
            </div>
          </div>

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
            { 
              label: "Prep", 
              value: "15m", 
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) 
            },
            { 
              label: "Cook", 
              value: "45m", 
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              ) 
            },
            { 
              label: "Serves", 
              value: "4 ppl", 
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) 
            },
            { 
              label: "Level", 
              value: "Entry", 
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ) 
            },
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`flex flex-col items-center justify-center rounded-[2rem] border-2 py-6 transition-all hover:scale-105 ${
                isDark 
                  ? "border-white/5 bg-[#171717] shadow-lg shadow-black/20" 
                  : "border-black/5 bg-white shadow-sm"
              }`}
            >
              <div className={`mb-2 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {item.icon}
              </div>
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
            <div className={`sticky top-8 rounded-[2rem] border-2 p-6 sm:rounded-[2.5rem] sm:p-8 ${
              isDark ? "border-white/5 bg-[#171717]" : "border-black/5 bg-white"
            }`}>
              <button 
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="mb-6 flex w-full items-center justify-between outline-none"
              >
                <div className="flex flex-col items-start gap-1">
                  <h2 className={`text-xl font-black tracking-tight sm:text-2xl ${isDark ? "text-white" : "text-gray-900"}`}>
                    Ingredients
                  </h2>
                  <span className={`rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-500`}>
                    {ingredients.length} items
                  </span>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-transform duration-300 lg:hidden ${ingredientsOpen ? "rotate-180" : ""}`}>
                  <svg className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`${ingredientsOpen ? "block" : "hidden lg:block"}`}>
                <ul className="space-y-2">
                  {ingredients.map((item, index) => (
                    <li
                      key={index}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-all hover:border-emerald-500/30 ${
                        isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                         <span className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.measure && (
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                          {item.measure}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Instructions Column */}
          <section className="lg:col-span-3">
            <div className={`rounded-[2rem] border-2 p-6 sm:rounded-[2.5rem] sm:p-8 ${
              isDark ? "border-white/5 bg-[#171717]" : "border-black/5 bg-white"
            }`}>
              <button 
                onClick={() => setInstructionsOpen(!instructionsOpen)}
                className="mb-8 flex w-full items-center justify-between outline-none"
              >
                <h2 className={`text-xl font-black tracking-tight sm:text-2xl ${isDark ? "text-white" : "text-gray-900"}`}>
                  Method
                </h2>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-transform duration-300 lg:hidden ${instructionsOpen ? "rotate-180" : ""}`}>
                  <svg className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`${instructionsOpen ? "block" : "hidden lg:block"}`}>
                <div className="space-y-8">
                  {formatInstructions(meal.strInstructions).map((step, index) => (
                    <div key={index} className="group relative flex gap-4 sm:gap-6">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[10px] font-black text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110 sm:h-10 sm:w-10 sm:text-sm">
                          {index + 1}
                        </div>
                        <div className="mt-4 h-full w-[1.5px] bg-gradient-to-b from-emerald-500/30 to-transparent" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`mb-1 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          Step {index + 1}
                        </h4>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"} sm:text-base`}>
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
