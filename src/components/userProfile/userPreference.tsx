import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

export default function UserPreference() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    language: "en",
    currency: "RWF",
  });
  const [loading, setLoading] = useState(false);
  const [systemCurrency, setSystemCurrency] = useState<string>("RWF");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  // Common currencies list (based on README supported currencies)
  const availableCurrencies = [
    { value: "RWF", label: "RWF (Fr)", symbol: "Fr" },
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "GBP", label: "GBP (£)", symbol: "£" },
    { value: "KES", label: "KES (KSh)", symbol: "KSh" },
    { value: "UGX", label: "UGX (USh)", symbol: "USh" },
    { value: "TZS", label: "TZS (TSh)", symbol: "TSh" },
  ];

  // Load system currency and user preferences on component mount
  useEffect(() => {
    const fetchSystemCurrency = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();

        if (data.success && data.config?.currency) {
          const currency = data.config.currency;
          setSystemCurrency(currency);
          // Set the system currency as default if no user preference is saved
          setPreferences((prev) => ({
            ...prev,
            currency: prev.currency === "RWF" ? currency : prev.currency,
          }));
        }
      } catch (error) {
        console.error("Error fetching system currency:", error);
        // Keep default RWF if fetch fails
      } finally {
        setLoadingCurrency(false);
      }
    };

    fetchSystemCurrency();
    // You can add logic here to load saved user preferences from the backend
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

  // Custom Toggle Component
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          checked ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings Card */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 dark:border-gray-700 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
              <svg
                className="h-5 w-5 !text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Theme Settings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your app appearance
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Dark Mode
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {theme === "dark" ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            <Toggle
              checked={theme === "dark"}
              onChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences Card */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <svg
                className="h-5 w-5 !text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage how you receive updates
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-6">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Push Notifications
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Receive notifications on your device
                </span>
              </div>
            </div>
            <Toggle
              checked={preferences.notifications}
              onChange={(checked) =>
                handlePreferenceChange("notifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Email Updates
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Get updates via email
                </span>
              </div>
            </div>
            <Toggle
              checked={preferences.emailUpdates}
              onChange={(checked) =>
                handlePreferenceChange("emailUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <svg
                  className="h-5 w-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  SMS Updates
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Receive text message updates
                </span>
              </div>
            </div>
            <Toggle
              checked={preferences.smsUpdates}
              onChange={(checked) =>
                handlePreferenceChange("smsUpdates", checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Language & Currency Card */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 dark:border-gray-700 dark:from-emerald-900/20 dark:to-teal-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <svg
                className="h-5 w-5 !text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Language & Currency
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set your preferred language and currency
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  handlePreferenceChange("language", e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20 sm:text-base"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Currency
                {loadingCurrency ? (
                  <span className="ml-2 text-xs text-gray-400">
                    (Loading...)
                  </span>
                ) : (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    System Managed
                  </span>
                )}
              </label>
              <select
                value={systemCurrency}
                disabled={true}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm shadow-sm transition-all duration-200 cursor-not-allowed opacity-60 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400 sm:text-base"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                    {currency.value === systemCurrency ? " (Current)" : ""}
                  </option>
                ))}
              </select>
              {!loadingCurrency && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Currency is managed by Company and cannot be changed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
        >
          {loading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin !text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="!text-white">Saving...</span>
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4 !text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="!text-white">Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
