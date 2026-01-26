import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Toggle } from "rsuite";

interface MobileSettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  type?: "toggle" | "navigation";
  value?: boolean;
  onChange?: (value: boolean) => void;
  onNavigate?: () => void;
}

export default function MobileSettingsCard({
  icon,
  title,
  description,
  type = "toggle",
  value = false,
  onChange,
  onNavigate,
}: MobileSettingsCardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`mb-3 rounded-xl p-4 shadow-sm transition-all ${
        theme === "dark"
          ? "border border-gray-800 bg-white/5"
          : "border border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Icon */}
          <div
            className={`flex-shrink-0 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {icon}
          </div>

          {/* Title and Description */}
          <div className="min-w-0 flex-1">
            <h3
              className={`mb-0.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
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

        {/* Interactive Element */}
        <div className="ml-3 flex-shrink-0">
          {type === "toggle" ? (
            <Toggle checked={value} onChange={onChange} size="md" />
          ) : (
            <button
              onClick={onNavigate}
              className={`p-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-400"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
