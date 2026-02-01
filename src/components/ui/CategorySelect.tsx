"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { PRODUCT_CATEGORIES_GROUPED } from "../../constants/productCategories";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  optional?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = "Select a category (optional)",
  className = "",
  optional = true,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLower = search.toLowerCase().trim();

  const filteredGroups = PRODUCT_CATEGORIES_GROUPED.map(
    ({ group, categories }) => {
      const matching = searchLower
        ? categories.filter((c) => c.toLowerCase().includes(searchLower))
        : [...categories];
      return { group, categories: matching };
    }
  ).filter((g) => g.categories.length > 0);

  const selectedLabel = value
    ? PRODUCT_CATEGORIES_GROUPED.flatMap((g) => g.categories).find(
        (c) => c === value
      ) ?? value
    : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) setSearch("");
        }}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
      >
        <span
          className={
            selectedLabel
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && optional && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
          <div className="sticky top-0 border-b border-gray-200 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredGroups.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No categories match &quot;{search}&quot;
              </p>
            ) : (
              filteredGroups.map(({ group, categories }) => (
                <div key={group} className="mb-2">
                  <div className="sticky top-0 bg-gray-50 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onChange(cat);
                          setIsOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          value === cat
                            ? "bg-green-100 font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
