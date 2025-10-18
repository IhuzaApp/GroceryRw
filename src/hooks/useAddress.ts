import { useState, useEffect } from "react";
import { authenticatedFetch } from "../lib/authenticatedFetch";

interface Address {
  id: string;
  user_id: string;
  street: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  latitude: string;
  longitude: string;
  type: string; // Address type: house, apartment, office, other
  placeDetails: any; // Type-specific details as jsonb
  created_at: string;
  updated_at: string;
}

interface UseAddressReturn {
  defaultAddress: Address | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAddress = (): UseAddressReturn => {
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch("/api/queries/addresses");

      if (!response.ok) {
        throw new Error(`Failed to fetch addresses: ${response.status}`);
      }

      const data = await response.json();
      const addressesList = data.addresses || [];

      setAddresses(addressesList);

      // Find the default address
      const defaultAddr = addressesList.find(
        (addr: Address) => addr.is_default
      );
      setDefaultAddress(defaultAddr || null);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch addresses"
      );
      setAddresses([]);
      setDefaultAddress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    defaultAddress,
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
  };
};
