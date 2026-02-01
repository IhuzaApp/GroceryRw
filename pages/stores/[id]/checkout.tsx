"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import RootLayout from "../../../src/components/ui/layout";
import { ArrowLeft, MapPin, Clock, ShoppingBag, ChevronDown, Wallet, Smartphone, Plus } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import AddressManagementModal from "../../../src/components/userProfile/AddressManagementModal";

interface SelectedProduct {
  id: string;
  name: string;
  price: string;
  unit: string;
  measurement_unit?: string;
  quantity: number;
  image?: string;
}

interface CheckoutData {
  storeId: string;
  storeName: string;
  products: SelectedProduct[];
  total: number;
  transportationFee: number;
  serviceFee: number;
}

interface PaymentMethod {
  type: "refund" | "card" | "momo";
  id?: string;
  number?: string;
}

interface SavedAddress {
  id: string;
  street: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

interface SavedPaymentMethod {
  id: string;
  method: string;
  number: string;
  is_default: boolean;
}

function sanitizeSrc(src: string | null | undefined): string {
  if (!src || typeof src !== "string") return "/images/shop-placeholder.jpg";
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://"))
    return src;
  if (src.startsWith("/")) return src;
  return src;
}

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

export default function StoreCheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [storeLocation, setStoreLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [deliveryTime, setDeliveryTime] = useState("N/A");
  const [distance, setDistance] = useState("N/A");
  const [transportationFee, setTransportationFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [comment, setComment] = useState("");
  const [deliveredTime, setDeliveredTime] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState<string | null>(null);
  const [oneTimePhoneNumber, setOneTimePhoneNumber] = useState("");
  const [payRemainderWithMomo, setPayRemainderWithMomo] = useState(false);
  const [momoPhoneForRemainder, setMomoPhoneForRemainder] = useState("");
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand on mobile by default
  const [storeDetails, setStoreDetails] = useState<{
    image?: string;
    name?: string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("storeCheckoutData");
    if (!data) {
      router.push("/");
      return;
    }

    const parsed: CheckoutData = JSON.parse(data);
    setCheckoutData(parsed);

    // Fetch store location and details
    fetch(`/api/queries/store-details?id=${parsed.storeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store) {
          setStoreLocation({
            lat: parseFloat(data.store.latitude || "0"),
            lng: parseFloat(data.store.longitude || "0"),
          });
          setStoreDetails({
            image: data.store.image || "",
            name: data.store.name || parsed.storeName,
          });
        }
      })
      .catch(console.error);
  }, [router]);

  // Fetch saved addresses
  useEffect(() => {
    fetch("/api/queries/addresses")
      .then((res) => res.json())
      .then((data) => setSavedAddresses(data.addresses || []))
      .catch(console.error);
  }, []);

  // Sync address from cookie on load
  useEffect(() => {
    const cookie = Cookies.get("delivery_address");
    if (cookie) {
      try {
        const addr = JSON.parse(cookie);
        setUserAddress(addr);
        setAddressInput(
          addr.street && addr.city
            ? `${addr.street}, ${addr.city}`
            : addr.latitude && addr.longitude
            ? "Current Location"
            : ""
        );
      } catch (e) {
        console.error("Error parsing address:", e);
      }
    }
  }, []);

  // Fetch payment methods and refund balance
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [methodsRes, walletRes] = await Promise.all([
          fetch("/api/queries/payment-methods"),
          fetch("/api/queries/personal-wallet-balance"),
        ]);
        const methodsData = await methodsRes.json();
        const walletData = await walletRes.json();

        const methods = methodsData.paymentMethods || [];
        setSavedPaymentMethods(methods);
        const balance = walletData.wallet?.balance;
        setWalletBalance(parseFloat(String(balance ?? "0")));

        const defaultMethod = methods.find((m: SavedPaymentMethod) => m.is_default);
        if (defaultMethod) {
          setSelectedPaymentValue(defaultMethod.id);
          setSelectedPaymentMethod({
            type: defaultMethod.method.toLowerCase().includes("momo") ? "momo" : "card",
            id: defaultMethod.id,
            number: defaultMethod.number,
          });
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoadingPayment(false);
      }
    };
    fetchPaymentData();
  }, []);

  useEffect(() => {
    if (!checkoutData || !storeLocation || !userAddress) return;

    const userLat = parseFloat(userAddress.latitude || "0");
    const userLng = parseFloat(userAddress.longitude || "0");

    if (userLat && userLng) {
      const distKm = getDistanceFromLatLonInKm(
        userLat,
        userLng,
        storeLocation.lat,
        storeLocation.lng
      );
      setDistance(`${Math.round(distKm * 10) / 10} km`);

      // Calculate delivery time: minimum 1 hour + 1 minute per km
      const baseTime = 60;
      const travelTime = Math.ceil(distKm);
      const totalMinutes = baseTime + travelTime;

      let deliveryTimeDisplay = "";
      let deliveredTimeValue = "";
      let timeRangeValue = "";

      if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        deliveryTimeDisplay = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

        // Set delivered_time and timeRange for API
        const now = new Date();
        const deliveryDate = new Date(now.getTime() + totalMinutes * 60000);

        // Format delivered_time as ISO string
        deliveredTimeValue = deliveryDate.toISOString();

        // Format timeRange (e.g., "1h 30m - 2h")
        const bufferMinutes = 30; // 30 minute buffer
        const minDeliveryDate = new Date(
          now.getTime() + (totalMinutes - bufferMinutes) * 60000
        );
        const maxDeliveryDate = new Date(
          now.getTime() + (totalMinutes + bufferMinutes) * 60000
        );

        const formatTime = (date: Date) => {
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        };

        timeRangeValue = `${formatTime(minDeliveryDate)} - ${formatTime(
          maxDeliveryDate
        )}`;
      } else {
        deliveryTimeDisplay = `${totalMinutes} mins`;

        const now = new Date();
        const deliveryDate = new Date(now.getTime() + totalMinutes * 60000);
        deliveredTimeValue = deliveryDate.toISOString();

        const bufferMinutes = 15;
        const minDeliveryDate = new Date(
          now.getTime() + (totalMinutes - bufferMinutes) * 60000
        );
        const maxDeliveryDate = new Date(
          now.getTime() + (totalMinutes + bufferMinutes) * 60000
        );

        const formatTime = (date: Date) => {
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        };

        timeRangeValue = `${formatTime(minDeliveryDate)} - ${formatTime(
          maxDeliveryDate
        )}`;
      }

      setDeliveryTime(deliveryTimeDisplay);
      setDeliveredTime(deliveredTimeValue);
      setTimeRange(timeRangeValue);

      // Calculate transportation fee
      const transportFee =
        distKm <= 3 ? 1000 : 1000 + Math.ceil((distKm - 3) * 300);
      setTransportationFee(transportFee);
    }
  }, [checkoutData, storeLocation, userAddress]);

  useEffect(() => {
    if (!checkoutData) return;
    const serviceFeeCalc = Math.ceil(checkoutData.total * 0.05);
    setServiceFee(serviceFeeCalc);
    setTotalAmount(checkoutData.total + transportationFee + serviceFeeCalc);
  }, [checkoutData, transportationFee]);

  const handleSelectAddressFromList = (address: SavedAddress) => {
    const addr = {
      ...address,
      latitude: address.latitude?.toString() ?? "",
      longitude: address.longitude?.toString() ?? "",
    };
    setUserAddress(addr);
    setAddressInput(
      address.street && address.city
        ? `${address.street}, ${address.city}`
        : address.latitude && address.longitude
        ? "Current Location"
        : ""
    );
    Cookies.set("delivery_address", JSON.stringify(addr));
    setShowAddressDropdown(false);
  };

  const handleSelectAddress = (address: any) => {
    setUserAddress(address);
    setAddressInput(
      address.street && address.city
        ? `${address.street}, ${address.city}`
        : address.latitude && address.longitude
        ? "Current Location"
        : ""
    );
    Cookies.set("delivery_address", JSON.stringify(address));
    setShowAddressModal(false);
    // Refresh addresses list in case it was newly added
    fetch("/api/queries/addresses")
      .then((res) => res.json())
      .then((data) => setSavedAddresses(data.addresses || []))
      .catch(console.error);
    toast.success("Address updated");
  };

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentValue(value);
    setShowPaymentDropdown(false);
    if (value === "wallet") {
      setSelectedPaymentMethod({ type: "refund" });
      setOneTimePhoneNumber("");
      setPayRemainderWithMomo(false);
      setMomoPhoneForRemainder("");
    } else if (value === "one-time-phone") {
      setSelectedPaymentMethod({ type: "momo", number: oneTimePhoneNumber });
    } else {
      const method = savedPaymentMethods.find((m) => m.id === value);
      if (method) {
        setSelectedPaymentMethod({
          type: method.method.toLowerCase().includes("momo") ? "momo" : "card",
          id: method.id,
          number: method.number,
        });
        setOneTimePhoneNumber("");
      }
    }
  };

  const handleOneTimePhoneChange = (value: string) => {
    setOneTimePhoneNumber(value);
    setSelectedPaymentMethod({ type: "momo", number: value });
  };

  const canUseWallet = walletBalance >= totalAmount;
  const remainderAmount = Math.max(0, totalAmount - walletBalance);
  const isWalletWithMomoRemainder =
    selectedPaymentValue === "wallet" &&
    !canUseWallet &&
    payRemainderWithMomo &&
    remainderAmount > 0;
  const isValidMomoRemainderPhone =
    momoPhoneForRemainder.replace(/\D/g, "").length >= 10;
  const isOneTimePhoneSelected = selectedPaymentValue === "one-time-phone";
  const isValidOneTimePhone =
    oneTimePhoneNumber.replace(/\D/g, "").length >= 10;

  const canPlaceOrder = () => {
    if (!userAddress || !selectedPaymentMethod) return false;
    if (isOneTimePhoneSelected && !isValidOneTimePhone) return false;
    if (isWalletWithMomoRemainder && !isValidMomoRemainderPhone) return false;
    if (selectedPaymentValue === "wallet" && !canUseWallet && !payRemainderWithMomo)
      return false;
    return true;
  };

  const processPaymentAfterOrder = async (orderId: string) => {
    if (isWalletWithMomoRemainder) {
      const res = await fetch("/api/store-checkout/process-split-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAmount: walletBalance,
          momoAmount: remainderAmount,
          momoPhone: momoPhoneForRemainder,
          orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      return data;
    }

    if (selectedPaymentValue === "wallet" && canUseWallet) {
      const res = await fetch("/api/user/deduct-from-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Wallet deduction failed");
      return data;
    }

    if (selectedPaymentMethod?.type === "card") {
      return { success: true };
    }

    if (
      selectedPaymentMethod?.type === "momo" &&
      (oneTimePhoneNumber || selectedPaymentMethod?.number)
    ) {
      const phone = oneTimePhoneNumber || selectedPaymentMethod?.number || "";
      const res = await fetch("/api/momo/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "RWF",
          payerNumber: phone,
          externalId: orderId,
          payerMessage: "Payment for your order",
          payeeNote: "Thank you for your order",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "MoMo payment failed");
      return data;
    }

    return { success: true };
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData || !userAddress) {
      toast.error("Please set your delivery address");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (isOneTimePhoneSelected && !isValidOneTimePhone) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    if (isWalletWithMomoRemainder && !isValidMomoRemainderPhone) {
      toast.error("Please enter a valid MoMo phone number for the remainder");
      return;
    }

    if (selectedPaymentValue === "wallet" && !canUseWallet && !payRemainderWithMomo) {
      toast.error("Please enable 'Pay remainder via MoMo' or choose another payment method");
      return;
    }

    setIsProcessing(true);

    try {
      const productsJsonb = checkoutData.products.map((p) => ({
        id: p.id,
        name: p.name,
        price_per_item: parseFloat(p.price),
        quantity: p.quantity,
        unit: p.unit,
        measurement_type: p.measurement_unit || p.unit,
      }));

      const totalUnits = checkoutData.products.reduce(
        (sum, p) => sum + p.quantity,
        0
      );

      let paymentMethodString = "mobile_money";
      if (selectedPaymentMethod.type === "refund") {
        paymentMethodString = isWalletWithMomoRemainder ? "wallet_and_momo" : "wallet";
      } else if (selectedPaymentMethod.type === "card") {
        paymentMethodString = "card";
      } else if (selectedPaymentMethod.type === "momo") {
        paymentMethodString = "mobile_money";
      }

      const userId = (session?.user as any)?.id;
      if (!userId) {
        toast.error("Please log in to place an order");
        setIsProcessing(false);
        return;
      }

      const orderRes = await fetch("/api/mutations/create-business-product-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: checkoutData.storeId,
          allProducts: productsJsonb,
          total: totalAmount.toString(),
          transportation_fee: transportationFee.toString(),
          service_fee: serviceFee.toString(),
          units: totalUnits.toString(),
          latitude: userAddress.latitude || "",
          longitude: userAddress.longitude || "",
          deliveryAddress: addressInput || "Current Location",
          comment: comment || "",
          delivered_time:
            deliveredTime || new Date(Date.now() + 60 * 60000).toISOString(),
          timeRange: timeRange || "Within 1-2 hours",
          ordered_by: userId,
          status: "Pending",
          payment_method: paymentMethodString,
          payment_method_id: selectedPaymentMethod.id || null,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || "Failed to create order");
      }

      const orderData = await orderRes.json();
      const orderId = orderData.orderId;

      if (orderId) {
        await processPaymentAfterOrder(orderId);
      }

      toast.success(
        isWalletWithMomoRemainder || (selectedPaymentMethod?.type === "momo" && totalAmount > 0)
          ? "Order placed! Approve the MoMo prompt on your phone to complete payment."
          : "Order placed successfully!"
      );
      localStorage.removeItem("storeCheckoutData");
      router.push(`/stores/${checkoutData.storeId}?orderSuccess=true`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading…</span>
        </div>
      );
    }
    if (!selectedPaymentMethod && !selectedPaymentValue) {
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Select payment method
        </span>
      );
    }
    const badges = {
      refund: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", label: "Personal wallet" },
      momo: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "MoMo" },
      card: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Card" },
    };
    const badge = badges[selectedPaymentMethod?.type || "momo"] || badges.card;
    let detail = "";
    if (selectedPaymentMethod?.type === "refund") {
      if (isWalletWithMomoRemainder) {
        detail = `${formatCurrencySync(walletBalance)} + ${formatCurrencySync(remainderAmount)} MoMo`;
      } else {
        detail = `${formatCurrencySync(walletBalance)} available`;
      }
    } else if (isOneTimePhoneSelected) {
      detail = oneTimePhoneNumber ? `•••• ${oneTimePhoneNumber.slice(-4)}` : "Enter phone number";
    } else {
      detail = selectedPaymentMethod?.number ? `•••• ${selectedPaymentMethod.number.slice(-3)}` : "";
    }
    return (
      <div className="flex items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
      </div>
    );
  };

  if (!checkoutData) {
    return (
      <RootLayout>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading checkout...
          </p>
        </div>
      </RootLayout>
    );
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const totalItems =
    checkoutData?.products.reduce((sum, p) => sum + p.quantity, 0) || 0;

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
        {/* Mobile Header - Store hero with logo */}
        {isMounted && storeDetails && (
          <div className="relative h-44 w-full overflow-hidden sm:hidden">
            {/* Store Cover Image */}
            <Image
              src={sanitizeSrc(storeDetails?.image)}
              alt={checkoutData.storeName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            {/* Top bar with safe area */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white"
              >
                <ArrowLeft className="h-5 w-5 text-gray-800" />
              </button>
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 backdrop-blur-sm">
                Checkout
              </span>
            </div>

            {/* Store info at bottom */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-end gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 shadow-xl ring-2 ring-black/10">
                <Image
                  src={sanitizeSrc(storeDetails?.image)}
                  alt={checkoutData.storeName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                <h1 className="truncate text-lg font-bold text-white drop-shadow-md">
                  {checkoutData.storeName}
                </h1>
                <p className="text-sm text-white/90">{totalItems} items</p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div
          className="container mx-auto px-4 pb-24 pt-6 md:pb-6 lg:px-6 lg:py-8"
          style={{ marginTop: storeDetails && isMounted ? "24px" : "0" }}
        >
          {/* Back Button - Desktop */}
          <button
            onClick={() => router.back()}
            className="mb-6 hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </button>

          {/* Store Name Header - Desktop */}
          <div className="mb-8 hidden sm:block">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-emerald-500/20">
                <Image
                  src={sanitizeSrc(storeDetails?.image)}
                  alt={checkoutData.storeName}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Checkout · {checkoutData.storeName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} items in cart</p>
              </div>
            </div>
          </div>

          {/* Products List - Mobile Only */}
          <div className="mb-4 px-1 md:hidden">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Your order
                </h2>
              </div>
              <div className="space-y-2.5">
                {checkoutData.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-700/50"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.quantity} × {formatCurrencySync(parseFloat(product.price))} / {product.unit}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrencySync(parseFloat(product.price) * product.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-1 gap-8 md:grid lg:grid-cols-3">
            {/* Order Summary - Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Products */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <ShoppingBag className="h-5 w-5 text-emerald-500" />
                  Order items
                </h2>
                <div className="space-y-3">
                  {checkoutData.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-xl bg-gray-50/80 py-3 pl-3 pr-4 dark:bg-gray-700/40"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600 lg:h-16 lg:w-16">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.quantity} × {formatCurrencySync(parseFloat(product.price))} / {product.unit}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrencySync(parseFloat(product.price) * product.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Notes */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Delivery address
                  </h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressDropdown(!showAddressDropdown);
                        setShowPaymentDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        addressInput
                          ? "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                          : "border-amber-300 bg-amber-50/50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}
                    >
                      <span className="truncate">
                        {addressInput || "Select delivery address"}
                      </span>
                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${showAddressDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showAddressDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAddressDropdown(false)} />
                        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectAddressFromList(addr)}
                              className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                addressInput === `${addr.street}, ${addr.city}` ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                              }`}
                            >
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <div>
                                <p className="font-medium">{addr.street}</p>
                                <p className="text-gray-500 dark:text-gray-400">{addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ""}</p>
                              </div>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressDropdown(false);
                              setShowAddressModal(true);
                            }}
                            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:border-gray-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          >
                            <Plus className="h-4 w-4" />
                            Add new address
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Estimated delivery
                  </h3>
                  <p className="ml-10 text-sm text-gray-700 dark:text-gray-300">
                    {deliveryTime} ({distance})
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    Add a note <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Delivery instructions, gate code, etc."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-emerald-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary Sidebar - Desktop */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
                  Payment summary
                </h2>

                <div className="space-y-3 border-b border-gray-100 pb-5 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrencySync(checkoutData.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Units</span>
                    <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Transportation</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrencySync(transportationFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Service fee (5%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrencySync(serviceFee)}</span>
                  </div>
                </div>

                <div className="my-5 flex justify-between rounded-xl bg-emerald-50 px-4 py-4 dark:bg-emerald-900/20">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencySync(totalAmount)}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment method
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentDropdown(!showPaymentDropdown);
                        setShowAddressDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                        selectedPaymentValue
                          ? "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                          : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                      }`}
                    >
                      {renderPaymentMethod()}
                      <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${showPaymentDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showPaymentDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPaymentDropdown(false)} />
                        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodChange("wallet")}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              selectedPaymentValue === "wallet" ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                            }`}
                          >
                            <Wallet className="h-4 w-4 text-violet-500" />
                            <div>
                              <p className="font-medium">Personal wallet</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrencySync(walletBalance)} available
                                {!canUseWallet && remainderAmount > 0 && (
                                  <span className="text-amber-600">
                                    {" "}
                                    — pay {formatCurrencySync(remainderAmount)} via MoMo
                                  </span>
                                )}
                              </p>
                            </div>
                          </button>
                          {savedPaymentMethods.map((method) => {
                            const isMomo = method.method.toLowerCase().includes("momo");
                            return (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => handlePaymentMethodChange(method.id)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                  selectedPaymentValue === method.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                                }`}
                              >
                                {isMomo ? (
                                  <Smartphone className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <Wallet className="h-4 w-4 text-blue-500" />
                                )}
                                <div>
                                  <p className="font-medium">{method.method} ••• {isMomo ? method.number.slice(-3) : method.number.slice(-4)}</p>
                                  {method.is_default && <p className="text-xs text-gray-500">Default</p>}
                                </div>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodChange("one-time-phone")}
                            className={`flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                              selectedPaymentValue === "one-time-phone" ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                            }`}
                          >
                            <Plus className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">Use different phone number</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {isOneTimePhoneSelected && (
                    <input
                      type="tel"
                      placeholder="e.g. 0781234567"
                      value={oneTimePhoneNumber}
                      onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                      className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                  {selectedPaymentValue === "wallet" && !canUseWallet && remainderAmount > 0 && (
                    <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={payRemainderWithMomo}
                          onChange={(e) => setPayRemainderWithMomo(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Pay remainder {formatCurrencySync(remainderAmount)} via MoMo
                        </span>
                      </label>
                      {payRemainderWithMomo && (
                        <input
                          type="tel"
                          placeholder="MoMo phone e.g. 0781234567"
                          value={momoPhoneForRemainder}
                          onChange={(e) => setMomoPhoneForRemainder(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !canPlaceOrder()}
                  className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? "Processing…" : "Place order"}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Checkout Card - Fixed at Bottom */}
          <div className="md:hidden">
            {isExpanded && (
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={toggleExpand}
                aria-hidden="true"
              />
            )}

            <div
              className={`fixed left-0 right-0 z-50 mx-4 w-[calc(100%-2rem)] rounded-t-2xl border border-b-0 border-gray-200/80 bg-white shadow-2xl transition-[max-height] duration-300 dark:border-gray-700 dark:bg-gray-800 ${
                isExpanded ? "max-h-[85vh]" : "max-h-[200px]"
              }`}
              style={{ bottom: "max(4rem, env(safe-area-inset-bottom, 4rem))", overflow: "hidden" }}
            >
              {/* Drag handle */}
              <div
                className="flex cursor-grab justify-center border-b border-gray-100 py-3 dark:border-gray-700"
                onClick={toggleExpand}
              >
                <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                onClick={toggleExpand}
              >
                <div>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    Summary
                  </span>
                  <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {totalItems} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencySync(totalAmount)}
                  </span>
                  <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Checkout button when collapsed */}
              {!isExpanded && (
                <div className="px-5 pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canPlaceOrder()) {
                        toast.error(!userAddress ? "Please set your delivery address" : !selectedPaymentMethod ? "Please select a payment method" : "Please enter a valid phone number");
                        return;
                      }
                      handlePlaceOrder();
                    }}
                    disabled={isProcessing || !canPlaceOrder()}
                    className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? "Processing…" : "Place order"}
                  </button>
                </div>
              )}

              {/* Expanded content */}
              <div
                className={`overflow-y-auto px-5 pb-8 ${isExpanded ? "block" : "hidden"}`}
                style={{ maxHeight: "calc(85vh - 140px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4 border-b border-gray-100 pb-5 dark:border-gray-700">
                  {[
                    { label: "Subtotal", value: formatCurrencySync(checkoutData.total) },
                    { label: "Units", value: totalItems },
                    { label: "Transportation", value: formatCurrencySync(transportationFee) },
                    { label: "Service fee (5%)", value: formatCurrencySync(serviceFee) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencySync(totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-4 py-5">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      Delivery address
                    </h4>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddressDropdown(!showAddressDropdown);
                          setShowPaymentDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm ${
                          addressInput
                            ? "border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            : "border-amber-300 bg-white text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        <span className="truncate">{addressInput || "Select address"}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 ${showAddressDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showAddressDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowAddressDropdown(false)} />
                          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAddressFromList(addr);
                                }}
                                className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                {addr.street}, {addr.city}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddressDropdown(false);
                                setShowAddressModal(true);
                              }}
                              className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:border-gray-700 dark:text-emerald-400"
                            >
                              <Plus className="h-4 w-4" /> Add new address
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h4 className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      Estimated delivery
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{deliveryTime} ({distance})</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Payment method</h4>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPaymentDropdown(!showPaymentDropdown);
                          setShowAddressDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                          !selectedPaymentValue ? "text-gray-500 dark:text-gray-400" : ""
                        }`}
                      >
                        {renderPaymentMethod()}
                        <ChevronDown className={`h-4 w-4 shrink-0 ${showPaymentDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showPaymentDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowPaymentDropdown(false)} />
                          <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePaymentMethodChange("wallet");
                              }}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                            >
                              <Wallet className="h-4 w-4 text-violet-500" />
                              <span>
                                Personal wallet ({formatCurrencySync(walletBalance)})
                                {!canUseWallet && remainderAmount > 0 && (
                                  <span className="text-amber-600"> + MoMo</span>
                                )}
                              </span>
                            </button>
                            {savedPaymentMethods.map((method) => {
                              const isMomo = method.method.toLowerCase().includes("momo");
                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePaymentMethodChange(method.id);
                                  }}
                                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm"
                                >
                                  {isMomo ? (
                                    <Smartphone className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <Wallet className="h-4 w-4 text-blue-500" />
                                  )}
                                  <span>{method.method} ••• {method.number.slice(-4)}</span>
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePaymentMethodChange("one-time-phone");
                              }}
                              className="flex w-full items-center gap-3 border-t border-gray-100 px-3 py-2.5 text-left text-sm font-medium text-emerald-600 dark:border-gray-700 dark:text-emerald-400"
                            >
                              <Plus className="h-4 w-4" /> Use different phone number
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {isOneTimePhoneSelected && (
                      <input
                        type="tel"
                        placeholder="e.g. 0781234567"
                        value={oneTimePhoneNumber}
                        onChange={(e) => handleOneTimePhoneChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    {selectedPaymentValue === "wallet" && !canUseWallet && remainderAmount > 0 && (
                      <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
                        <label className="flex cursor-pointer items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={payRemainderWithMomo}
                            onChange={(e) => setPayRemainderWithMomo(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                          />
                          <span className="text-sm font-medium">Pay {formatCurrencySync(remainderAmount)} via MoMo</span>
                        </label>
                        {payRemainderWithMomo && (
                          <input
                            type="tel"
                            placeholder="MoMo phone e.g. 0781234567"
                            value={momoPhoneForRemainder}
                            onChange={(e) => setMomoPhoneForRemainder(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                      Note <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Delivery instructions..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={2}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
                  disabled={isProcessing || !canPlaceOrder()}
                  className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? "Processing…" : "Place order"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Address Management Modal - Add/Select delivery address */}
        <AddressManagementModal
          open={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSelect={(address) => {
            handleSelectAddress(address);
          }}
        />
      </div>
    </RootLayout>
  );
}
