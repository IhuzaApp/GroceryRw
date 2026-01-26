import React from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";
import MobileSettingsCard from "./MobileSettingsCard";

interface MobileSettingsLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function MobileSettingsLayout({
  title,
  description,
  children,
}: MobileSettingsLayoutProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="px-4 py-4">
          {/* Back Button and Title */}
          <div className="mb-3 flex items-center gap-4">
            <button
              onClick={handleBack}
              className={`-ml-2 rounded-lg p-2 transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">{children}</div>
    </div>
  );
}
