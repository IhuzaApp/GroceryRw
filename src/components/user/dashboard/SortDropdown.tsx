import React, { useState, useRef, useEffect } from "react";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  onNearbyClick: () => void;
  isNearbyActive: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
  onNearbyClick,
  isNearbyActive,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to display sort option names
  const getSortDisplayName = (key: string) => {
    switch (key) {
      case "name":
        return "Name";
      case "distance":
        return "Distance";
      case "rating":
        return "Rating";
      case "reviews":
        return "Reviews";
      case "delivery_time":
        return "Delivery Time";
      default:
        return key;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortOptions = [
    { value: "name", label: "Name", icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { value: "distance", label: "Distance", icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    )},
    { value: "rating", label: "Rating", icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )},
    { value: "reviews", label: "Reviews", icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    )},
    { value: "delivery_time", label: "Delivery Time", icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    )},
  ];

  const handleSelect = (value: string) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sort Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-750"
        >
          <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>Sort by {getSortDisplayName(sortBy)}</span>
          <svg 
            className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-200 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                  }`}
                >
                  <span className={`${sortBy === option.value ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                    {option.icon}
                  </span>
                  <span>Sort by {option.label}</span>
                  {sortBy === option.value && (
                    <svg className="ml-auto h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nearby Button */}
      <button
        onClick={onNearbyClick}
        className={`group flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          isNearbyActive
            ? "border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-600/40 dark:from-green-600 dark:to-green-700 dark:shadow-green-600/20 dark:hover:from-green-700 dark:hover:to-green-800"
            : "border-gray-200 bg-white text-gray-700 shadow-gray-200/50 hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:shadow-gray-900/50 dark:hover:border-gray-600 dark:hover:bg-gray-750"
        }`}
      >
        <svg 
          className={`h-4 w-4 transition-transform duration-300 ${isNearbyActive ? "text-white" : "text-gray-600 dark:text-gray-300"}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span>{isNearbyActive ? "Nearby Live" : "Nearby"}</span>
        {isNearbyActive && (
          <span className="ml-1.5 flex h-2 w-2 animate-pulse rounded-full bg-white"></span>
        )}
      </button>
    </div>
  );
};

export default SortDropdown;
