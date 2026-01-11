import React, { useState, useEffect, useCallback } from "react";
import { Button, Panel, Modal, toaster, Notification } from "rsuite";
import Link from "next/link";
import { formatCurrency } from "../../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useAuth as useAuthHook } from "../../../hooks/useAuth";
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
  type: "refund" | "card" | "momo" | "wallet";
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
  const { isGuest } = useAuthHook();
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

      if (
        data.success &&
        data.config &&
        typeof data.config.discounts === "boolean"
      ) {
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
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [refundBalance, setRefundBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);
  const [oneTimePhoneNumber, setOneTimePhoneNumber] = useState<string>("");
  const [showOneTimePhoneInput, setShowOneTimePhoneInput] = useState(false);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState<
    string | null
  >(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Combined carts state
  const [availableCarts, setAvailableCarts] = useState<any[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<Set<string>>(new Set());
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [refetchCartDetails, setRefetchCartDetails] = useState(0);
  const [cartDetails, setCartDetails] = useState<{
    [key: string]: {
      total: number;
      units: number;
      deliveryFee: number;
      serviceFee: number;
      distance: string;
      deliveryTime: string;
      shopLat: number;
      shopLng: number;
    };
  }>({});

  // Fetch available carts to combine with
  useEffect(() => {
    const fetchAvailableCarts = async () => {
      try {
        setLoadingCarts(true);
        const response = await fetch("/api/carts");
        const data = await response.json();
        
        if (data.carts) {
          // Filter out the current cart
          const otherCarts = data.carts.filter((cart: any) => cart.id !== shopId);
          setAvailableCarts(otherCarts);
        }
      } catch (error) {
        console.error("Error fetching available carts:", error);
      } finally {
        setLoadingCarts(false);
      }
    };

    if (!isFoodCart) {
      // Only show cart combination for regular shop carts, not food carts
      fetchAvailableCarts();
    } else {
      setLoadingCarts(false);
    }
  }, [shopId, isFoodCart]);

  // Fetch cart details for all available carts (not just selected)
  useEffect(() => {
    const fetchCartDetails = async () => {
      // Get current selected address (same logic as main component)
      let currentAddress = selectedAddressId
        ? savedAddresses.find((a) => a.id === selectedAddressId)
        : null;

      // Fallback to cookie if no address selected (for guest users)
      let userLat = 0;
      let userLng = 0;
      let hasUserLocation = false;

      if (currentAddress && currentAddress.latitude && currentAddress.longitude) {
        userLat = parseFloat(currentAddress.latitude.toString());
        userLng = parseFloat(currentAddress.longitude.toString());
        hasUserLocation = true;
      } else {
        // Try cookie fallback
        const cookie = Cookies.get("delivery_address");
        if (cookie) {
          try {
            const userAddr = JSON.parse(cookie);
            if (userAddr.latitude && userAddr.longitude) {
              userLat = parseFloat(userAddr.latitude.toString());
              userLng = parseFloat(userAddr.longitude.toString());
              hasUserLocation = true;
            }
          } catch (err) {
            console.error("Error parsing delivery_address cookie:", err);
          }
        }
      }

      // Only proceed if we have user location
      if (!hasUserLocation) {
        return;
      }

      for (const cart of availableCarts) {
        // Only skip if we have valid data (not N/A for distance)
        if (cartDetails[cart.id] && cartDetails[cart.id].distance !== "N/A") {
          continue;
        }

        try {
          // Fetch cart items (now includes shop coordinates)
          const itemsResponse = await fetch(`/api/cart-items?shop_id=${cart.id}`);
          const itemsData = await itemsResponse.json();
          const items = itemsData.items || [];
          const shopLatitude = itemsData.shopLatitude;
          const shopLongitude = itemsData.shopLongitude;

          // Calculate subtotal
          const cartTotal = items.reduce(
            (sum: number, item: any) =>
              sum + parseFloat(item.price || "0") * item.quantity,
            0
          );

          // Calculate units
          const cartUnits = items.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          );

          // Calculate service fee (same as main cart)
          const cartServiceFee = systemConfig
            ? parseInt(systemConfig.serviceFee)
            : 0;

          // Calculate delivery fee based on distance
          const extraUnitsThreshold = systemConfig
            ? parseInt(systemConfig.extraUnits)
            : 0;
          const extraUnits = Math.max(0, cartUnits - extraUnitsThreshold);
          const unitsSurcharge =
            extraUnits * (systemConfig ? parseInt(systemConfig.unitsSurcharge) : 0);
          
          const baseDeliveryFee = systemConfig
            ? parseInt(systemConfig.baseDeliveryFee)
            : 0;

          // Calculate distance if we have store location
          let distanceKm = 0;
          let cartDeliveryFee = baseDeliveryFee + unitsSurcharge;
          let distanceText = "N/A";
          let deliveryTimeText = "N/A";

          if (shopLatitude && shopLongitude) {
            const storeLat = parseFloat(shopLatitude.toString());
            const storeLng = parseFloat(shopLongitude.toString());

            if (storeLat && storeLng) {
              distanceKm = getDistanceFromLatLonInKm(userLat, userLng, storeLat, storeLng);
              
              // Use 3D distance for consistency with main cart (altitude difference)
              // Assume shop altitude is 0 if not available, user altitude from cookie or 0
              const shopAltitude = 0; // Could be fetched from shop data if available
              const userAltitude = 0; // Could be from address data if available
              const altKm = (shopAltitude - userAltitude) / 1000;
              const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);
              
              distanceText = `${distance3D.toFixed(1)} km`;

              // Calculate distance-based delivery fee using 3D distance
              const extraDistance = Math.max(0, distance3D - 3);
              const distanceSurcharge =
                Math.ceil(extraDistance) *
                (systemConfig ? parseInt(systemConfig.distanceSurcharge) : 0);
              const rawDistanceFee = baseDeliveryFee + distanceSurcharge;
              const cappedDistanceFee = systemConfig
                ? parseInt(systemConfig.cappedDistanceFee)
                : 0;
              const finalDistanceFee =
                rawDistanceFee > cappedDistanceFee ? cappedDistanceFee : rawDistanceFee;
              cartDeliveryFee = finalDistanceFee + unitsSurcharge;

              // Calculate delivery time using 3D distance
              const shoppingTimeMinutes = systemConfig ? parseInt(systemConfig.shoppingTime) : 0;
              const travelTimeMinutes = Math.min(Math.ceil(distance3D), 240); // Cap at 4 hours
              const totalMinutes = shoppingTimeMinutes + travelTimeMinutes;
              
              if (totalMinutes < 60) {
                deliveryTimeText = `${totalMinutes}min`;
              } else {
                const hours = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;
                deliveryTimeText = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
              }

            }
          }

          setCartDetails((prev) => ({
            ...prev,
            [cart.id]: {
              total: cartTotal,
              units: cartUnits,
              deliveryFee: cartDeliveryFee,
              serviceFee: cartServiceFee,
              distance: distanceText,
              deliveryTime: deliveryTimeText,
              shopLat: shopLatitude ? parseFloat(shopLatitude.toString()) : 0,
              shopLng: shopLongitude ? parseFloat(shopLongitude.toString()) : 0,
            },
          }));
        } catch (error) {
          console.error(`Error fetching details for cart ${cart.id}:`, error);
        }
      }
    };

    if (availableCarts.length > 0 && systemConfig) {
      fetchCartDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCarts, systemConfig, selectedAddressId, savedAddresses, refetchCartDetails]);

  // Toggle cart selection
  const toggleCartSelection = (cartId: string) => {
    setSelectedCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartId)) {
        next.delete(cartId);
      } else {
        next.add(cartId);
      }
      return next;
    });
  };

  // Calculate combined delivery time for multiple shops
  const calculateCombinedDeliveryTime = () => {
    if (selectedCartIds.size === 0) {
      return null; // No combined carts, use normal calculation
    }

    // Get user location
    let userLat = 0;
    let userLng = 0;
    
    if (selectedAddress && selectedAddress.latitude && selectedAddress.longitude) {
      userLat = parseFloat(selectedAddress.latitude.toString());
      userLng = parseFloat(selectedAddress.longitude.toString());
    } else {
      const cookie = Cookies.get("delivery_address");
      if (cookie) {
        try {
          const userAddr = JSON.parse(cookie);
          if (userAddr.latitude && userAddr.longitude) {
            userLat = parseFloat(userAddr.latitude.toString());
            userLng = parseFloat(userAddr.longitude.toString());
          }
        } catch (err) {
          // Ignore
        }
      }
    }

    if (!userLat || !userLng) {
      return null; // Can't calculate without user location
    }

    // Create array of all shops (current + selected) with coordinates
    const allShops = [
      { id: shopId, lat: shopLat, lng: shopLng, name: "Current Shop" },
      ...Array.from(selectedCartIds).map(cartId => {
        const details = cartDetails[cartId];
        return {
          id: cartId,
          lat: details?.shopLat || 0,
          lng: details?.shopLng || 0,
          name: availableCarts.find(c => c.id === cartId)?.name || "Shop"
        };
      })
    ].filter(shop => shop.lat !== 0 && shop.lng !== 0); // Filter out shops without coordinates

    // If we only have 1 shop (the current one), return null to use normal calculation
    if (allShops.length <= 1) {
      return null;
    }

    // Shopping time: 15 minutes per shop (faster for combined orders)
    const totalShoppingTime = 15 * allShops.length;

    // Initial travel time: Shopper → First Shop (estimated ~5 min buffer)
    const initialTravelTime = 5; // Fixed 5 minutes for shopper to reach first shop

    // Calculate total travel distance between shops and to customer
    // Route: Shopper → Shop 1 → Shop 2 → ... → Shop N → Customer
    let totalTravelDistance = 0;
    const routeLegs = [`Shopper → ${allShops[0].name}: ~5 min (buffer)`];
    
    // Distance between consecutive shops
    for (let i = 0; i < allShops.length - 1; i++) {
      const shop1 = allShops[i];
      const shop2 = allShops[i + 1];
      const distance = getDistanceFromLatLonInKm(shop1.lat, shop1.lng, shop2.lat, shop2.lng);
      totalTravelDistance += distance;
      routeLegs.push(`${shop1.name} → ${shop2.name}: ${distance.toFixed(2)} km`);
    }
    
    // Distance from last shop to customer
    const lastShop = allShops[allShops.length - 1];
    const lastLegDistance = getDistanceFromLatLonInKm(lastShop.lat, lastShop.lng, userLat, userLng);
    totalTravelDistance += lastLegDistance;
    routeLegs.push(`${lastShop.name} → Customer: ${lastLegDistance.toFixed(2)} km`);

    // Travel time (1 min per km, capped at 240 min)
    const shopToShopTravelTime = Math.min(Math.ceil(totalTravelDistance), 240);
    const totalTravelTime = initialTravelTime + shopToShopTravelTime;
    
    const totalTime = totalShoppingTime + totalTravelTime;

    return {
      totalTime,
      details: {
        numberOfShops: allShops.length,
        shoppingTime: totalShoppingTime,
        initialTravelTime,
        shopToShopTravelTime,
        totalTravelDistance,
        totalTravelTime,
        route: "Shopper → " + allShops.map(s => s.name).join(" → ") + " → Customer",
        routeLegs
      }
    };
  };

  // Log combined delivery time calculation when it changes
  useEffect(() => {
    // Only log when there are actually combined carts
    if (selectedCartIds.size > 0) {
      const combinedCalc = calculateCombinedDeliveryTime();
      if (combinedCalc && combinedCalc.details) {
        console.log(`🚚 Combined Delivery Time Calculation:`);
        console.log(`   📊 ${combinedCalc.details.numberOfShops} shops selected`);
        console.log(`   🛒 Shopping: ${combinedCalc.details.shoppingTime} min (15 min × ${combinedCalc.details.numberOfShops})`);
        console.log(`   🚗 Travel Time Breakdown:`);
        console.log(`      - Shopper to First Shop: ${combinedCalc.details.initialTravelTime} min (buffer)`);
        console.log(`      - Between Shops + To Customer: ${combinedCalc.details.shopToShopTravelTime} min (${combinedCalc.details.totalTravelDistance.toFixed(2)} km)`);
        console.log(`      - Total Travel: ${combinedCalc.details.totalTravelTime} min`);
        console.log(`   📍 Route breakdown:`);
        combinedCalc.details.routeLegs.forEach(leg => {
          console.log(`      ${leg}`);
        });
        console.log(`   ⏱️  Total Time: ${combinedCalc.totalTime} min (${combinedCalc.details.shoppingTime} shopping + ${combinedCalc.details.totalTravelTime} travel)`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCartIds.size, Object.keys(cartDetails).length]);

  // Fetch payment methods, addresses, and refund balance on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // For guest users, skip fetching payment methods and just set up phone payment
        if (isGuest) {
          setSelectedPaymentValue("one-time-phone");
          setShowOneTimePhoneInput(true);
          setSelectedPaymentMethod({ type: "momo", number: oneTimePhoneNumber });
          setLoadingPayment(false);
          return;
        }

        // Fetch payment methods for regular users
        const paymentResponse = await fetch("/api/queries/payment-methods");
        const paymentData = await paymentResponse.json();
        const methods = paymentData.paymentMethods || [];
        setSavedPaymentMethods(methods);

        // Find and select the default payment method
        const defaultMethod = methods.find(
          (m: SavedPaymentMethod) => m.is_default
        );
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

        // Fetch wallet balance
        try {
          const walletResponse = await fetch(
            "/api/queries/personal-wallet-balance"
          );
          const walletData = await walletResponse.json();
          if (walletData.wallet) {
            setWalletBalance(parseFloat(walletData.wallet.balance || "0"));
          } else {
            setWalletBalance(0);
          }
        } catch (walletError) {
          console.error("Error fetching wallet balance:", walletError);
          setWalletBalance(0);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoadingPayment(false);
      }
    };

    fetchPaymentData();
  }, [isGuest]);

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
              const defaultAddr = addresses.find(
                (a: SavedAddress) => a.is_default
              );
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                Cookies.set("delivery_address", JSON.stringify(defaultAddr));
                setTick((t) => t + 1);
              }
            }
          } catch (err) {
            console.error("Error parsing address cookie:", err);
            // Try to find default address
            const defaultAddr = addresses.find(
              (a: SavedAddress) => a.is_default
            );
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
  if (
    selectedAddress &&
    selectedAddress.latitude &&
    selectedAddress.longitude
  ) {
    const userLat = parseFloat(selectedAddress.latitude.toString());
    const userLng = parseFloat(selectedAddress.longitude.toString());
    // Altitude is typically not stored in addresses, use 0 as default
    userAlt = 0;
    distanceKm = getDistanceFromLatLonInKm(userLat, userLng, shopLat, shopLng);
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
      const totalReferralDiscount =
        serviceFeeDiscountAmount + deliveryFeeDiscountAmount;

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
  
  // Log single cart delivery calculation (before combining)
  if (!isFoodCart) {
    console.log(`🛒 Single Cart Delivery Calculation:`);
    console.log(`   📦 Shop: ${shopId.substring(0, 8)}...`);
    console.log(`   🛒 Shopping: ${shoppingTime} min`);
    console.log(`   🚗 Travel: ${travelTime} min (${distanceKm.toFixed(2)} km)`);
    console.log(`   ⏱️  Total Time: ${shoppingTime + travelTime} min`);
  }

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
  
  // Calculate combined delivery time if multiple carts are selected
  const combinedCalc = calculateCombinedDeliveryTime();
  const totalTimeMinutes = combinedCalc !== null ? combinedCalc.totalTime : (travelTime + processingTime);

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
  const formattedDistance =
    distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : "0 km";

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
    const multiShopSuffix = selectedCartIds.size > 0 
      ? ` - ${selectedCartIds.size + 1} shops` 
      : "";
      
    if (days > 0) {
      deliveryTime = `Will be delivered in ${days} day${days > 1 ? "s" : ""}${
        hours > 0 ? ` ${hours}h` : ""
      } (${formattedDistance}${multiShopSuffix})`;
    } else if (hours > 0) {
      deliveryTime = `Will be delivered in ${hours}h${
        mins > 0 ? ` ${mins}m` : ""
      } (${formattedDistance}${multiShopSuffix})`;
    } else {
      deliveryTime = `Will be delivered in ${mins} minutes (${formattedDistance}${multiShopSuffix})`;
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
        const totalReferralDiscount =
          serviceFeeDiscountAmount + deliveryFeeDiscountAmount;

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

  // Calculate combined totals from selected additional carts
  let combinedSubtotal = 0;
  let combinedUnits = 0;
  let combinedServiceFee = 0; // Service fee stays the same, not added
  let combinedDeliveryFee = 0; // This will be 70% for additional carts

  selectedCartIds.forEach((cartId) => {
    const details = cartDetails[cartId];
    if (details) {
      combinedSubtotal += details.total;
      combinedUnits += details.units;
      // Service fee is NOT added - it stays the same as the main cart
      // combinedServiceFee += details.serviceFee; // REMOVED
      // Add 70% of delivery fee for additional carts
      combinedDeliveryFee += details.deliveryFee * 0.7;
    }
  });

  // Compute numeric final total including service fee and delivery fee, minus discounts
  const finalServiceFee = serviceFee - serviceFeeDiscount + combinedServiceFee;
  const finalDeliveryFee = deliveryFee - deliveryFeeDiscount + combinedDeliveryFee;
  const grandSubtotal = Total + combinedSubtotal;
  const grandTotalUnits = totalUnits + combinedUnits;
  const finalTotal = grandSubtotal - discount + finalServiceFee + finalDeliveryFee;

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
          referral_discount:
            referralDiscount > 0 ? referralDiscount.toString() : null,
          service_fee_discount:
            serviceFeeDiscount > 0 ? serviceFeeDiscount.toString() : null,
          delivery_fee_discount:
            deliveryFeeDiscount > 0 ? deliveryFeeDiscount.toString() : null,
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
        // Check if this is a combined checkout
        if (selectedCartIds.size > 0) {
          // Combined checkout with multiple carts
          apiEndpoint = "/api/mutations/create-combined-orders";
          
          // Prepare stores data
          const stores = [
            // Current cart
            {
              store_id: shopId,
              delivery_fee: (deliveryFee - deliveryFeeDiscount).toString(),
              service_fee: (serviceFee - serviceFeeDiscount).toString(),
              discount: discount > 0 ? discount.toString() : null,
              voucher_code: codeType === "promo" ? appliedCode : null,
            },
            // Additional selected carts (with 70% delivery fee, no service fee)
            ...Array.from(selectedCartIds).map((cartId) => {
              const details = cartDetails[cartId];
              return {
                store_id: cartId,
                delivery_fee: (details.deliveryFee * 0.7).toString(), // 70% delivery fee
                service_fee: "0", // No service fee for additional carts
              };
            }),
          ];

          payload = {
            stores,
            delivery_address_id: deliveryAddressId,
            delivery_time: deliveryTimestamp,
            delivery_notes: deliveryNotes || null,
            payment_method: "mobile_money", // This will be set properly
            payment_method_id: selectedPaymentMethod?.id || null,
          };
        } else {
          // Regular single cart checkout
          apiEndpoint = "/api/checkout";
          payload = {
            shop_id: shopId,
            delivery_address_id: deliveryAddressId,
            service_fee: finalServiceFee.toString(),
            delivery_fee: finalDeliveryFee.toString(),
            discount: discount > 0 ? discount.toString() : null,
            voucher_code: codeType === "promo" ? appliedCode : null,
            referral_code: codeType === "referral" ? appliedCode : null,
            referral_discount:
              referralDiscount > 0 ? referralDiscount.toString() : null,
            service_fee_discount:
              serviceFeeDiscount > 0 ? serviceFeeDiscount.toString() : null,
            delivery_fee_discount:
              deliveryFeeDiscount > 0 ? deliveryFeeDiscount.toString() : null,
            delivery_time: deliveryTimestamp,
            delivery_notes: deliveryNotes || null,
          };
        }
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
              // Handle regular shop cart success or combined orders success
              // Clear loading state immediately
              clearTimeout(loadingTimeout);
              setIsCheckoutLoading(false);

              // Check if this was a combined order
              const isCombinedOrder = data.combined_order_id && data.orders;

              // Show success notification
              toaster.push(
                <Notification
                  type="success"
                  header="Order Completed Successfully!"
                >
                  {isCombinedOrder
                    ? `Your ${data.orders.length} combined orders have been placed successfully! You can view them in "Current Orders".`
                    : `Your order #${data.order_id?.slice(-8)} has been placed and is being prepared! You can view it in "Current Orders".`}
                </Notification>,
                { placement: "topEnd", duration: 5000 }
              );

              // Trigger cart refresh to show cart(s) are cleared
              setTimeout(() => {
                if (isCombinedOrder) {
                  // Clear all combined carts
                  data.orders.forEach((order: any) => {
                    const cartChangedEvent = new CustomEvent("cartChanged", {
                      detail: { shop_id: order.shop_id, refetch: true },
                    });
                    window.dispatchEvent(cartChangedEvent);
                  });
                } else {
                  // Clear single cart
                  const cartChangedEvent = new CustomEvent("cartChanged", {
                    detail: { shop_id: shopId, refetch: true },
                  });
                  window.dispatchEvent(cartChangedEvent);
                }
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
    } else if (value === "wallet") {
      setSelectedPaymentMethod({ type: "wallet" });
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
  const handleOneTimePhoneChange = (
    value: string,
    event?: React.SyntheticEvent
  ) => {
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

  // Helper function to get payment method icon
  const getPaymentMethodIcon = (value: string, methodType?: string) => {
    if (value === "refund") {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      );
    }
    if (value === "wallet") {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    }
    if (value === "one-time-phone") {
      return (
        <svg
          className="h-5 w-5"
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
      );
    }
    if (
      methodType?.toLowerCase() === "mtn momo" ||
      methodType?.toLowerCase().includes("momo")
    ) {
      return (
        <svg
          className="h-5 w-5"
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
      );
    }
    // Default credit card icon
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    );
  };

  // Prepare payment method options for dropdown
  const getPaymentMethodOptions = () => {
    const options: Array<{
      label: string;
      value: string;
      methodType?: string;
    }> = [];

    // For guest users, only show one-time phone number option
    if (isGuest) {
      options.push({
        label: "Pay with Phone Number (MTN Mobile Money)",
        value: "one-time-phone",
      });
      return options;
    }

    // For regular users, show all payment options
    const canUseRefund = refundBalance >= finalTotal;
    const canUseWallet = walletBalance >= finalTotal;

    // Add refund option if balance is sufficient
    if (canUseRefund) {
      options.push({
        label: `Use Refund Balance (${formatCurrency(
          refundBalance
        )} available)`,
        value: "refund",
      });
    }

    // Add wallet option (always show if wallet exists)
    if (hasWallet) {
      options.push({
        label: canUseWallet
          ? `Use Wallet (${formatCurrency(walletBalance)} available)`
          : `Use Wallet (${formatCurrency(
              walletBalance
            )} available - Insufficient)`,
        value: "wallet",
      });
    }

    // Add saved payment methods
    savedPaymentMethods.forEach((method) => {
      const displayNumber =
        method.method.toLowerCase() === "mtn momo"
          ? `•••• ${method.number.slice(-3)}`
          : `•••• ${method.number.slice(-4)}`;
      options.push({
        label: `${method.method} ${displayNumber}${
          method.is_default ? " (Default)" : ""
        }`,
        value: method.id,
        methodType: method.method,
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
      label: `${address.street}, ${address.city}${
        address.is_default ? " (Default)" : ""
      }`,
      value: address.id,
    }));
  };

  // Check if checkout can proceed (all required fields filled)
  const canProceedToCheckout = () => {
    // Must have items in cart
    if (totalUnits <= 0) return false;

    // Must have delivery address selected
    if (!selectedAddressId) return false;

    // Must have payment method selected
    if (!selectedPaymentMethod) return false;

    // For guest users or when using one-time phone
    if (isGuest || showOneTimePhoneInput) {
      // Phone number must be provided and valid (at least 10 digits)
      if (!oneTimePhoneNumber || oneTimePhoneNumber.replace(/\D/g, "").length < 10) {
        return false;
      }
    }

    return true;
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
            : selectedPaymentMethod.type === "wallet"
            ? "WALLET"
            : selectedPaymentMethod.type === "momo"
            ? "MOMO"
            : "VISA"}
        </div>
        <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          {selectedPaymentMethod.type === "refund"
            ? "Using Refund Balance"
            : selectedPaymentMethod.type === "wallet"
            ? `Using Wallet (${formatCurrency(walletBalance)} available)`
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
        <div className="p-4 shadow-sm">
          <div
            className="flex items-center justify-between"
            onClick={toggleExpand}
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
                {grandTotalUnits} items
              </span>
              {selectedCartIds.size > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {selectedCartIds.size + 1} carts
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-green-600 ${
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
          
          {/* Combine button - Mobile */}
          {!loadingCarts && availableCarts.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Clear cart details and trigger refetch
                setCartDetails({});
                setRefetchCartDetails(prev => prev + 1);
                setShowCombineModal(true);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {selectedCartIds.size > 0 ? `${selectedCartIds.size} Cart${selectedCartIds.size !== 1 ? 's' : ''} Combined` : "Combine with Other Carts"}
            </button>
          )}
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
              disabled={!canProceedToCheckout() || isCheckoutLoading}
              onClick={handleProceedToCheckout}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  }`}
                />
                <Button
                  appearance="primary"
                  color="green"
                  className="whitespace-nowrap bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md"
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
                Subtotal {selectedCartIds.size > 0 && `(${selectedCartIds.size + 1} carts)`}
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(grandSubtotal)}
              </span>
            </div>
            {discount > 0 && codeType === "promo" && (
              <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                <span className="text-sm">Discount ({appliedCode})</span>
                <span className="text-sm font-medium">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            {referralDiscount > 0 && codeType === "referral" && (
              <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                <span className="text-sm">
                  Referral Discount ({appliedCode})
                </span>
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
                {grandTotalUnits}
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
                Delivery Fee {selectedCartIds.size > 0 && `(+${selectedCartIds.size} at 70%)`}
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
                    ? getAddressOptions().find(
                        (opt) => opt.value === selectedAddressId
                      )?.label || "Select delivery address"
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
              {/* Hide "Add New Address" button for guest users who already have an address */}
              {(!isGuest || !selectedAddressId) && (
                <button
                  type="button"
                  className="mt-1 w-full rounded-lg border-2 border-green-500 bg-transparent px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => {
                    setShowAddressModal(true);
                  }}
                >
                  + Add New Address
                </button>
              )}
            </div>
            <div className="mt-2">
              <h4
                className={`mb-1 text-sm font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Payment Method
              </h4>
              
              {/* For guest users, show only phone input */}
              {isGuest ? (
                <div>
                  <p className={`mb-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Pay with MTN Mobile Money
                  </p>
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., 078XXXXXXX)"
                    value={oneTimePhoneNumber}
                    onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                        : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    }`}
                  />
                </div>
              ) : (
                <>
                  {/* For regular users, show payment method dropdown */}
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
                        ? getPaymentMethodOptions().find(
                            (opt) => opt.value === selectedPaymentValue
                          )?.label || "Select payment method"
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
                          {getPaymentMethodOptions().map((option) => {
                            const isWalletInsufficient =
                              option.value === "wallet" &&
                              walletBalance < finalTotal;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  if (!isWalletInsufficient) {
                                    handlePaymentMethodChange(option.value);
                                    setShowPaymentDropdown(false);
                                  }
                                }}
                                disabled={isWalletInsufficient}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                  isWalletInsufficient
                                    ? "cursor-not-allowed bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    : selectedPaymentValue === option.value
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`flex-shrink-0 ${
                                    isWalletInsufficient
                                      ? "text-red-500 dark:text-red-400"
                                      : selectedPaymentValue === option.value
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {getPaymentMethodIcon(
                                    option.value,
                                    option.methodType
                                  )}
                                </span>
                                <span className="flex-1">{option.label}</span>
                              </button>
                            );
                          })}
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
                      className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      }`}
                    />
                  )}
                </>
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
                className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                }`}
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
                disabled={!canProceedToCheckout() || isCheckoutLoading}
                onClick={handleProceedToCheckout}
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Order Summary
                </h2>
                {!loadingCarts && availableCarts.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Clear cart details and trigger refetch
                      setCartDetails({});
                      setRefetchCartDetails(prev => prev + 1);
                      setShowCombineModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {selectedCartIds.size > 0 ? `${selectedCartIds.size} Combined` : "Combine Carts"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Subtotal {selectedCartIds.size > 0 && `(${selectedCartIds.size + 1} carts)`}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(grandSubtotal)}
                </span>
              </div>

              {discount > 0 && codeType === "promo" && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Discount ({appliedCode})
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}
              {referralDiscount > 0 && codeType === "referral" && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Referral Discount ({appliedCode})
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    17% off
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Units
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {grandTotalUnits}
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
                  Delivery Fee {selectedCartIds.size > 0 && `(+${selectedCartIds.size} at 70%)`}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(finalDeliveryFee)}
                </span>
              </div>

              <div className="my-3 h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex justify-between py-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total
                </span>
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
                    ? getAddressOptions().find(
                        (opt) => opt.value === selectedAddressId
                      )?.label || "Select delivery address"
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
              {/* Hide "Add New Address" button for guest users who already have an address */}
              {(!isGuest || !selectedAddressId) && (
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg border-2 border-green-500 bg-transparent px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => {
                    setShowAddressModal(true);
                  }}
                >
                  + Add New Address
                </button>
              )}
            </div>

            <div className="mt-2">
              <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h4>
              
              {/* For guest users, show only phone input */}
              {isGuest ? (
                <div>
                  <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                    Pay with MTN Mobile Money
                  </p>
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., 078XXXXXXX)"
                    value={oneTimePhoneNumber}
                    onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500/20"
                  />
                </div>
              ) : (
                <>
                  {/* For regular users, show payment method dropdown */}
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
                        ? getPaymentMethodOptions().find(
                            (opt) => opt.value === selectedPaymentValue
                          )?.label || "Select payment method"
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
                          {getPaymentMethodOptions().map((option) => {
                            const isWalletInsufficient =
                              option.value === "wallet" &&
                              walletBalance < finalTotal;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  if (!isWalletInsufficient) {
                                    handlePaymentMethodChange(option.value);
                                    setShowPaymentDropdown(false);
                                  }
                                }}
                                disabled={isWalletInsufficient}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                  isWalletInsufficient
                                    ? "cursor-not-allowed bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    : selectedPaymentValue === option.value
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : "text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`flex-shrink-0 ${
                                    isWalletInsufficient
                                      ? "text-red-500 dark:text-red-400"
                                      : selectedPaymentValue === option.value
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {getPaymentMethodIcon(
                                    option.value,
                                    option.methodType
                                  )}
                                </span>
                                <span className="flex-1">{option.label}</span>
                              </button>
                            );
                          })}
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
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500/20"
                    />
                  )}
                </>
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
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500/20"
                  />
                  <Button
                    appearance="primary"
                    color="green"
                    className="whitespace-nowrap bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md"
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
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 dark:focus:ring-green-500/20"
              />
            </div>

            <Button
              color="green"
              appearance="primary"
              block
              size="lg"
              className="mt-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              onClick={handleProceedToCheckout}
              loading={isCheckoutLoading}
              disabled={!canProceedToCheckout() || isCheckoutLoading}
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

      {/* Combine Carts Modal */}
      <Modal
        open={showCombineModal}
        onClose={() => setShowCombineModal(false)}
        size="md"
      >
        <Modal.Header>
          <Modal.Title className={theme === "dark" ? "text-white" : "text-gray-900"}>
            🛒 Combine with Other Carts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Select additional carts to checkout together. <span className="font-semibold text-green-600 dark:text-green-400">Delivery fee is 30% off</span> for each additional cart!
            </p>
            
            {loadingCarts ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"></div>
              </div>
            ) : availableCarts.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No other carts available to combine
              </div>
            ) : (
              <div className="space-y-3">
                {availableCarts.map((cart) => {
                  const details = cartDetails[cart.id];
                  const isSelected = selectedCartIds.has(cart.id);
                  
                  return (
                    <div
                      key={cart.id}
                      onClick={() => toggleCartSelection(cart.id)}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                          : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCartSelection(cart.id);
                          }}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">
                              {cart.name}
                            </h4>
                            {isSelected && (
                              <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                                SELECTED
                              </span>
                            )}
                          </div>
                          
                          {details ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                  <span>{details.units} items</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{details.distance}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{details.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  <span>{formatCurrency(details.deliveryFee)} {isSelected && "(30% off)"}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Subtotal:
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(details.total)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500"></div>
                              Loading details...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowCombineModal(false)}
            appearance="primary"
            color="green"
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            {selectedCartIds.size > 0 
              ? `Continue with ${selectedCartIds.size + 1} Cart${selectedCartIds.size > 0 ? 's' : ''}`
              : 'Continue'}
          </Button>
          <Button onClick={() => setShowCombineModal(false)} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
