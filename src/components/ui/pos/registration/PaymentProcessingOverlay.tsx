"use client";

import React from "react";
import { Loader2, Phone } from "lucide-react";

interface PaymentProcessingOverlayProps {
    processingStep: "initiating_payment" | "awaiting_approval";
}

export default function PaymentProcessingOverlay({
    processingStep,
}: PaymentProcessingOverlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-2 w-full bg-[#022C22] animate-pulse" />
                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-[#022C22]">
                            <Loader2 className="h-12 w-12 animate-spin" />
                        </div>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        {processingStep === "initiating_payment" && "Initiating Payment"}
                        {processingStep === "awaiting_approval" && "Waiting for Approval"}
                    </h3>
                    <p className="text-gray-600">
                        {processingStep === "initiating_payment" &&
                            "Connecting to MoMo secure gateway..."}
                        {processingStep === "awaiting_approval" &&
                            "Please check your phone and approve the payment request."}
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
