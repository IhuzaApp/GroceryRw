import React, { useState, useEffect } from "react";
import { Button, Input, SelectPicker, Toggle } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

export default function UserPreference() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    language: "en",
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);

  // Load user preferences on component mount
  useEffect(() => {
    // You can add logic here to load saved preferences from the backend
    // For now, we'll use default values
  }, []);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Add API call to save preferences
      // await fetch('/api/user/preferences', { ... });
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Theme Settings
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <Toggle
            checked={theme === "dark"}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Push Notifications
            </span>
            <Toggle
              checked={preferences.notifications}
              onChange={(checked) =>
                handlePreferenceChange("notifications", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Email Updates
            </span>
            <Toggle
              checked={preferences.emailUpdates}
              onChange={(checked) =>
                handlePreferenceChange("emailUpdates", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              SMS Updates
            </span>
            <Toggle
              checked={preferences.smsUpdates}
              onChange={(checked) =>
                handlePreferenceChange("smsUpdates", checked)
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Language & Currency
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Language
            </label>
            <SelectPicker
              data={[
                { label: "English", value: "en" },
                { label: "Spanish", value: "es" },
                { label: "French", value: "fr" },
              ]}
              value={preferences.language}
              onChange={(value) => handlePreferenceChange("language", value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Currency
            </label>
            <SelectPicker
              data={[
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" },
                { label: "GBP (£)", value: "GBP" },
              ]}
              value={preferences.currency}
              onChange={(value) => handlePreferenceChange("currency", value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          appearance="primary"
          onClick={handleSave}
          loading={loading}
          className="bg-green-500 hover:bg-green-600"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
