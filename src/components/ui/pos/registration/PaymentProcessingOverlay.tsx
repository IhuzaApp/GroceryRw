"use client";

import React from "react";
import { Loader2, Phone } from "lucide-react";

interface PaymentProcessingOverlayProps {
    processingStep: "initiating_payment" | "awaiting_approval" | "success";
}

export default function PaymentProcessingOverlay({
    processingStep,
}: PaymentProcessingOverlayProps) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-2 w-full bg-[#022C22] animate-pulse" />
                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${processingStep === "success" ? "bg-green-100 text-green-600 shadow-lg shadow-green-200" : "bg-blue-100 text-[#022C22]"}`}>
                            {processingStep === "success" ? (
                                <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <Loader2 className="h-12 w-12 animate-spin" />
                            )}
                        </div>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        {processingStep === "initiating_payment" && "Initiating Payment"}
                        {processingStep === "awaiting_approval" && "Waiting for Approval"}
                        {processingStep === "success" && "Payment Completed!"}
                    </h3>
                    <p className="text-gray-600">
                        {processingStep === "initiating_payment" &&
                            "Connecting to MoMo secure gateway..."}
                        {processingStep === "awaiting_approval" &&
                            "Check your mobile, we sent the request."}
                        {processingStep === "success" &&
                            "Your payment was successful and your order is being processed."}
                    </p>
                    {processingStep === "awaiting_approval" && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#022C22] bg-[#022C22]/5 py-3 rounded-lg px-4 border border-[#022C22]/10">
                            <Phone className="h-4 w-4" />
                            Approval required via MoMo USSD prompt
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
