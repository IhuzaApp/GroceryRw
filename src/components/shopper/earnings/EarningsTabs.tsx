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
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs: Tab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
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
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
    <div className="mb-6">
      <div
        className={`border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div
          ref={tabsRef}
          className="scrollbar-hide overflow-x-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <nav className="-mb-px flex min-w-full">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group relative flex items-center justify-center gap-2
                  whitespace-nowrap px-4 py-4 text-sm
                  font-medium transition-all duration-200
                  focus:outline-none focus:ring-2
                  focus:ring-green-500 focus:ring-offset-2 sm:px-6 lg:px-8
                  ${index === 0 ? "ml-0" : ""}
                  ${
                    activeTab === tab.id
                      ? theme === "dark"
                        ? "text-green-400"
                        : "text-green-600"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                {/* Icon */}
                <span
                  className={`
                  transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "scale-110"
                      : "scale-100 group-hover:scale-105"
                  }
                `}
                >
                  {tab.icon}
                </span>

                {/* Label - Hidden on small mobile, shown on larger screens */}
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Active indicator */}
                <span
                  className={`
                  absolute bottom-0 left-0 right-0 h-0.5
                  transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? theme === "dark"
                        ? "bg-green-400"
                        : "bg-green-600"
                      : "bg-transparent"
                  }
                `}
                />

                {/* Hover indicator */}
                {activeTab !== tab.id && (
                  <span
                    className={`
                    absolute bottom-0 left-0 right-0 h-0.5
                    opacity-0 transition-all duration-200 group-hover:opacity-100
                    ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}
                  `}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile: Show active tab label below tabs */}
      <div className="mt-3 text-center sm:hidden">
        <span
          className={`text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {tabs.find((t) => t.id === activeTab)?.label}
        </span>
      </div>
    </div>
  );
};

export default EarningsTabs;
