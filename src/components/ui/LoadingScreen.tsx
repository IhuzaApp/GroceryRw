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
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-green-200/20 dark:bg-green-800/20"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-300/20 dark:bg-green-700/20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Animation */}
        <div className="mb-8 transform transition-all duration-500 hover:scale-105">
          <img
            src="/assets/logos/PlasLogo.svg"
            alt="Plasa Logo"
            className="h-20 w-auto drop-shadow-lg"
          />
        </div>

        {/* Loading Container */}
        <div className="mb-8 flex flex-col items-center space-y-6">
          {/* Animated Spinner */}
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-200 dark:border-green-800"></div>
            <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-green-500"></div>
          </div>

          {/* Text Content */}
          <div className="text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">
              Setting up your experience
            </h2>
            <p className="animate-pulse text-lg text-gray-600 dark:text-gray-300">
              {loadingMessage}
            </p>
          </div>

          {/* Progress Bar Container */}
          {showProgressBar && (
            <div className="w-80">
              <div className="mb-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Loading</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
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
