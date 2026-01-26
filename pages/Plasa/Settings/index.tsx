"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";
import GeneralTab from "../../../src/components/shopper/settings/GeneralTab";
import WorkScheduleTab from "../../../src/components/shopper/settings/WorkScheduleTab";
import PaymentTab from "../../../src/components/shopper/settings/PaymentTab";
import NotificationTab from "../../../src/components/shopper/settings/NotificationTab";
import { AuthGuard } from "../../../src/components/AuthGuard";

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  category: "account" | "workspace";
}

function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  // Memoize the tab change handler
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab);
      // Update URL without page reload
      router.push(`/Plasa/Settings?tab=${newTab}`, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Define navigation items
  const navItems: NavItem[] = [
    {
      key: "profile",
      label: "My Profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      category: "account",
    },
    {
      key: "general",
      label: "General",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      category: "account",
    },
    {
      key: "preferences",
      label: "Preferences",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      ),
      category: "account",
    },
    {
      key: "applications",
      label: "Applications",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
      category: "account",
    },
    {
      key: "schedule",
      label: "Work Schedule",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      category: "workspace",
    },
    {
      key: "payment",
      label: "Payment Info",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <line x1="1" y1="4" x2="23" y2="4" />
          <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      ),
      category: "workspace",
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      category: "workspace",
    },
    {
      key: "security",
      label: "Security",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      category: "workspace",
    },
  ];

  // Define tabs configuration
  const tabs = [
    {
      key: "general",
      component: <GeneralTab />,
    },
    {
      key: "schedule",
      component: <WorkScheduleTab />,
    },
    {
      key: "payment",
      component: <PaymentTab />,
    },
    {
      key: "notifications",
      component: <NotificationTab />,
    },
    {
      key: "security",
      component: (
        <div className="p-8">
          <h3
            className={`mb-4 text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Security Settings
          </h3>
          <p
            className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
          >
            Security settings coming soon...
          </p>
        </div>
      ),
    },
    {
      key: "profile",
      component: (
        <div className="p-8">
          <h3
            className={`mb-4 text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            My Profile
          </h3>
          <p
            className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
          >
            Profile settings coming soon...
          </p>
        </div>
      ),
    },
    {
      key: "preferences",
      component: (
        <div className="p-8">
          <h3
            className={`mb-4 text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Preferences
          </h3>
          <p
            className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
          >
            Preferences settings coming soon...
          </p>
        </div>
      ),
    },
    {
      key: "applications",
      component: (
        <div className="p-8">
          <h3
            className={`mb-4 text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Applications
          </h3>
          <p
            className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
          >
            Applications settings coming soon...
          </p>
        </div>
      ),
    },
  ];

  // Effect to sync URL with active tab
  React.useEffect(() => {
    const tab = router.query.tab as string;
    const validTabs = [
      "general",
      "schedule",
      "payment",
      "notifications",
      "security",
      "profile",
      "preferences",
      "applications",
    ];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  const accountItems = navItems.filter((item) => item.category === "account");
  const workspaceItems = navItems.filter(
    (item) => item.category === "workspace"
  );

  const activeTabLabel = navItems.find((item) => item.key === activeTab)?.label;

  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
      <ShopperLayout>
        <div
          className={`min-h-screen ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Settings
                    </span>
                  </li>
                  <li>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </li>
                  <li>
                    <span
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {activeTabLabel || "General"}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            <div className="flex gap-8">
              {/* Left Sidebar Navigation */}
              <aside className="w-64 flex-shrink-0">
                <nav className="space-y-8">
                  {/* ACCOUNT Section */}
                  <div>
                    <h3
                      className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      ACCOUNT
                    </h3>
                    <ul className="space-y-1">
                      {accountItems.map((item) => (
                        <li key={item.key}>
                          <button
                            onClick={() => handleTabChange(item.key)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              activeTab === item.key
                                ? theme === "dark"
                                  ? "bg-gray-800 text-white"
                                  : "bg-gray-100 text-gray-900"
                                : theme === "dark"
                                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WORKSPACE Section */}
                  <div>
                    <h3
                      className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      WORKSPACE
                    </h3>
                    <ul className="space-y-1">
                      {workspaceItems.map((item) => (
                        <li key={item.key}>
                          <button
                            onClick={() => handleTabChange(item.key)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              activeTab === item.key
                                ? theme === "dark"
                                  ? "bg-gray-800 text-white"
                                  : "bg-gray-100 text-gray-900"
                                : theme === "dark"
                                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1">
                <div
                  className={`rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border`}
                >
                  {tabs.find((tab) => tab.key === activeTab)?.component}
                </div>
              </main>
            </div>
          </div>
        </div>
      </ShopperLayout>
    </AuthGuard>
  );
}

export default SettingsPage;
