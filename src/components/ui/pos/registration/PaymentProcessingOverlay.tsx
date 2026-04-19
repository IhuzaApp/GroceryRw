import React from "react";
import { Loader2, Phone } from "lucide-react";
import { useRouter } from "next/router";
import { useTheme } from "../../../../context/ThemeContext";

interface PaymentProcessingOverlayProps {
  processingStep: "initiating_payment" | "awaiting_approval" | "success";
}

export default function PaymentProcessingOverlay({
  processingStep,
}: PaymentProcessingOverlayProps) {
  const { theme } = useTheme();
  const router = useRouter();

  // Force light theme if on POS path to match POS UI
  const isPos = router.pathname.startsWith("/pos");
  const activeTheme = isPos ? "light" : theme;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm duration-300 animate-in fade-in">
      <div
        className={`mx-4 w-full max-w-lg overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 animate-in zoom-in-95 ${
          activeTheme === "dark"
            ? "border border-white/5 bg-gray-900"
            : "bg-white"
        }`}
      >
        <div
          className={`h-2 w-full animate-pulse ${
            activeTheme === "dark" ? "bg-green-500" : "bg-[#022C22]"
          }`}
        />
        <div className="p-8 text-center md:p-12">
          <div className="mb-8 flex justify-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-2xl transition-all duration-500 ${
                processingStep === "success"
                  ? "bg-green-500/10 text-green-500 shadow-lg shadow-green-500/20"
                  : activeTheme === "dark"
                  ? "bg-white/5 text-white"
                  : "bg-[#022C22]/10 text-[#022C22]"
              }`}
            >
              {processingStep === "success" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <Loader2 className="h-12 w-12 animate-spin" />
              )}
            </div>
          </div>
          <h3
            className={`mb-3 text-2xl font-bold ${
              activeTheme === "dark" ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            {processingStep === "initiating_payment" && "Initiating Payment"}
            {processingStep === "awaiting_approval" && "Waiting for Approval"}
            {processingStep === "success" && "Payment Completed!"}
          </h3>
          <p
            className={`${
              activeTheme === "dark" ? "text-gray-400" : "text-gray-500"
            } font-medium`}
          >
            {processingStep === "initiating_payment" &&
              "Connecting to MoMo secure gateway..."}
            {processingStep === "awaiting_approval" &&
              "Check your mobile phone, we sent the request."}
            {processingStep === "success" &&
              "Your payment was successful and your order is being processed."}
          </p>
          {processingStep === "awaiting_approval" && (
            <div
              className={`mt-8 flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-sm font-bold transition-all duration-300 ${
                activeTheme === "dark"
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-[#022C22]/10 bg-[#022C22]/5 text-[#022C22]"
              }`}
            >
              <Phone className="h-5 w-5" />
              Approval required via MoMo USSD prompt
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
