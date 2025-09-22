import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface RestaurantSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  isSticky?: boolean;
}

export const RestaurantSearchBar: React.FC<RestaurantSearchBarProps> = ({
  placeholder = "Search dishes...",
  onSearch,
  className = "",
  isSticky = false
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const baseClasses = isSticky 
    ? "w-full rounded-xl py-2 pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
    : "w-full rounded-2xl border border-white/30 bg-white/20 py-4 pl-12 pr-4 text-sm text-white placeholder-white/80 transition-all duration-200 focus:border-white/50 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md shadow-xl";

  const themeClasses = isSticky 
    ? theme === 'dark'
      ? 'border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-400 focus:bg-gray-600 focus:ring-blue-400/20'
      : 'border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-blue-200'
    : '';

  const iconClasses = isSticky
    ? theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    : 'text-white drop-shadow-lg';

  const iconSize = isSticky ? 'h-4 w-4' : 'h-5 w-5';
  const iconPosition = isSticky ? 'pl-3' : 'pl-4';

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className={`absolute inset-y-0 left-0 flex items-center ${iconPosition} z-20`}>
            <svg 
              className={`${iconSize} ${iconClasses}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className={`${baseClasses} ${themeClasses}`}
            style={{ textAlign: 'left' }}
          />
        </div>
      </form>
    </div>
  );
};

export default RestaurantSearchBar;
