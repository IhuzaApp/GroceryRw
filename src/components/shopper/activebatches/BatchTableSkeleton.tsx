import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchTableSkeletonProps {
  rows?: number;
}

export function BatchTableSkeleton({ rows = 25 }: BatchTableSkeletonProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`border-b text-left text-xs font-medium uppercase ${
              theme === "dark"
                ? "border-gray-700 bg-gray-900/50 text-gray-400"
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
          >
            <tr>
              <th className="w-12 px-6 py-3">
                <div
                  className={`h-4 w-4 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
              </th>
              <th className="px-6 py-3">Order No</th>
              <th className="px-6 py-3">Order Type</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Distance</th>
              <th className="px-6 py-3">Shop/Store</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Status</th>
              <th className="w-12 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-900"
            }`}
          >
            {Array.from({ length: rows }).map((_, index) => (
              <tr
                key={index}
                className={`border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                {/* Checkbox */}
                <td className="px-6 py-4">
                  <div
                    className={`h-4 w-4 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Order Number */}
                <td className="px-6 py-4">
                  <div
                    className={`h-4 w-16 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Order Type */}
                <td className="px-6 py-4">
                  <div
                    className={`h-6 w-20 rounded-full ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Name with Avatar */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}
                    />
                    <div
                      className={`h-4 w-24 rounded ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      } animate-pulse`}
                    />
                  </div>
                </td>

                {/* Distance */}
                <td className="px-6 py-4">
                  <div
                    className={`h-4 w-16 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Shop/Store */}
                <td className="px-6 py-4">
                  <div
                    className={`h-6 w-32 rounded-full ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Time */}
                <td className="px-6 py-4">
                  <div
                    className={`h-4 w-28 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Address */}
                <td className="px-6 py-4">
                  <div
                    className={`h-4 w-40 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div
                    className={`h-6 w-20 rounded-full ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div
                    className={`h-5 w-5 rounded ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } animate-pulse`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
