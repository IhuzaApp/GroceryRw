import React, { useState } from "react";
import { Button, SelectPicker, Toggle } from "rsuite";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function UserPreference() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      setHasChanges(false);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Clear any custom cookies that might interfere
      document.cookie = "role_changed=; Path=/; Max-Age=0; HttpOnly";
      document.cookie = "new_role=; Path=/; Max-Age=0; HttpOnly";
      document.cookie = "return_to=; Path=/; Max-Age=0; HttpOnly";
      
      // Use NextAuth signOut with redirect: false to handle redirect manually
      await signOut({ redirect: false });
      
      // Manual redirect to avoid the custom signout route
      window.location.href = "/Auth/Login";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
      // Fallback: force redirect even if signOut fails
      window.location.href = "/Auth/Login";
    } finally {
      setIsLoggingOut(false);
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

      {/* Logout Section */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold dark:text-white">
          Account Actions
        </h3>
        
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm transition-colors duration-200 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-red-800 dark:text-red-200">Sign Out</span>
              <p className="text-sm text-red-600 dark:text-red-300">
                Sign out of your account and return to the login page
              </p>
            </div>
            <Button
              appearance="primary"
              color="red"
              onClick={handleLogout}
              loading={isLoggingOut}
              className="dark:bg-red-600 dark:text-white"
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}