import React, { useState, useEffect } from "react";
import { Input, Button, Panel, Modal, toaster, Notification } from "rsuite";
import Link from "next/link"; // Make sure you import Link if you use it
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
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

interface CheckoutItemsProps {
  Total: number;
  totalUnits: number;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
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
}: CheckoutItemsProps) {
  const { theme } = useTheme();
  const router = useRouter();
  // Re-render when the address cookie changes
  const [, setTick] = useState(0);
  // Mobile checkout card expand/collapse state
  const [isExpanded, setIsExpanded] = useState(false);
  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(
    null
  );
  const [configLoading, setConfigLoading] = useState(true);
  // Address management modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Checkout loading state
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Fetch system configuration
  useEffect(() => {
    // Function to fetch config from API and update cache
    const fetchConfigFromAPI = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();

        if (data.success && data.config) {
          console.log("Fetched system configuration from API:", data.config);
          setSystemConfig(data.config);

          // Store in cookie with expiration and timestamp
          const cacheData = {
            config: data.config,
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
          console.log(
            "Background refresh of system configuration successful:",
            data.config
          );
          setSystemConfig(data.config);

          // Update cache with new data and timestamp
          const cacheData = {
            config: data.config,
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
              // New format with timestamp
              console.log(
                "Found cached system configuration:",
                parsedCache.config
              );
              setSystemConfig(parsedCache.config);

              // Check if cache is stale and needs background refresh
              const cacheAge = Date.now() - parsedCache.timestamp;
              if (cacheAge > CACHE_REFRESH_MS) {
                console.log("Cache is stale, refreshing in background");
                refreshConfigInBackground();
              }
            } else {
              // Old format or unexpected structure - treat as config directly
              console.log(
                "Found cached system configuration (legacy format):",
                parsedCache
              );
              setSystemConfig(parsedCache);

              // Always refresh old format in background to update to new format
              console.log("Updating cache format in background");
              refreshConfigInBackground();
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
        console.log("System configuration cache cleared");
        fetchConfigFromAPI();
      };
    }

    fetchSystemConfig();
  }, []);

  useEffect(() => {
    const handleAddressChange = () => setTick((t) => t + 1);
    window.addEventListener("addressChanged", handleAddressChange);
    return () =>
      window.removeEventListener("addressChanged", handleAddressChange);
  }, []);

  // No router event listeners needed since we're not redirecting

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  // Fetch default payment method on component mount
  useEffect(() => {
    const fetchDefaultPaymentMethod = async () => {
      try {
        const response = await fetch("/api/queries/payment-methods");
        const data = await response.json();
        const defaultMethod = data.paymentMethods?.find(
          (m: any) => m.is_default
        );

        if (defaultMethod) {
          setSelectedPaymentMethod({
            type:
              defaultMethod.method.toLowerCase() === "mtn momo"
                ? "momo"
                : "card",
            id: defaultMethod.id,
            number: defaultMethod.number,
          });
        }
      } catch (error) {
        console.error("Error fetching default payment method:", error);
      } finally {
        setLoadingPayment(false);
      }
    };

    fetchDefaultPaymentMethod();
  }, []);

  // Service and Delivery Fee calculations
  const serviceFee = systemConfig ? parseInt(systemConfig.serviceFee) : 0;
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
  // Surcharge based on distance beyond 3km
  let distanceKm = 0;
  let userAlt = 0;
  const cookie = Cookies.get("delivery_address");
  if (cookie) {
    try {
      const userAddr = JSON.parse(cookie);
      const userLat = parseFloat(userAddr.latitude);
      const userLng = parseFloat(userAddr.longitude);
      userAlt = parseFloat(userAddr.altitude || "0");
      distanceKm = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        shopLat,
        shopLng
      );
    } catch (err) {
      console.error("Error parsing delivery_address cookie:", err);
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

  // Compute total delivery time: travel time in 3D plus shopping time
  const shoppingTime = systemConfig ? parseInt(systemConfig.shoppingTime) : 0;
  const altKm = (shopAlt - userAlt) / 1000;
  const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
  const travelTime = Math.ceil(distance3D); // assume 1 km ≈ 1 minute travel
  const totalTimeMinutes = travelTime + shoppingTime;

  // Calculate the delivery timestamp (current time + totalTimeMinutes)
  const deliveryDate = new Date(Date.now() + totalTimeMinutes * 60000);
  const deliveryTimestamp = deliveryDate.toISOString();

  // Format the delivery time for display
  let deliveryTime: string;
  const diffMs = deliveryDate.getTime() - Date.now();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    deliveryTime = `Will be delivered in ${days} day${days > 1 ? "s" : ""}${
      hours > 0 ? ` ${hours}h` : ""
    }`;
  } else if (hours > 0) {
    deliveryTime = `Will be delivered in ${hours}h${
      mins > 0 ? ` ${mins}m` : ""
    }`;
  } else {
    deliveryTime = `Will be delivered in ${mins} minutes`;
  }

  // Check if discounts are enabled in system configuration
  const discountsEnabled = systemConfig ? systemConfig.discounts : false;

  const handleApplyPromo = () => {
    // If discounts are disabled, don't apply promo codes
    if (!discountsEnabled) {
      toaster.push(
        <Notification type="warning" header="Discounts Disabled">
          Discounts are currently disabled in the system.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    const PROMO_CODES: { [code: string]: number } = {
      SAVE10: 0.1,
      SAVE20: 0.2,
    };

    const code = promoCode.trim().toUpperCase();

    if (PROMO_CODES[code]) {
      setDiscount(Total * PROMO_CODES[code]);
      setAppliedPromo(code);
    } else {
      setDiscount(0);
      setAppliedPromo(null);
      toaster.push(
        <Notification type="error" header="Invalid Promo Code">
          Invalid promo code.
        </Notification>,
        { placement: "topEnd" }
      );
    }
  };

  // Compute numeric final total including service fee
  const finalTotal = Total - discount + serviceFee + deliveryFee;

  const handleProceedToCheckout = async () => {
    console.log("🚀 Starting checkout process...");
    
    // Validate cart has items
    if (totalUnits <= 0) {
      console.log("❌ Cart is empty, cannot proceed");
      toaster.push(
        <Notification type="warning" header="Empty Cart">
          Your cart is empty.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }
    
    console.log("✅ Cart validation passed, totalUnits:", totalUnits);
    
    // Get selected delivery address from cookie
    const cookieValue = Cookies.get("delivery_address");
    console.log("📍 Delivery address cookie:", cookieValue ? "Found" : "Missing");
    
    if (!cookieValue) {
      console.log("❌ No delivery address found");
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
      console.log("✅ Address parsed successfully:", addressObj);
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
    console.log("📍 Delivery address ID:", deliveryAddressId);
    
    if (!deliveryAddressId) {
      console.log("❌ No delivery address ID found");
      toaster.push(
        <Notification type="error" header="Invalid Address">
          Please select a valid delivery address.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }
    
    console.log("🔄 Setting loading state to true");
    setIsCheckoutLoading(true);
    
        // No immediate notification - will show after cart refresh completes

        // Cart refresh will happen after API call completes
        // Loading overlay will be hidden after cart refresh completes
    
    // Process checkout in background
    try {
      console.log("📦 Preparing checkout payload...");
      // Prepare checkout payload
      const payload = {
        shop_id: shopId,
        delivery_address_id: deliveryAddressId,
        service_fee: serviceFee.toString(),
        delivery_fee: deliveryFee.toString(),
        discount: discount > 0 ? discount.toString() : null,
        voucher_code: appliedPromo,
        delivery_time: deliveryTimestamp,
        delivery_notes: deliveryNotes || null,
      };
      
      console.log("📦 Checkout payload:", payload);
      
      // Make API call in background (don't await)
      console.log("🌐 Making API call to /api/checkout...");
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
           }).then(async (res) => {
             console.log("📡 API response received:", res.status, res.statusText);
             const data = await res.json();
             if (!res.ok) {
               console.error("❌ Checkout error:", data.error || "Checkout failed");
               // Show error notification
               toaster.push(
                 <Notification type="error" header="Checkout Failed">
                   {data.error || "There was an error processing your order. Please try again."}
                 </Notification>,
                 { placement: "topEnd", duration: 5000 }
               );
               setIsCheckoutLoading(false);
             } else {
               console.log("✅ Order processed successfully in background:", data);
               
               // Refresh cart data after successful checkout
               console.log("🛒 Refreshing cart data after successful checkout");
               setTimeout(() => {
                 console.log("🔄 Dispatching cartChanged event with callback...");
                 // Create custom event with callback to hide loading overlay and show success notification
                 const cartChangedEvent = new CustomEvent("cartChanged", {
                   detail: {
                     hideLoadingCallback: () => {
                       console.log("✅ Cart refresh completed, hiding loading overlay");
                       setIsCheckoutLoading(false);
                       
                       // Show final success toast after overlay disappears
                       setTimeout(() => {
                         toaster.push(
                           <Notification type="success" header="Order Completed Successfully!">
                             Your order #{data.order_id?.slice(-8)} has been placed and is being prepared! You can view it in "Current Orders".
                           </Notification>,
                           { placement: "topEnd", duration: 5000 }
                         );
                       }, 100); // Small delay to ensure overlay is fully hidden
                     }
                   }
                 });
                 window.dispatchEvent(cartChangedEvent);
               }, 1000); // Increased delay to ensure server processing is complete
             }
           }).catch((err) => {
             console.error("❌ Checkout fetch error:", err);
             toaster.push(
               <Notification type="error" header="Network Error">
                 Unable to process your order. Please check your connection and try again.
               </Notification>,
               { placement: "topEnd", duration: 5000 }
             );
             setIsCheckoutLoading(false);
           });
      
    } catch (err: any) {
      console.error("❌ Checkout setup error:", err);
      // Hide loading overlay on error
      setIsCheckoutLoading(false);
    }
  };

  // Toggle mobile checkout card expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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
          <div className={`rounded-xl p-8 shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col items-center space-y-4">
              {/* Spinner */}
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-green-500"></div>
              
              {/* Loading Text */}
              <div className="text-center">
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Processing Your Order
                </h3>
                 <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                   Please wait while we process your checkout and refresh your cart...
                 </p>
              </div>
              
              {/* Progress Steps */}
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse"></div>
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
        className={`fixed bottom-16 left-0 right-0 z-50 w-full transition-all duration-300 md:hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } ${
          isExpanded
            ? "border-2 border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] ring-4 ring-white/20"
            : "shadow-2xl"
        }`}
        style={{
          maxHeight: isExpanded ? "calc(90vh - 64px)" : "160px",
          overflow: "hidden",
        }}
      >
        {/* Header with toggle button */}
        <div
          className={`flex items-center justify-between border-b p-4 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
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
                className={`mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Do you have any promo code?
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={promoCode}
                  onChange={setPromoCode}
                  placeholder="Enter promo code"
                  className="max-w-md"
                />
                <Button
                  appearance="primary"
                  color="green"
                  className="bg-green-100 font-medium text-green-600 dark:bg-green-900/20 dark:text-green-300"
                  onClick={handleApplyPromo}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          <hr
            className={`mt-4 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          />

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Subtotal
              </span>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(Total)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span className="text-sm">Discount ({appliedPromo})</span>
                <span className="text-sm">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Units
              </span>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {totalUnits}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Service Fee
              </span>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(serviceFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Delivery Fee
              </span>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
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
            <div className="flex justify-between">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Delivery Address
              </span>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  {(() => {
                    const cookieValue = Cookies.get("delivery_address");
                    if (!cookieValue) {
                      return (
                        <span className="text-sm text-red-500">No address</span>
                      );
                    }
                    try {
                      const addressObj = JSON.parse(cookieValue);
                      if (addressObj.street && addressObj.city) {
                        return (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {addressObj.street.length > 20
                                ? `${addressObj.street.substring(0, 20)}...`
                                : addressObj.street}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {addressObj.city}
                            </div>
                          </div>
                        );
                      } else if (addressObj.latitude && addressObj.longitude) {
                        return (
                          <span className="text-sm text-gray-900 dark:text-white">
                            Current Location
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-sm text-red-500">Invalid</span>
                        );
                      }
                    } catch (err) {
                      return (
                        <span className="text-sm text-red-500">Error</span>
                      );
                    }
                  })()}
                </div>
                <Button
                  size="xs"
                  appearance="ghost"
                  className="px-2 py-1 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => {
                    setShowAddressModal(true);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
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
            {/* Delivery Notes Input */}
            <div className="mt-2">
              <h4
                className={`mb-1 font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Add a Note
              </h4>
              <Input
                as="textarea"
                rows={2}
                value={deliveryNotes}
                onChange={setDeliveryNotes}
                placeholder="Enter any delivery instructions or notes"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on input
              />
            </div>
            {/* Proceed to Checkout Button */}
            <div className="mt-2">
              <Button
                appearance="primary"
                color="green"
                block
                size="lg"
                loading={isCheckoutLoading}
                onClick={handleProceedToCheckout}
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
              className={`-mx-4 -mt-4 mb-6 p-4 ${
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

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(Total)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({appliedPromo})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Units</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {totalUnits}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Service Fee
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(serviceFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Delivery Fee
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Delivery Time
              </h4>
              <div className="flex items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
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
                <span className="font-medium text-green-600 dark:text-green-400">
                  {deliveryTime}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Delivery Address
              </h4>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 h-4 w-4 text-green-500"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      {(() => {
                        const cookieValue = Cookies.get("delivery_address");
                        if (!cookieValue) {
                          return (
                            <p className="text-sm text-red-500">
                              No delivery address selected
                            </p>
                          );
                        }
                        try {
                          const addressObj = JSON.parse(cookieValue);
                          if (addressObj.street && addressObj.city) {
                            return (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {addressObj.street}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {addressObj.city}
                                  {addressObj.postal_code &&
                                    `, ${addressObj.postal_code}`}
                                </p>
                              </div>
                            );
                          } else if (
                            addressObj.latitude &&
                            addressObj.longitude
                          ) {
                            return (
                              <p className="text-sm text-gray-900 dark:text-white">
                                Current Location
                              </p>
                            );
                          } else {
                            return (
                              <p className="text-sm text-red-500">
                                Invalid address format
                              </p>
                            );
                          }
                        } catch (err) {
                          return (
                            <p className="text-sm text-red-500">
                              Error reading address
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    appearance="ghost"
                    className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    onClick={() => {
                      setShowAddressModal(true);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Payment Method
              </h4>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                {renderPaymentMethod()}
                <PaymentMethodSelector
                  totalAmount={finalTotal}
                  onSelect={(method) => {
                    setSelectedPaymentMethod(method);
                  }}
                />
              </div>
            </div>

            {discountsEnabled && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Promo Code
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={setPromoCode}
                    placeholder="Enter promo code"
                  />
                  <Button
                    appearance="primary"
                    color="green"
                    className="bg-green-100 font-medium text-green-600 dark:bg-green-900/20 dark:text-green-300"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Add a Note
              </h4>
              <Input
                as="textarea"
                rows={3}
                value={deliveryNotes}
                onChange={setDeliveryNotes}
                placeholder="Enter any delivery instructions or notes"
              />
            </div>

            <Button
              color="green"
              appearance="primary"
              block
              size="lg"
              className="mt-6 bg-green-500 font-medium text-white hover:bg-green-600"
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
        onClose={() => setShowAddressModal(false)}
        onSelect={(address) => {
          Cookies.set("delivery_address", JSON.stringify(address));
          setShowAddressModal(false);
          setTick((t) => t + 1); // Force re-render to update address display
        }}
      />
    </>
  );
}