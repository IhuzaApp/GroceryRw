import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchTableSkeletonProps {
  rows?: number;
}

export function BatchTableSkeleton({ rows = 25 }: BatchTableSkeletonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  /* Glass surface style to match real table */
  const surfaceStyle = {
    background: isDark ? "rgba(23,23,23,0.9)" : "rgba(255,255,255,0.92)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: isDark 
      ? "0 8px 40px rgba(0,0,0,0.45)" 
      : "0 8px 40px rgba(0,0,0,0.07)",
  };

  const skeletonColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const headerBg = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)";

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="overflow-hidden rounded-2xl"
        style={surfaceStyle}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr 
                style={{ 
                  background: headerBg,
                  borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)"
                }}
              >
                {[
                  "Order", "Type", "Customer", "Shop", "Earnings", 
                  "Delivery Time", "Address", "Status", "Action"
                ].map((col, i) => (
                  <th 
                    key={i}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, idx) => (
                <tr 
                  key={idx}
                  style={{ 
                    borderBottom: isDark 
                      ? "1px solid rgba(255,255,255,0.035)" 
                      : "1px solid rgba(0,0,0,0.035)" 
                  }}
                >
                  {/* Order */}
                  <td className="px-5 py-3.5">
                    <div className="h-6 w-16 animate-pulse rounded-lg" style={{ background: skeletonColor }} />
                  </td>
                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <div className="h-6 w-20 animate-pulse rounded-full" style={{ background: skeletonColor }} />
                  </td>
                  {/* Customer */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 animate-pulse rounded-full" style={{ background: skeletonColor }} />
                      <div className="h-4 w-24 animate-pulse rounded" style={{ background: skeletonColor }} />
                    </div>
                  </td>
                  {/* Shop */}
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-28 animate-pulse rounded" style={{ background: skeletonColor }} />
                  </td>
                  {/* Earnings */}
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-16 animate-pulse rounded" style={{ background: skeletonColor }} />
                  </td>
                  {/* Delivery Time */}
                  <td className="px-5 py-3.5">
                    <div className="h-10 w-24 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
                  </td>
                  {/* Address */}
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-32 animate-pulse rounded" style={{ background: skeletonColor }} />
                  </td>
                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <div className="h-6 w-20 animate-pulse rounded-full" style={{ background: skeletonColor }} />
                  </td>
                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
                      <div className="h-8 w-8 animate-pulse rounded-lg" style={{ background: skeletonColor }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
