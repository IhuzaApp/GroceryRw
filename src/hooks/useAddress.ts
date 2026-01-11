import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    // Only fetch if user is authenticated
    if (status !== "authenticated" || !session?.user) {
      setLoading(false);
      setAddresses([]);
      setDefaultAddress(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch("/api/queries/addresses");

      if (!response.ok) {
        // Don't log 401 errors as they're expected when not logged in
        if (response.status === 401) {
          setAddresses([]);
          setDefaultAddress(null);
          setLoading(false);
          return;
        }
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
      // Only log actual errors, not 401s
      if (err instanceof Error && !err.message.includes("401")) {
        console.error("Error fetching addresses:", err);
      }
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
    // Only fetch if authenticated
    if (status === "authenticated" && session?.user) {
      fetchAddresses();
    } else if (status === "unauthenticated") {
      // Clear data when not authenticated
      setLoading(false);
      setAddresses([]);
      setDefaultAddress(null);
      setError(null);
    }
  }, [status, session?.user]);

  return {
    defaultAddress,
    addresses,
    loading,
    error,
    refetch: fetchAddresses,
  };
};
