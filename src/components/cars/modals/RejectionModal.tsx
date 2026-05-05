import React from "react";
import { X, AlertCircle } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  reason: string;
  setReason: (reason: string) => void;
  theme: string;
}

export default function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  reason,
  setReason,
  theme,
}: RejectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 ${
          theme === "dark"
            ? "border border-white/5 bg-[#121212] text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-outfit text-2xl font-black">Reject Booking</h3>
        <p className="mb-6 text-sm text-gray-500">
          Please provide a reason for rejecting this booking.
        </p>
        <textarea
          className={`mb-6 h-32 w-full rounded-2xl border p-4 text-sm font-normal outline-none ${
            theme === "dark"
              ? "border-white/10 bg-white/5"
              : "border-gray-200 bg-gray-50"
          }`}
          placeholder="e.g. Vehicle maintenance, fully booked..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 rounded-2xl py-4 font-normal transition-all ${
              theme === "dark"
                ? "bg-white/5 hover:bg-white/10"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 rounded-2xl bg-red-500 py-4 font-black text-white shadow-xl shadow-red-500/30 transition-all hover:scale-[1.02]"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
