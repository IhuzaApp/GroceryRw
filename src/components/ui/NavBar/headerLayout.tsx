import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { useAuth } from "../../../hooks/useAuth";
import GuestUpgradeModal from "../GuestUpgradeModal";
import NotificationCenter from "../../shopper/NotificationCenter";
import PackageDeliveryModal from "./PackageDeliveryModal";

export default function HeaderLayout() {
  const router = useRouter();
  const { count } = useCart();
  const { data: session } = useSession();
  const { isGuest } = useAuth();
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  useEffect(() => {
    // Try loading the delivery address from cookie first (works for both logged in and guest users)
    const saved = Cookies.get("delivery_address");
    const tempAddress = Cookies.get("temp_address");

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
      } catch { }
    } else if (tempAddress) {
      // For guest users with temp address, create address object
      const lat = Cookies.get("user_latitude");
      const lng = Cookies.get("user_longitude");
      setDefaultAddress({
        street: tempAddress,
        city: "",
        postal_code: "",
        latitude: lat || "",
        longitude: lng || "",
      });
    } else if (session?.user?.id) {
      // Only fetch addresses from API if user is authenticated and no cookie exists
      authenticatedFetch("/api/queries/addresses")
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          // Silently handle 401 errors (not authenticated)
          if (res.status === 401) {
            return null;
          }
          throw new Error(`Failed to fetch addresses: ${res.status}`);
        })
        .then((data) => {
          if (!data) return;
          const def = (data.addresses || []).find((a: any) => a.is_default);
          setDefaultAddress(def || null);
          if (def) {
            Cookies.set("delivery_address", JSON.stringify(def));
            window.dispatchEvent(new Event("addressChanged"));
          }
        })
        .catch((err) => {
          // Only log non-401 errors
          if (!err.message?.includes("401")) {
            console.error("Error fetching addresses in header:", err);
          }
        });
    }
    // Listen for address changes and update
    const handleAddrChange = () => {
      const updated = Cookies.get("delivery_address");
      const tempAddr = Cookies.get("temp_address");

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
        } catch { }
      } else if (tempAddr) {
        // For guest users with temp address
        const lat = Cookies.get("user_latitude");
        const lng = Cookies.get("user_longitude");
        setDefaultAddress({
          street: tempAddr,
          city: "",
          postal_code: "",
          latitude: lat || "",
          longitude: lng || "",
        });
      } else if (session?.user?.id) {
        // If no cookie, try to fetch default address from API (only for authenticated users)
        fetch("/api/queries/addresses")
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            // Silently handle 401 errors (not authenticated)
            if (res.status === 401) {
              return null;
            }
            throw new Error(`Failed to fetch addresses: ${res.status}`);
          })
          .then((data) => {
            if (!data) return;
            const def = (data.addresses || []).find((a: any) => a.is_default);
            setDefaultAddress(def || null);
          })
          .catch((err) => {
            // Only log non-401 errors
            if (!err.message?.includes("401")) {
              console.error("Error fetching addresses in header:", err);
            }
          });
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
      {/* ── Desktop Header ── */}
      <header
        className="
          sticky top-0 z-40 mx-auto hidden
          w-full
          border-b border-white/20 dark:border-white/10
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-xl
          shadow-[0_2px_24px_0_rgba(0,0,0,0.08)] dark:shadow-[0_2px_24px_0_rgba(0,0,0,0.4)]
          md:block
          transition-all duration-300
        "
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-6 px-6 py-2.5">

          {/* ── Left: Logo + Address ── */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Logo */}
            <Link href="/" className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={28}
                height={28}
                className="h-7 w-7 drop-shadow-sm"
              />
            </Link>

            {/* Address block */}
            <button
              onClick={() => setShowAddressModal(true)}
              className="group flex flex-col items-start gap-0 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <div className="flex items-center gap-1.5">
                {/* Location pin */}
                <svg className="h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
                  Deliver to
                </span>
              </div>
              <span className="max-w-[160px] truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {defaultAddress
                  ? defaultAddress.street && defaultAddress.city
                    ? `${defaultAddress.street}, ${defaultAddress.city}`
                    : defaultAddress.latitude && defaultAddress.longitude
                      ? "Current Location"
                      : "Set address"
                  : "Set address"}
              </span>
            </button>
          </div>

          {/* ── Center: Search ── */}
          <div className="min-w-0 flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Send Package Icon */}
            <button
              onClick={() => setShowPackageModal(true)}
              title="Send a Package"
              className="
                group relative flex h-9 w-9 items-center justify-center rounded-xl
                text-gray-600 dark:text-gray-300
                transition-all duration-200
                hover:bg-green-50 hover:text-green-600
                dark:hover:bg-green-900/20 dark:hover:text-green-400
                active:scale-90
              "
            >
               <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5.5 w-5.5 transition-transform duration-200 group-hover:-translate-y-0.5"
              >
                <path
                  d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M14 20.889L12.777 21.5684C12.4934 21.726 12.3516 21.8047 12.2015 21.8356C12.0685 21.863 11.9315 21.863 11.7986 21.8356C11.6484 21.8047 11.5066 21.726 11.223 21.5684L3.82297 17.4573C3.52346 17.2909 3.37368 17.2077 3.26463 17.0893C3.16816 16.9847 3.09515 16.8606 3.05048 16.7254C3 16.5726 3 16.4013 3 16.0586V7.94153C3 7.59889 3 7.42757 3.05048 7.27477C3.09515 7.13959 3.16816 7.01551 3.26463 6.91082C3.37368 6.79248 3.52345 6.70928 3.82297 6.54288L11.223 2.43177C11.5066 2.27421 11.6484 2.19543 11.7986 2.16454C11.9315 2.13721 12.0685 2.13721 12.2015 2.16454C12.3516 2.19543 12.4934 2.27421 12.777 2.43177L20.177 6.54288C20.4766 6.70928 20.6263 6.79248 20.7354 6.91082C20.8318 7.01551 20.9049 7.13959 20.9495 7.27477C21 7.42757 21 7.59889 21 7.94153L21 12.5001M7.5 4.50008L16.5 9.50008M19 21.0001V15.0001M16 18.0001H22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Notifications Bell */}
            <NotificationCenter />

            {/* Guest Badge */}
            {isGuest && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                title="Upgrade to full member"
                className="
                  ml-1 flex items-center gap-1.5 rounded-full
                  bg-gradient-to-r from-amber-400 to-orange-500
                  px-3 py-1.5 text-sm font-semibold text-white
                  shadow-md shadow-orange-400/30
                  transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/40
                  active:scale-95
                "
              >
                {/* Person outline */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Guest
                {/* Sparkle/upgrade indicator */}
                <svg className="h-3.5 w-3.5 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                </svg>
              </button>
            )}

            {/* Divider */}
            <span className="mx-2 h-6 w-px rounded-full bg-gray-200 dark:bg-gray-700" />

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="
                group relative flex h-9 w-9 items-center justify-center rounded-xl
                text-gray-500 dark:text-gray-400
                transition-all duration-200
                hover:bg-amber-50 hover:text-amber-500
                dark:hover:bg-amber-900/20 dark:hover:text-amber-400
                active:scale-90
              "
            >
              {theme === "dark" ? (
                /* Sun icon */
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Cart */}
            <Link href="/Cart" passHref>
              <div
                className="
                  group relative flex h-9 w-9 items-center justify-center rounded-xl
                  text-gray-600 dark:text-gray-300
                  transition-all duration-200
                  hover:bg-green-50 hover:text-green-600
                  dark:hover:bg-green-900/20 dark:hover:text-green-400
                  active:scale-90
                "
              >
                {/* Shopping bag icon */}
                <svg className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>

                {/* Badge bubble */}
                {count > 0 && (
                  <span className="
                    absolute -right-1.5 -top-1.5
                    flex h-5 w-5 items-center justify-center
                    rounded-full
                    bg-gradient-to-br from-green-400 to-emerald-600
                    text-[10px] font-bold text-white
                    shadow-md shadow-green-500/40
                    ring-2 ring-white dark:ring-gray-900
                    transition-transform duration-200 group-hover:scale-110
                  ">
                    {count > 99 ? "99+" : count}
                  </span>
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

      {/* Guest Upgrade Modal */}
      <GuestUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Package Delivery Modal */}
      <PackageDeliveryModal
        open={showPackageModal}
        onClose={() => setShowPackageModal(false)}
      />
    </>
  );
}
