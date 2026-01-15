import React from "react";

interface GoLiveButtonProps {
  isOnline: boolean;
  theme: "light" | "dark";
  handleGoLive: () => void;
}

const GoLiveButton: React.FC<GoLiveButtonProps> = ({
  isOnline,
  theme,
  handleGoLive,
}) => {
  return (
    <button
      onClick={handleGoLive}
      className={`absolute bottom-5 left-1/2 z-[1000] hidden w-[90%] -translate-x-1/2 transform rounded-xl px-6 py-3 font-bold shadow-lg backdrop-blur-lg transition-all duration-200 hover:shadow-xl active:scale-95 md:block md:w-auto ${
        isOnline
          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30 hover:shadow-red-500/40"
          : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/40"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Go Offline
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Start Plasa
          </>
        )}
      </span>
    </button>
  );
};

export default GoLiveButton;
