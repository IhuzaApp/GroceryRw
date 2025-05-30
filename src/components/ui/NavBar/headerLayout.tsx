import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Input, InputGroup, Modal } from "rsuite";
import { useCart } from "../../../context/CartContext";
import UserAddress from "../../userProfile/userAddress";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function HeaderLayout() {
  const { count } = useCart();
  const { data: session } = useSession();
  const [defaultAddress, setDefaultAddress] = useState<{
    street: string;
    city: string;
    postal_code: string;
  } | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    // Try loading the delivery address from cookie first
    const saved = Cookies.get("delivery_address");
    if (saved) {
      try {
        setDefaultAddress(JSON.parse(saved));
      } catch {}
    } else {
      // Fall back to default address from API
      fetch("/api/queries/addresses")
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
          setDefaultAddress(JSON.parse(updated));
        } catch {}
      }
    };
    window.addEventListener("addressChanged", handleAddrChange);
    return () => window.removeEventListener("addressChanged", handleAddrChange);
  }, []);

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

  return (
    <>
      <header className="container sticky top-0 z-50 mx-auto rounded-full border-b border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-4 px-2 sm:px-4">
          {/* Left section (address + icon) - Desktop only */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="currentColor"
              >
                <path d="..." />
              </svg>
            </div>
            <div>
              <h6 className="font-medium text-inherit">
                {defaultAddress
                  ? `${defaultAddress.street}, ${defaultAddress.city}`
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
            <InputGroup inside style={{ width: "100%" }}>
              <Input
                placeholder="Search"
                className="rounded-full bg-gray-50 text-inherit transition-colors duration-200 dark:bg-gray-700 dark:text-inherit dark:placeholder-gray-400"
              />
              <InputGroup.Addon className="text-inherit">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </InputGroup.Addon>
            </InputGroup>
          </div>

          {/* Right actions - Desktop only */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Cart Icon */}
            <Link href="/Cart" passHref>
              <div className="flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50 dark:hover:bg-green-900">
                <div className="text-inherit">
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
          {/* Logo or Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="currentColor"
            >
              <path d="..." />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            {/* Messages Icon - Mobile only */}
            <Link href="/Messages" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50 dark:hover:bg-green-900">
                <div className="text-inherit">
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
      <Modal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        size="lg"
        className="dark:text-white [&_.rs-modal-content]:dark:bg-gray-800"
      >
        <Modal.Header>
          <Modal.Title>Manage Addresses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserAddress
            onSelect={(addr) => {
              setDefaultAddress(addr);
              Cookies.set("delivery_address", JSON.stringify(addr));
              window.dispatchEvent(new Event("addressChanged"));
              setShowAddressModal(false);
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
