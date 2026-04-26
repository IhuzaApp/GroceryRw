"use client";

import React from "react";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onAction: () => void;
  actionLabel: string;
  theme: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  onAction,
  actionLabel,
  theme,
}: DashboardHeaderProps) {
  return (
    <div
      className={`px-6 py-8 ${
        theme === "dark"
          ? "bg-gradient-to-b from-green-900/20 to-transparent"
          : "bg-gradient-to-b from-green-50 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-black tracking-tight ${
                theme === "dark" ? "text-white" : "!text-gray-900"
              }`}
            >
              {title}
            </h1>
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "!text-gray-600"
              } font-medium`}
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onAction}
            className="flex items-center gap-2 rounded-2xl bg-green-500 p-3 font-black !text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.05] active:scale-[0.95] md:px-6 md:py-3"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">{actionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
