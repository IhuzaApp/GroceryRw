import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import toast from "react-hot-toast";

export default function UserPreference() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    currency: "RWF",
  });
  const [loading, setLoading] = useState(false);
  const [systemCurrency, setSystemCurrency] = useState<string>("RWF");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  // Common currencies list
  const availableCurrencies = [
    { value: "RWF", label: "RWF (Fr)", symbol: "Fr" },
    { value: "USD", label: "USD ($)", symbol: "$" },
    { value: "EUR", label: "EUR (€)", symbol: "€" },
    { value: "GBP", label: "GBP (£)", symbol: "£" },
    { value: "KES", label: "KES (KSh)", symbol: "KSh" },
    { value: "UGX", label: "UGX (USh)", symbol: "USh" },
    { value: "TZS", label: "TZS (TSh)", symbol: "TSh" },
  ];

  useEffect(() => {
    const fetchSystemCurrency = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();
        if (data.success && data.config?.currency) {
          const currency = data.config.currency;
          setSystemCurrency(currency);
          setPreferences((prev) => ({
            ...prev,
            currency: prev.currency === "RWF" ? currency : prev.currency,
          }));
        }
      } catch (error) {
        console.error("Error fetching system currency:", error);
      } finally {
        setLoadingCurrency(false);
      }
    };
    fetchSystemCurrency();
  }, []);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (newLanguage: "en" | "rw") => {
    setLanguage(newLanguage);
    const languageName =
      newLanguage === "en"
        ? t("preferences.english")
        : t("preferences.kinyarwanda");
    toast.success(`${t("preferences.languageChanged")} ${languageName}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      toast.success(
        t("preferences.preferencesSaved") || "Preferences saved successfully!"
      );
    } catch (error) {
      toast.error(
        t("preferences.failedToSave") || "Failed to save preferences."
      );
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
        checked
          ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          : "bg-gray-300 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {t("nav.preferences") || "Preferences"}
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {t("preferences.customizeExperience") ||
              "Customize your experience."}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest !text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("common.saveChanges") || "Save Changes"}
            </>
          )}
        </button>
      </div>

      <div className="space-y-8">
        {/* Appearance Card */}
        <section
          className={`overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white/50 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50`}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-inner dark:bg-purple-900/30 dark:text-purple-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                {t("preferences.appearance") || "Appearance"}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t("preferences.customizeColors") || "Theme & visual settings"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50/50 p-4 transition-all hover:bg-gray-50 dark:bg-gray-800/20 dark:hover:bg-gray-800/40">
            <div className="space-y-1">
              <span className="block text-sm font-black tracking-tight text-gray-900 dark:text-white">
                {t("preferences.darkMode")}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {theme === "dark"
                  ? t("preferences.enabled")
                  : t("preferences.disabled")}
              </span>
            </div>
            <Toggle
              checked={theme === "dark"}
              onChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </section>

        {/* Notifications Card */}
        <section
          className={`overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white/50 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50`}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner dark:bg-blue-900/30 dark:text-blue-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                {t("preferences.notifications") || "Notifications"}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t("preferences.stayUpdated") || "Manage alerts & updates"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "notifications",
                label: t("preferences.pushNotifications"),
                desc: t("preferences.receiveNotifications"),
              },
              {
                key: "emailUpdates",
                label: t("preferences.emailUpdates"),
                desc: t("preferences.getUpdatesViaEmail"),
              },
              {
                key: "smsUpdates",
                label: t("preferences.smsUpdates"),
                desc: t("preferences.receiveTextMessages"),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl bg-gray-50/50 p-4 transition-all hover:bg-gray-50 dark:bg-gray-800/20 dark:hover:bg-gray-800/40"
              >
                <div className="space-y-1">
                  <span className="block text-sm font-black tracking-tight text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {item.desc}
                  </span>
                </div>
                <Toggle
                  checked={(preferences as any)[item.key]}
                  onChange={(checked) =>
                    handlePreferenceChange(item.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* Locale Card */}
        <section
          className={`overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white/50 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50`}
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                {t("preferences.locale") || "Language & Region"}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t("preferences.setPreferred") || "Regional preferences"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl bg-gray-50/50 p-5 dark:bg-gray-800/20">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {t("preferences.language")}
              </label>
              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as "en" | "rw")
                }
                className="w-full rounded-xl border-2 border-transparent bg-white px-4 py-2 text-xs font-black transition-all focus:border-green-500 focus:outline-none dark:bg-gray-900"
              >
                <option value="en">{t("preferences.english")}</option>
                <option value="rw">{t("preferences.kinyarwanda")}</option>
              </select>
            </div>

            <div className="space-y-2 rounded-2xl bg-gray-50/50 p-5 dark:bg-gray-800/20">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {t("preferences.currency")}
                </label>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[7px] font-black uppercase tracking-tighter text-green-600 dark:bg-green-900/30">
                  Managed
                </span>
              </div>
              <select
                value={systemCurrency}
                disabled
                className="w-full cursor-not-allowed rounded-xl border-2 border-transparent bg-white/50 px-4 py-2 text-xs font-black opacity-60 dark:bg-gray-900"
              >
                {availableCurrencies.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
