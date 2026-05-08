"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";
import WorkScheduleTab from "../../../src/components/shopper/settings/WorkScheduleTab";
import { AuthGuard } from "../../../src/components/AuthGuard";

export default function SchedulerPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
      <ShopperLayout>
        <div
          className={`min-h-screen transition-colors duration-500 ${
            theme === "dark"
              ? "bg-[#0A0A0A] text-white"
              : "bg-[#FDFDFD] text-gray-900"
          }`}
        >
          {/* Decorative background element */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div
              className={`absolute -right-[10%] -top-[10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px] ${
                theme === "dark" ? "bg-emerald-500" : "bg-emerald-200"
              }`}
            />
            <div
              className={`absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px] ${
                theme === "dark" ? "bg-blue-500" : "bg-blue-200"
              }`}
            />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
            {/* Header Section */}
            <div className="mb-6 md:mb-10">
              <nav
                className="no-scrollbar mb-3 flex overflow-x-auto whitespace-nowrap md:mb-4"
                aria-label="Breadcrumb"
              >
                <ol className="flex items-center space-x-2 text-[10px] font-medium uppercase tracking-wide md:text-xs">
                  <li>
                    <span
                      className={
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }
                    >
                      Portal
                    </span>
                  </li>
                  <li
                    className={
                      theme === "dark" ? "text-gray-700" : "text-gray-300"
                    }
                  >
                    /
                  </li>
                  <li>
                    <span className="text-emerald-500">Scheduler</span>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end md:gap-4">
                <div>
                  <h1 className="mb-1 text-2xl font-black leading-tight tracking-tight md:mb-2 md:text-4xl">
                    Availability{" "}
                    <span className="text-emerald-500">Scheduler</span>
                  </h1>
                  <p
                    className={`text-sm md:text-lg ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Customize your peak hours and weekly availability.
                  </p>
                </div>
              </div>
            </div>

            <main>
              <div
                className={`overflow-hidden rounded-3xl border transition-all duration-500 ${
                  theme === "dark"
                    ? "border-white/5 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl"
                    : "border-black/5 bg-white shadow-xl shadow-gray-200/50"
                }`}
              >
                <WorkScheduleTab />
              </div>
            </main>
          </div>
        </div>
      </ShopperLayout>
    </AuthGuard>
  );
}
