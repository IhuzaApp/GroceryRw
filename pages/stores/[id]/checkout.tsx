"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import RootLayout from "../../../src/components/ui/layout";
import { ArrowLeft, MapPin, Clock, CreditCard, X } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import PaymentMethodSelector from "../../../src/components/UserCarts/checkout/PaymentMethodSelector";

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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
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

    // Fetch saved addresses
    fetch("/api/queries/addresses")
      .then((res) => res.json())
      .then((data) => {
        setSavedAddresses(data.addresses || []);
      })
      .catch(console.error);
  }, []);

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
      if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        setDeliveryTime(mins > 0 ? `${hours}h ${mins}m` : `${hours}h`);
      } else {
        setDeliveryTime(`${totalMinutes} mins`);
      }

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

  const handleChangeAddress = () => {
    setShowAddressModal(true);
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
    toast.success("Address updated");
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

    setIsProcessing(true);

    try {
      // Prepare products as JSONB
      const productsJsonb = checkoutData.products.map((p) => ({
        id: p.id,
        name: p.name,
        price_per_item: parseFloat(p.price),
        quantity: p.quantity,
        unit: p.unit,
        measurement_type: p.measurement_unit || p.unit,
        image: p.image || null,
      }));

      // Calculate units (total quantity of all items)
      const totalUnits = checkoutData.products.reduce(
        (sum, p) => sum + p.quantity,
        0
      );

      // Determine payment method string for API
      let paymentMethodString = "mobile_money";
      if (selectedPaymentMethod.type === "refund") {
        paymentMethodString = "wallet";
      } else if (selectedPaymentMethod.type === "card") {
        paymentMethodString = "card";
      } else if (selectedPaymentMethod.type === "momo") {
        paymentMethodString = "mobile_money";
      }

      const response = await fetch(
        "/api/mutations/create-business-product-order",
        {
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
            delivered_time: deliveredTime || "",
            timeRange: timeRange || "",
            payment_method: paymentMethodString,
            payment_method_id: selectedPaymentMethod.id || null,
          }),
        }
      );

      if (response.ok) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("storeCheckoutData");
        router.push(`/stores/${checkoutData.storeId}?orderSuccess=true`);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render payment method display
  const renderPaymentMethod = () => {
    if (loadingPayment) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs !text-white">
            LOADING
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Loading payment method...
          </span>
        </div>
      );
    }

    if (!selectedPaymentMethod) {
      return (
        <div className="flex items-center">
          <div className="mr-2 flex items-center justify-center rounded bg-gray-400 p-2 text-xs !text-white">
            NONE
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            No payment method selected
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <div
          className={`mr-2 flex items-center justify-center rounded p-2 text-xs !text-white ${
            selectedPaymentMethod.type === "refund"
              ? "bg-purple-600"
              : selectedPaymentMethod.type === "momo"
              ? "bg-yellow-600"
              : "bg-blue-600"
          }`}
        >
          {selectedPaymentMethod.type === "refund"
            ? "WALLET"
            : selectedPaymentMethod.type === "momo"
            ? "MOMO"
            : "CARD"}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedPaymentMethod.type === "refund"
            ? "Using Wallet Balance"
            : selectedPaymentMethod.type === "momo"
            ? `•••• ${selectedPaymentMethod.number?.slice(-3) || ""}`
            : `•••• ${selectedPaymentMethod.number?.slice(-4) || ""}`}
        </span>
      </div>
    );
  };

  if (!checkoutData) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading...</p>
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
        {/* Mobile Header - Full width cover image with circular logo */}
        {isMounted && storeDetails && (
          <div
            className="relative h-32 w-full sm:hidden"
            style={{
              marginTop: "-44px",
              marginLeft: "-16px",
              marginRight: "-16px",
              width: "calc(100% + 32px)",
            }}
          >
            {/* Store Cover Image */}
            <Image
              src={storeDetails.image || "/images/store-placeholder.jpg"}
              alt={checkoutData.storeName}
              fill
              className="object-cover"
              priority
            />

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="absolute left-4 top-7 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 !text-white"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Store Logo - Circular at bottom left */}
            <div className="absolute -bottom-4 left-3 z-50">
              <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-green-500 shadow-lg">
                <Image
                  src={storeDetails.image || "/images/store-placeholder.jpg"}
                  alt={`${checkoutData.storeName} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Store Info Overlay - Center */}
            <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-center">
              {/* Store Name */}
              <h1 className="mb-1 text-xl font-bold !text-white drop-shadow-lg">
                {checkoutData.storeName}
              </h1>

              {/* Checkout Badge */}
              <div className="flex items-center justify-center gap-2 text-xs !text-white/90">
                <div className="flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-1 backdrop-blur-md">
                  <CreditCard className="h-3 w-3" />
                  <span>Checkout</span>
                </div>
                <span>{totalItems} items</span>
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
          <div className="mb-6 hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 shadow-lg sm:block sm:p-5">
            <h1 className="text-xl font-bold !text-white sm:text-2xl">
              Checkout - {checkoutData.storeName}
            </h1>
          </div>

          {/* Products List - Mobile Only */}
          <div className="mb-6 md:hidden">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order Items
                </h2>
              </div>
              <div className="space-y-3">
                {checkoutData.products.map((product) => (
                  <div
                    key={product.id}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50 dark:hover:border-green-600"
                  >
                    {product.image && (
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm dark:border-gray-600">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.quantity} ×{" "}
                        {formatCurrencySync(parseFloat(product.price))} /{" "}
                        {product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrencySync(
                          parseFloat(product.price) * product.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-1 gap-6 md:grid lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order Summary
                  </h2>
                </div>

                {/* Products List */}
                <div className="mb-8 space-y-3">
                  {checkoutData.products.map((product) => (
                    <div
                      key={product.id}
                      className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50 dark:hover:border-green-600"
                    >
                      {product.image && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm dark:border-gray-600 lg:h-20 lg:w-20">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.quantity} ×{" "}
                          {formatCurrencySync(parseFloat(product.price))} /{" "}
                          {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrencySync(
                            parseFloat(product.price) * product.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      Delivery Address
                    </h3>
                    <button
                      onClick={handleChangeAddress}
                      className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold !text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-lg"
                    >
                      Change
                    </button>
                  </div>
                  <p className="ml-10 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {addressInput || "No address set"}
                  </p>
                </div>

                {/* Delivery Time */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    Estimated Delivery
                  </h3>
                  <p className="ml-10 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {deliveryTime} ({distance})
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Order Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions or notes for the delivery..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary Sidebar - Desktop */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Summary
                  </h2>
                </div>

                <div className="space-y-4 border-b border-gray-200 pb-6 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrencySync(checkoutData.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Transportation:
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrencySync(transportationFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Service Fee (5%):
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrencySync(serviceFee)}
                    </span>
                  </div>
                </div>

                <div className="my-6 flex justify-between rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencySync(totalAmount)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-600 dark:from-gray-700/50 dark:to-gray-800/50">
                    {renderPaymentMethod()}
                    <PaymentMethodSelector
                      totalAmount={totalAmount}
                      onSelect={(method) => {
                        setSelectedPaymentMethod(method);
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isProcessing || !userAddress || !selectedPaymentMethod
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold !text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Checkout Card - Fixed at Bottom */}
          <div className="md:hidden">
            {/* Backdrop overlay when expanded */}
            {isExpanded && (
              <div
                className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg transition-all duration-300"
                onClick={toggleExpand}
              />
            )}

            <div
              className={`fixed bottom-16 left-0 right-0 z-50 w-full transition-all duration-300 ${
                isExpanded
                  ? "border-2 border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] ring-4 ring-white/20"
                  : "shadow-2xl"
              } rounded-t-2xl bg-white dark:bg-gray-800`}
              style={{
                maxHeight: isExpanded ? "calc(90vh - 64px)" : "160px",
                overflow: "hidden",
              }}
            >
              {/* Header with toggle button */}
              <div
                className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
                onClick={toggleExpand}
              >
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Order Summary
                  </span>
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium !text-green-800 dark:bg-green-900/20 dark:!text-green-300">
                    {totalItems} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrencySync(totalAmount)}
                  </span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {isExpanded ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Checkout button when collapsed */}
              {!isExpanded && (
                <div className="p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!userAddress || !selectedPaymentMethod) {
                        toast.error(
                          !userAddress
                            ? "Please set your delivery address"
                            : "Please select a payment method"
                        );
                        return;
                      }
                      handlePlaceOrder();
                    }}
                    disabled={
                      isProcessing || !userAddress || !selectedPaymentMethod
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold !text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </button>
                </div>
              )}

              {/* Expanded content */}
              <div
                className={`p-4 ${
                  isExpanded ? "block" : "hidden"
                } overflow-y-auto`}
                style={{ maxHeight: "calc(90vh - 124px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cost Breakdown */}
                <div className="mb-6 space-y-3 border-b border-gray-200 pb-6 dark:border-gray-700">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Cost Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencySync(checkoutData.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Transportation:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencySync(transportationFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service Fee (5%):
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrencySync(serviceFee)}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrencySync(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      Delivery Address
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeAddress();
                      }}
                      className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold !text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600"
                    >
                      Change
                    </button>
                  </div>
                  <p className="ml-10 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {addressInput || "No address set"}
                  </p>
                </div>

                {/* Delivery Time */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    Estimated Delivery
                  </h4>
                  <p className="ml-10 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {deliveryTime} ({distance})
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Payment Method
                    </h4>
                    <PaymentMethodSelector
                      totalAmount={totalAmount}
                      onSelect={(method) => {
                        setSelectedPaymentMethod(method);
                      }}
                    />
                  </div>
                  <div className="mt-2">{renderPaymentMethod()}</div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                    Order Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions or notes for the delivery..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                    rows={3}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Place Order Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaceOrder();
                  }}
                  disabled={
                    isProcessing || !userAddress || !selectedPaymentMethod
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold !text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Address Selection Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Delivery Address
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    No saved addresses. Please add an address in your profile.
                  </p>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowAddressModal(false);
                    }}
                    className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold !text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
                  >
                    Go to Profile
                  </button>
                </div>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => handleSelectAddress(address)}
                      className="group w-full rounded-xl border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 text-left transition-all duration-200 hover:border-green-400 hover:shadow-md dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50 dark:hover:border-green-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                          <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 font-semibold text-gray-900 dark:text-white">
                            {address.street}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.city}, {address.postal_code || ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
