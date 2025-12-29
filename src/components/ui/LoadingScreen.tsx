import React, { useState, useEffect } from "react";

interface LoadingScreenProps {
  loadingProgress?: number;
  loadingMessage?: string;
  showProgressBar?: boolean;
  showBouncingDots?: boolean;
  customMessages?: string[];
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  loadingProgress: externalProgress,
  loadingMessage: externalMessage,
  showProgressBar = true,
  showBouncingDots = true,
  customMessages = [
    "Initializing...",
    "Loading user data...",
    "Setting up your dashboard...",
    "Almost ready...",
    "Finalizing...",
  ],
  onComplete,
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(customMessages[0]);

  // Use external progress if provided, otherwise simulate it
  useEffect(() => {
    if (externalProgress !== undefined) {
      setLoadingProgress(externalProgress);
      return;
    }

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        onComplete?.();
      }

      setLoadingProgress(progress);

      // Update message based on progress
      const messageIndex = Math.min(
        Math.floor(progress / 25),
        customMessages.length - 1
      );
      setLoadingMessage(customMessages[messageIndex]);
    }, 800);

    return () => clearInterval(interval);
  }, [externalProgress, customMessages, onComplete]);

  // Use external message if provided
  useEffect(() => {
    if (externalMessage) {
      setLoadingMessage(externalMessage);
    }
  }, [externalMessage]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-green-200/20 dark:bg-green-800/20"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-300/20 dark:bg-green-700/20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Logo with Animation */}
        <div className="mb-6 transform transition-all duration-500 sm:mb-8">
          <img
            src="/assets/logos/PlasIcon.png"
            alt="Plas Logo"
            className="h-16 w-16 drop-shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24"
          />
        </div>

        {/* Loading Container */}
        <div className="mb-6 flex w-full max-w-md flex-col items-center space-y-4 sm:mb-8 sm:space-y-6">
          {/* Animated Spinner */}
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 dark:border-green-800 sm:h-16 sm:w-16"></div>
            <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-green-500 sm:h-16 sm:w-16"></div>
          </div>

          {/* Text Content */}
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white sm:mb-3 sm:text-2xl">
              Setting up your experience
            </h2>
            <p className="animate-pulse text-sm text-gray-600 dark:text-gray-300 sm:text-base md:text-lg">
              {loadingMessage}
            </p>
          </div>

          {/* Progress Bar Container */}
          {showProgressBar && (
            <div className="w-full max-w-xs sm:max-w-sm md:w-80">
              <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <span>Loading</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700 sm:h-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Dots */}
        {showBouncingDots && (
          <div className="flex space-x-2">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-500"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-500"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-green-500"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
