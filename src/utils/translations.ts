// Translation dictionary for English and Kinyarwanda
export const translations = {
  en: {
    // Preferences
    preferences: {
      themeSettings: "Theme Settings",
      customizeAppearance: "Customize your app appearance",
      darkMode: "Dark Mode",
      enabled: "Enabled",
      disabled: "Disabled",
      notificationPreferences: "Notification Preferences",
      manageUpdates: "Manage how you receive updates",
      pushNotifications: "Push Notifications",
      receiveNotifications: "Receive notifications on your device",
      emailUpdates: "Email Updates",
      getUpdatesViaEmail: "Get updates via email",
      smsUpdates: "SMS Updates",
      receiveTextMessages: "Receive text message updates",
      languageCurrency: "Language & Currency",
      setPreferredLanguage: "Set your preferred language and currency",
      language: "Language",
      changesApplyImmediately: "Changes apply immediately to the app",
      currency: "Currency",
      systemManaged: "System Managed",
      currencyManagedByCompany: "Currency is managed by Company and cannot be changed",
      systemCurrency: "System currency",
      savePreferences: "Save Preferences",
      saving: "Saving...",
      preferencesSaved: "Preferences saved successfully!",
      failedToSave: "Failed to save preferences",
      languageChanged: "Language changed to",
      english: "English",
      kinyarwanda: "Kinyarwanda",
    },
    // Common
    common: {
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading...",
    },
  },
  rw: {
    // Preferences
    preferences: {
      themeSettings: "Gahunda z'Imiterere",
      customizeAppearance: "Guhindura imiterere y'urubuga rwawe",
      darkMode: "Imiterere y'Umwijima",
      enabled: "Bikoreshwa",
      disabled: "Bidakoreshwa",
      notificationPreferences: "Ibyifuzo by'Amakuru",
      manageUpdates: "Gucunga uko wakira amakuru",
      pushNotifications: "Amakuru mu Modiri",
      receiveNotifications: "Kiraba amakuru mu modiri yawe",
      emailUpdates: "Amakuru kuri Email",
      getUpdatesViaEmail: "Kiraba amakuru kuri email",
      smsUpdates: "Amakuru kuri SMS",
      receiveTextMessages: "Kiraba amakuru kuri SMS",
      languageCurrency: "Ururimi n'Ifaranga",
      setPreferredLanguage: "Hitamo ururimi n'ifaranga ukunda",
      language: "Ururimi",
      changesApplyImmediately: "Ihinduka bikora mu kanya k'urubuga",
      currency: "Ifaranga",
      systemManaged: "Bikoreshwa na Sisitemu",
      currencyManagedByCompany: "Ifaranga ikoreshwa na Sisitemu kandi ntishobora guhindurwa",
      systemCurrency: "Ifaranga ya Sisitemu",
      savePreferences: "Bika Ibyifuzo",
      saving: "Bikwa...",
      preferencesSaved: "Ibyifuzo byabikwe neza!",
      failedToSave: "Kubika ibyifuzo byanze",
      languageChanged: "Ururimi rwahindutse kuri",
      english: "Icyongereza",
      kinyarwanda: "Ikinyarwanda",
    },
    // Common
    common: {
      cancel: "Kureka",
      save: "Bika",
      edit: "Hindura",
      delete: "Siba",
      loading: "Bikurura...",
    },
  },
};

export type TranslationKey = keyof typeof translations.en;
export type Language = "en" | "rw";

// Helper function to get translation
export const getTranslation = (
  language: Language,
  key: string
): string => {
  const keys = key.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
};
