import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchCardSkeletonProps {
  count?: number;
}

export function BatchCardSkeleton({ count = 6 }: BatchCardSkeletonProps) {
  const { theme } = useTheme();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`rounded-xl border-2 p-4 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Batch Type Indicators */}
          <div className="mb-3 flex items-center justify-center gap-2">
            <div
              className={`h-6 w-24 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
            <div
              className={`h-6 w-20 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
          </div>

          {/* Header Section */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                } animate-pulse`}
              />
              <div className="space-y-2">
                <div
                  className={`h-4 w-24 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div
                  className={`h-3 w-16 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
              </div>
            </div>

            <div
              className={`rounded-lg p-3 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`h-5 w-16 rounded ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div
                  className={`h-3 w-20 rounded ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } animate-pulse`}
                />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <div
              className={`h-6 w-20 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
          </div>

          {/* Location Information */}
          <div className="mb-4 space-y-3">
            {/* Pickup Location */}
            <div
              className={`rounded-lg border p-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-700/30"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-6 rounded-full ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div className="flex-1 space-y-1">
                  <div
                    className={`h-3 w-24 rounded ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    } animate-pulse`}
                  />
                  <div
                    className={`h-3 w-40 rounded ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div
              className={`rounded-lg border p-3 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-700/30"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-6 w-6 rounded-full ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div className="flex-1 space-y-1">
                  <div
                    className={`h-3 w-24 rounded ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    } animate-pulse`}
                  />
                  <div
                    className={`h-3 w-full rounded ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`h-9 w-24 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
            <div
              className={`h-9 w-32 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            />
          </div>
        </div>
      ))}
    </>
  );
}
