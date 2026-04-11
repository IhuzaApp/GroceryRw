import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  X,
  MessageSquare,
  ClipboardList,
  Store,
  Tag,
  Activity,
  Send,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Info,
} from "lucide-react";

function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
  /** Current order (regular, reel, or restaurant) */
  order: any;
  /** Order type for this order */
  orderType: "regular" | "reel" | "restaurant" | "business" | "package";
  onSuccess?: () => void;
}

export default function ContactSupportModal({
  open,
  onClose,
  order,
  orderType,
  onSuccess,
}: ContactSupportModalProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<number | null>(null);

  const isDark = theme === "dark";

  const storeName =
    order?.shop?.name ??
    order?.reel?.title ??
    order?.Restaurant?.name ??
    order?.restaurant?.name ??
    (orderType === "package" ? "Plas Package" : "—");

  const orderDisplayId =
    order?.DeliveryCode != null
      ? order.DeliveryCode
      : order?.OrderID != null
      ? formatOrderID(order.OrderID)
      : order?.id ?? "—";

  const status = order?.status ?? "—";

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please explain what you need help with.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id,
          orderDisplayId: order?.OrderID ?? order?.id,
          orderType,
          storeName,
          status,
          message: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
        return;
      }

      if (data.code) {
        setSuccessCode(data.code);
        onSuccess?.();
      } else {
        setMessage("");
        onSuccess?.();
        onClose();
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage("");
      setError(null);
      setSuccessCode(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Premium Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border shadow-2xl transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-10 border-[var(--bg-secondary)] bg-[var(--bg-primary)] shadow-black/30`}
      >
        {/* Decorative Background Element */}
        <div
          className={`absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-[100px] ${
            isDark ? "bg-emerald-500" : "bg-emerald-400"
          }`}
        />

        {/* Header Section */}
        <div
          className={`relative flex items-start justify-between border-b px-8 py-8 border-[var(--bg-secondary)]`}
        >
          <div className="flex gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Headphones className="h-7 w-7" />
            </div>
            <div>
              <h2
                className={`text-2xl font-black tracking-tight text-[var(--text-primary)]`}
              >
                Customer Support
              </h2>
              <p
                className={`mt-1 text-sm font-medium text-[var(--text-secondary)]`}
              >
                We're here to help. Send us a message!
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className={`group rounded-full p-2 transition-all hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Section */}
        <div className="scrollbar-hide relative max-h-[65vh] overflow-y-auto px-8 py-8">
          {successCode ? (
            <div className="flex flex-col items-center justify-center py-6 text-center duration-500 animate-in fade-in zoom-in-95">
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>

              <h3
                className={`text-3xl font-black italic tracking-tighter text-[var(--text-primary)]`}
              >
                TICKET SENT!
              </h3>

              <div className="mt-6 flex flex-col items-center">
                <p
                  className={`text-sm font-bold uppercase tracking-widest ${
                    isDark ? "text-emerald-400/60" : "text-emerald-600/60"
                  }`}
                >
                  Your Tracking Code
                </p>
                <div
                  className={`mt-2 rounded-2xl border-2 border-dashed px-8 py-3 text-4xl font-black tracking-widest ${
                    isDark
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  #{successCode}
                </div>
              </div>

              <div
                className={`mt-10 max-w-sm rounded-[1.5rem] p-6 text-center text-sm leading-relaxed bg-[var(--bg-secondary)] text-[var(--text-secondary)]`}
              >
                <Info
                  className={`mx-auto mb-3 h-5 w-5 ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                Please keep this code safe. You can ask our <b>AI Assistant</b>{" "}
                for updates using this number.
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-500 ring-1 ring-inset ring-red-500/20">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              {/* Enhanced Order Brief Card */}
              <div
                className={`group relative overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-300 hover:shadow-lg border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/50`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]`}
                  >
                    Reference Details
                  </span>
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      isDark
                        ? "bg-white/10 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    <Activity className="h-3 w-3" />
                    {status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList
                      className={`h-4 w-4 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase opacity-40">
                        Order ID
                      </p>
                      <p
                        className={`truncate text-sm font-bold text-[var(--text-primary)]`}
                      >
                        #{orderDisplayId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag
                      className={`h-4 w-4 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase opacity-40">
                        Category
                      </p>
                      <p
                        className={`truncate text-sm font-bold text-[var(--text-primary)]`}
                      >
                        {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <Store
                      className={`h-4 w-4 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase opacity-40">
                        Store/Source
                      </p>
                      <p
                        className={`truncate text-sm font-bold text-[var(--text-primary)]`}
                      >
                        {storeName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare
                    className={`h-4 w-4 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  <label
                    className={`text-sm font-black uppercase tracking-wider text-[var(--text-primary)]`}
                  >
                    How can we help?
                  </label>
                </div>
                <div className="group relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's happening..."
                    rows={5}
                    disabled={submitting}
                    className={`w-full resize-none rounded-[1.5rem] border-2 p-5 text-sm font-medium leading-relaxed transition-all duration-300 focus:outline-none border-[var(--bg-secondary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-emerald-500/50`}
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold opacity-30">
                    {message.length} characters
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons Section */}
        <div
          className={`flex flex-col gap-3 border-t p-8 sm:flex-row sm:items-center sm:justify-end border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/20`}
        >
          {successCode ? (
            <button
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-10 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-600 active:scale-95 sm:w-auto"
            >
              GOT IT
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-8 py-4 text-base font-bold transition-all sm:w-auto border-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-10 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-800 hover:shadow-emerald-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    SUBMITTING...
                  </div>
                ) : (
                  <>
                    SUBMIT TICKET
                    <Send className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
