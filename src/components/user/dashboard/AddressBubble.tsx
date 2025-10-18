import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAddress } from "../../../hooks/useAddress";
import AddressMap from "./AddressMap";

interface AddressBubbleProps {
  className?: string;
}

export default function AddressBubble({ className = "" }: AddressBubbleProps) {
  const { defaultAddress, addresses, loading, refetch } = useAddress();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch("/api/queries/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: addressId,
          is_default: true,
        }),
      });

      if (response.ok) {
        await refetch();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const handleAddAddress = async (addressData: {
    latitude: string;
    longitude: string;
    street: string;
    city: string;
    postal_code: string;
    is_default: boolean;
    type: string;
    placeDetails: any;
  }) => {
    try {
      const response = await fetch("/api/queries/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          street: addressData.street,
          city: addressData.city,
          postal_code: addressData.postal_code,
          is_default: addressData.is_default,
          type: addressData.type,
          placeDetails: addressData.placeDetails,
        }),
      });

      if (response.ok) {
        await refetch();
        // Show success message or notification
        console.log("Address added successfully!");
      }
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleAddressClick = (address: any) => {
    if (address.id === defaultAddress?.id) {
      // Already default, just close dropdown
      setIsDropdownOpen(false);
      return;
    }

    // Show confirmation dialog
    setSelectedAddress(address);
    setIsConfirming(true);
  };

  const confirmSetDefault = async () => {
    if (!selectedAddress) return;

    try {
      setIsConfirming(false);
      await handleSetDefault(selectedAddress.id);
      setIsDropdownOpen(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const cancelSetDefault = () => {
    setIsConfirming(false);
    setSelectedAddress(null);
  };

  const calculateDropdownPosition = () => {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Recalculate dropdown position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className={`mb-4 ${className}`}>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/20 px-5 py-3 shadow-2xl backdrop-blur-md dark:border-gray-600/30 dark:bg-gray-900/20">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/30"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-white/30"></div>
          <div className="h-4 w-4 animate-pulse rounded bg-white/30"></div>
        </div>
      </div>
    );
  }

  if (!defaultAddress) {
    return null;
  }

  return (
    <>
      <div className={`mb-4 ${className}`}>
        <div
          ref={bubbleRef}
          className="group relative inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/20 px-5 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-2xl dark:border-gray-600/30 dark:bg-gray-900/20 dark:hover:bg-gray-900/30"
        >
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10"></div>

          {/* Location Icon with Background */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/30 backdrop-blur-sm dark:border-gray-600/40 dark:bg-gray-800/40">
            <svg
              className="h-4 w-4 text-green-700 drop-shadow-sm dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Address Text */}
          <div className="relative flex flex-1 flex-col">
            <span className="text-sm font-semibold leading-tight text-gray-800 drop-shadow-sm dark:text-gray-100">
              {defaultAddress.street}, {defaultAddress.city}
            </span>
          </div>

          {/* Dropdown Icon */}
          <button
            onClick={handleDropdownToggle}
            className="relative flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/20 dark:hover:bg-gray-700/20"
          >
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
                isDropdownOpen ? "rotate-180" : ""
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

          {/* Glass edge highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50 dark:border-gray-500/30"></div>
        </div>

        {/* Full Screen Dropdown with Map */}
        {isDropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div
                className="fixed inset-0 z-[99999] overflow-hidden bg-white dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Address
                  </h5>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                 {/* Full Height Content - Vertical Layout */}
                 <div className="flex h-[calc(100vh-80px)] flex-col">
                   {/* Map Section - Header */}
                   <div className="h-3/5 border-b border-gray-200 dark:border-gray-700">
                     <AddressMap
                       address={
                         defaultAddress
                           ? {
                               latitude: defaultAddress.latitude,
                               longitude: defaultAddress.longitude,
                               street: defaultAddress.street,
                               city: defaultAddress.city,
                             }
                           : null
                       }
                       height="h-full"
                       className="bg-gray-100 dark:bg-gray-800"
                       onAddAddress={handleAddAddress}
                     />
                   </div>

                   {/* Address List Section - Below Map */}
                   <div className="flex h-2/5 flex-col">
                     <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                       <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                         Your Addresses
                       </h3>
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         Select an address to set as default
                       </p>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => handleAddressClick(address)}
                            className={`w-full rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                              address.is_default
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <div
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      address.is_default
                                        ? "bg-green-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                  ></div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {address.street}
                                  </span>
                                  {address.type && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                      address.type === 'house' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                      address.type === 'apartment' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                      address.type === 'office' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                      {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                    </span>
                                  )}
                                  {address.is_default && (
                                    <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {address.city}, {address.postal_code}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}

                        {/* Add New Address Button */}
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              // TODO: Implement add new address functionality
                              console.log("Add new address clicked");
                            }}
                            className="group w-full rounded-xl border-2 border-dashed border-gray-300 p-3 transition-all duration-200 hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:hover:border-green-400 dark:hover:bg-green-900/10"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 transition-colors duration-200 group-hover:bg-green-100 dark:bg-gray-700 dark:group-hover:bg-green-900/20">
                                <svg
                                  className="h-3 w-3 text-gray-500 group-hover:text-green-500 dark:text-gray-400 dark:group-hover:text-green-400"
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
                              </div>
                              <span className="text-sm font-medium text-gray-600 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400">
                                Add New Address
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                     {/* Footer */}
                     <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                       <button
                         onClick={() => setIsDropdownOpen(false)}
                         className="w-full rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                       >
                         Done
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Full Page Modal - Rendered as Portal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              ref={modalRef}
              className="fixed inset-0 z-[99999] overflow-hidden bg-white dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manage Addresses
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Full Height */}
              <div className="flex h-[calc(100vh-80px)]">
                {/* Map Section */}
                 <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                   <AddressMap
                     address={
                       defaultAddress
                         ? {
                             latitude: defaultAddress.latitude,
                             longitude: defaultAddress.longitude,
                             street: defaultAddress.street,
                             city: defaultAddress.city,
                           }
                         : null
                     }
                     height="h-full"
                     className="bg-gray-100 dark:bg-gray-800"
                     onAddAddress={handleAddAddress}
                   />
                 </div>

                {/* Address List Section */}
                <div className="flex w-1/2 flex-col">
                  <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      Your Addresses
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your saved delivery addresses
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                            address.is_default
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                          }`}
                          onClick={() =>
                            !address.is_default && handleSetDefault(address.id)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                               <div className="mb-2 flex items-center gap-2">
                                 <div
                                   className={`h-3 w-3 rounded-full ${
                                     address.is_default
                                       ? "bg-green-500"
                                       : "bg-gray-300 dark:bg-gray-600"
                                   }`}
                                 ></div>
                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                   {address.street}
                                 </span>
                                 {address.type && (
                                   <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                     address.type === 'house' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                     address.type === 'apartment' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                     address.type === 'office' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                                     'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                   }`}>
                                     {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                   </span>
                                 )}
                                 {address.is_default && (
                                   <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                     Default
                                   </span>
                                 )}
                               </div>
                              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {address.city}, {address.postal_code}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                Coordinates: {address.latitude},{" "}
                                {address.longitude}
                              </div>
                            </div>

                            {!address.is_default && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefault(address.id);
                                }}
                                className="ml-3 rounded-lg px-3 py-1 text-sm font-medium text-green-600 transition-colors duration-200 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add New Address Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            // TODO: Implement add new address functionality
                            console.log("Add new address clicked");
                          }}
                          className="group w-full rounded-xl border-2 border-dashed border-gray-300 p-4 transition-all duration-200 hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:hover:border-green-400 dark:hover:bg-green-900/10"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors duration-200 group-hover:bg-green-100 dark:bg-gray-700 dark:group-hover:bg-green-900/20">
                              <svg
                                className="h-4 w-4 text-gray-500 group-hover:text-green-500 dark:text-gray-400 dark:group-hover:text-green-400"
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
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400">
                              Add New Address
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Confirmation Dialog */}
      {isConfirming &&
        selectedAddress &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={cancelSetDefault}
          >
            <div
              className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Set Default Address?
                  </h3>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-gray-600 dark:text-gray-400">
                    Do you want to set this address as your default delivery
                    address?
                  </p>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                    <div className="mb-1 font-medium text-gray-900 dark:text-white">
                      {selectedAddress.street}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedAddress.city}, {selectedAddress.postal_code}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelSetDefault}
                    className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSetDefault}
                    className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
                  >
                    Set as Default
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
