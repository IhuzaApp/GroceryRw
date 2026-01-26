import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Toggle, SelectPicker } from "rsuite";

export default function GeneralTab() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState({
    dailyProductivity: true,
    newEventCreated: true,
    whenAddedOnNewTeam: true,
  });
  const [mobilePush, setMobilePush] = useState(true);
  const [desktopNotification, setDesktopNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);
  const [appearance, setAppearance] = useState("light");
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [language, setLanguage] = useState("english");

  const appearanceOptions = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  const languageOptions = [
    { label: "English", value: "english" },
    { label: "French", value: "french" },
    { label: "Spanish", value: "spanish" },
  ];

  return (
    <div className="p-8">
      {/* My Notifications Section */}
      <div className="mb-12">
        <h2
          className={`mb-8 text-xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          My Notifications
        </h2>

        {/* Notify me when... */}
        <div className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <h3
              className={`text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Notify me when...
            </h3>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              About notifications?
            </a>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.dailyProductivity}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    dailyProductivity: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Daily productivity update
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newEventCreated}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    newEventCreated: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                New event created
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.whenAddedOnNewTeam}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    whenAddedOnNewTeam: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                When added on new team
              </span>
            </label>
          </div>
        </div>

        {/* Mobile push notifications */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Mobile push notifications
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Receive push notification whenever your organisation requires your
              attentions
            </p>
          </div>
          <div className="flex-shrink-0">
            <Toggle
              checked={mobilePush}
              onChange={setMobilePush}
              size="md"
            />
          </div>
        </div>

        {/* Desktop Notification */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Desktop Notification
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Receive desktop notification whenever your organisation requires
              your attentions
            </p>
          </div>
          <div className="flex-shrink-0">
            <Toggle
              checked={desktopNotification}
              onChange={setDesktopNotification}
              size="md"
            />
          </div>
        </div>

        {/* Email Notification */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Email Notification
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Receive email whenever your organisation requires your attentions
            </p>
          </div>
          <div className="flex-shrink-0">
            <Toggle
              checked={emailNotification}
              onChange={setEmailNotification}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* My Settings Section */}
      <div>
        <h2
          className={`mb-8 text-xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          My Settings
        </h2>

        {/* Appearance */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Appearance
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Customize how you theams looks on your device.
            </p>
          </div>
          <div className="flex-shrink-0">
            <SelectPicker
              data={appearanceOptions}
              value={appearance}
              onChange={(value) => setAppearance(value || "light")}
              cleanable={false}
              searchable={false}
              style={{ width: 120 }}
            />
          </div>
        </div>

        {/* Two-factor authentication */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Two-factor authentication
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Keep your account secure by enabling 2FA via SMS or using a
              temporary one-time passcode (TOTP).
            </p>
          </div>
          <div className="flex-shrink-0">
            <Toggle
              checked={twoFactorAuth}
              onChange={setTwoFactorAuth}
              size="md"
            />
          </div>
        </div>

        {/* Language */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex-1 pr-8">
            <h3
              className={`mb-1.5 text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Language
            </h3>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Customize how you theams looks on your device.
            </p>
          </div>
          <div className="flex-shrink-0">
            <SelectPicker
              data={languageOptions}
              value={language}
              onChange={(value) => setLanguage(value || "english")}
              cleanable={false}
              searchable={false}
              style={{ width: 120 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
