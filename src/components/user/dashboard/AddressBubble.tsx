import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAddress } from "../../../hooks/useAddress";

interface AddressBubbleProps {
  className?: string;
}

export default function AddressBubble({ className = "" }: AddressBubbleProps) {
  const { defaultAddress, addresses, loading, refetch } = useAddress();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const calculateDropdownPosition = () => {
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md px-5 py-3 shadow-2xl border border-white/30 dark:bg-gray-900/20 dark:border-gray-600/30">
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
        <div ref={bubbleRef} className="group relative inline-flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md px-5 py-3 shadow-2xl border border-white/30 dark:bg-gray-900/20 dark:border-gray-600/30 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/30 dark:hover:bg-gray-900/30">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10"></div>
          
          {/* Location Icon with Background */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm border border-white/40 dark:bg-gray-800/40 dark:border-gray-600/40">
            <svg
              className="h-4 w-4 text-green-700 dark:text-green-300 drop-shadow-sm"
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
          <div className="relative flex flex-col flex-1">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight drop-shadow-sm">
              {defaultAddress.street}, {defaultAddress.city}
            </span>
          </div>
          
          {/* Dropdown Icon */}
          <button
            onClick={handleDropdownToggle}
            className="relative flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-gray-700/20 transition-colors duration-200"
          >
            <svg
              className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
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
          <div className="absolute inset-0 rounded-2xl border border-white/50 dark:border-gray-500/30 pointer-events-none"></div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && createPortal(
          <div ref={dropdownRef} className="fixed z-[9998] w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-md border border-white/30 shadow-2xl dark:bg-gray-800/90 dark:border-gray-600/30" style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '320px'
          }}>
            <div className="p-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => {
                    if (address.id !== defaultAddress.id) {
                      handleSetDefault(address.id);
                    }
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    address.is_default
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      address.is_default ? "bg-green-200 dark:bg-green-800" : "bg-gray-200 dark:bg-gray-600"
                    }`}>
                      {address.is_default && (
                        <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{address.street}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{address.city}</div>
                    </div>
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Manage Addresses</span>
                  </div>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Full Page Modal - Rendered as Portal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            ref={modalRef} 
            className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Addresses</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      address.is_default
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {address.street}
                          </span>
                          {address.is_default && (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {address.city}, {address.postal_code}
                        </div>
                      </div>
                      
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="ml-3 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
