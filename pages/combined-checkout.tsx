"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import RootLayout from "../src/components/ui/layout";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  ShoppingCart,
  X,
} from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../src/utils/formatCurrency";
import PaymentMethodSelector from "../src/components/UserCarts/checkout/PaymentMethodSelector";

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  unit?: string;
}

interface StoreCart {
  id: string;
  name: string;
  image?: string;
  items: CartItem[];
  subtotal: number;
  transportationFee: number;
  serviceFee: number;
  total: number;
  selected: boolean;
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

export default function CombinedCheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [storeCarts, setStoreCarts] = useState<StoreCart[]>([]);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's carts
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setIsLoading(true);
        // Fetch all user's carts
        const cartsResponse = await fetch("/api/carts");
        const cartsData = await cartsResponse.json();

        if (!cartsData.carts || cartsData.carts.length === 0) {
          toast.error("No carts found");
          router.push("/");
          return;
        }

        // Fetch cart items for each cart
        const storeCartsPromises = cartsData.carts.map(async (cart: any) => {
          const itemsResponse = await fetch(
            `/api/cart-items?shop_id=${cart.id}`
          );
          const itemsData = await itemsResponse.json();
          const items = itemsData.items || [];

          // Calculate subtotal
          const subtotal = items.reduce(
            (sum: number, item: any) =>
              sum + parseFloat(item.price || "0") * item.quantity,
            0
          );

          // Calculate fees (5% service fee, distance-based transport)
          const serviceFee = Math.ceil(subtotal * 0.05);

          // For now, use a default transportation fee of 1000
          // We'll calculate actual distance-based fee when user selects address
          const transportationFee = 1000;

          return {
            id: cart.id,
            name: cart.name,
            image: cart.logo,
            items: items.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              unit: item.size || "unit",
            })),
            subtotal,
            transportationFee,
            serviceFee,
            total: subtotal + transportationFee + serviceFee,
            selected: true, // All carts selected by default
          };
        });

        const loadedCarts = await Promise.all(storeCartsPromises);
        setStoreCarts(loadedCarts);
      } catch (error) {
        console.error("Error loading carts:", error);
        toast.error("Failed to load carts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarts();
  }, [router]);

  // Load user address
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

  // Fetch default payment method
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

  // Recalculate transportation fees when address changes
  useEffect(() => {
    if (!userAddress || storeCarts.length === 0) return;

    const userLat = parseFloat(userAddress.latitude || "0");
    const userLng = parseFloat(userAddress.longitude || "0");

    if (userLat && userLng) {
      // Update transportation fees based on distance
      const updatedCarts = storeCarts.map((cart) => {
        // Fetch store location and calculate distance
        // For now, use default fee
        const transportationFee = 1000; // Will be updated with actual distance calculation
        const total = cart.subtotal + transportationFee + cart.serviceFee;
        return { ...cart, transportationFee, total };
      });
      setStoreCarts(updatedCarts);
    }
  }, [userAddress]);

  const toggleCartSelection = (cartId: string) => {
    setStoreCarts((prev) =>
      prev.map((cart) =>
        cart.id === cartId ? { ...cart, selected: !cart.selected } : cart
      )
    );
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

  const handlePlaceCombinedOrder = async () => {
    const selectedCarts = storeCarts.filter((cart) => cart.selected);

    if (selectedCarts.length === 0) {
      toast.error("Please select at least one cart to checkout");
      return;
    }

    if (!userAddress) {
      toast.error("Please set your delivery address");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    try {
      const userId = (session?.user as any)?.id;
      if (!userId) {
        toast.error("Please log in to place an order");
        setIsProcessing(false);
        return;
      }

      // Get delivery address ID
      let deliveryAddressId = userAddress.id;
      if (!deliveryAddressId) {
        // Create delivery address if not exists
        const addressResponse = await fetch("/api/mutations/create-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: userAddress.street || "Current Location",
            city: userAddress.city || "",
            latitude: userAddress.latitude || "",
            longitude: userAddress.longitude || "",
            postal_code: userAddress.postal_code || "",
          }),
        });

        if (!addressResponse.ok) {
          throw new Error("Failed to create delivery address");
        }

        const addressData = await addressResponse.json();
        deliveryAddressId = addressData.address.id;
      }

      // Prepare stores data for combined checkout
      const stores = selectedCarts.map((cart) => ({
        store_id: cart.id,
        delivery_fee: cart.transportationFee.toString(),
        service_fee: cart.serviceFee.toString(),
      }));

      // Determine payment method string for API
      let paymentMethodString = "mobile_money";
      if (selectedPaymentMethod.type === "refund") {
        paymentMethodString = "wallet";
      } else if (selectedPaymentMethod.type === "card") {
        paymentMethodString = "card";
      } else if (selectedPaymentMethod.type === "momo") {
        paymentMethodString = "mobile_money";
      }

      const deliveryTime = new Date(Date.now() + 60 * 60000).toISOString(); // 1 hour from now

      const response = await fetch("/api/mutations/create-combined-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stores,
          delivery_address_id: deliveryAddressId,
          delivery_time: deliveryTime,
          delivery_notes: comment || null,
          payment_method: paymentMethodString,
          payment_method_id: selectedPaymentMethod.id || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Successfully placed ${result.orders.length} orders together!`
        );
        router.push(
          `/user-orders?combined_order_id=${result.combined_order_id}`
        );
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to place combined orders");
      }
    } catch (error: any) {
      console.error("Error placing combined orders:", error);
      toast.error(error.message || "Failed to place combined orders");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCarts = storeCarts.filter((cart) => cart.selected);
  const grandTotal = selectedCarts.reduce((sum, cart) => sum + cart.total, 0);
  const totalItems = selectedCarts.reduce(
    (sum, cart) =>
      sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

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

  if (isLoading) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"></div>
            <p className="text-gray-500">Loading your carts...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
        <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
          {/* Header */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 !text-white" />
              <div>
                <h1 className="text-2xl font-bold !text-white">
                  Combined Checkout
                </h1>
                <p className="text-sm !text-white/90">
                  Select multiple stores and pay for all orders at once
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Store Carts List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {storeCarts.map((cart) => (
                  <div
                    key={cart.id}
                    className={`rounded-2xl border-2 p-6 shadow-lg transition-all ${
                      cart.selected
                        ? "border-green-500 bg-white dark:bg-gray-800"
                        : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                    }`}
                  >
                    {/* Cart Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={cart.selected}
                          onChange={() => toggleCartSelection(cart.id)}
                          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        {cart.image && (
                          <div className="h-12 w-12 overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600">
                            <Image
                              src={cart.image}
                              alt={cart.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {cart.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cart.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrencySync(cart.total)}
                        </p>
                      </div>
                    </div>

                    {/* Cart Items */}
                    {cart.selected && (
                      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                          >
                            {item.image && (
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.quantity} ×{" "}
                                {formatCurrencySync(parseFloat(item.price))}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrencySync(
                                parseFloat(item.price) * item.quantity
                              )}
                            </p>
                          </div>
                        ))}

                        {/* Cart Summary */}
                        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Subtotal:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrencySync(cart.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Transportation:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrencySync(cart.transportationFee)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Service Fee:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatCurrencySync(cart.serviceFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 !text-white shadow-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Summary
                  </h2>
                </div>

                <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Selected Stores:
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedCarts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Items:
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {totalItems}
                    </span>
                  </div>
                </div>

                <div className="my-6 flex justify-between rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Grand Total:
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrencySync(grandTotal)}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Delivery Address
                    </h3>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold !text-white shadow-md transition-all hover:from-green-600 hover:to-emerald-600"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {addressInput || "No address set"}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-600 dark:from-gray-700/50 dark:to-gray-800/50">
                    {renderPaymentMethod()}
                    <PaymentMethodSelector
                      totalAmount={grandTotal}
                      onSelect={(method) => {
                        setSelectedPaymentMethod(method);
                      }}
                    />
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions for all orders..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handlePlaceCombinedOrder}
                  disabled={
                    isProcessing ||
                    !userAddress ||
                    !selectedPaymentMethod ||
                    selectedCarts.length === 0
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-base font-bold !text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing
                    ? "Processing..."
                    : `Place ${selectedCarts.length} Order${
                        selectedCarts.length !== 1 ? "s" : ""
                      }`}
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
