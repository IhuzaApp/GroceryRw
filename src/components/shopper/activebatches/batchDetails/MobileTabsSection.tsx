"use client";

interface MobileTabsSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileTabsSection({
  activeTab,
  onTabChange,
}: MobileTabsSectionProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 sm:hidden">
      <div className="flex">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "items"
              ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
          onClick={() => onTabChange("items")}
        >
          Items
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "details"
              ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
          onClick={() => onTabChange("details")}
        >
          Other Details
        </button>
      </div>
    </div>
  );
}
