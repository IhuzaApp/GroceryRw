import React from "react";
import { Message } from "rsuite";

interface TrackingModeIndicatorProps {
  isActivelyTracking: boolean;
  setIsActivelyTracking: (tracking: boolean) => void;
  theme: "light" | "dark";
  startLocationTracking: () => void;
  watchIdRef: React.MutableRefObject<number | null>;
  reduceToastDuplicates: (type: string, content: React.ReactNode, options?: any) => void;
}

const TrackingModeIndicator: React.FC<TrackingModeIndicatorProps> = ({
  isActivelyTracking,
  setIsActivelyTracking,
  theme,
  startLocationTracking,
  watchIdRef,
  reduceToastDuplicates,
}) => {
  return (
    <div
      className={`absolute bottom-20 left-1/2 z-[1000] hidden -translate-x-1/2 transform rounded-xl px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-lg transition-all duration-200 md:block ${
        theme === "dark"
          ? "border border-gray-700/50 bg-gray-800/90 text-gray-100"
          : "border border-gray-200/50 bg-white/90 text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              isActivelyTracking
                ? theme === "dark"
                  ? "animate-pulse bg-green-400"
                  : "animate-pulse bg-green-500"
                : theme === "dark"
                ? "bg-blue-400"
                : "bg-blue-500"
            }`}
          ></span>
          <span className="font-semibold">
            {isActivelyTracking ? "Live Tracking" : "Static Location"}
          </span>
        </div>

        <button
          onClick={() => {
            if (isActivelyTracking) {
              setIsActivelyTracking(false);
              if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
              }
              reduceToastDuplicates(
                "tracking-disabled",
                <Message
                  showIcon
                  type="info"
                  header="Tracking Disabled"
                  className={theme === "dark" ? "rs-message-dark" : ""}
                >
                  Using static location. Use the refresh button to update.
                </Message>,
                { placement: "topEnd", duration: 3000 }
              );
            } else {
              startLocationTracking();
              reduceToastDuplicates(
                "tracking-enabled",
                <Message
                  showIcon
                  type="success"
                  header="Tracking Enabled"
                  className={theme === "dark" ? "rs-message-dark" : ""}
                >
                  Your location will update automatically as you move.
                </Message>,
                { placement: "topEnd", duration: 3000 }
              );
            }
          }}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
            isActivelyTracking
              ? theme === "dark"
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-red-100 text-red-600 hover:bg-red-200"
              : theme === "dark"
              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
              : "bg-green-100 text-green-600 hover:bg-green-200"
          }`}
        >
          {isActivelyTracking ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
};

export default TrackingModeIndicator;
