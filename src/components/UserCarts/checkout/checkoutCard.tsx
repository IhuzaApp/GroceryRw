import React, { useState, useEffect, useCallback } from "react";
import { Button, Panel, Modal, toaster, Notification } from "rsuite";
import Link from "next/link"; // Make sure you import Link if you use it
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import {
  useFoodCart,
  FoodCartRestaurant,
} from "../../../context/FoodCartContext";
import AddressManagementModal from "../../userProfile/AddressManagementModal";

// Cookie name for system configuration cache
const SYSTEM_CONFIG_COOKIE = "system_configuration";
// Cache expiration time (24 hours)
const CACHE_EXPIRATION_HOURS = 24;
// Maximum age of cache in milliseconds before refreshing in background (12 hours)
const CACHE_REFRESH_MS = 12 * 60 * 60 * 1000;

interface PaymentMethod {
  type: "refund" | "card" | "momo";
  id?: string;
  number?: string;
}

interface SavedPaymentMethod {
  id: string;
  method: string;
  names: string;
  number: string;
  is_default: boolean;
}

interface SavedAddress {
  id: string;
  street: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

interface CheckoutItemsProps {
  Total: number;
  totalUnits: number;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
  isFoodCart?: boolean;
  restaurant?: FoodCartRestaurant;
}

// System configuration interface
interface SystemConfiguration {
  baseDeliveryFee: string;
  serviceFee: string;
  shoppingTime: string;
  unitsSurcharge: string;
  extraUnits: string;
  cappedDistanceFee: string;
  distanceSurcharge: string;
  currency: string;
  discounts: boolean;
  id: string;
  deliveryCommissionPercentage: string;
  productCommissionPercentage: string;
}

// Add helper to compute distance between two coordinates
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CheckoutItems({
  Total,
  totalUnits,
  shopLat,
  shopLng,
  shopAlt,
  shopId,
  isFoodCart = false,
  restaurant,
}: CheckoutItemsProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { clearRestaurant } = useFoodCart();
  // Re-render when the address cookie changes
  const [, setTick] = useState(0);
  // Mobile checkout card expand/collapse state
  const [isExpanded, setIsExpanded] = useState(false);
  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(
    null
  );
  const [configLoading, setConfigLoading] = useState(true);
  // Separate state for discounts (always fetched fresh from server)
  const [discountsEnabled, setDiscountsEnabled] = useState(false);
  // Address management modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Checkout loading state
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Function to fetch fresh discounts from server (always called, never cached)
  const fetchFreshDiscounts = useCallback(async () => {
    try {
      const response = await fetch("/api/queries/system-configuration");
      const data = await response.json();

      if (data.success && data.config && typeof data.config.discounts === "boolean") {
        setDiscountsEnabled(data.config.discounts);
      }
    } catch (error) {
      console.error("Error fetching fresh discounts:", error);
      // Fallback to false if fetch fails
      setDiscountsEnabled(false);
    }
  }, []);

  // Fetch system configuration with memoization
  useEffect(() => {
    // Function to fetch config from API and update cache
    const fetchConfigFromAPI = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();

        if (data.success && data.config) {
          // Extract discounts before caching (don't cache discounts)
          const { discounts, ...configWithoutDiscounts } = data.config;
          setDiscountsEnabled(discounts || false);
          
          // Store config WITHOUT discounts in cookie
          setSystemConfig({
            ...configWithoutDiscounts,
            discounts: false, // Set to false in cached config, we'll use fresh value
          } as SystemConfiguration);

          // Store in cookie with expiration and timestamp (without discounts)
          const cacheData = {
            config: {
              ...configWithoutDiscounts,
              discounts: false, // Don't cache discounts value
            },
            timestamp: Date.now(),
          };

          Cookies.set(SYSTEM_CONFIG_COOKIE, JSON.stringify(cacheData), {
            expires: CACHE_EXPIRATION_HOURS / 24, // Convert hours to days
            sameSite: "strict",
          });
        } else {
          console.error("Failed to fetch system configuration:", data);
        }
      } catch (error) {
        console.error("Error fetching system configuration from API:", error);
      } finally {
        setConfigLoading(false);
      }
    };

    // Function to refresh config in background without blocking UI
    const refreshConfigInBackground = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();

        if (data.success && data.config) {
          // Extract discounts before caching (don't cache discounts)
          const { discounts, ...configWithoutDiscounts } = data.config;
          setDiscountsEnabled(discounts || false);
          
          // Update config WITHOUT discounts
          setSystemConfig({
            ...configWithoutDiscounts,
            discounts: false, // Set to false in cached config
          } as SystemConfiguration);

          // Update cache with new data and timestamp (without discounts)
          const cacheData = {
            config: {
              ...configWithoutDiscounts,
              discounts: false, // Don't cache discounts value
            },
            timestamp: Date.now(),
          };

          Cookies.set(SYSTEM_CONFIG_COOKIE, JSON.stringify(cacheData), {
            expires: CACHE_EXPIRATION_HOURS / 24,
            sameSite: "strict",
          });
        }
      } catch (error) {
        console.error(
          "Background refresh of system configuration failed:",
          error
        );
      }
    };

    const fetchSystemConfig = async () => {
      try {
        setConfigLoading(true);

        // Check if we have cached configuration
        const cachedConfig = Cookies.get(SYSTEM_CONFIG_COOKIE);

        if (cachedConfig) {
          try {
            // Parse the cached configuration
            const parsedCache = JSON.parse(cachedConfig);

            // Handle both old format (direct config object) and new format (with timestamp)
            if (parsedCache.config && parsedCache.timestamp) {
              // New format with timestamp - use cached config but fetch fresh discounts
              setSystemConfig(parsedCache.config);
              
              // Always fetch fresh discounts from server (don't use cached value)
              fetchFreshDiscounts();

              // Check if cache is stale and needs background refresh
              const cacheAge = Date.now() - parsedCache.timestamp;
              if (cacheAge > CACHE_REFRESH_MS) {
                // Don't block UI - refresh in background
                setTimeout(refreshConfigInBackground, 0);
              }
            } else {
              // Old format or unexpected structure - treat as config directly
              setSystemConfig(parsedCache);
              
              // Always fetch fresh discounts from server
              fetchFreshDiscounts();

              // Always refresh old format in background to update to new format
              setTimeout(refreshConfigInBackground, 0);
            }

            setConfigLoading(false);
            return;
          } catch (parseError) {
            console.error("Error parsing cached configuration:", parseError);
            // Continue to fetch from API if parsing fails
          }
        }

        // Fetch from API if no valid cache exists
        await fetchConfigFromAPI();
      } catch (error) {
        console.error("Error in system configuration flow:", error);
        setConfigLoading(false);
      }
    };

    // Add debug function to window object
    if (typeof window !== "undefined") {
      (window as any).clearGrocerySystemConfigCache = () => {
        Cookies.remove(SYSTEM_CONFIG_COOKIE);
        fetchConfigFromAPI();
      };
    }

    // Only fetch if we don't have config yet
    if (!systemConfig) {
      fetchSystemConfig();
    } else {
      // Even if we have cached config, always fetch fresh discounts
      fetchFreshDiscounts();
      setConfigLoading(false);
    }
  }, [systemConfig, fetchFreshDiscounts]); // Add systemConfig and fetchFreshDiscounts as dependencies

  // Always fetch fresh discounts on component mount
  useEffect(() => {
    fetchFreshDiscounts();
  }, [fetchFreshDiscounts]); // Run on mount and when fetchFreshDiscounts changes

  useEffect(() => {
    const handleAddressChange = () => setTick((t) => t + 1);
    window.addEventListener("addressChanged", handleAddressChange);
    return () =>
      window.removeEventListener("addressChanged", handleAddressChange);
  }, []);

  // No router event listeners needed since we're not redirecting

  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<"promo" | "referral" | null>(null);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [serviceFeeDiscount, setServiceFeeDiscount] = useState(0);
  const [deliveryFeeDiscount, setDeliveryFeeDiscount] = useState(0);
  const [validatingCode, setValidatingCode] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  // Payment methods and addresses state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [refundBalance, setRefundBalance] = useState(0);
  const [oneTimePhoneNumber, setOneTimePhoneNumber] = useState<string>("");
  const [showOneTimePhoneInput, setShowOneTimePhoneInput] = useState(false);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Fetch payment methods, addresses, and refund balance on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Fetch payment methods
        const paymentResponse = await fetch("/api/queries/payment-methods");
        const paymentData = await paymentResponse.json();
        const methods = paymentData.paymentMethods || [];
        setSavedPaymentMethods(methods);

        // Find and select the default payment method
        const defaultMethod = methods.find((m: SavedPaymentMethod) => m.is_default);
        if (defaultMethod) {
          setSelectedPaymentValue(defaultMethod.id);
          setSelectedPaymentMethod({
            type:
              defaultMethod.method.toLowerCase() === "mtn momo"
                ? "momo"
                : "card",
            id: defaultMethod.id,
            number: defaultMethod.number,
          });
        }

        // Fetch refund balance
        const refundResponse = await fetch("/api/queries/refunds");
        const refundData = await refundResponse.json();
        setRefundBalance(parseFloat(refundData.totalAmount || "0"));
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoadingPayment(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch("/api/queries/addresses");
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);

        // Check if there's a selected address in cookie
        const cookieValue = Cookies.get("delivery_address");
        if (cookieValue) {
          try {
            const addressObj = JSON.parse(cookieValue);
            if (addressObj.id) {
              setSelectedAddressId(addressObj.id);
            } else {
              // If no ID in cookie, try to find default address
              const defaultAddr = addresses.find((a: SavedAddress) => a.is_default);
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                Cookies.set("delivery_address", JSON.stringify(defaultAddr));
                setTick((t) => t + 1);
              }
            }
          } catch (err) {
            console.error("Error parsing address cookie:", err);
            // Try to find default address
            const defaultAddr = addresses.find((a: SavedAddress) => a.is_default);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              Cookies.set("delivery_address", JSON.stringify(defaultAddr));
              setTick((t) => t + 1);
            }
          }
        } else {
          // No address in cookie, try to find default address
          const defaultAddr = addresses.find((a: SavedAddress) => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            Cookies.set("delivery_address", JSON.stringify(defaultAddr));
            setTick((t) => t + 1);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  // Get selected address for delivery fee calculation
  const selectedAddress = selectedAddressId
    ? savedAddresses.find((a) => a.id === selectedAddressId)
    : null;

  // Service and Delivery Fee calculations - recalculates when selectedAddress changes
  const serviceFee = isFoodCart
    ? 0
    : systemConfig
    ? parseInt(systemConfig.serviceFee)
    : 0;
  const baseDeliveryFee = systemConfig
    ? parseInt(systemConfig.baseDeliveryFee)
    : 0;
  // Surcharge based on units beyond extraUnits threshold
  const extraUnitsThreshold = systemConfig
    ? parseInt(systemConfig.extraUnits)
    : 0;
  const extraUnits = Math.max(0, totalUnits - extraUnitsThreshold);
  const unitsSurcharge =
    extraUnits * (systemConfig ? parseInt(systemConfig.unitsSurcharge) : 0);
  // Surcharge based on distance beyond 3km - uses selected address
  let distanceKm = 0;
  let userAlt = 0;
  if (selectedAddress && selectedAddress.latitude && selectedAddress.longitude) {
    const userLat = parseFloat(selectedAddress.latitude.toString());
    const userLng = parseFloat(selectedAddress.longitude.toString());
    // Altitude is typically not stored in addresses, use 0 as default
    userAlt = 0;
    distanceKm = getDistanceFromLatLonInKm(
      userLat,
      userLng,
      shopLat,
      shopLng
    );
  } else {
    // Fallback to cookie if no address selected yet
    const cookie = Cookies.get("delivery_address");
    if (cookie) {
      try {
        const userAddr = JSON.parse(cookie);
        if (userAddr.latitude && userAddr.longitude) {
          const userLat = parseFloat(userAddr.latitude.toString());
          const userLng = parseFloat(userAddr.longitude.toString());
          userAlt = parseFloat((userAddr.altitude || "0").toString());
          distanceKm = getDistanceFromLatLonInKm(
            userLat,
            userLng,
            shopLat,
            shopLng
          );
        }
      } catch (err) {
        console.error("Error parsing delivery_address cookie:", err);
      }
    }
  }
  const extraDistance = Math.max(0, distanceKm - 3);
  const distanceSurcharge =
    Math.ceil(extraDistance) *
    (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 0);
  // Cap the distance-based delivery fee (before units) at cappedDistanceFee
  const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
  const cappedDistanceFee = systemConfig
    ? parseInt(systemConfig.cappedDistanceFee)
    : 0;
  const finalDistanceFee =
    rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;
  // Final delivery fee includes unit surcharge
  const deliveryFee = finalDistanceFee + unitsSurcharge;

  // Update referral discounts when delivery fee changes (if referral code is applied)
  useEffect(() => {
    if (codeType === "referral" && appliedCode) {
      // Recalculate referral discount based on current delivery fee
      const serviceFeeDiscountAmount = serviceFee * 0.085;
      const deliveryFeeDiscountAmount = deliveryFee * 0.085;
      const totalReferralDiscount = serviceFeeDiscountAmount + deliveryFeeDiscountAmount;

      setServiceFeeDiscount(serviceFeeDiscountAmount);
      setDeliveryFeeDiscount(deliveryFeeDiscountAmount);
      setReferralDiscount(totalReferralDiscount);
    }
  }, [deliveryFee, serviceFee, codeType, appliedCode]);

  // Compute total delivery time: travel time in 3D plus shopping time/preparation time
  const shoppingTime = systemConfig ? parseInt(systemConfig.shoppingTime) : 0;
  const altKm = (shopAlt - userAlt) / 1000;
  const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
  // Cap travel time to reasonable maximum (4 hours = 240 minutes)
  const travelTime = Math.min(Math.ceil(distance3D), 240); // assume 1 km ≈ 1 minute travel, max 4 hours

  // Helper function to parse preparation time string from database
  const parsePreparationTimeString = (timeString?: string): number => {
    if (!timeString || timeString.trim() === "") {
      return 0; // Empty means immediately available
    }

    const cleanTime = timeString.toLowerCase().trim();

    // Handle minutes format: "15min", "30min", etc.
    const minMatch = cleanTime.match(/^(\d+)min$/);
    if (minMatch) {
      return parseInt(minMatch[1]);
    }

    // Handle hours and minutes format: "2hr30min", "1hr15min", etc.
    const hrMinMatch = cleanTime.match(/^(\d+)hr(\d+)min$/);
    if (hrMinMatch) {
      const hours = parseInt(hrMinMatch[1]);
      const mins = parseInt(hrMinMatch[2]);
      return hours * 60 + mins;
    }

    // Handle hours format: "1hr", "2hr", etc.
    const hrMatch = cleanTime.match(/^(\d+)hr$/);
    if (hrMatch) {
      return parseInt(hrMatch[1]) * 60; // Convert hours to minutes
    }

    // Handle just numbers (assume minutes): "15", "30"
    const numMatch = cleanTime.match(/^(\d+)$/);
    if (numMatch) {
      return parseInt(numMatch[1]);
    }

    // Default fallback
    return 0;
  };

  // Calculate food preparation time for food orders
  let preparationTime = 0;
  if (isFoodCart && restaurant) {
    // Calculate realistic preparation time - dishes are prepared simultaneously
    // but the total time is closer to the longest dish time
    const preparationTimes = restaurant.items.map((item) => {
      // Parse the preparation time string from the dish data
      const parsedTime = parsePreparationTimeString(item.preparingTime);
      // If no preparation time or it's 0, use a default of 5 minutes
      return parsedTime || 5;
    });

    if (preparationTimes.length > 0) {
      const maxTime = Math.max(...preparationTimes);

      if (preparationTimes.length === 1) {
        // Single dish - use its preparation time
        preparationTime = maxTime;
      } else {
        // Multiple dishes - find average of dishes with lower prep times
        const lowerTimes = preparationTimes.filter((time) => time < maxTime);

        if (lowerTimes.length > 0) {
          // Average of dishes with lower prep times (can be prepared simultaneously)
          const avgLowerTime =
            lowerTimes.reduce((sum, time) => sum + time, 0) / lowerTimes.length;

          // For longer prep times (>30min), use a more conservative approach
          if (maxTime > 30) {
            // Use 70% of the average of lower times to be more realistic
            preparationTime = Math.round(maxTime + avgLowerTime * 0.7);
          } else {
            // For shorter prep times, add full average
            preparationTime = Math.round(maxTime + avgLowerTime);
          }
        } else {
          // All dishes have the same prep time
          preparationTime = maxTime;
        }
      }

      // Cap preparation time at 90 minutes maximum (1 hour 30 minutes)
      // Dishes above 1 hour can have an exception but never exceed 1.5 hours
      preparationTime = Math.min(preparationTime, 90);
    }
  }

  // Use preparation time for food orders, shopping time for regular orders
  const processingTime = isFoodCart ? preparationTime : shoppingTime;
  const totalTimeMinutes = travelTime + processingTime;

  // Calculate the delivery timestamp (current time + totalTimeMinutes)
  const deliveryDate = new Date(Date.now() + totalTimeMinutes * 60000);
  const deliveryTimestamp = deliveryDate.toISOString();

  // Format the delivery time for display
  let deliveryTime: string;
  const diffMs = deliveryDate.getTime() - Date.now();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // Helper function to format time in minutes to readable format
  const formatTimeMinutes = (totalMinutes: number): string => {
    if (totalMinutes < 60) {
      return `${totalMinutes}min`;
    } else if (totalMinutes < 1440) {
      // Less than 24 hours (1 day)
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    } else if (totalMinutes < 43200) {
      // Less than 30 days (1 month)
      const days = Math.floor(totalMinutes / 1440);
      const remainingHours = Math.floor((totalMinutes % 1440) / 60);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else {
      const months = Math.floor(totalMinutes / 43200);
      const remainingDays = Math.floor((totalMinutes % 43200) / 1440);
      return remainingDays > 0 ? `${months}m ${remainingDays}d` : `${months}m`;
    }
  };

  // Format distance for display
  const formattedDistance = distanceKm > 0 
    ? `${distanceKm.toFixed(1)} km`
    : "0 km";

  // Create detailed delivery time message
  if (isFoodCart) {
    // For food orders, show preparation + delivery time breakdown with distance
    const prepText =
      preparationTime === 0 ? "ready now" : formatTimeMinutes(preparationTime);
    const deliveryText = formatTimeMinutes(travelTime);

    if (days > 0) {
      deliveryTime = `${days} day${days > 1 ? "s" : ""}${
        hours > 0 ? ` ${hours}h` : ""
      } (${formattedDistance}, prep: ${prepText} + delivery: ${deliveryText})`;
    } else if (hours > 0) {
      deliveryTime = `${hours}h${
        mins > 0 ? ` ${mins}m` : ""
      } (${formattedDistance}, prep: ${prepText} + delivery: ${deliveryText})`;
    } else {
      deliveryTime = `${mins} minutes (${formattedDistance}, prep: ${prepText} + delivery: ${deliveryText})`;
    }
  } else {
    // For regular shop orders, show shopping + delivery time with distance
    if (days > 0) {
      deliveryTime = `Will be delivered in ${days} day${days > 1 ? "s" : ""}${
        hours > 0 ? ` ${hours}h` : ""
      } (${formattedDistance})`;
    } else if (hours > 0) {
      deliveryTime = `Will be delivered in ${hours}h${
        mins > 0 ? ` ${mins}m` : ""
      } (${formattedDistance})`;
    } else {
      deliveryTime = `Will be delivered in ${mins} minutes (${formattedDistance})`;
    }
  }

  // discountsEnabled is now a separate state that's always fetched fresh from server

  const handleApplyCode = async () => {
    // If discounts are disabled, don't apply codes
    if (!discountsEnabled) {
      toaster.push(
        <Notification type="warning" header="Discounts Disabled">
          Discounts are currently disabled in the system.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    const code = discountCode.trim().toUpperCase();
    if (!code) {
      toaster.push(
        <Notification type="error" header="Code Required">
          Please enter a promo or referral code.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    setValidatingCode(true);
    
    // First, check if it's a promo code
    const PROMO_CODES: { [code: string]: number } = {
      SAVE10: 0.1,
      SAVE20: 0.2,
    };

    if (PROMO_CODES[code]) {
      // It's a promo code
      setDiscount(Total * PROMO_CODES[code]);
      setAppliedCode(code);
      setCodeType("promo");
      // Clear referral discounts
      setServiceFeeDiscount(0);
      setDeliveryFeeDiscount(0);
      setReferralDiscount(0);
      
      toaster.push(
        <Notification type="success" header="Promo Code Applied">
          Discount applied successfully!
        </Notification>,
        { placement: "topEnd" }
      );
      setValidatingCode(false);
      return;
    }

    // If not a promo code, check if it's a referral code
    try {
      const response = await fetch("/api/referrals/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code }),
      });

      const result = await response.json();

      if (result.valid) {
        // Calculate 17% discount from service fee and delivery fee
        // Split: 8.5% from service fee, 8.5% from delivery fee
        // Note: These will be recalculated when delivery fee changes
        const serviceFeeDiscountAmount = serviceFee * 0.085;
        const deliveryFeeDiscountAmount = deliveryFee * 0.085;
        const totalReferralDiscount = serviceFeeDiscountAmount + deliveryFeeDiscountAmount;

        setServiceFeeDiscount(serviceFeeDiscountAmount);
        setDeliveryFeeDiscount(deliveryFeeDiscountAmount);
        setReferralDiscount(totalReferralDiscount);
        setAppliedCode(code);
        setCodeType("referral");
        // Clear promo discount
        setDiscount(0);

        toaster.push(
          <Notification type="success" header="Referral Code Applied">
            You've received a 17% discount on service and delivery fees!
          </Notification>,
          { placement: "topEnd" }
        );
      } else {
        // Reset all discounts
        setServiceFeeDiscount(0);
        setDeliveryFeeDiscount(0);
        setReferralDiscount(0);
        setDiscount(0);
        setAppliedCode(null);
        setCodeType(null);
        toaster.push(
          <Notification type="error" header="Invalid Code">
            {result.message || "Invalid code. Please check and try again."}
          </Notification>,
          { placement: "topEnd" }
        );
      }
    } catch (error) {
      console.error("Error validating code:", error);
      // Reset all discounts
      setServiceFeeDiscount(0);
      setDeliveryFeeDiscount(0);
      setReferralDiscount(0);
      setDiscount(0);
      setAppliedCode(null);
      setCodeType(null);
      toaster.push(
        <Notification type="error" header="Error">
          Failed to validate code. Please try again.
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setValidatingCode(false);
    }
  };

  // Compute numeric final total including service fee and delivery fee, minus discounts
  const finalServiceFee = serviceFee - serviceFeeDiscount;
  const finalDeliveryFee = deliveryFee - deliveryFeeDiscount;
  const finalTotal = Total - discount + finalServiceFee + finalDeliveryFee;

  const handleProceedToCheckout = async () => {
    // Validate cart has items
    if (totalUnits <= 0) {
      toaster.push(
        <Notification type="warning" header="Empty Cart">
          Your cart is empty.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    // Get selected delivery address from cookie
    const cookieValue = Cookies.get("delivery_address");

    if (!cookieValue) {
      toaster.push(
        <Notification type="error" header="Address Required">
          Please select a delivery address.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    let addressObj;
    try {
      addressObj = JSON.parse(cookieValue);
    } catch (err) {
      console.error("❌ Error parsing delivery_address cookie:", err);
      toaster.push(
        <Notification type="error" header="Invalid Address">
          Invalid delivery address. Please select again.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    const deliveryAddressId = addressObj.id;

    if (!deliveryAddressId) {
      toaster.push(
        <Notification type="error" header="Invalid Address">
          Please select a valid delivery address.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    setIsCheckoutLoading(true);

    // Set a timeout fallback to ensure loading state is always cleared
    const loadingTimeout = setTimeout(() => {
      console.warn("Checkout timeout - clearing loading state");
      setIsCheckoutLoading(false);
    }, 30000); // 30 second timeout

    // Process checkout in background
    try {
      let payload;
      let apiEndpoint;

      if (isFoodCart && restaurant) {
        // Food cart checkout
        apiEndpoint = "/api/food-checkout";
        payload = {
          restaurant_id: restaurant.id,
          delivery_address_id: deliveryAddressId,
          service_fee: "0", // No service fee for food orders
          delivery_fee: finalDeliveryFee.toString(),
          discount: discount > 0 ? discount.toString() : null,
          voucher_code: codeType === "promo" ? appliedCode : null,
          referral_code: codeType === "referral" ? appliedCode : null,
          referral_discount: referralDiscount > 0 ? referralDiscount.toString() : null,
          service_fee_discount: serviceFeeDiscount > 0 ? serviceFeeDiscount.toString() : null,
          delivery_fee_discount: deliveryFeeDiscount > 0 ? deliveryFeeDiscount.toString() : null,
          delivery_time: deliveryTimestamp,
          delivery_notes: deliveryNotes || null,
          items: restaurant.items.map((item) => ({
            dish_id: item.id,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || null,
          })),
        };
      } else {
        // Regular shop cart checkout
        apiEndpoint = "/api/checkout";
        payload = {
          shop_id: shopId,
          delivery_address_id: deliveryAddressId,
          service_fee: finalServiceFee.toString(),
          delivery_fee: finalDeliveryFee.toString(),
          discount: discount > 0 ? discount.toString() : null,
          voucher_code: codeType === "promo" ? appliedCode : null,
          referral_code: codeType === "referral" ? appliedCode : null,
          referral_discount: referralDiscount > 0 ? referralDiscount.toString() : null,
          service_fee_discount: serviceFeeDiscount > 0 ? serviceFeeDiscount.toString() : null,
          delivery_fee_discount: deliveryFeeDiscount > 0 ? deliveryFeeDiscount.toString() : null,
          delivery_time: deliveryTimestamp,
          delivery_notes: deliveryNotes || null,
        };
      }

      // Make API call in background (don't await)
      fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            console.error(
              "❌ Checkout error:",
              data.error || "Checkout failed"
            );
            // Show error notification
            toaster.push(
              <Notification type="error" header="Checkout Failed">
                {data.error ||
                  "There was an error processing your order. Please try again."}
              </Notification>,
              { placement: "topEnd", duration: 5000 }
            );
            clearTimeout(loadingTimeout);
            setIsCheckoutLoading(false);
          } else {
            if (isFoodCart && restaurant) {
              // Handle food cart success
              clearRestaurant(restaurant.id);
              toaster.push(
                <Notification
                  type="success"
                  header="Food Order Completed Successfully!"
                >
                  Your food order #{data.order_id?.slice(-8)} has been placed
                  and is being prepared! You can view it in "Current Orders".
                </Notification>,
                { placement: "topEnd", duration: 5000 }
              );
              clearTimeout(loadingTimeout);
              setIsCheckoutLoading(false);

              // Trigger cart refetch to show cart is cleared
              setTimeout(() => {
                const cartChangedEvent = new CustomEvent("cartChanged", {
                  detail: { refetch: true },
                });
                window.dispatchEvent(cartChangedEvent);
              }, 500);
            } else {
              // Handle regular shop cart success
              // Clear loading state immediately
              clearTimeout(loadingTimeout);
              setIsCheckoutLoading(false);

              // Show success notification
              toaster.push(
                <Notification
                  type="success"
                  header="Order Completed Successfully!"
                >
                  Your order #{data.order_id?.slice(-8)} has been placed and is
                  being prepared! You can view it in "Current Orders".
                </Notification>,
                { placement: "topEnd", duration: 5000 }
              );

              // Trigger cart refresh to show cart is cleared
              setTimeout(() => {
                const cartChangedEvent = new CustomEvent("cartChanged", {
                  detail: { shop_id: shopId, refetch: true },
                });
                window.dispatchEvent(cartChangedEvent);
              }, 500);
            }
          }
        })
        .catch((err) => {
          console.error("❌ Checkout fetch error:", err);
          clearTimeout(loadingTimeout);
          toaster.push(
            <Notification type="error" header="Network Error">
              Unable to process your order. Please check your connection and try
              again.
            </Notification>,
            { placement: "topEnd", duration: 5000 }
          );
          setIsCheckoutLoading(false);
        });
    } catch (err: any) {
      console.error("❌ Checkout setup error:", err);
      // Hide loading overlay on error
      clearTimeout(loadingTimeout);
      setIsCheckoutLoading(false);
    }
  };

  // Toggle mobile checkout card expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (value: string | null) => {
    setSelectedPaymentValue(value);
    setShowOneTimePhoneInput(false);

    if (!value) {
      setSelectedPaymentMethod(null);
      return;
    }

    if (value === "refund") {
      setSelectedPaymentMethod({ type: "refund" });
    } else if (value === "one-time-phone") {
      setShowOneTimePhoneInput(true);
      setSelectedPaymentMethod({ type: "momo", number: oneTimePhoneNumber });
    } else {
      const method = savedPaymentMethods.find((m) => m.id === value);
      if (method) {
        setSelectedPaymentMethod({
          type: method.method.toLowerCase() === "mtn momo" ? "momo" : "card",
          id: method.id,
          number: method.number,
        });
      }
    }
  };

  // Handle one-time phone number change
  const handleOneTimePhoneChange = (value: string, event?: React.SyntheticEvent) => {
    setOneTimePhoneNumber(value);
    if (value) {
      setSelectedPaymentMethod({ type: "momo", number: value });
    }
  };

  // Handle address selection
  const handleAddressChange = (value: string | null) => {
    setSelectedAddressId(value);
    if (value) {
      const address = savedAddresses.find((a) => a.id === value);
      if (address) {
        Cookies.set("delivery_address", JSON.stringify(address));
        setTick((t) => t + 1);
      }
    }
  };

  // Prepare payment method options for dropdown
  const getPaymentMethodOptions = () => {
    const options: Array<{ label: string; value: string }> = [];
    const canUseRefund = refundBalance >= finalTotal;

    // Add refund option if balance is sufficient
    if (canUseRefund) {
      options.push({
        label: `Use Refund Balance (${formatCurrency(refundBalance)} available)`,
        value: "refund",
      });
    }

    // Add saved payment methods
    savedPaymentMethods.forEach((method) => {
      const displayNumber =
        method.method.toLowerCase() === "mtn momo"
          ? `•••• ${method.number.slice(-3)}`
          : `•••• ${method.number.slice(-4)}`;
      options.push({
        label: `${method.method} ${displayNumber}${method.is_default ? " (Default)" : ""}`,
        value: method.id,
      });
    });

    // Add one-time phone number option
    options.push({
      label: "Use One-Time Phone Number",
      value: "one-time-phone",
    });

    return options;
  };

  // Prepare address options for dropdown
  const getAddressOptions = () => {
    return savedAddresses.map((address) => ({
      label: `${address.street}, ${address.city}${address.is_default ? " (Default)" : ""}`,
      value: address.id,
    }));
  };

  // Update the payment method display section
  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs text-white">
            LOADING
          </div>
          <span
            className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
          >
            Loading payment method...
          </span>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs text-white">
            NONE
          </div>
          <span
            className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
          >
            No payment method selected
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <div className="mr-2 flex items-center justify-center rounded bg-blue-600 p-2 text-xs text-white">
          {selectedPaymentMethod.type === "refund"
            ? "REFUND"
            : selectedPaymentMethod.type === "momo"
            ? "MOMO"
            : "VISA"}
        </div>
        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          {selectedPaymentMethod.type === "refund"
            ? "Using Refund Balance"
            : selectedPaymentMethod.type === "momo"
            ? `•••• ${selectedPaymentMethod.number?.slice(-3)}`
            : `•••• ${selectedPaymentMethod.number?.slice(-4)}`}
        </span>
      </div>
    );
  };

  // Show loading state while fetching configuration
  if (configLoading) {
    return (
      <div className="w-full md:block lg:w-1/3">
        <div className="sticky top-20">
          <Panel
            shaded
            bordered
            className="overflow-hidden rounded-xl border-0 bg-white shadow-lg"
          >
            <div className="flex h-48 flex-col items-center justify-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-purple-800"></div>
              <p className="text-lg font-medium">
                Loading checkout information...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Fetching system configuration
              </p>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Loading Overlay - Shows during checkout process */}
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`rounded-xl p-8 shadow-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Spinner */}
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-green-500"></div>

              {/* Loading Text */}
              <div className="text-center">
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Processing Your Order
                </h3>
                <p
                  className={`mt-2 text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Please wait while we process your checkout and refresh your
                  cart...
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile View - Only visible on small devices */}
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg transition-all duration-300 md:hidden"
          onClick={toggleExpand}
        />
      )}

      <div
        className={`fixed bottom-16 left-0 right-0 z-50 w-full rounded-2xl transition-all duration-300 md:hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } ${isExpanded ? "shadow-2xl" : "shadow-xl"}`}
        style={{
          maxHeight: isExpanded ? "calc(90vh - 64px)" : "160px",
          overflow: "hidden",
        }}
      >
        {/* Header with toggle button */}
        <div
          className="flex items-center justify-between p-4 shadow-sm"
          onClick={toggleExpand} // Make the entire header clickable to toggle
        >
          <div className="flex items-center">
            <span
              className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Order Summary
            </span>
            <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
              {totalUnits} items
            </span>
          </div>
          <div className="flex items-center">
            <span
              className={`mr-2 font-bold text-green-600 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              {formatCurrency(finalTotal)}
            </span>
            <button
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isExpanded ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Checkout button when collapsed */}
        {!isExpanded && (
          <div className="p-4">
            <Button
              appearance="primary"
              color="green"
              block
              size="lg"
              loading={isCheckoutLoading}
              onClick={handleProceedToCheckout}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}

        {/* Expanded content */}
        <div
          className={`p-4 ${isExpanded ? "block" : "hidden"} overflow-y-auto`}
          style={{ maxHeight: "calc(90vh - 124px)" }}
        >
          {discountsEnabled && (
            <div>
              <p
                className={`mb-0.5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Promo or Referral Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter promo or referral code"
                  className="flex-1 border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                />
                <Button
                  appearance="primary"
                  color="green"
                  className="bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md whitespace-nowrap"
                  onClick={handleApplyCode}
                  loading={validatingCode}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          <div className="my-1.5 h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between py-1">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Subtotal
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(Total)}
              </span>
            </div>
            {discount > 0 && codeType === "promo" && (
              <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                <span className="text-sm">Discount ({appliedCode})</span>
                <span className="text-sm font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}
            {referralDiscount > 0 && codeType === "referral" && (
              <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                <span className="text-sm">Referral Discount ({appliedCode})</span>
                <span className="text-sm font-medium">17% off</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Units
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {totalUnits}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Service Fee
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(finalServiceFee)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Delivery Fee
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(finalDeliveryFee)}
              </span>
            </div>
            <div className="my-3 h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex justify-between py-1">
              <span
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Total
              </span>
              <span className="text-lg font-bold text-green-500 dark:text-green-400">
                {formatCurrency(finalTotal)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Delivery Time
              </span>
              <span
                className={`text-sm font-medium text-green-600 dark:text-green-400`}
              >
                {deliveryTime}
              </span>
            </div>
            <div className="mt-2">
              <h4
                className={`mb-1 text-sm font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Delivery Address
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressDropdown(!showAddressDropdown);
                    setShowPaymentDropdown(false);
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm transition-all ${
                    selectedAddressId
                      ? "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white"
                      : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {selectedAddressId
                    ? getAddressOptions().find((opt) => opt.value === selectedAddressId)?.label ||
                      "Select delivery address"
                    : "Select delivery address"}
                  <svg
                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-transform ${
                      showAddressDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showAddressDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAddressDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {getAddressOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleAddressChange(option.value);
                            setShowAddressDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedAddressId === option.value
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="mt-1 w-full rounded-lg border-2 border-green-500 bg-transparent px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                onClick={() => {
                  setShowAddressModal(true);
                }}
              >
                + Add New Address
              </button>
            </div>
            <div className="mt-2">
              <h4
                className={`mb-1 text-sm font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Payment Method
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentDropdown(!showPaymentDropdown);
                    setShowAddressDropdown(false);
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm transition-all ${
                    selectedPaymentValue
                      ? "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white"
                      : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {selectedPaymentValue
                    ? getPaymentMethodOptions().find((opt) => opt.value === selectedPaymentValue)?.label ||
                      "Select payment method"
                    : "Select payment method"}
                  <svg
                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-transform ${
                      showPaymentDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showPaymentDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPaymentDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {getPaymentMethodOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handlePaymentMethodChange(option.value);
                            setShowPaymentDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedPaymentValue === option.value
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {showOneTimePhoneInput && (
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={oneTimePhoneNumber}
                  onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                  className="mt-2 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
                />
              )}
            </div>
            {/* Delivery Notes Input */}
            <div className="mt-2">
              <h4
                className={`mb-0.5 text-sm font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Add a Note
              </h4>
              <textarea
                rows={3}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Enter any delivery instructions or notes"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on input
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400/20"
              />
            </div>
            {/* Proceed to Checkout Button */}
            <div className="mt-4">
              <Button
                appearance="primary"
                color="green"
                block
                size="lg"
                loading={isCheckoutLoading}
                onClick={handleProceedToCheckout}
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Only visible on medium and larger devices */}
      <div className="hidden w-full md:block lg:w-1/3">
        <div className="sticky top-20">
          <Panel
            shaded
            bordered
            className={`overflow-hidden rounded-xl border-0 shadow-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className={`-mx-4 -mt-4 mb-2 p-3 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Order Summary
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(Total)}
                </span>
              </div>

              {discount > 0 && codeType === "promo" && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-green-600 dark:text-green-400">Discount ({appliedCode})</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">-{formatCurrency(discount)}</span>
                </div>
              )}
              {referralDiscount > 0 && codeType === "referral" && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-green-600 dark:text-green-400">Referral Discount ({appliedCode})</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">17% off</span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Units</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalUnits}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Service Fee
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(finalServiceFee)}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Delivery Fee
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(finalDeliveryFee)}
                </span>
              </div>

              <div className="my-3 h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex justify-between py-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                Delivery Time
              </h4>
              <div className="flex items-center rounded-xl bg-gray-50 p-2 shadow-sm dark:bg-gray-700/50">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-5 w-5 text-green-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {deliveryTime}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Delivery Address
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressDropdown(!showAddressDropdown);
                    setShowPaymentDropdown(false);
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm transition-all ${
                    selectedAddressId
                      ? "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white"
                      : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {selectedAddressId
                    ? getAddressOptions().find((opt) => opt.value === selectedAddressId)?.label ||
                      "Select delivery address"
                    : "Select delivery address"}
                  <svg
                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-transform ${
                      showAddressDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showAddressDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAddressDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {getAddressOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleAddressChange(option.value);
                            setShowAddressDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedAddressId === option.value
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-lg border-2 border-green-500 bg-transparent px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                onClick={() => {
                  setShowAddressModal(true);
                }}
              >
                + Add New Address
              </button>
            </div>

            <div className="mt-2">
              <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentDropdown(!showPaymentDropdown);
                    setShowAddressDropdown(false);
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm transition-all ${
                    selectedPaymentValue
                      ? "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white"
                      : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {selectedPaymentValue
                    ? getPaymentMethodOptions().find((opt) => opt.value === selectedPaymentValue)?.label ||
                      "Select payment method"
                    : "Select payment method"}
                  <svg
                    className={`absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-transform ${
                      showPaymentDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showPaymentDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPaymentDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {getPaymentMethodOptions().map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handlePaymentMethodChange(option.value);
                            setShowPaymentDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedPaymentValue === option.value
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {showOneTimePhoneInput && (
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={oneTimePhoneNumber}
                  onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                  className="mt-2 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
                />
              )}
            </div>

            {discountsEnabled && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Promo or Referral Code
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter promo or referral code"
                    className="flex-1 border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                  />
                  <Button
                    appearance="primary"
                    color="green"
                    className="bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md whitespace-nowrap"
                    onClick={handleApplyCode}
                    loading={validatingCode}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-2">
              <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                Add a Note
              </h4>
              <textarea
                rows={3}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Enter any delivery instructions or notes"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400/20"
              />
            </div>

            <Button
              color="green"
              appearance="primary"
              block
              size="lg"
              className="mt-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              onClick={handleProceedToCheckout}
              loading={isCheckoutLoading}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              By placing your order, you agree to our{" "}
              <Link
                href="/terms"
                className="text-green-600 dark:text-green-400"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-green-600 dark:text-green-400"
              >
                Privacy Policy
              </Link>
            </div>
          </Panel>
        </div>
      </div>

      {/* Address Management Modal */}
      <AddressManagementModal
        open={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          // Refresh addresses after modal closes
          fetch("/api/queries/addresses")
            .then(async (res) => {
              if (!res.ok) {
                throw new Error(`Failed to load addresses (${res.status})`);
              }
              const data = await res.json();
              setSavedAddresses(data.addresses || []);
            })
            .catch((err) => {
              console.error("Error fetching addresses:", err);
            });
        }}
        onSelect={(address) => {
          Cookies.set("delivery_address", JSON.stringify(address));
          setSelectedAddressId(address.id);
          setShowAddressModal(false);
          setTick((t) => t + 1); // Force re-render to update address display
        }}
      />
    </>
  );
}
