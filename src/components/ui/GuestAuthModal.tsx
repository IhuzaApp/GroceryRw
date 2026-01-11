import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestContinue: (guestData: GuestUserData) => void;
}

export interface GuestUserData {
  name: string;
  phone: string;
  email?: string;
}

export default function GuestAuthModal({
  isOpen,
  onClose,
  onGuestContinue,
}: GuestAuthModalProps) {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestData, setGuestData] = useState<GuestUserData>({
    name: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!guestData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!guestData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    const cleanPhone = guestData.phone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    // Validate email if provided
    if (guestData.email && guestData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating guest account...");

    try {
      // Create guest user via API
      const response = await fetch("/api/auth/guest-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestData.name.trim(),
          phone: cleanPhone,
          email: guestData.email?.trim() || `guest_${cleanPhone}@guest.local`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create guest account");
      }

      // Auto-login the guest user
      const signInResult = await signIn("credentials", {
        identifier: data.guestEmail,
        password: data.guestPassword,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Failed to sign in as guest");
      }

      toast.success("Continuing as guest", { id: toastId });
      onGuestContinue(guestData);
      onClose();

      // Refresh the page to update session
      router.reload();
    } catch (error: any) {
      console.error("Guest registration error:", error);
      toast.error(error.message || "Failed to continue as guest", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    onClose();
    router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {showGuestForm ? "Continue as Guest" : "Sign In Required"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              theme === "dark"
                ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Content */}
        <div className="p-6">
          {!showGuestForm ? (
            // Initial choice screen
            <div className="space-y-4">
              <p
                className={`text-center text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                To add items to your cart, please sign in or continue as a guest
              </p>

              <div className="space-y-3">
                {/* Login Button */}
                <button
                  onClick={handleLoginRedirect}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-semibold transition-all hover:scale-[1.02] ${
                    theme === "dark"
                      ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
                      : "border-green-600 bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span
                      className={`px-2 ${
                        theme === "dark"
                          ? "bg-gray-800 text-gray-400"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      Or
                    </span>
                  </div>
                </div>

                {/* Continue as Guest Button */}
                <button
                  onClick={() => setShowGuestForm(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-semibold transition-all hover:scale-[1.02] ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Continue as Guest
                </button>
              </div>

              <p
                className={`text-center text-xs ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Guest accounts let you shop without creating a full account
              </p>
            </div>
          ) : (
            // Guest form
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Please provide your details to continue shopping
              </p>

              {/* Name Input */}
              <div>
                <label
                  htmlFor="guest-name"
                  className={`mb-1 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestData.name}
                  onChange={(e) =>
                    setGuestData({ ...guestData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  required
                />
              </div>

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="guest-phone"
                  className={`mb-1 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="guest-phone"
                  type="tel"
                  value={guestData.phone}
                  onChange={(e) =>
                    setGuestData({ ...guestData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  required
                />
              </div>

              {/* Email Input (Optional) */}
              <div>
                <label
                  htmlFor="guest-email"
                  className={`mb-1 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email{" "}
                  <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  id="guest-email"
                  type="email"
                  value={guestData.email}
                  onChange={(e) =>
                    setGuestData({ ...guestData, email: e.target.value })
                  }
                  placeholder="Enter your email (optional)"
                  disabled={isLoading}
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg border px-4 py-2.5 font-semibold transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-semibold transition-colors ${
                    theme === "dark"
                      ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
                      : "border-green-600 bg-green-600 text-white hover:bg-green-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>

              <p
                className={`text-center text-xs ${
                  theme === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                We'll use this information for order updates and delivery
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
