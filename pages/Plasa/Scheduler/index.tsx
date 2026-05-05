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
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
              theme === "dark" ? "bg-emerald-500" : "bg-emerald-200"
            }`} />
            <div className={`absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${
              theme === "dark" ? "bg-blue-500" : "bg-blue-200"
            }`} />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
            {/* Header Section */}
            <div className="mb-6 md:mb-10">
              <nav className="flex mb-3 md:mb-4 overflow-x-auto no-scrollbar whitespace-nowrap" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] md:text-xs font-medium tracking-wide uppercase">
                  <li>
                    <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
                      Portal
                    </span>
                  </li>
                  <li className={theme === "dark" ? "text-gray-700" : "text-gray-300"}>/</li>
                  <li>
                    <span className="text-emerald-500">Scheduler</span>
                  </li>
                </ol>
              </nav>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1 md:mb-2 leading-tight">
                    Availability <span className="text-emerald-500">Scheduler</span>
                  </h1>
                  <p className={`text-sm md:text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Customize your peak hours and weekly availability.
                  </p>
                </div>
              </div>
            </div>

            <main>
              <div
                className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                  theme === "dark"
                    ? "border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40"
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
