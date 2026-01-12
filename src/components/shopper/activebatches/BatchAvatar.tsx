import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

export function BatchAvatar({ name, imageUrl, size = "md" }: BatchAvatarProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitial = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getColorFromName(
        name
      )} flex items-center justify-center rounded-full font-semibold text-white`}
    >
      {getInitial(name)}
    </div>
  );
}
