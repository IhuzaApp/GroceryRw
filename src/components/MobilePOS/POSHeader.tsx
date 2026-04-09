import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";

interface POSHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  children,
  className = "",
}) => {
  const router = useRouter();

  return (
    <div
      className={`sticky top-0 z-40 w-full border-b border-gray-200 
        bg-white/90 shadow-sm backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="rounded-full bg-gray-100 p-2.5 text-gray-700 
              transition hover:bg-gray-200 active:scale-95 
              dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" /> // Spacer to balance layout
        )}

        {children ? (
          children
        ) : (
          <div className="flex-1 text-center">
            <h1 className="text-lg font-black leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-xs font-medium uppercase text-green-500">
                {subtitle}
              </span>
            )}
          </div>
        )}

        {rightAction ? (
          <div className="flex items-center">{rightAction}</div>
        ) : (
          <div className="w-10" /> // Spacer to balance layout
        )}
      </div>
    </div>
  );
};
