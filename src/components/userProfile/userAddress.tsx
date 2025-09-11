import React, { useState, useEffect, useRef } from "react";
import { Button, Panel, Tag, Modal, Form, Checkbox } from "rsuite";
import { useGoogleMap } from "../../context/GoogleMapProvider";
import Cookies from "js-cookie";
import { authenticatedFetch } from "../../lib/authenticatedFetch";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <Panel bordered className="animate-pulse p-4">
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
    </Panel>
  );
}

// Add prop interface after imports
interface UserAddressProps {
  onSelect?: (address: any) => void;
}

// Update component signature to accept props
export default function UserAddress({ onSelect }: UserAddressProps) {
  const { isLoaded } = useGoogleMap();
  // Autocomplete service and geocoder refs
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Form and autocomplete state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [street, setStreet] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // Coordinates
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Handle street input change for autocomplete
  const handleStreetChange = (val: string) => {
    setStreet(val);
    if (val && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: val, componentRestrictions: { country: ["rw"] } },
        (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            setSuggestions(preds);
            setActiveInput(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
      setActiveInput(false);
    }
  };

  // On selecting an autocomplete suggestion
  const handleSelect = (sug: google.maps.places.AutocompletePrediction) => {
    setStreet(sug.description);
    setSuggestions([]);
    setActiveInput(false);
    // Geocode to get lat/lng
    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { address: sug.description },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            setLat(results[0].geometry.location.lat());
            setLng(results[0].geometry.location.lng());
          }
        }
      );
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load addresses (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to reload addresses
  const fetchAddresses = () => {
    setLoading(true);
    setError(null);
    authenticatedFetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`Failed to load addresses (${res.status})`);
        return res.json();
      })
      .then((data) => setAddresses(data.addresses || []))
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  // Save new address
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authenticatedFetch("/api/queries/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street,
          city,
          postal_code: postalCode,
          is_default: isDefault,
          latitude: lat,
          longitude: lng,
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await res.json();
      fetchAddresses();
      setShowModal(false);
      // reset form
      setStreet("");
      setCity("");
      setPostalCode("");
      setIsDefault(false);
      setLat(null);
      setLng(null);
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  // Set address as default
  const handleSetDefault = async (addressId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/queries/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addressId,
          is_default: true,
        }),
      });
      if (!res.ok) throw new Error(`Failed to set default (${res.status})`);
      await res.json();
      fetchAddresses();

      // Update the delivery address cookie with the new default address
      const updatedAddresses = await fetch("/api/queries/addresses").then(
        (res) => res.json()
      );
      const newDefaultAddress = (updatedAddresses.addresses || []).find(
        (a: any) => a.is_default
      );
      if (newDefaultAddress) {
        const locationData = {
          latitude: newDefaultAddress.latitude || "0",
          longitude: newDefaultAddress.longitude || "0",
          altitude: "0",
          street: newDefaultAddress.street,
          city: newDefaultAddress.city,
          postal_code: newDefaultAddress.postal_code,
        };
        Cookies.set("delivery_address", JSON.stringify(locationData));
        window.dispatchEvent(new Event("addressChanged"));
      }
    } catch (err: any) {
      alert(err.message || "Failed to set address as default");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Saved Addresses</h3>
        <Button
          appearance="primary"
          color="green"
          className="bg-green-500 text-white"
          onClick={() => setShowModal(true)}
        >
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading ? (
          Array(2)
            .fill(0)
            .map((_, idx) => <AddressSkeleton key={idx} />)
        ) : error ? (
          <div className="col-span-full p-4 text-red-600">{error}</div>
        ) : addresses.length ? (
          addresses.map((addr) => (
            <Panel key={addr.id} bordered className="relative">
              {addr.is_default && (
                <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
                  Default
                </Tag>
              )}
              <h4 className="font-bold">{addr.street}</h4>
              <p className="mt-2 text-gray-600">
                {addr.city}, {addr.postal_code}
              </p>
              <div className="mt-4 flex gap-2">
                {!addr.is_default && (
                  <button
                    className="rounded border border-green-700 px-3 py-1 text-sm text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={saving}
                  >
                    {saving ? "Setting..." : "Set as Default"}
                  </button>
                )}
                {onSelect && (
                  <button
                    className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-500 hover:bg-blue-100"
                    onClick={() => onSelect(addr)}
                  >
                    Select
                  </button>
                )}
              </div>
            </Panel>
          ))
        ) : (
          <div className="col-span-full p-4 text-gray-500">
            No saved addresses.
          </div>
        )}
      </div>

      {/* Add New Address Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group className="relative">
              <Form.ControlLabel>Street</Form.ControlLabel>
              <Form.Control
                disabled={!isLoaded}
                name="street"
                placeholder="Enter street"
                value={street}
                onChange={handleStreetChange}
              />
              {activeInput && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto border bg-white">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      className="cursor-pointer p-2 hover:bg-gray-100"
                      onClick={() => handleSelect(s)}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>City</Form.ControlLabel>
              <Form.Control
                name="city"
                placeholder="Enter city"
                value={city}
                onChange={setCity}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Postal Code</Form.ControlLabel>
              <Form.Control
                name="postal_code"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={setPostalCode}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Default</Form.ControlLabel>
              <Checkbox
                checked={isDefault}
                onChange={(value, checked) => setIsDefault(checked)}
              >
                Yes
              </Checkbox>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            appearance="primary"
            loading={saving}
            disabled={!street || lat === null || lng === null}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
