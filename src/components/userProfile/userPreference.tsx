import React, { useState } from "react";
import { Button, SelectPicker, Toggle } from "rsuite";
import toast from "react-hot-toast";
import { useTheme } from "@context/ThemeContext";

export default function UserPreference() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [hasChanges, setHasChanges] = useState(false);

  const languages = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "Spanish", value: "es" },
    { label: "German", value: "de" },
    { label: "Chinese", value: "zh" },
    { label: "Arabic", value: "ar" },
  ];

  // Load language preference on mount
  React.useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    try {
      const newTheme = checked ? "dark" : "light";
      setTheme(newTheme);
      setHasChanges(true);
    } catch (error) {
      toast.error("Failed to update theme");
    }
  };

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      try {
        setLanguage(value);
        localStorage.setItem("language", value);
        setHasChanges(true);
      } catch (error) {
        toast.error("Failed to update language");
      }
    }
  };

  const savePreferences = async () => {
    try {
      // Here you would typically also save to backend
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ theme, language })
      // });

      setHasChanges(false);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div className="transition-colors duration-200">
      <h3 className="mb-4 text-lg font-bold dark:text-white">
        Display Settings
      </h3>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium dark:text-white">Dark Mode</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <Toggle
              checked={theme === "dark"}
              onChange={handleThemeChange}
              size="md"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium dark:text-white">Language</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred language
              </p>
            </div>
            <SelectPicker
              data={languages}
              value={language}
              onChange={handleLanguageChange}
              cleanable={false}
              searchable={false}
              className="w-40 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          appearance="primary"
          color="green"
          onClick={savePreferences}
          disabled={!hasChanges}
          className="dark:bg-green-600 dark:text-white"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
