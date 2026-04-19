"use client";

import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface DeliveryNotesSectionProps {
  order: any;
  activeTab: string;
}

export default function DeliveryNotesSection({
  order,
  activeTab,
}: DeliveryNotesSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const note = order.deliveryNotes || order.deliveryNote;
  if (!note) return null;

  return (
    <div
      className={`${
        activeTab === "details" ? "block" : "hidden sm:block"
      } mt-6 px-4 sm:px-0`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`h-8 w-1.5 rounded-full ${
            isDark ? "bg-amber-500" : "bg-amber-600"
          }`}
        />
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white sm:text-lg">
          Delivery Notes
        </h2>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
          isDark
            ? "border-amber-500/20 bg-amber-500/10"
            : "border-amber-100 bg-amber-50"
        }`}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex gap-4 p-5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-amber-500/20 text-amber-400"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className={`text-sm font-bold leading-relaxed ${
              isDark ? "text-amber-200" : "text-amber-900"
            }`}
          >
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}
