import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "../../../context/ThemeContext";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import {
  Toggle,
  Button,
  Message,
  Loader,
  Input,
  InputGroup,
  Tag,
  IconButton,
  Modal,
  Form,
  SelectPicker,
  List,
} from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";
import CloseIcon from "@rsuite/icons/Close";
import toast from "react-hot-toast";

interface NotificationItem {
  title: string;
  body: string;
  timestamp: number;
  type: string;
  read: boolean;
  orderId?: string;
  conversationId?: string;
  senderName?: string;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface NotificationSettings {
  id?: string;
  user_id: string;
  use_live_location: boolean;
  custom_locations: Location[];
  max_distance: string;
  notification_types: {
    orders: boolean;
    batches: boolean;
    earnings: boolean;
    system: boolean;
  };
  sound_settings: {
    enabled: boolean;
    volume: number;
  };
}

export default function NotificationTab() {
  // Helper function to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return (
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "batch_orders":
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-gray-500"
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
        );
    }
  };

  // Helper function to format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMap();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: session?.user?.id || "",
    use_live_location: true,
    custom_locations: [],
    max_distance: "10",
    notification_types: {
      orders: true,
      batches: true,
      earnings: true,
      system: true,
    },
    sound_settings: {
      enabled: true,
      volume: 0.8,
    },
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  // Google Maps Autocomplete refs
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Notification history state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (session?.user?.id) {
      loadNotificationSettings();
    }
  }, [session?.user?.id]);

  // Load notification history
  const loadNotificationHistory = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem("fcm_notification_history") || "[]"
      );
      // Filter for new_order and batch_orders types
      const orderNotifications = history.filter(
        (n: NotificationItem) =>
          n.type === "new_order" || n.type === "batch_orders"
      );
      // Sort by timestamp (newest first)
      const sortedNotifications = orderNotifications.sort(
        (a: NotificationItem, b: NotificationItem) => b.timestamp - a.timestamp
      );
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Error loading notification history:", error);
    }
  };

  // Load notifications on mount and refresh periodically
  useEffect(() => {
    loadNotificationHistory();
    const interval = setInterval(loadNotificationHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Google Maps services
  useEffect(() => {
    if (isGoogleMapsLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isGoogleMapsLoaded]);

  // Handle address input change for autocomplete
  const handleAddressChange = (value: string | null) => {
    const address = value || "";
    setNewLocation((prev) => ({ ...prev, address }));

    if (address && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: address,
          componentRestrictions: { country: ["rw"] },
          types: ["address"],
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (
    suggestion: google.maps.places.AutocompletePrediction
  ) => {
    setNewLocation((prev) => ({ ...prev, address: suggestion.description }));
    setSuggestions([]);
    setShowSuggestions(false);

    // Geocode to get coordinates
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: suggestion.description },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            const address =
              results[0].formatted_address || suggestion.description;
            const name =
              suggestion.structured_formatting?.main_text ||
              address.split(",")[0] ||
              "Custom Location";

            setNewLocation((prev) => ({
              ...prev,
              name: name,
              address: address,
              latitude: lat.toString(),
              longitude: lng.toString(),
            }));

            toast.success("Location selected from Google Maps!");
          }
        }
      );
    }
  };

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/queries/shopper-notification-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: session?.user?.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.settings?.length > 0) {
        const existingSettings = data.settings[0];
        setSettings({
          id: existingSettings.id,
          user_id: existingSettings.user_id,
          use_live_location: existingSettings.use_live_location || true,
          custom_locations: existingSettings.custom_locations || [],
          max_distance: existingSettings.max_distance || "10",
          notification_types: existingSettings.notification_types || {
            orders: true,
            batches: true,
            earnings: true,
            system: true,
          },
          sound_settings: existingSettings.sound_settings || {
            enabled: true,
            volume: 0.8,
          },
        });
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
      toast.error("Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        "/api/mutations/shopper-notification-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: session?.user?.id,
            use_live_location: settings.use_live_location,
            custom_locations: settings.custom_locations,
            max_distance: settings.max_distance,
            notification_types: settings.notification_types,
            sound_settings: settings.sound_settings,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Notification settings saved successfully!");
        if (data.settings?.id) {
          setSettings((prev) => ({ ...prev, id: data.settings.id }));
        }
      } else {
        toast.error(data.message || "Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLocationToggle = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      use_live_location: checked,
      // If enabling live location, disable custom locations
      custom_locations: checked ? [] : prev.custom_locations,
    }));
  };

  const handleNotificationTypeToggle = (
    type: keyof typeof settings.notification_types,
    checked: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: checked,
      },
    }));
  };

  const handleMaxDistanceChange = (value: string | null) => {
    setSettings((prev) => ({
      ...prev,
      max_distance: value || "10",
    }));
  };

  const addCustomLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      toast.error("Please fill in all location fields");
      return;
    }

    if (!newLocation.latitude || !newLocation.longitude) {
      toast.error("Please select a valid location from the address field");
      return;
    }

    if (settings.custom_locations.length >= 2) {
      toast.error("You can only add up to 2 custom locations");
      return;
    }

    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name,
      address: newLocation.address,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude),
    };

    setSettings((prev) => ({
      ...prev,
      custom_locations: [...prev.custom_locations, location],
      // Automatically disable live location when adding custom locations
      use_live_location: false,
    }));

    setNewLocation({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setShowLocationModal(false);
    setSuggestions([]);
    setShowSuggestions(false);
    toast.success("Custom location added successfully!");
  };

  const removeCustomLocation = (locationId: string) => {
    setSettings((prev) => ({
      ...prev,
      custom_locations: prev.custom_locations.filter(
        (loc) => loc.id !== locationId
      ),
    }));
    toast.success("Location removed successfully!");
  };

  const distanceOptions = [
    { label: "5 km", value: "5" },
    { label: "10 km", value: "10" },
    { label: "15 km", value: "15" },
    { label: "20 km", value: "20" },
    { label: "25 km", value: "25" },
    { label: "30 km", value: "30" },
  ];

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader size="md" content="Loading notification settings..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h3
        className={`mb-2 text-xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Notification Settings
      </h3>
      <p
        className={`mb-8 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Configure how you receive notifications for orders and batches based on
        your location preferences.
      </p>

      {/* Location Settings */}
      <div className="mb-8">
        <h4
          className={`mb-6 text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Location Preferences
        </h4>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Use Live Location
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive notifications based on your current GPS location
              </p>
            </div>
            <Toggle
              checked={settings.use_live_location}
              onChange={handleLocationToggle}
              size="md"
            />
          </div>
        </div>

        {!settings.use_live_location && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Custom Locations ({settings.custom_locations.length}/2)
              </span>
              {settings.custom_locations.length < 2 && (
                <Button
                  appearance="primary"
                  size="sm"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1"
                >
                  <PlusIcon />
                  Add Location
                </Button>
              )}
            </div>

            {settings.custom_locations.length === 0 ? (
              <p
                className={`text-sm italic ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No custom locations added. You can add up to 2 locations.
              </p>
            ) : (
              <div className="space-y-3">
                {settings.custom_locations.map((location) => (
                  <div
                    key={location.id}
                    className={`flex items-center justify-between rounded-lg p-4 ${
                      theme === "dark"
                        ? "bg-gray-800/50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <div
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {location.name}
                      </div>
                      <div
                        className={`mt-1 text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {location.address}
                      </div>
                    </div>
                    <IconButton
                      icon={<CloseIcon />}
                      size="sm"
                      appearance="subtle"
                      onClick={() => removeCustomLocation(location.id)}
                      className="text-red-500 hover:text-red-600"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Distance Settings */}
      <div
        className={`mb-8 border-b pb-8 ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h4
          className={`mb-1.5 text-base font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Maximum Distance
        </h4>
        <p
          className={`mb-4 text-sm leading-relaxed ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Maximum distance to receive notifications for orders and batches
        </p>
        <SelectPicker
          data={distanceOptions}
          value={settings.max_distance}
          onChange={handleMaxDistanceChange}
          cleanable={false}
          searchable={false}
          style={{ width: 140 }}
        />
      </div>

      {/* Notification Types */}
      <div
        className={`mb-8 border-b pb-8 ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h4
          className={`mb-6 text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Notification Types
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                New Orders
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive notifications for new individual orders
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.orders}
              onChange={(checked) =>
                handleNotificationTypeToggle("orders", checked)
              }
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Batch Orders
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive notifications for batch orders (multiple orders)
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.batches}
              onChange={(checked) =>
                handleNotificationTypeToggle("batches", checked)
              }
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Earnings Updates
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive notifications about your earnings and payments
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.earnings}
              onChange={(checked) =>
                handleNotificationTypeToggle("earnings", checked)
              }
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                System Notifications
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive important system updates and announcements
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.system}
              onChange={(checked) =>
                handleNotificationTypeToggle("system", checked)
              }
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div
        className={`mb-8 border-b pb-8 ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h4
          className={`mb-6 text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Sound Settings
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <span
                className={`text-base font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Enable Sound Notifications
              </span>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Play sound when receiving new order notifications
              </p>
            </div>
            <Toggle
              checked={settings.sound_settings.enabled}
              onChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  sound_settings: {
                    ...prev.sound_settings,
                    enabled: checked,
                  },
                }))
              }
              size="md"
            />
          </div>

          {settings.sound_settings.enabled && (
            <div>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Sound Volume
              </span>
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sound_settings.volume * 100}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sound_settings: {
                        ...prev.sound_settings,
                        volume: parseInt(e.target.value) / 100,
                      },
                    }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <div
                  className={`mt-1 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Volume: {Math.round(settings.sound_settings.volume * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification History Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h4
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            New Order Notifications
          </h4>
          <Button
            appearance="subtle"
            size="sm"
            onClick={() => {
              setShowNotificationHistory(!showNotificationHistory);
              if (!showNotificationHistory) {
                loadNotificationHistory();
              }
            }}
          >
            {showNotificationHistory ? "Hide" : "Show"} History
          </Button>
        </div>

        {showNotificationHistory && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No new order notifications yet</p>
                <p className="mt-1 text-xs">
                  New order notifications will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg p-4 transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-800/50"
                        : "hover:bg-gray-50"
                    } ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={() => {
                      // Mark as read when clicked
                      if (!notification.read) {
                        const allHistory = JSON.parse(
                          localStorage.getItem("fcm_notification_history") ||
                            "[]"
                        );
                        const updatedHistory = allHistory.map(
                          (n: NotificationItem) =>
                            n.timestamp === notification.timestamp
                              ? { ...n, read: true }
                              : n
                        );
                        localStorage.setItem(
                          "fcm_notification_history",
                          JSON.stringify(updatedHistory)
                        );
                        loadNotificationHistory();
                      }

                      // Navigate to relevant page
                      if (
                        (notification.type === "new_order" ||
                          notification.type === "batch_orders") &&
                        notification.orderId
                      ) {
                        window.location.href = `/Plasa/active-batches`;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            !notification.read
                              ? "animate-pulse bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {notification.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          appearance="primary"
          color="green"
          onClick={saveNotificationSettings}
          loading={saving}
          disabled={saving}
        >
          Save Settings
        </Button>
      </div>

      {/* Add Location Modal */}
      <Modal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        size="md"
      >
        <Modal.Header>
          <Modal.Title>Add Custom Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Location Name</Form.ControlLabel>
              <Input
                value={newLocation.name}
                onChange={(value: string | null) =>
                  setNewLocation((prev) => ({ ...prev, name: value || "" }))
                }
                placeholder="e.g., Home, Work, Downtown"
              />
            </Form.Group>
            <Form.Group className="relative">
              <Form.ControlLabel>
                Address (Google Maps Autocomplete)
              </Form.ControlLabel>
              <Input
                value={newLocation.address}
                onChange={handleAddressChange}
                placeholder="Start typing to search for an address..."
                disabled={!isGoogleMapsLoaded}
              />
              {!isGoogleMapsLoaded && (
                <p className="mt-1 text-xs text-gray-500">
                  Loading Google Maps...
                </p>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute z-50 mt-1 w-full rounded border shadow-lg ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <List>
                    {suggestions.map((suggestion, index) => (
                      <List.Item
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`cursor-pointer p-2 hover:bg-gray-100 ${
                          theme === "dark"
                            ? "hover:bg-gray-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {suggestion.structured_formatting?.main_text}
                        </div>
                        <div
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {suggestion.structured_formatting?.secondary_text}
                        </div>
                      </List.Item>
                    ))}
                  </List>
                </div>
              )}
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>
                Coordinates (Auto-filled from address)
              </Form.ControlLabel>
              <div className="flex gap-2">
                <Input
                  value={newLocation.latitude}
                  onChange={(value: string | null) =>
                    setNewLocation((prev) => ({
                      ...prev,
                      latitude: value || "",
                    }))
                  }
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  readOnly
                />
                <Input
                  value={newLocation.longitude}
                  onChange={(value: string | null) =>
                    setNewLocation((prev) => ({
                      ...prev,
                      longitude: value || "",
                    }))
                  }
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  readOnly
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Coordinates are automatically filled when you select an address
                from the dropdown.
              </p>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            onClick={addCustomLocation}
            disabled={
              !newLocation.name ||
              !newLocation.address ||
              !newLocation.latitude ||
              !newLocation.longitude
            }
          >
            Add Location
          </Button>
          <Button
            appearance="subtle"
            onClick={() => setShowLocationModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
