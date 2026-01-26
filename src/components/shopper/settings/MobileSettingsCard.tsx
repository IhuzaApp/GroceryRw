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
          ? "bg-white/5 border border-gray-800"
          : "bg-white border border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={`flex-shrink-0 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {icon}
          </div>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold mb-0.5 ${
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
        <div className="flex-shrink-0 ml-3">
          {type === "toggle" ? (
            <Toggle
              checked={value}
              onChange={onChange}
              size="md"
            />
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
