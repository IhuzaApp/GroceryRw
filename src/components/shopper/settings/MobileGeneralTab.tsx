import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import MobileSettingsLayout from "./MobileSettingsLayout";
import MobileSettingsCard from "./MobileSettingsCard";

export default function MobileGeneralTab() {
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

  return (
    <MobileSettingsLayout
      title="General"
      description="Customize your general settings and preferences"
    >
      {/* My Notifications Section */}
      <div className="mb-8">
        <h2
          className={`mb-6 text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          My Notifications
        </h2>

        {/* Notify me when... */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className={`text-base font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Notify me when...
            </h3>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400"
            >
              About notifications?
            </a>
          </div>
          <div className="space-y-3">
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
                className="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all dark:border-gray-600"
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
                className="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all dark:border-gray-600"
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
                className="h-4 w-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all dark:border-gray-600"
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
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
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
          }
          title="Mobile push notifications"
          description="Receive push notification whenever your organisation requires your attentions"
          type="toggle"
          value={mobilePush}
          onChange={setMobilePush}
        />

        {/* Desktop Notification */}
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          title="Desktop Notification"
          description="Receive desktop notification whenever your organisation requires your attentions"
          type="toggle"
          value={desktopNotification}
          onChange={setDesktopNotification}
        />

        {/* Email Notification */}
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
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
          }
          title="Email Notification"
          description="Receive email whenever your organisation requires your attentions"
          type="toggle"
          value={emailNotification}
          onChange={setEmailNotification}
        />
      </div>

      {/* My Settings Section */}
      <div>
        <h2
          className={`mb-6 text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          My Settings
        </h2>

        {/* Appearance */}
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          }
          title="Appearance"
          description="Customize how you theams looks on your device."
          type="navigation"
          onNavigate={() => {}}
        />

        {/* Two-factor authentication */}
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
          title="Two-factor authentication"
          description="Keep your account secure by enabling 2FA via SMS or using a temporary one-time passcode (TOTP)."
          type="toggle"
          value={twoFactorAuth}
          onChange={setTwoFactorAuth}
        />

        {/* Language */}
        <MobileSettingsCard
          icon={
            <svg
              className="h-6 w-6"
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
          }
          title="Language"
          description="Customize how you theams looks on your device."
          type="navigation"
          onNavigate={() => {}}
        />
      </div>
    </MobileSettingsLayout>
  );
}
