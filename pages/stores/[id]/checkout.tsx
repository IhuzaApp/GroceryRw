"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import RootLayout from "../../../src/components/ui/layout";
import { ArrowLeft, MapPin, Clock, CreditCard, X } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";

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
  const [storeLocation, setStoreLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<any>(null);
  const [deliveryTime, setDeliveryTime] = useState("N/A");
  const [distance, setDistance] = useState("N/A");
  const [transportationFee, setTransportationFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [comment, setComment] = useState("");
  const [deliveredTime, setDeliveredTime] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("storeCheckoutData");
    if (!data) {
      router.push("/");
      return;
    }

    const parsed: CheckoutData = JSON.parse(data);
    setCheckoutData(parsed);

    // Fetch store location
    fetch(`/api/queries/store-details?id=${parsed.storeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store) {
          setStoreLocation({
            lat: parseFloat(data.store.latitude || "0"),
            lng: parseFloat(data.store.longitude || "0"),
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
      const transportFee = distKm <= 3 ? 1000 : 1000 + Math.ceil((distKm - 3) * 300);
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

      const response = await fetch("/api/mutations/create-business-product-order", {
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
        }),
      });

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

  if (!checkoutData) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                {/* Products List */}
                <div className="space-y-4">
                  {checkoutData.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      {product.image && (
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.quantity} × {formatCurrencySync(parseFloat(product.price))} / {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrencySync(
                            parseFloat(product.price) * product.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </h3>
                    <button
                      onClick={handleChangeAddress}
                      className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {addressInput || "No address set"}
                  </p>
                </div>

                {/* Delivery Time */}
                <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Clock className="h-5 w-5" />
                    Estimated Delivery
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveryTime} ({distance})
                  </p>
                </div>

                {/* Comment */}
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </h2>

                <div className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
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
                      Service Fee:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrencySync(serviceFee)}
                    </span>
                  </div>
                </div>

                <div className="my-4 flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrencySync(totalAmount)}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card Payment</option>
                  </select>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !userAddress}
                  className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Make Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Address Selection Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No saved addresses. Please add an address in your profile.
                  </p>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowAddressModal(false);
                    }}
                    className="mt-4 text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    Go to Profile
                  </button>
                </div>
              ) : (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => handleSelectAddress(address)}
                      className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {address.city}, {address.postal_code || ""}
                      </p>
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

