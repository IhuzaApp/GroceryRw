import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "../utils/translations";

type Language = "en" | "rw" | "fr" | "sw";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load purely for local state tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language | null;
      if (savedLanguage) setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }
  };

  const t = (key: string) => {
    return getTranslation("en", key); // We always just return the English raw text and let Google Translate handle the UI
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
