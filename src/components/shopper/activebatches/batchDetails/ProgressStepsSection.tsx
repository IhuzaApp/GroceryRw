"use client";

import React from "react";
import { OrderDetailsType } from "../../types";
import { useTheme } from "../../../../context/ThemeContext";

interface ProgressStepsSectionProps {
  order: OrderDetailsType;
  currentStep: number;
}

export default function ProgressStepsSection({
  order,
  currentStep,
}: ProgressStepsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isReelOrRestaurantOrBusiness =
    order?.orderType === "reel" ||
    order?.orderType === "restaurant" ||
    order?.orderType === "business";

  const regularSteps = [
    { title: "Accepted", desc: "Batch assigned" },
    { title: "Shopping", desc: "In store" },
    { title: "Transit", desc: "Out for delivery" },
    { title: "Delivered", desc: "Success" }
  ];

  const simplifiedSteps = [
    { title: "Pickup", desc: "At store/restaurant" },
    { title: "Transit", desc: "Out for delivery" },
    { title: "Delivered", desc: "Success" }
  ];

  const activeSteps = isReelOrRestaurantOrBusiness ? simplifiedSteps : regularSteps;

  return (
    <div 
      className={`hidden rounded-2xl border transition-all duration-300 sm:block overflow-hidden ${
        isDark 
          ? "bg-white/5 border-white/10" 
          : "bg-black/2 border-black/5"
      }`}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"}`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Order Progress</h2>
      </div>

      <div className="p-8">
        <div className="relative flex items-center justify-between">
          {/* Progress Line Background */}
          <div className={`absolute left-0 top-[1.1rem] h-[2px] w-full -translate-y-1/2 ${isDark ? "bg-white/10" : "bg-black/5"}`} />
          
          {/* Progress Line Active */}
          <div 
            className="absolute left-0 top-[1.1rem] h-[2px] -translate-y-1/2 bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${(currentStep / (activeSteps.length - 1)) * 100}%` }}
          />

          {activeSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCompleted 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : isCurrent
                      ? `bg-[var(--bg-primary)] border-emerald-500 text-emerald-500 shadow-xl shadow-emerald-500/20 scale-110`
                      : `bg-[var(--bg-primary)] ${isDark ? "border-white/10 text-gray-600" : "border-black/10 text-gray-400"}`
                }`}>
                  {isCompleted ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                
                <div className="mt-3 flex flex-col items-center">
                  <span className={`text-xs font-black uppercase tracking-tight ${
                    isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.title}
                  </span>
                  <span className={`mt-0.5 text-[10px] whitespace-nowrap opacity-60 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
