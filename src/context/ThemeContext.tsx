import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "light" : "dark");

    setTheme(initialTheme);
    updateTheme(initialTheme);
  }, []);

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.setProperty("--bg-primary", "#000000ff"); // True black
      root.style.setProperty("--text-primary", "#ffffff");
      root.style.setProperty("--bg-secondary", "#171717"); // Dark gray for contrast
      root.style.setProperty("--text-secondary", "#a1a1aa");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--bg-primary", "#e6e5e5"); // Custom warm white
      root.style.setProperty("--text-primary", "#1f2937");
      root.style.setProperty("--bg-secondary", "#f5f5f5"); // Slightly lighter for contrast
      root.style.setProperty("--text-secondary", "#374151");
    }
    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
