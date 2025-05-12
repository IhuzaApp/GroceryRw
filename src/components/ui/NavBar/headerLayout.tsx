import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Input, InputGroup, Modal } from "rsuite";
import { useCart } from "../../../context/CartContext";
import UserAddress from "../../userProfile/userAddress";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
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
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadMessages(snapshot.docs.length);
      }, (error) => {
        console.error("Error fetching unread messages:", error);
      });
      
      return () => unsubscribe();
    }
  }, [session]);

  return (
    <>
      <header className="container sticky top-0 z-50 mx-auto rounded-full border-b bg-white p-2 shadow-lg">
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
              <h2 className="font-medium text-gray-900">
                {defaultAddress
                  ? `${defaultAddress.street}, ${defaultAddress.city}`
                  : "No address set"}
              </h2>
              <p className="text-xs text-gray-500">
                <button
                  className="text-green-500 hover:underline"
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
              <Input placeholder="Search" className="rounded-full" />
              <InputGroup.Addon>
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
            {/* Messages Icon */}
            <Link href="/Messages" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50">
                <div className="text-green-600">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 14H13.5"
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>
                </div>
                {unreadMessages > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </div>
                )}
              </div>
            </Link>
            
            {/* Cart Icon */}
            <Link href="/Cart" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50">
                <div className="text-white">
                  <svg
                    width="33px"
                    height="33px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        opacity="0.5"
                        d="M10 2C9.0335 2 8.25 2.7835 8.25 3.75C8.25 4.7165 9.0335 5.5 10 5.5H14C14.9665 5.5 15.75 4.7165 15.75 3.75C15.75 2.7835 14.9665 2 14 2H10Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        opacity="0.5"
                        d="M3.86327 16.2052C3.00532 12.7734 2.57635 11.0575 3.47718 9.90376C4.37801 8.75 6.14672 8.75 9.68413 8.75H14.3148C17.8522 8.75 19.6209 8.75 20.5218 9.90376C21.4226 11.0575 20.9936 12.7734 20.1357 16.2052C19.59 18.3879 19.3172 19.4792 18.5034 20.1146C17.6896 20.75 16.5647 20.75 14.3148 20.75H9.68413C7.43427 20.75 6.30935 20.75 5.49556 20.1146C4.68178 19.4792 4.40894 18.3879 3.86327 16.2052Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M15.5805 4.5023C15.6892 4.2744 15.75 4.01931 15.75 3.75C15.75 3.48195 15.6897 3.22797 15.582 3.00089C16.2655 3.00585 16.7983 3.03723 17.2738 3.22309C17.842 3.44516 18.3362 3.82266 18.6999 4.31242C19.0669 4.8065 19.2391 5.43979 19.4762 6.31144L19.5226 6.48181L20.0353 9.44479C19.6266 9.16286 19.0996 8.99533 18.418 8.89578L18.0567 6.80776C17.7729 5.76805 17.6699 5.44132 17.4957 5.20674C17.2999 4.94302 17.0337 4.73975 16.7278 4.62018C16.508 4.53427 16.2424 4.50899 15.5805 4.5023Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M8.41799 3.00089C8.31027 3.22797 8.25 3.48195 8.25 3.75C8.25 4.01931 8.31083 4.27441 8.41951 4.50231C7.75766 4.509 7.49208 4.53427 7.27227 4.62018C6.96633 4.73975 6.70021 4.94302 6.50436 5.20674C6.33015 5.44132 6.22715 5.76805 5.94337 6.80776L5.58207 8.89569C4.90053 8.99518 4.37353 9.1626 3.96484 9.44433L4.47748 6.48181L4.52387 6.31145C4.76095 5.4398 4.9332 4.8065 5.30013 4.31242C5.66384 3.82266 6.15806 3.44516 6.72624 3.22309C7.20177 3.03724 7.73449 3.00586 8.41799 3.00089Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M8.75 12.75C8.75 12.3358 8.41421 12 8 12C7.58579 12 7.25 12.3358 7.25 12.75V16.75C7.25 17.1642 7.58579 17.5 8 17.5C8.41421 17.5 8.75 17.1642 8.75 16.75V12.75Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M16 12C16.4142 12 16.75 12.3358 16.75 12.75V16.75C16.75 17.1642 16.4142 17.5 16 17.5C15.5858 17.5 15.25 17.1642 15.25 16.75V12.75C15.25 12.3358 15.5858 12 16 12Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M12.75 12.75C12.75 12.3358 12.4142 12 12 12C11.5858 12 11.25 12.3358 11.25 12.75V16.75C11.25 17.1642 11.5858 17.5 12 17.5C12.4142 17.5 12.75 17.1642 12.75 16.75V12.75Z"
                        fill="#98d576"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                {count > 0 && (
                  <span className="text-xl font-bold text-green-500">{count}</span>
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
            {/* Messages Icon */}
            <Link href="/Messages" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50">
                <div className="text-green-600">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 14H13.5"
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
                        stroke="#98d576"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>
                </div>
                {unreadMessages > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </div>
                )}
              </div>
            </Link>
            
            {/* Cart Icon */}
            <Link href="/Cart" passHref>
              <div className="relative flex items-center gap-1 rounded-md p-1.5 transition-colors duration-200 hover:cursor-pointer hover:bg-green-50">
                <div className="text-green-600">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        opacity="0.5"
                        d="M10 2C9.0335 2 8.25 2.7835 8.25 3.75C8.25 4.7165 9.0335 5.5 10 5.5H14C14.9665 5.5 15.75 4.7165 15.75 3.75C15.75 2.7835 14.9665 2 14 2H10Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        opacity="0.5"
                        d="M3.86327 16.2052C3.00532 12.7734 2.57635 11.0575 3.47718 9.90376C4.37801 8.75 6.14672 8.75 9.68413 8.75H14.3148C17.8522 8.75 19.6209 8.75 20.5218 9.90376C21.4226 11.0575 20.9936 12.7734 20.1357 16.2052C19.59 18.3879 19.3172 19.4792 18.5034 20.1146C17.6896 20.75 16.5647 20.75 14.3148 20.75H9.68413C7.43427 20.75 6.30935 20.75 5.49556 20.1146C4.68178 19.4792 4.40894 18.3879 3.86327 16.2052Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M15.5805 4.5023C15.6892 4.2744 15.75 4.01931 15.75 3.75C15.75 3.48195 15.6897 3.22797 15.582 3.00089C16.2655 3.00585 16.7983 3.03723 17.2738 3.22309C17.842 3.44516 18.3362 3.82266 18.6999 4.31242C19.0669 4.8065 19.2391 5.43979 19.4762 6.31144L19.5226 6.48181L20.0353 9.44479C19.6266 9.16286 19.0996 8.99533 18.418 8.89578L18.0567 6.80776C17.7729 5.76805 17.6699 5.44132 17.4957 5.20674C17.2999 4.94302 17.0337 4.73975 16.7278 4.62018C16.508 4.53427 16.2424 4.50899 15.5805 4.5023Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M8.41799 3.00089C8.31027 3.22797 8.25 3.48195 8.25 3.75C8.25 4.01931 8.31083 4.27441 8.41951 4.50231C7.75766 4.509 7.49208 4.53427 7.27227 4.62018C6.96633 4.73975 6.70021 4.94302 6.50436 5.20674C6.33015 5.44132 6.22715 5.76805 5.94337 6.80776L5.58207 8.89569C4.90053 8.99518 4.37353 9.1626 3.96484 9.44433L4.47748 6.48181L4.52387 6.31145C4.76095 5.4398 4.9332 4.8065 5.30013 4.31242C5.66384 3.82266 6.15806 3.44516 6.72624 3.22309C7.20177 3.03724 7.73449 3.00586 8.41799 3.00089Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M8.75 12.75C8.75 12.3358 8.41421 12 8 12C7.58579 12 7.25 12.3358 7.25 12.75V16.75C7.25 17.1642 7.58579 17.5 8 17.5C8.41421 17.5 8.75 17.1642 8.75 16.75V12.75Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M16 12C16.4142 12 16.75 12.3358 16.75 12.75V16.75C16.75 17.1642 16.4142 17.5 16 17.5C15.5858 17.5 15.25 17.1642 15.25 16.75V12.75C15.25 12.3358 15.5858 12 16 12Z"
                        fill="#98d576"
                      ></path>{" "}
                      <path
                        d="M12.75 12.75C12.75 12.3358 12.4142 12 12 12C11.5858 12 11.25 12.3358 11.25 12.75V16.75C11.25 17.1642 11.5858 17.5 12 17.5C12.4142 17.5 12.75 17.1642 12.75 16.75V12.75Z"
                        fill="#98d576"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                {count > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {count > 9 ? '9+' : count}
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
