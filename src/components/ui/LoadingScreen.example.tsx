import React, { useState } from "react";
import LoadingScreen from "./LoadingScreen";

// Example usage of LoadingScreen component
const LoadingScreenExample = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartLoading = () => {
    setShowLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowLoading(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (showLoading) {
    return (
      <LoadingScreen
        loadingProgress={progress}
        loadingMessage={`Loading... ${progress}%`}
        onComplete={() => console.log("Loading complete!")}
      />
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={handleStartLoading}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Start Loading Example
      </button>
    </div>
  );
};

export default LoadingScreenExample;
