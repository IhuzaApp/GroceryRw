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
  List
} from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";
import CloseIcon from "@rsuite/icons/Close";
import toast from "react-hot-toast";

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
}

export default function NotificationTab() {
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
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  // Google Maps Autocomplete refs
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (session?.user?.id) {
      loadNotificationSettings();
    }
  }, [session?.user?.id]);

  // Initialize Google Maps services
  useEffect(() => {
    if (isGoogleMapsLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isGoogleMapsLoaded]);

  // Handle address input change for autocomplete
  const handleAddressChange = (value: string | null) => {
    const address = value || "";
    setNewLocation(prev => ({ ...prev, address }));
    
    if (address && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { 
          input: address, 
          componentRestrictions: { country: ["rw"] },
          types: ['address']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
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
  const handleSelectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    setNewLocation(prev => ({ ...prev, address: suggestion.description }));
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
            const address = results[0].formatted_address || suggestion.description;
            const name = suggestion.structured_formatting?.main_text || address.split(',')[0] || 'Custom Location';

            setNewLocation(prev => ({
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
      const response = await fetch("/api/queries/shopper-notification-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
        }),
      });

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
      const response = await fetch("/api/mutations/shopper-notification-settings", {
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
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notification settings saved successfully!");
        if (data.settings?.id) {
          setSettings(prev => ({ ...prev, id: data.settings.id }));
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
    setSettings(prev => ({
      ...prev,
      use_live_location: checked,
    }));
  };

  const handleNotificationTypeToggle = (type: keyof typeof settings.notification_types, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: checked,
      },
    }));
  };

  const handleMaxDistanceChange = (value: string | null) => {
    setSettings(prev => ({
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

    setSettings(prev => ({
      ...prev,
      custom_locations: [...prev.custom_locations, location],
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
    setSettings(prev => ({
      ...prev,
      custom_locations: prev.custom_locations.filter(loc => loc.id !== locationId),
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
    <div className="p-4">
      <h3
        className={`mb-4 text-lg font-semibold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Notification Settings
      </h3>
      <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        Configure how you receive notifications for orders and batches based on your location preferences.
      </p>

      {/* Location Settings */}
      <div className={`mb-6 rounded-lg border p-4 ${
        theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <h4 className={`mb-4 font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Location Preferences
        </h4>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Use Live Location
              </span>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
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
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
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
              <p className={`text-sm italic ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                No custom locations added. You can add up to 2 locations.
              </p>
            ) : (
              <div className="space-y-2">
                {settings.custom_locations.map((location) => (
                  <div
                    key={location.id}
                    className={`flex items-center justify-between rounded border p-3 ${
                      theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {location.name}
                      </div>
                      <div className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
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
      <div className={`mb-6 rounded-lg border p-4 ${
        theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <h4 className={`mb-4 font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Maximum Distance
        </h4>
        <p className={`mb-3 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          Maximum distance to receive notifications for orders and batches
        </p>
        <SelectPicker
          data={distanceOptions}
          value={settings.max_distance}
          onChange={handleMaxDistanceChange}
          cleanable={false}
          searchable={false}
          className="w-32"
        />
      </div>

      {/* Notification Types */}
      <div className={`mb-6 rounded-lg border p-4 ${
        theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <h4 className={`mb-4 font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Notification Types
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                New Orders
              </span>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Receive notifications for new individual orders
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.orders}
              onChange={(checked) => handleNotificationTypeToggle("orders", checked)}
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Batch Orders
              </span>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Receive notifications for batch orders (multiple orders)
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.batches}
              onChange={(checked) => handleNotificationTypeToggle("batches", checked)}
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Earnings Updates
              </span>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Receive notifications about your earnings and payments
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.earnings}
              onChange={(checked) => handleNotificationTypeToggle("earnings", checked)}
              size="md"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                System Notifications
              </span>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Receive important system updates and announcements
              </p>
            </div>
            <Toggle
              checked={settings.notification_types.system}
              onChange={(checked) => handleNotificationTypeToggle("system", checked)}
              size="md"
            />
          </div>
        </div>
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
                onChange={(value: string | null) => setNewLocation(prev => ({ ...prev, name: value || "" }))}
                placeholder="e.g., Home, Work, Downtown"
              />
            </Form.Group>
            <Form.Group className="relative">
              <Form.ControlLabel>Address (Google Maps Autocomplete)</Form.ControlLabel>
              <Input
                value={newLocation.address}
                onChange={handleAddressChange}
                placeholder="Start typing to search for an address..."
                disabled={!isGoogleMapsLoaded}
              />
              {!isGoogleMapsLoaded && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading Google Maps...
                </p>
              )}
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute z-50 mt-1 w-full rounded border shadow-lg ${
                  theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-white"
                }`}>
                  <List>
                    {suggestions.map((suggestion, index) => (
                      <List.Item
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`cursor-pointer p-2 hover:bg-gray-100 ${
                          theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className={`text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>
                          {suggestion.structured_formatting?.main_text}
                        </div>
                        <div className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {suggestion.structured_formatting?.secondary_text}
                        </div>
                      </List.Item>
                    ))}
                  </List>
                </div>
              )}
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Coordinates (Auto-filled from address)</Form.ControlLabel>
              <div className="flex gap-2">
                <Input
                  value={newLocation.latitude}
                  onChange={(value: string | null) => setNewLocation(prev => ({ ...prev, latitude: value || "" }))}
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  readOnly
                />
                <Input
                  value={newLocation.longitude}
                  onChange={(value: string | null) => setNewLocation(prev => ({ ...prev, longitude: value || "" }))}
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Coordinates are automatically filled when you select an address from the dropdown.
              </p>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            onClick={addCustomLocation}
            disabled={!newLocation.name || !newLocation.address || !newLocation.latitude || !newLocation.longitude}
          >
            Add Location
          </Button>
          <Button appearance="subtle" onClick={() => setShowLocationModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 