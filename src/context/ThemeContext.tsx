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
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    updateTheme(initialTheme);
  }, []);

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.setProperty('--bg-primary', '#1f2937');
      root.style.setProperty('--text-primary', '#f3f4f6');
      root.style.setProperty('--bg-secondary', '#111827');
      root.style.setProperty('--text-secondary', '#e5e7eb');
    } else {
      root.classList.remove("dark");
      root.style.setProperty('--bg-primary', '#f8fafc'); // Slightly darker than pure white
      root.style.setProperty('--text-primary', '#1f2937');
      root.style.setProperty('--bg-secondary', '#f1f5f9'); // Even slightly darker for secondary
      root.style.setProperty('--text-secondary', '#334155');
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
