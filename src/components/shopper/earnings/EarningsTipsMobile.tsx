import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { authenticatedFetch } from "@lib/authenticatedFetch";

interface PeakHour {
  day: string;
  timeRange: string;
  orderCount: number;
  avgEarnings: number;
}

interface StorePerformance {
  store: string;
  orderCount: number;
  totalEarnings: number;
  avgEarnings: number;
}

interface EarningsTips {
  peakHours: PeakHour[];
  topStores: StorePerformance[];
  batchOrderPercentage: number;
  totalOrders: number;
  tips: string[];
}

const EarningsTipsMobile: React.FC = () => {
  const { theme } = useTheme();
  const [tipsData, setTipsData] = useState<EarningsTips | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch("/api/shopper/earningsTips");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTipsData(data.tips);
          }
        }
      } catch (error) {
        console.error("Error fetching earnings tips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-6 h-6 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse`}></div>
          <div className={`h-4 w-24 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded animate-pulse`}></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-lg p-3 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} animate-pulse`}>
              <div className={`h-3 w-full mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
              <div className={`h-3 w-3/4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tipsData) {
    return (
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-3">
          <div className={`p-1 rounded-lg ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Earnings Tips
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center px-4">
          <div className={`${theme === "dark" ? "text-gray-400" : "text-gray-400"} mb-2`}>💡</div>
          <p className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Unable to load tips</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <div className={`p-1 rounded-lg ${theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Earnings Tips
        </h3>
      </div>

      {/* Tips List */}
      <div className="space-y-2">
        {tipsData.tips.slice(0, 4).map((tip, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 ${
              theme === "dark" 
                ? "bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30" 
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
            } shadow-sm`}
          >
            <div className="flex items-start space-x-2">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                theme === "dark" ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
              }`}>
                {index + 1}
              </div>
              <p className={`text-xs leading-relaxed ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}>
                {tip}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Peak Hours Summary */}
      {tipsData.peakHours.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1 rounded-lg ${theme === "dark" ? "bg-green-500/20" : "bg-green-100"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-green-500">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <h4 className={`text-xs font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
              Peak Hours
            </h4>
          </div>
          <div className="space-y-1">
            {tipsData.peakHours.slice(0, 2).map((peak, index) => (
              <div
                key={index}
                className={`rounded-lg p-2 ${
                  theme === "dark" 
                    ? "bg-green-900/20 border border-green-500/30" 
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    theme === "dark" ? "text-green-300" : "text-green-700"
                  }`}>
                    {peak.day} {peak.timeRange}
                  </span>
                  <span className={`text-xs font-bold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}>
                    {peak.orderCount} orders
                  </span>
                </div>
                <div className={`text-xs ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}>
                  Avg: RWF {peak.avgEarnings}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stores Summary */}
      {tipsData.topStores.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1 rounded-lg ${theme === "dark" ? "bg-purple-500/20" : "bg-purple-100"}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-purple-500">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h4 className={`text-xs font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
              Top Stores
            </h4>
          </div>
          <div className="space-y-1">
            {tipsData.topStores.slice(0, 2).map((store, index) => (
              <div
                key={index}
                className={`rounded-lg p-2 ${
                  theme === "dark" 
                    ? "bg-purple-900/20 border border-purple-500/30" 
                    : "bg-purple-50 border border-purple-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium truncate ${
                    theme === "dark" ? "text-purple-300" : "text-purple-700"
                  }`}>
                    {store.store}
                  </span>
                  <span className={`text-xs font-bold ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}>
                    RWF {Math.round(store.avgEarnings)}
                  </span>
                </div>
                <div className={`text-xs ${
                  theme === "dark" ? "text-purple-400" : "text-purple-600"
                }`}>
                  {store.orderCount} orders
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View More Button */}
      {tipsData.tips.length > 4 && (
        <div className="mt-3 text-center">
          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
            theme === "dark" ? "bg-gray-800/50 text-gray-400" : "bg-gray-100 text-gray-600"
          }`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>+{tipsData.tips.length - 4} more tips</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTipsMobile;
