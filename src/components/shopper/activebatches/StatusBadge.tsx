import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { theme } = useTheme();

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    const lightConfigs = {
      scheduled: { bg: "bg-blue-100", text: "text-blue-800", label: "Scheduled" },
      unscheduled: { bg: "bg-gray-100", text: "text-gray-800", label: "Unscheduled" },
      accepted: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Accepted" },
      picked: { bg: "bg-orange-100", text: "text-orange-800", label: "Picked Up" },
      shopping: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Shopping" },
      on_the_way: { bg: "bg-purple-100", text: "text-purple-800", label: "On The Way" },
      at_customer: { bg: "bg-indigo-100", text: "text-indigo-800", label: "At Customer" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
    };

    const darkConfigs = {
      scheduled: { bg: "bg-blue-900/20", text: "text-blue-300", label: "Scheduled" },
      unscheduled: { bg: "bg-gray-700/50", text: "text-gray-300", label: "Unscheduled" },
      accepted: { bg: "bg-emerald-900/20", text: "text-emerald-300", label: "Accepted" },
      picked: { bg: "bg-orange-900/20", text: "text-orange-300", label: "Picked Up" },
      shopping: { bg: "bg-yellow-900/20", text: "text-yellow-300", label: "Shopping" },
      on_the_way: { bg: "bg-purple-900/20", text: "text-purple-300", label: "On The Way" },
      at_customer: { bg: "bg-indigo-900/20", text: "text-indigo-300", label: "At Customer" },
      delivered: { bg: "bg-green-900/20", text: "text-green-300", label: "Delivered" },
    };

    const configs = theme === "dark" ? darkConfigs : lightConfigs;
    return configs[normalizedStatus as keyof typeof configs] || {
      bg: theme === "dark" ? "bg-gray-700/50" : "bg-gray-100",
      text: theme === "dark" ? "text-gray-300" : "text-gray-700",
      label: status,
    };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.text}`}
    >
      {config.label}
    </span>
  );
}
