import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "../utils/translations";

type Language = "en" | "rw";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string; // Translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const updateLanguage = (newLanguage: Language) => {
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLanguage;
    }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

  useEffect(() => {
    // Load language from localStorage on mount
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language | null;
      const initialLanguage = savedLanguage || "en"; // Default to English

      setLanguage(initialLanguage);
      updateLanguage(initialLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    updateLanguage(newLanguage);
    
    // Reload the page to apply language changes throughout the app
    // This ensures all components re-render with the new language
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleLanguageChange, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
