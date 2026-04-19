import React, { useRef, useEffect } from "react";
import { useTheme } from "@context/ThemeContext";

interface Tab {
  id: string;
  label: string;
  mobileLabel?: string;
  icon: React.ReactNode;
}

interface EarningsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const EarningsTabs: React.FC<EarningsTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs: Tab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "breakdown",
      label: "Breakdown",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "recent-orders",
      label: "Orders",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      id: "payments",
      label: "Payments",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "achievements",
      label: "Badges",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
  ];

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabsRef.current) {
      const activeButton = tabsRef.current.querySelector(
        `[data-tab-id="${activeTab}"]`
      ) as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="mb-8 overflow-hidden">
      <div
        ref={tabsRef}
        className={`scrollbar-hide flex items-center gap-2 overflow-x-auto rounded-[2rem] p-1.5 backdrop-blur-2xl transition-all duration-300 ${
          isDark
            ? "border border-white/10 bg-white/5"
            : "border border-black/5 bg-black/5 shadow-sm"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex flex-1 items-center justify-center gap-2.5
                whitespace-nowrap rounded-[1.5rem] px-5 py-3 text-sm
                font-bold transition-all duration-500
                focus:outline-none
                ${
                  isActive
                    ? isDark
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]"
                      : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : isDark
                    ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
                }
              `}
            >
              {/* Icon */}
              <span
                className={`transition-all duration-300 ${
                  isActive ? "scale-110" : "scale-100 group-hover:scale-110"
                }`}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span className="relative z-10">{tab.label}</span>

              {/* Animated Glow on Active */}
              {isActive && (
                <span className="absolute inset-0 animate-pulse rounded-[1.5rem] bg-white opacity-10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsTabs;
