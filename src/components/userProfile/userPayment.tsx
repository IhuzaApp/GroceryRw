import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";
import { useLanguage } from "../../context/LanguageContext";
import { reportErrorToSlackClient } from "../../lib/reportErrorClient";
import AddPaymentMethodModal from "./AddPaymentMethodModal";

// Encryption key - in production, this should be in environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

// Helper to map methods to their logo path
const getMethodLogo = (method: string) => {
  switch (method.toLowerCase()) {
    case "visa":
      return "/assets/logos/visa.svg";
    case "mastercard":
    case "mc":
      return "/assets/logos/mastercard.svg";
    case "mtn momo":
      return "/assets/logos/mtn.svg";
    case "airtel":
    case "airtel money":
      return "/assets/logos/airtel.svg";
    default:
      return null;
  }
};

// Format card number to show only last 4 digits
const formatCardNumber = (encryptedNumber: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedNumber, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const lastFour = decrypted.slice(-4);
    return `**** **** **** ${lastFour}`;
  } catch (error) {
    return "**** **** **** ****";
  }
};

interface PaymentMethod {
  id: string;
  user_id: string;
  method: string;
  names: string;
  number: string;
  CCV: string;
  validity: string;
  is_default: boolean;
}

interface PaymentCard {
  id: string;
  number: string;
  name: string;
  expiry_date: string;
  image: string | null;
  created_at: string;
}

export default function UserPayment() {
  const { t } = useLanguage();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/queries/payment-methods");
      const { paymentMethods } = await res.json();
      setPaymentMethods(paymentMethods);
    } catch (err) {
      reportErrorToSlackClient("userPayment (load payment methods)", err);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/queries/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_default: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error || `Request failed with status ${res.status}`
        );
      }
      toast.success("Default payment method updated!");
      fetchPaymentMethods();
    } catch (err: any) {
      reportErrorToSlackClient("userPayment (update default method)", err);
      toast.error(err.message || "Failed to update default payment method");
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {t("nav.paymentMethods")}
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {t("nav.managePaymentMethods")}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest !text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 sm:w-auto"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Method
        </button>
      </div>
      <div className="space-y-4">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl ${
              pm.is_default
                ? "border-green-500 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:border-green-600 dark:from-green-900/10 dark:to-emerald-900/10"
                : "border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-gray-800/80"
            } backdrop-blur-md`}
          >
            {/* Main Content Container */}
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row">
              {/* Payment Method Icon Container */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                {getMethodLogo(pm.method) ? (
                  <Image
                    src={getMethodLogo(pm.method)!}
                    alt={pm.method}
                    width={44}
                    height={44}
                    className="h-10 w-10 object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-700">
                    {pm.method.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Details Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {pm.method}
                  </h4>
                  {pm.is_default && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider !text-white shadow-sm">
                      <svg
                        className="mr-1 h-2.5 w-2.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("address.default")}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-col gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 sm:flex-row">
                  <span className="font-medium">
                    {t("payment.endingIn")}{" "}
                    <span className="text-gray-900 dark:text-gray-200">
                      {pm.number.slice(-4)}
                    </span>
                  </span>
                  {pm.validity && (
                    <span className="font-medium">
                      {t("payment.expires")}{" "}
                      <span className="text-gray-900 dark:text-gray-200">
                        {pm.validity}
                      </span>
                    </span>
                  )}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {pm.names}
                  </span>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                {!pm.is_default && (
                  <button
                    onClick={() => handleSetDefault(pm.id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-green-500 bg-transparent px-4 py-2 text-[10px] font-bold text-green-600 transition-all duration-200 hover:bg-green-500 hover:!text-white hover:shadow-lg active:scale-95 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-600 dark:hover:!text-white"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("address.setDefault")}
                  </button>
                )}
                <button className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-red-100 bg-red-50 px-4 py-2 text-[10px] font-bold text-red-600 transition-all duration-200 hover:border-red-500 hover:bg-red-500 hover:!text-white hover:shadow-lg active:scale-95 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:!text-white">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {t("payment.delete")}
                </button>
              </div>
            </div>

            {/* Premium Decorative Accents */}
            <div
              className={`absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${
                pm.is_default ? "bg-green-400/20" : "bg-blue-400/10"
              }`}
            />
            <div
              className={`absolute -bottom-4 -left-4 h-16 w-16 rounded-full blur-xl transition-opacity duration-500 group-hover:opacity-100 ${
                pm.is_default ? "bg-emerald-400/20" : "bg-purple-400/10"
              }`}
            />
          </div>
        ))}
      </div>
      {paymentMethods.length === 0 && (
        <div className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center shadow-sm transition-all hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50">
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition-transform duration-500 group-hover:scale-110 group-hover:text-green-500 dark:bg-gray-700/50">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {t("payment.noPaymentMethods")}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your saved payment methods will appear here safely.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-50/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:to-green-900/10" />
        </div>
      )}

      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchPaymentMethods}
      />
    </>
  );
}
