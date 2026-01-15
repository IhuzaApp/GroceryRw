import React from "react";

interface RefreshLocationButtonProps {
  refreshLocation: () => void;
  isRefreshingLocation: boolean;
  theme: "light" | "dark";
}

const RefreshLocationButton: React.FC<RefreshLocationButtonProps> = ({
  refreshLocation,
  isRefreshingLocation,
  theme,
}) => {
  return (
    <button
      onClick={refreshLocation}
      disabled={isRefreshingLocation}
      className={`absolute bottom-36 right-5 z-[1001] h-10 w-10 rounded-xl shadow-lg backdrop-blur-lg transition-all duration-200 hover:shadow-xl active:scale-95 md:bottom-5 md:h-10 md:w-10 ${
        theme === "dark"
          ? isRefreshingLocation
            ? "bg-gradient-to-r from-green-700 to-green-800 text-gray-300 shadow-green-700/30"
            : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40"
          : isRefreshingLocation
          ? "bg-gradient-to-r from-green-300 to-green-400 text-white shadow-green-300/30"
          : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40"
      }`}
      title="Refresh location"
    >
      <div className="flex h-full w-full items-center justify-center p-2">
        {isRefreshingLocation ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 4.992h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 4.992h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

export default RefreshLocationButton;
