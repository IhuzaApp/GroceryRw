"use client";

import React from "react";
import { Plus } from "lucide-react";

interface PetDashboardHeaderProps {
  title: string;
  subtitle: string;
  onAction: () => void;
  actionLabel: string;
  theme: string;
}

export default function PetDashboardHeader({
  title,
  subtitle,
  onAction,
  actionLabel,
  theme,
}: PetDashboardHeaderProps) {
  return (
    <div
      className={`px-6 py-10 ${
        theme === "dark"
          ? "border-b border-white/5 bg-gradient-to-b from-green-900/20 to-transparent"
          : "border-b border-gray-100 bg-gradient-to-b from-green-50 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1
              className={`font-outfit text-4xl font-black tracking-tight ${
                theme === "dark"
                  ? "!text-white text-white"
                  : "!text-gray-900 text-gray-900"
              }`}
            >
              {title}
            </h1>
            <p
              className={`${
                theme === "dark"
                  ? "!text-gray-400 text-gray-400"
                  : "!text-gray-500 text-gray-500"
              } mt-1 font-medium`}
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onAction}
            className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-8 py-4 font-black !text-white text-white shadow-2xl shadow-green-500/40 transition-all hover:scale-[1.05] active:scale-[0.95]"
          >
            <Plus className="h-5 w-5" />
            <span>{actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
