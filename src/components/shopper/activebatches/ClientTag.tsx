import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface ClientTagProps {
  name: string;
}

export function ClientTag({ name }: ClientTagProps) {
  const { theme } = useTheme();

  const getInitial = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const getColorFromName = (name: string) => {
    const colors = [
      { bg: "bg-pink-100", text: "text-pink-800", initial: "bg-pink-500" },
      { bg: "bg-purple-100", text: "text-purple-800", initial: "bg-purple-500" },
      { bg: "bg-blue-100", text: "text-blue-800", initial: "bg-blue-500" },
      { bg: "bg-green-100", text: "text-green-800", initial: "bg-green-500" },
      { bg: "bg-yellow-100", text: "text-yellow-800", initial: "bg-yellow-500" },
      { bg: "bg-red-100", text: "text-red-800", initial: "bg-red-500" },
      { bg: "bg-indigo-100", text: "text-indigo-800", initial: "bg-indigo-500" },
      { bg: "bg-teal-100", text: "text-teal-800", initial: "bg-teal-500" },
    ];
    
    const darkColors = [
      { bg: "bg-pink-900/20", text: "text-pink-300", initial: "bg-pink-600" },
      { bg: "bg-purple-900/20", text: "text-purple-300", initial: "bg-purple-600" },
      { bg: "bg-blue-900/20", text: "text-blue-300", initial: "bg-blue-600" },
      { bg: "bg-green-900/20", text: "text-green-300", initial: "bg-green-600" },
      { bg: "bg-yellow-900/20", text: "text-yellow-300", initial: "bg-yellow-600" },
      { bg: "bg-red-900/20", text: "text-red-300", initial: "bg-red-600" },
      { bg: "bg-indigo-900/20", text: "text-indigo-300", initial: "bg-indigo-600" },
      { bg: "bg-teal-900/20", text: "text-teal-300", initial: "bg-teal-600" },
    ];

    const colorSet = theme === "dark" ? darkColors : colors;
    const index = name?.charCodeAt(0) % colorSet.length || 0;
    return colorSet[index];
  };

  const colors = getColorFromName(name);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} px-2.5 py-1 text-xs font-medium ${colors.text}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${colors.initial} text-[10px] font-bold text-white`}
      >
        {getInitial(name)}
      </span>
      <span className="truncate">{name}</span>
    </div>
  );
}
