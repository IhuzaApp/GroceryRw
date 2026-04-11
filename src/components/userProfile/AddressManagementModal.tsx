import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Cookies from "js-cookie";
import { useAuth } from "../../hooks/useAuth";
import AddAddressModal from "./AddAddressModal";

// Skeleton loader for address cards
function AddressSkeleton() {
  return (
    <div className="animate-pulse rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mb-6 flex h-10 w-10 rounded-2xl bg-gray-200 dark:bg-white/5" />
      <div className="mb-3 h-6 w-3/4 rounded-xl bg-gray-200 dark:bg-white/5" />
      <div className="mb-6 h-4 w-1/2 rounded-lg bg-gray-100 dark:bg-white/[0.03]" />
      <div className="flex gap-3">
        <div className="h-12 flex-1 rounded-2xl bg-gray-200 dark:bg-white/5" />
        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/[0.03]" />
      </div>
    </div>
  );
}

interface AddressManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (address: any) => void;
}

export default function AddressManagementModal({
  open,
  onClose,
  onSelect,
}: AddressManagementModalProps) {
  const { theme } = useTheme();
  const { isGuest } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const fetchAddresses = () => {
    setLoading(true);
    fetch("/api/queries/addresses")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load addresses (${res.status})`);
        }
        const data = await res.json();
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error("Error fetching addresses:", err);
        setError("Failed to load addresses");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open]);

  // Set address as default
  const handleSetDefault = async (addressId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/queries/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addressId,
          is_default: true,
        }),
      });
      if (!res.ok) throw new Error(`Failed to set default (${res.status})`);
      await res.json();
      fetchAddresses();

      // Update the delivery address cookie with the new default address
      const updatedAddresses = await fetch("/api/queries/addresses").then(
        (res) => res.json()
      );
      const newDefaultAddress = (updatedAddresses.addresses || []).find(
        (a: any) => a.is_default
      );
      if (newDefaultAddress) {
        const locationData = {
          latitude: newDefaultAddress.latitude || "0",
          longitude: newDefaultAddress.longitude || "0",
          altitude: "0",
          street: newDefaultAddress.street,
          city: newDefaultAddress.city,
          postal_code: newDefaultAddress.postal_code,
        };
        Cookies.set("delivery_address", JSON.stringify(locationData));
        window.dispatchEvent(new Event("addressChanged"));
      }
    } catch (err: any) {
      alert(err.message || "Failed to set address as default");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSelect = (address: any) => {
    // Update cookie when selecting an address (important for guest users)
    const locationData = {
      latitude: address.latitude || "0",
      longitude: address.longitude || "0",
      altitude: "0",
      street: address.street,
      city: address.city,
      postal_code: address.postal_code,
    };
    Cookies.set("delivery_address", JSON.stringify(locationData));
    window.dispatchEvent(new Event("addressChanged"));

    if (onSelect) {
      onSelect(address);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Main Delivery Address Modal */}
      {open && !showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
          <div
            className="absolute inset-0 bg-black/40 px-4 backdrop-blur-md"
            onClick={onClose}
          />

          <div
            className={`relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in zoom-in-95 sm:max-h-[90vh] sm:rounded-[3rem] ${
              theme === "dark"
                ? "border-white/10 bg-[#0A0A0A]"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl sm:px-8 sm:py-6 ${
                theme === "dark"
                  ? "border-white/5 bg-[#0A0A0A]/80"
                  : "border-gray-100 bg-white/80"
              }`}
            >
              <div>
                <h2
                  className={`text-2xl font-black tracking-tighter sm:text-3xl ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delivery Addresses
                </h2>
                <p
                  className={`mt-1 text-xs font-semibold uppercase tracking-widest opacity-40 ${
                    theme === "dark" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Manage your delivery locations
                </p>
              </div>
              <button
                onClick={onClose}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all active:scale-90 ${
                  theme === "dark"
                    ? "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    : "border border-black/5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="custom-scrollbar overflow-y-auto p-5 sm:p-8">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${
                        theme === "dark"
                          ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black tracking-tight ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Saved Locations
                      </h3>
                      <p
                        className={`text-xs font-bold uppercase tracking-widest opacity-40 ${
                          theme === "dark" ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {addresses.length} address
                        {addresses.length !== 1 ? "es" : ""} found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] hover:shadow-emerald-500/40 active:scale-95"
                  >
                    <svg
                      className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add New
                  </button>
                </div>

                {/* Addresses Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array(4)
                      .fill(0)
                      .map((_, idx) => (
                        <AddressSkeleton key={idx} />
                      ))}
                  </div>
                ) : error ? (
                  <div
                    className={`rounded-xl border p-6 text-center ${
                      theme === "dark"
                        ? "border-red-700 bg-red-900/20 text-red-400"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    <svg
                      className="mx-auto mb-3 h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mb-3 font-medium">{error}</p>
                    <button
                      onClick={fetchAddresses}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      }`}
                    >
                      Try Again
                    </button>
                  </div>
                ) : addresses.length === 0 ? (
                  <div
                    className={`rounded-xl border-2 border-dashed p-12 text-center ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <svg
                      className={`mx-auto mb-4 h-16 w-16 ${
                        theme === "dark" ? "text-gray-600" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h3
                      className={`mb-2 text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No addresses yet
                    </h3>
                    <p
                      className={`mb-6 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Add your first delivery address to get started
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <svg
                        className="mr-2 h-5 w-5 !text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="!text-white">
                        Add Your First Address
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-6 transition-all duration-500 ${
                          addr.is_default
                            ? theme === "dark"
                              ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]"
                              : "border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-500/10"
                            : theme === "dark"
                            ? "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                            : "border-gray-100 bg-gray-50/50 hover:border-emerald-200 hover:bg-white hover:shadow-lg"
                        }`}
                      >
                        {/* Category Badge & Status */}
                        <div className="mb-6 flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                              theme === "dark"
                                ? "bg-white/5 text-gray-400"
                                : "bg-white text-gray-500 shadow-sm"
                            }`}
                          >
                            {addr.type === "home" ? (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                              </svg>
                            ) : addr.type === "office" ? (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            )}
                          </div>
                          {addr.is_default && (
                            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="mb-6 space-y-2">
                          <h4
                            className={`text-lg font-black tracking-tight ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {addr.street}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                theme === "dark"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {addr.city}
                              {addr.postal_code ? `, ${addr.postal_code}` : ""}
                            </span>
                          </div>

                          {addr.placeDetails &&
                            Object.keys(addr.placeDetails).length > 0 && (
                              <div className={`flex flex-wrap gap-2 pt-2`}>
                                {addr.placeDetails.gateNumber && (
                                  <span
                                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                      theme === "dark"
                                        ? "bg-white/5 text-gray-400"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    Gate: {addr.placeDetails.gateNumber}
                                  </span>
                                )}
                                {addr.placeDetails.floor && (
                                  <span
                                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                      theme === "dark"
                                        ? "bg-white/5 text-gray-400"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    Floor {addr.placeDetails.floor}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAddressSelect(addr)}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:translate-y-[-1px] active:scale-95"
                          >
                            Select
                          </button>
                          {!addr.is_default && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all hover:bg-white/5 active:scale-90 ${
                                theme === "dark"
                                  ? "border-white/10 text-gray-400"
                                  : "border-gray-200 text-gray-500"
                              }`}
                              title="Set as Default"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Address Modal */}
      <AddAddressModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchAddresses}
      />
    </>
  );
}
