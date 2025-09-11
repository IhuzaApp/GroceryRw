import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Input, InputGroup, Modal } from "rsuite";
import { useCart } from "../../../context/CartContext";
import AddressManagementModal from "../../userProfile/AddressManagementModal";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import { useTheme } from "../../../context/ThemeContext";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import SearchBar from "../SearchBar/SearchBar";
import { authenticatedFetch } from "../../../lib/authenticatedFetch";

export default function HeaderLayout() {
  const { count } = useCart();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [defaultAddress, setDefaultAddress] = useState<{
    street: string;
    city: string;
    postal_code: string;
    latitude?: string;
    longitude?: string;
    altitude?: string;
  } | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    // Only fetch addresses if user is authenticated
    if (!session?.user?.id) {
      return;
    }

    // Try loading the delivery address from cookie first
    const saved = Cookies.get("delivery_address");
    if (saved) {
      try {
        const parsedAddress = JSON.parse(saved);
        // If it's a nearby location (has lat/lng but no street), show "Current Location"
        if (
          parsedAddress.latitude &&
          parsedAddress.longitude &&
          !parsedAddress.street
        ) {
          setDefaultAddress({
            ...parsedAddress,
            street: "Current Location",
            city: "GPS Coordinates",
          });
        } else {
          setDefaultAddress(parsedAddress);
        }
      } catch {}
    } else {
      // Fall back to default address from API
      authenticatedFetch("/api/queries/addresses")
        .then((res) => res.json())
        .then((data) => {
          const def = (data.addresses || []).find((a: any) => a.is_default);
          setDefaultAddress(def || null);
          if (def) {
            Cookies.set("delivery_address", JSON.stringify(def));
            window.dispatchEvent(new Event("addressChanged"));
          }
        })
        .catch((err) =>
          console.error("Error fetching addresses in header:", err)
        );
    }
    // Listen for address changes and update
    const handleAddrChange = () => {
      const updated = Cookies.get("delivery_address");
      if (updated) {
        try {
          const parsedAddress = JSON.parse(updated);
          // If it's a nearby location (has lat/lng but no street), show "Current Location"
          if (
            parsedAddress.latitude &&
            parsedAddress.longitude &&
            !parsedAddress.street
          ) {
            setDefaultAddress({
              ...parsedAddress,
              street: "Current Location",
              city: "GPS Coordinates",
            });
          } else {
            setDefaultAddress(parsedAddress);
          }
        } catch {}
      } else {
        // If no cookie, try to fetch default address from API
        fetch("/api/queries/addresses")
          .then((res) => res.json())
          .then((data) => {
            const def = (data.addresses || []).find((a: any) => a.is_default);
            setDefaultAddress(def || null);
          })
          .catch((err) =>
            console.error("Error fetching addresses in header:", err)
          );
      }
    };
    window.addEventListener("addressChanged", handleAddrChange);
    return () => window.removeEventListener("addressChanged", handleAddrChange);
  }, [session?.user?.id]);

  useEffect(() => {
    // Listen for unread messages if user is logged in
    if (session?.user?.id) {
      const userId = session.user.id;

      // Create a query for messages where the user is the recipient and messages are unread
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("recipientId", "==", userId),
        where("read", "==", false)
      );

      // Set up real-time listener for unread messages
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setUnreadMessages(snapshot.docs.length);
        },
        (error) => {
          console.error("Error fetching unread messages:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [session]);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <>
      <header className="container sticky top-0 z-50 mx-auto rounded-full border-b border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-4 px-2 sm:px-4">
          {/* Left section (address + icon) - Desktop only */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-12 w-12 items-center justify-center">
              <Image
                src="/assets/logos/PlasIcon.svg"
                alt="Plas Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
            <div>
              <h6 className="font-medium text-inherit">
                {defaultAddress
                  ? defaultAddress.street && defaultAddress.city
                    ? `${defaultAddress.street}, ${defaultAddress.city}`
                    : defaultAddress.latitude && defaultAddress.longitude
                    ? "Current Location"
                    : "No address set"
                  : "No address set"}
              </h6>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                <button
                  className="text-green-500 hover:underline dark:text-green-400"
                  onClick={() => setShowAddressModal(true)}
                >
                  Change Address
                </button>
              </p>
            </div>
          </div>

          {/* Center search - Desktop only */}
          <div className="mx-2 hidden max-w-md flex-1 md:mx-4 md:block">
            <SearchBar />
          </div>

          {/* Right actions - Desktop only */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Theme Switch */}
            <button
              onClick={handleThemeToggle}
              className="flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50 dark:hover:bg-green-900"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current"
                >
                  <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2V4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 20V22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.93 4.93L6.34 6.34"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.66 17.66L19.07 19.07"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12H4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 12H22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.34 17.66L4.93 19.07"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.07 4.93L17.66 6.34"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current"
                >
                  <path
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Cart Icon */}
            <Link href="/Cart" passHref>
              <div className="flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer">
                <div className="text-gray-900 dark:text-white">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </div>
                {count > 0 && (
                  <span className="text-xl font-bold text-green-500 dark:text-green-400">
                    {count}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile version */}
        <div className="flex items-center justify-between px-3 pt-2 md:hidden">
          {/* Logo Section - Mobile */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div
                className={`transition-all duration-200 ${
                  theme === "dark" ? "brightness-0 invert" : ""
                }`}
              >
                <Image
                  src="/assets/logos/PlasLogo.svg"
                  alt="Plas Logo"
                  width={80}
                  height={30}
                  className="h-8 w-auto"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Messages Icon - Mobile */}
            <Link href="/Messages" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50 dark:hover:bg-green-900">
                <div className="text-gray-900 dark:text-white">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M8 10.5H16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 14H13.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>
                </div>
                {unreadMessages > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>
      <AddressManagementModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={(addr) => {
          setDefaultAddress(addr);
          Cookies.set("delivery_address", JSON.stringify(addr));
          window.dispatchEvent(new Event("addressChanged"));
          setShowAddressModal(false);
        }}
      />
    </>
  );
}
