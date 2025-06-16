import React, { useState, useEffect, useRef } from "react";
import { useGoogleMap } from "../../../context/GoogleMapProvider";
import { Button, AutoComplete, Modal, Form } from "rsuite";
import { logger } from "../../../utils/logger";

interface AddressSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  currentAddress?: string;
  loading?: boolean;
}

interface ExtendedAutocompletePrediction extends google.maps.places.AutocompletePrediction {
  originalDescription: string;
}

export default function AddressSelectionPopup({
  isOpen,
  onClose,
  onSave,
  currentAddress = "",
  loading = false,
}: AddressSelectionPopupProps) {
  const { isLoaded } = useGoogleMap();
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [address, setAddress] = useState<string>(currentAddress);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      try {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Error initializing Google Maps AutocompleteService", errorMessage);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    setAddress(currentAddress);
  }, [currentAddress]);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val && autocompleteServiceRef.current) {
      setIsLoading(true);
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          { input: val, componentRestrictions: { country: ["rw"] } },
          (preds, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
              // Handle duplicate addresses by adding a counter
              const addressMap = new Map<string, number>();
              const uniquePreds = preds.map(pred => {
                const description = pred.description;
                if (addressMap.has(description)) {
                  const count = addressMap.get(description)! + 1;
                  addressMap.set(description, count);
                  return `${description} (${count})`;
                }
                addressMap.set(description, 1);
                return description;
              });
              setSuggestions(uniquePreds);
            } else {
              setSuggestions([]);
            }
          }
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error("Error getting place predictions", errorMessage);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (value: string) => {
    // Remove the count suffix if it exists
    const cleanValue = value.replace(/\s\(\d+\)$/, '');
    setAddress(cleanValue);
    setSuggestions([]);
  };

  const handleSave = () => {
    onSave(address);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title>Update Service Area</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.ControlLabel>Address</Form.ControlLabel>
            <div style={{ position: 'relative' }}>
              <AutoComplete
                data={suggestions}
                value={address}
                onChange={handleAddressChange}
                onSelect={handleSelect}
                placeholder="Enter your service area address"
                style={{ width: '100%' }}
                menuStyle={{ 
                  position: 'absolute',
                  width: '100%',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                </div>
              )}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="subtle"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          appearance="primary"
          color="green"
          onClick={handleSave}
          loading={loading}
        >
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 