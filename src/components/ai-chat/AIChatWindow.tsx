import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../lib/firebase";
import { useCart } from "../../context/CartContext";
import { useFoodCart } from "../../context/FoodCartContext";
import { Loader2, Phone, CheckCircle2, AlertCircle } from "lucide-react";

interface CartConfirmPayload {
  product_id: string;
  shop_id: string;
  product_name: string;
  price: number | string;
  quantity: number;
  image?: string;
  item_source?: "Shop" | "Restaurant" | "BusinessStore";
  cart_payload?: any;
  restaurant_payload?: any;
  dish_payload?: any;
}

interface CheckoutConfirmPayload {
  shop_id: string;
  shop_name: string;
  address_id: string;
  address_street: string;
  payment_method_id: string;
  payment_method_name: string;
  payment_method_type: string;
  subtotal: number;
  service_fee: number;
  delivery_fee: number;
  total: number;
  pricing_token: string;
  is_food?: boolean;
}

interface CheckoutSetupPayload {
  shop_id: string;
  shop_name: string;
  addresses: any[];
  payment_methods: any[];
  subtotal: number;
  is_food?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  // Optional: action cards
  cartConfirm?: CartConfirmPayload;
  cartAdded?: boolean;
  checkoutConfirm?: CheckoutConfirmPayload;
  checkoutSetup?: CheckoutSetupPayload;
  checkoutPlaced?: boolean;
  checkoutComment?: string;
  isProcessing?: boolean;
  isComplete?: boolean;
  paymentStatus?: "pending" | "success" | "failed";
  referenceId?: string;
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIUsageStatus {
  usageCount: number;
  limit: number;
  isSubscribed: boolean;
  isBlocked: boolean;
}

// ─── Cart Confirmation Card ────────────────────────────────────────────────────
function CartConfirmCard({
  msgId,
  payload,
  isDone,
  isProcessing,
  onConfirm,
  onDecline,
}: {
  msgId: string;
  payload: CartConfirmPayload;
  isDone?: boolean;
  isProcessing?: boolean;
  onConfirm: (
    msgId: string,
    payload: CartConfirmPayload,
    qty: number
  ) => void | Promise<void>;
  onDecline: (msgId: string) => void | Promise<void>;
}) {
  const [qty, setQty] = React.useState(payload.quantity || 1);
  if (isDone) {
    return (
      <div className="flex justify-start duration-300 animate-in fade-in slide-in-from-bottom-3">
        <div className="max-w-[85%] rounded-3xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg text-white">
              ✓
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Added to cart!
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {payload.product_name} ×{qty}
              </p>
            </div>
          </div>
          <a
            href={
              payload.item_source === "Restaurant" ? "/Cart/FoodCart" : "/Cart"
            }
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            🛒 Go to Cart &amp; Checkout →
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div className="max-w-[85%] overflow-hidden rounded-3xl rounded-tl-sm border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Product header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#064e3b]/10 to-[#047857]/5 px-4 py-3 dark:from-[#064e3b]/30">
          <img
            src={payload.image || "/images/groceryPlaceholder.png"}
            alt={payload.product_name}
            className="h-12 w-12 rounded-xl object-cover shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/images/groceryPlaceholder.png";
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800 dark:text-white">
              {payload.product_name}
            </p>
            <p className="text-xs font-semibold text-[#115e59]">
              {Number(payload.price).toLocaleString()} RWF
            </p>
          </div>
        </div>
        {/* Quantity + actions */}
        <div className="px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Quantity
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1 dark:border-gray-600">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-800 dark:text-white">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Icon-only Add to Cart button */}
            <button
              onClick={() => onConfirm(msgId, payload, qty)}
              disabled={isProcessing}
              title="Add to cart"
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] py-2.5 text-white shadow-sm transition hover:opacity-90 active:scale-95 ${
                isProcessing ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isProcessing ? "animate-pulse" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                <line x1="12" y1="10" x2="12" y2="16" />
                <line x1="9" y1="13" x2="15" y2="13" />
              </svg>
            </button>
            <button
              onClick={() => onDecline(msgId)}
              className="flex-1 rounded-2xl border border-gray-200 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Setup Card (Interactive Selector) ──────────────────────────────
function CheckoutSetupCard({
  msgId,
  payload,
  isProcessing,
  isPlaced,
  onConfirm,
  onDecline,
}: {
  msgId: string;
  payload: CheckoutSetupPayload;
  isProcessing?: boolean;
  isPlaced?: boolean;
  onConfirm: (
    msgId: string,
    selection: CheckoutConfirmPayload & { comment: string }
  ) => void | Promise<void>;
  onDecline: (msgId: string) => void | Promise<void>;
}) {
  const [selectedAddrId, setSelectedAddrId] = React.useState(
    payload.addresses.find((a) => a.is_default)?.id ||
      payload.addresses[0]?.id ||
      ""
  );
  const [selectedPayId, setSelectedPayId] = React.useState(
    payload.payment_methods.find((p) => p.is_default)?.id ||
      payload.payment_methods[0]?.id ||
      ""
  );
  const [comment, setComment] = React.useState("");
  const [preview, setPreview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (selectedAddrId && !preview) {
      updatePreview(selectedAddrId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePreview = async (addrId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search-plas-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_order_preview",
          params: { shop_id: payload.shop_id, address_id: addrId },
        }),
      });
      const data = await res.json();
      setPreview(data);
    } catch (e) {
      console.error("Preview failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!preview || isSubmitting || isProcessing || isPlaced) return;
    setIsSubmitting(true);
    const addr = payload.addresses.find((a: any) => a.id === selectedAddrId);
    const pay = payload.payment_methods.find(
      (p: any) => p.id === selectedPayId
    );

    try {
      await onConfirm(msgId, {
        ...preview,
        shop_id: payload.shop_id,
        shop_name: payload.shop_name,
        address_id: selectedAddrId,
        address_street: addr?.street || "Selected Address",
        payment_method_id: selectedPayId,
        payment_method_name: pay?.number || pay?.method || "Selected Method",
        payment_method_type: pay?.method?.toLowerCase().includes("momo")
          ? "mobile_money"
          : "card",
        is_food: payload.is_food,
        comment,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-start duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div className="max-w-[90%] overflow-hidden rounded-3xl rounded-tl-sm border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="bg-[#115e59] px-5 py-4 text-white">
          <h4 className="text-base font-bold">Checkout Details</h4>
          <p className="text-xs opacity-80">{payload.shop_name}</p>
        </div>

        <div className="space-y-5 p-5">
          {/* Address Selection */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase leading-none tracking-wider text-gray-400">
              Delivery Address
            </label>
            <select
              value={selectedAddrId}
              disabled={isProcessing || isPlaced}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedAddrId(newId);
                setPreview(null); // Clear preview immediately for feedback
                updatePreview(newId);
              }}
              className={`w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#84cc16] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                isProcessing || isPlaced ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {payload.addresses.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.street}, {a.city}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase leading-none tracking-wider text-gray-400">
              Payment Method
            </label>
            <select
              value={selectedPayId}
              disabled={isProcessing || isPlaced}
              onChange={(e) => setSelectedPayId(e.target.value)}
              className={`w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#84cc16] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                isProcessing || isPlaced ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {payload.payment_methods.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.method} - {p.number}
                </option>
              ))}
            </select>
          </div>

          {/* Comment Field */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase leading-none tracking-wider text-gray-400">
              Delivery Instructions
            </label>
            <textarea
              value={comment}
              disabled={isProcessing || isPlaced}
              onChange={(e) => setComment(e.target.value)}
              placeholder="E.g. Ring the bell, deliver to gate..."
              className={`w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm focus:border-[#84cc16] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                isProcessing || isPlaced ? "cursor-not-allowed opacity-50" : ""
              }`}
              rows={2}
            />
          </div>

          {/* Summary Preview */}
          {preview ? (
            <div className="space-y-2 rounded-2xl bg-[#f0fdf4] p-4 duration-300 animate-in fade-in dark:bg-emerald-950/20">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{preview.subtotal.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span>{preview.delivery_fee.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Service Fee</span>
                <span>{preview.service_fee.toLocaleString()} RWF</span>
              </div>
              <div className="mt-2 border-t border-emerald-100 pt-2 dark:border-emerald-800">
                <div className="flex justify-between text-sm font-bold text-[#115e59] dark:text-emerald-400">
                  <span>Total Payable</span>
                  <span>{preview.total.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                Calculating delivery...
              </p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-1">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#115e59] border-t-transparent"></div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !preview}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              Confirm &amp; Place Order
            </button>
            <button
              onClick={() => onDecline(msgId)}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Confirmation Card ───────────────────────────────────────────────
function CheckoutConfirmCard({
  payload,
  isDone,
  paymentStatus,
}: {
  msgId: string;
  payload: CheckoutConfirmPayload;
  isDone?: boolean;
  paymentStatus?: "pending" | "success" | "failed";
}) {
  if (!isDone) return null;

  const isPending = paymentStatus === "pending";
  const isFailed = paymentStatus === "failed";
  const isSuccess = paymentStatus === "success";

  return (
    <div className="flex justify-start duration-500 animate-in fade-in slide-in-from-left-3">
      <div className="max-w-[90%] overflow-hidden rounded-3xl rounded-tl-sm border border-emerald-100 bg-white shadow-xl dark:border-emerald-900/30 dark:bg-gray-800">
        <div
          className={`flex items-center gap-3 px-5 py-4 text-white transition-colors duration-500 ${
            isSuccess
              ? "bg-emerald-600"
              : isFailed
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm ${
              isPending ? "animate-pulse" : ""
            }`}
          >
            {isSuccess ? "✓" : isFailed ? "!" : "..."}
          </div>
          <div>
            <h4 className="text-sm font-bold">
              {isSuccess
                ? "Order Confirmed!"
                : isFailed
                ? "Payment Failed"
                : "Awaiting Approval..."}
            </h4>
            <p className="text-[10px] opacity-90">
              {isSuccess
                ? payload.shop_name
                : isFailed
                ? "Please try again"
                : "Check your phone for MoMo prompt"}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 ${
                  isSuccess
                    ? "text-emerald-500"
                    : isFailed
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
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
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">
                  Delivering To
                </p>
                <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {payload.address_street}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 ${
                  isSuccess
                    ? "text-emerald-500"
                    : isFailed
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
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
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">
                  Payment Method
                </p>
                <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {payload.payment_method_name} (
                  {payload.payment_method_type === "mobile_money"
                    ? "MoMo"
                    : "Card"}
                  )
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${
              isSuccess
                ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                : isFailed
                ? "bg-red-50/50 dark:bg-red-950/20"
                : "bg-blue-50/50 dark:bg-blue-950/20"
            }`}
          >
            <div
              className={`mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider ${
                isSuccess
                  ? "text-[#115e59]"
                  : isFailed
                  ? "text-red-700"
                  : "text-blue-700"
              }`}
            >
              <span>Receipt Summary</span>
              <span>RWF</span>
            </div>
            <div
              className={`space-y-1.5 border-t pt-2 ${
                isSuccess
                  ? "border-emerald-100/50 dark:border-emerald-800/50"
                  : isFailed
                  ? "border-red-100/50 dark:border-red-800/50"
                  : "border-blue-100/50 dark:border-blue-800/50"
              }`}
            >
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Items Subtotal</span>
                <span>{payload.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Fees & Delivery</span>
                <span>
                  {(
                    payload.delivery_fee + payload.service_fee
                  ).toLocaleString()}
                </span>
              </div>
              <div
                className={`mt-2 flex justify-between text-sm font-black ${
                  isSuccess
                    ? "text-emerald-700 dark:text-emerald-400"
                    : isFailed
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                <span>Total Amount</span>
                <span>{payload.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] italic text-gray-400">
            {isSuccess
              ? "You can track your order status in the orders page."
              : isFailed
              ? "Please verify your balance and try again."
              : "We'll notify you as soon as payment is confirmed."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Safely converts Markdown to HTML using a placeholder system to avoid
// nested/mangled tags during multiple replacement passes.
function formatMessageText(text: string, isComplete?: boolean): string {
  const imagePlaceholders: string[] = [];
  const linkPlaceholders: string[] = [];

  // 1. Collect Images: ![alt](url)
  // We do this first so images don't get matched by the link regex.
  let processed = text.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (match, alt, url) => {
      const idx = imagePlaceholders.length;
      // Remove all whitespace (crucial for long Base64 strings with newlines)
      const sanitizedUrl = url.replace(/\s+/g, "");

      // SAFETY: If it's a huge data URL and the message isn't complete yet,
      // we don't render it to avoid "appearing/disappearing" and chrome errors.
      if (sanitizedUrl.startsWith("data:") && !isComplete) {
        return `[AI is sending an image...]`;
      }

      if (alt === "Thumb") {
        imagePlaceholders.push(
          `<img src="${sanitizedUrl}" alt="Recipe" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:block; width:100%; max-width:280px; height:160px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />`
        );
      } else {
        imagePlaceholders.push(
          `<img src="${sanitizedUrl}" alt="${alt}" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:inline-block; height:24px; width:24px; border-radius:9999px; object-fit:cover; vertical-align:middle; margin-right:4px;" />`
        );
      }
      return `__IMG_${idx}__`;
    }
  );

  // 2. Collect Links: [label](url)
  processed = processed.replace(
    /\[([^\]]*)\]\(([^)]*)\)/g,
    (match, label, url) => {
      const idx = linkPlaceholders.length;
      const sanitizedUrl = url.trim();
      linkPlaceholders.push(
        `<a href="${sanitizedUrl}" class="text-[#115e59] underline hover:text-green-700 font-medium">${label}</a>`
      );
      return `__LINK_${idx}__`;
    }
  );

  // 3. Simple Formatting (Bold & Bullets)
  processed = processed
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\n)\*\s/g, "$1• ");

  // 4. Standalone Image URLs (Base64) - only render if complete
  // IMPORTANT: We remove \s from the set to prevent greedy matching across
  // lines which was corrupting the rest of the AI message.
  processed = processed.replace(
    /(data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+)/g,
    (match) => {
      if (!isComplete) return `[AI is sending an image...]`;

      const idx = imagePlaceholders.length;
      const sanitizedBase64 = match.replace(/\s+/g, "");
      imagePlaceholders.push(
        `<img src="${sanitizedBase64}" alt="Image" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:block; width:100%; max-width:280px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />`
      );
      return `__IMG_${idx}__`;
    }
  );

  // 5. Restore Placeholders (Links first, then Images)
  processed = processed.replace(
    /__LINK_(\d+)__/g,
    (_, i) => linkPlaceholders[parseInt(i)]
  );
  processed = processed.replace(
    /__IMG_(\d+)__/g,
    (_, i) => imagePlaceholders[parseInt(i)]
  );

  return processed;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";

  // Cart Contexts
  const shopCart = useCart();
  const foodCart = useFoodCart();

  const getInitialMessage = () => ({
    id: "1",
    text: `Hey there, ${userName}! 👋 I'm Plas Agent, your personal grocery & dining assistant! Whether you're craving a quick bite, hunting for the best deals, or planning your weekly shopping, I'm here to help. What's on your mind today? 🍔🛒`,
    sender: "ai" as const,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [usageStatus, setUsageStatus] = useState<AIUsageStatus | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribePhone, setSubscribePhone] = useState("");
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "initiating" | "awaiting_approval" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string>("");
  const [subscriptionRefId, setSubscriptionRefId] = useState<string>("");

  const verifyAIPlusSubscription = async (refId: string) => {
    try {
      const res = await fetch("/api/ai/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: refId }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentStep("success");
        fetchUsageStatus();
        return true;
      }
      return false;
    } catch (e) {
      console.error("AI Plus Verification failed", e);
      return false;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === "awaiting_approval" && subscriptionRefId) {
      interval = setInterval(async () => {
        const isDone = await verifyAIPlusSubscription(subscriptionRefId);
        if (isDone) clearInterval(interval);
      }, 5000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStep, subscriptionRefId]);

  const pollIntervals = useRef<{ [msgId: string]: NodeJS.Timeout }>({});

  const getPushSubscriptionDetails = async () => {
    try {
      if (!("serviceWorker" in navigator)) return null;
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return null;

      const json = subscription.toJSON();
      return {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      };
    } catch (e) {
      console.error("Failed to get push subscription", e);
      return null;
    }
  };

  const fetchUsageStatus = async () => {
    try {
      const device = await getPushSubscriptionDetails();
      const res = await fetch("/api/ai/usage-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p256dh: device?.p256dh || "" }),
      });
      const data = await res.json();
      setUsageStatus(data);
    } catch (e) {
      console.error("Failed to fetch usage status", e);
      // Fallback so it doesn't stay completely disabled on error
      setUsageStatus({
        usageCount: 0,
        limit: 20,
        isSubscribed: false,
        isBlocked: false,
      });
    }
  };

  const incrementUsage = async () => {
    try {
      const res = await fetch("/api/ai/increment-usage", { method: "POST" });
      const data = await res.json();
      fetchUsageStatus(); // Refresh locally
      return data;
    } catch (e) {
      console.error("Failed to increment usage", e);
      return null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsageStatus();
    }
  }, [isOpen]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, []);

  const handleSubscribe = async () => {
    if (!subscribePhone || isSubscribing) return;
    setIsSubscribing(true);
    setPaymentStep("initiating");
    try {
      const res = await fetch("/api/ai/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: subscribePhone }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptionRefId(data.referenceId);
        setPaymentStep("awaiting_approval");
      } else {
        setPaymentStep("error");
        setPaymentError(data.error || "Subscription failed");
      }
    } catch (e) {
      // @ts-ignore
      reportError("AIChat:handleSubscribe", e);
      setPaymentStep("error");
      setPaymentError("Something went wrong. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update initial message when user name changes (only if it's still the initial message)
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "1") {
      const newInitialMessage = getInitialMessage();
      if (messages[0].text !== newInitialMessage.text) {
        setMessages([newInitialMessage]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const reportError = async (where: string, error: any, extra?: any) => {
    try {
      await fetch("/api/support/slack-logger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          where,
          error: error?.message || String(error),
          extra,
        }),
      });
    } catch (e) {
      console.error("Failed to report error to Slack proxy", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hook dedicated ONLY to resetting the chat state when closing
  useEffect(() => {
    if (!isOpen) {
      setMessages([getInitialMessage()]);
      setInputValue("");
      setIsTyping(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = async () => {
    try {
      if (!inputValue.trim() || !session) return;
      if (!usageStatus || usageStatus.isBlocked) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Secure Backend Limit Check
      const usageCheck = await incrementUsage();
      if (!usageCheck || usageCheck.isBlocked) {
        setUsageStatus((prev) => (prev ? { ...prev, isBlocked: true } : null));
        setIsTyping(false);
        scrollToBottom();
        return;
      }

      // Call Gemini AI
      if (!ai) {
        throw new Error("AI is not initialized");
      }

      const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash",
        systemInstruction:
          "You are Plas Agent, a helpful grocery and dining assistant. " +
          "When a user wants to checkout or make a payment, you MUST: " +
          "1. Call 'get_active_carts' to find their cart. " +
          "2. Call 'get_user_checkout_details' to get their delivery and payment options. " +
          "3. Call 'get_order_preview' to calculate the final amount. " +
          "4. MANDATORY: Call 'show_checkout_form' with the results. " +
          "NEVER just summarize the details in text. You MUST present the interactive form so the user can finalize the order.\n" +
          "SUPPORT & DELIVERY: For general issues use 'create_support_ticket'. For delivery issues (broken, missing), ask for PIN and source (shop, restaurant, reel, business, package) then call 'report_delivery_issue'.",
        tools: [
          {
            functionDeclarations: [
              {
                name: "search_products",
                description:
                  "Search for available grocery items, food products, or restaurant dishes by name, optionally filtered by a maximum price/budget.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    keyword: {
                      type: "STRING",
                      description:
                        "The keyword to search for, e.g., 'pizza', 'burger', 'milk'. Omit to view all.",
                    },
                    max_price: {
                      type: "NUMBER",
                      description:
                        "The maximum price the user is willing to pay. Omit if not specified.",
                    },
                    store_name: {
                      type: "STRING",
                      description:
                        "If the user mentions a specific shop or restaurant, put the name here. Omit to search everywhere.",
                    },
                  },
                },
              },
              {
                name: "search_stores",
                description:
                  "Search for available shops, restaurants, or grocery stores by keyword or category.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    keyword: {
                      type: "STRING",
                      description:
                        "The store name or type to search for, e.g., 'supermarket', 'bakery'. Omit to see all.",
                    },
                  },
                },
              },
              {
                name: "search_recipes",
                description:
                  "Search for recipe ideas and cooking instructions from a global recipe database. Use this when the user asks how to cook something, wants recipe ideas, or asks about ingredients for a dish.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    keyword: {
                      type: "STRING",
                      description:
                        "The recipe name or main ingredient to search for, e.g., 'pasta', 'chicken', 'chocolate cake'.",
                    },
                    category: {
                      type: "STRING",
                      description:
                        "Filter by meal category, e.g., 'Seafood', 'Chicken', 'Vegan', 'Dessert'. Use this for broad category requests.",
                    },
                  },
                },
              },
              {
                name: "search_web",
                description:
                  "Search the web for any recipe-related question that the recipe database may not cover — e.g. cooking tips, nutrition facts, substitution advice, dish history, or any food topic the user is curious about.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    query: {
                      type: "STRING",
                      description:
                        "A specific, focused search query about food, cooking, or nutrition, e.g., 'how to make fluffy scrambled eggs without butter'.",
                    },
                  },
                  required: ["query"],
                },
              },
              {
                name: "add_to_cart",
                description:
                  "Add an item to the user's cart. Use the 'ordering_payload' provided in the search results.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    product_name: {
                      type: "STRING",
                      description: "Name of the item.",
                    },
                    price: { type: "NUMBER", description: "Price in RWF." },
                    quantity: {
                      type: "NUMBER",
                      description: "Quantity to add.",
                    },
                    image: {
                      type: "STRING",
                      description: "Product image URL.",
                    },
                    ordering_payload: {
                      type: "STRING",
                      description:
                        "The EXACT ordering_payload string from the search result. Do not modify it.",
                    },
                  },
                  required: ["product_name", "price", "ordering_payload"],
                },
              },
              {
                name: "get_active_carts",
                description:
                  "Check for any active shopping carts the user has. Returns shop names and subtotals. Use this before checkout if the shop_id is not already known.",
                parameters: { type: "OBJECT", properties: {} },
              },
              {
                name: "get_user_checkout_details",
                description:
                  "Fetch the user's saved delivery addresses and payment methods. ALWAYS call this before presenting the checkout form.",
                parameters: { type: "OBJECT", properties: {} },
              },
              {
                name: "get_order_preview",
                description:
                  "Calculate final totals (delivery fee, service fee) for a specific shop and address. Use this to get the subtotal and fees for the form.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    shop_id: { type: "STRING" },
                    address_id: { type: "STRING" },
                  },
                  required: ["shop_id", "address_id"],
                },
              },
              {
                name: "show_checkout_form",
                description:
                  "MANDATORY: Show the interactive checkout form for a specific cart. Use results from get_active_carts, get_user_checkout_details, and get_order_preview. NEVER just ask for details via text.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    shop_id: { type: "STRING" },
                    shop_name: { type: "STRING" },
                    addresses: { type: "ARRAY", items: { type: "OBJECT" } },
                    payment_methods: {
                      type: "ARRAY",
                      items: { type: "OBJECT" },
                    },
                    subtotal: { type: "NUMBER" },
                    is_food: { type: "BOOLEAN" },
                  },
                  required: [
                    "shop_id",
                    "addresses",
                    "payment_methods",
                    "subtotal",
                  ],
                },
              },
              {
                name: "create_support_ticket",
                description:
                  "Create a support ticket for general issues (like account problems, app errors, wallet balances) or general questions about orders that are NOT delivery issues.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    requestType: { type: "STRING", description: "Must be 'general'" },
                    message: { type: "STRING", description: "Detailed explanation of the issue." }
                  },
                  required: ["requestType", "message"],
                },
              },
              {
                name: "report_delivery_issue",
                description:
                  "Report a delivery issue (e.g. broken items, wrong delivery, complaints about the shopper). MUST ask the user for their order PIN and order source (shop, restaurant, reel, business, package) before calling this.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    pin: { type: "STRING", description: "The order PIN/DeliveryCode from the user." },
                    order_source: { type: "STRING", description: "Source of the order: 'shop', 'restaurant', 'reel', 'business', or 'package'." },
                    description: { type: "STRING", description: "Details about what went wrong with the delivery." },
                    issue_type: { type: "STRING", description: "Type of issue, e.g., 'Broken Item', 'Wrong Item', 'Shopper Complaint'." }
                  },
                  required: ["pin", "order_source", "description", "issue_type"],
                },
              }
            ],
          } as any,
        ],
      });

      // Prepare chat history (exclude initial greeting and merge consecutive turns to satisfy Gemini API requirements)
      const history: any[] = [];
      messages
        .filter((m) => m.id !== "1" && m.text.trim() !== "")
        .forEach((m) => {
          const role = (m.sender === "user" ? "user" : "model") as
            | "user"
            | "model";
          const last = history[history.length - 1];
          if (last && last.role === role) {
            // Append text to the previous entry of the same role
            last.parts[0].text += "\n\n" + m.text;
          } else {
            history.push({
              role,
              parts: [{ text: m.text }],
            });
          }
        });

      const chat = model.startChat({
        history,
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: `You are Plas Agent, a helpful, friendly AI assistant for the Plas grocery & dining app.\n\nYou have access to several tools:\n1. search_products — searches real-time grocery inventory and restaurant dishes.\n2. search_stores — searches shops, restaurants, and businesses.\n3. search_recipes — searches recipes.\n4. search_web — searches the web for food/cooking topics.\n5. add_to_cart — adds an item to the user's cart.\n6. get_user_checkout_details — gets delivery addresses and payment methods.\n7. get_order_preview — calculates final totals and fees.\n8. place_order — initiates the final checkout.\n\nCHECKOUT FLOW:\n- When a user wants to checkout or place an order:\n  1. Call get_user_checkout_details to see their options.\n  2. If they have a default address, call get_order_preview with the shop_id and address_id.\n  3. Present the total and details to the user and call place_order to show the confirmation card.\n- MOMO PAYMENTS: Tell the user to check their phone for the payment prompt after placing the order.\n\nSUPPORT & DELIVERY ISSUES:\n- For general account/app issues, call 'create_support_ticket'.\n- For delivery issues (broken items, wrong orders, shopper complaints), ask for the order PIN and where they ordered from (shop, restaurant, reel, business, package), then call 'report_delivery_issue'.\n\nCRITICAL RULES:\n- NEVER hallucinate IDs or prices. Only use tool-returned values.\n- Use the 'ordering_payload' exactly as provided.\n- Ask for confirmation before adding items or placing orders.\n\nFormatting:\n- Stores: [![Logo](image_url)](/shops/shop_id) **Name**\n- Recipes: [![Thumb](image_url)](/Recipes/id) **Name**\n- Keep responses concise.`,
            },
          ],
        },
      });

      const responseId = (Date.now() + 1).toString();
      let isFirstChunk = true;

      // Wrap the message handling in a helper so we can recursively call it if a function is used
      const handleStream = async (requestPayload: any) => {
        const streamResult = await chat.sendMessageStream(requestPayload);
        let fullText = "";
        let functionCallToHandle: any = null;

        for await (const chunk of streamResult.stream) {
          const fCalls =
            typeof chunk.functionCalls === "function"
              ? chunk.functionCalls()
              : chunk.functionCalls;
          if (fCalls && Array.isArray(fCalls) && fCalls.length > 0) {
            functionCallToHandle = fCalls[0];
            break;
          }

          if (isFirstChunk) {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: responseId,
                text: "",
                sender: "ai",
                timestamp: new Date(),
              },
            ]);
            isFirstChunk = false;
          }

          if (chunk.text && typeof chunk.text === "function") {
            const chunkStr = chunk.text();
            if (chunkStr) {
              fullText += chunkStr;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === responseId ? { ...m, text: fullText } : m
                )
              );
            }
          }
        }

        return functionCallToHandle;
      };

      let currentFunctionCall = await handleStream(inputValue);

      while (currentFunctionCall) {
        // Show typing while we process each step
        setIsTyping(true);

        try {
          const fnName = currentFunctionCall.name;
          const args =
            currentFunctionCall.args || currentFunctionCall.arguments || {};
          console.log(`[AI Chat] Handling function call: ${fnName}`, args);

          let apiUrl = "/api/ai/search-plas-data";
          let body: any = { action: fnName, params: args };

          if (fnName === "search_recipes") {
            apiUrl = "/api/ai/search-recipes";
            body = {
              keyword: args.keyword || "",
              category: args.category || "",
            };
          } else if (fnName === "search_web") {
            apiUrl = "/api/ai/search-web";
            body = { query: args.query || "" };
          } else if (fnName === "add_to_cart") {
            const parsePayload = (val: any) => {
              if (!val) return null;
              if (typeof val === "object") return val;
              try {
                return JSON.parse(val);
              } catch (e) {
                return null;
              }
            };

            const ord_p = parsePayload(args.ordering_payload);
            if (!ord_p) {
              console.warn(
                "[AI Chat] Missing or invalid ordering_payload from tool call. Args:",
                args
              );
            }

            const confirmPayload: CartConfirmPayload = {
              product_id:
                ord_p?.productId ||
                ord_p?.dish_payload?.id ||
                args.product_id ||
                "",
              shop_id:
                ord_p?.shopId ||
                ord_p?.restaurant_payload?.id ||
                args.shop_id ||
                "",
              product_name:
                args.product_name || ord_p?.dish_payload?.name || "Item",
              price: args.price || ord_p?.dish_payload?.price || 0,
              quantity: Number(args.quantity) || 1,
              image: args.image || ord_p?.dish_payload?.image,
              item_source: ord_p?.item_source as any,
              cart_payload: ord_p?.item_source === "Shop" ? ord_p : null,
              restaurant_payload: ord_p?.restaurant_payload || null,
              dish_payload: ord_p?.dish_payload || null,
            };

            console.log("[AI Chat] Cart confirm payload generated:", {
              source: confirmPayload.item_source,
              productId: confirmPayload.product_id,
              shopId: confirmPayload.shop_id,
              parsedPayload: ord_p,
            });
            setIsTyping(false);

            // Mark previous search result as complete before showing the cart card
            setMessages((prev) =>
              prev.map((m) =>
                m.id === responseId ? { ...m, isComplete: true } : m
              )
            );

            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 2).toString(),
                text: "",
                sender: "ai",
                timestamp: new Date(),
                cartConfirm: confirmPayload,
                isComplete: true,
              },
            ]);

            // Feed back to AI that we showed the card
            currentFunctionCall = await handleStream([
              {
                functionResponse: {
                  name: fnName,
                  response: {
                    status: "confirmation_card_shown",
                    message:
                      "A confirmation card was displayed. User must confirm.",
                  },
                },
              },
            ]);
            // If the AI has more tools to call after add_to_cart, the loop continues.
            // Usually it stops here or sends text.
            continue;
          } else if (fnName === "get_active_carts") {
            const res = await fetch("/api/ai/search-plas-data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: fnName, params: args }),
            });
            const data = await res.json();
            currentFunctionCall = await handleStream([
              {
                functionResponse: { name: fnName, response: data },
              },
            ]);
            continue;
          } else if (fnName === "show_checkout_form") {
            setIsTyping(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === responseId ? { ...m, isComplete: true } : m
              )
            );
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 2).toString(),
                text: "", // UI is handled by checkoutSetup
                sender: "ai",
                timestamp: new Date(),
                checkoutSetup: args as any,
                isComplete: true,
              },
            ]);
            currentFunctionCall = await handleStream([
              {
                functionResponse: {
                  name: fnName,
                  response: {
                    status: "checkout_form_shown",
                    message:
                      "Interactive checkout form shown. User must select details and click confirm to proceed.",
                  },
                },
              },
            ]);
            continue;
          } else if (fnName === "create_support_ticket") {
            const res = await fetch("/api/support-ticket", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args),
            });
            const data = await res.json();
            currentFunctionCall = await handleStream([
              {
                functionResponse: { name: fnName, response: data },
              },
            ]);
            continue;
          } else if (fnName === "report_delivery_issue") {
            const res = await fetch("/api/queries/delivery-issues", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args),
            });
            const data = await res.json();
            currentFunctionCall = await handleStream([
              {
                functionResponse: { name: fnName, response: data },
              },
            ]);
            continue;
          }

          // Default API call flow (for search tools)
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          console.log(`[AI Chat] Tool Response for ${fnName}:`, data);

          // Give results back to AI and get NEXT action
          currentFunctionCall = await handleStream([
            {
              functionResponse: {
                name: fnName,
                response: data.results ? { results: data.results } : data,
              },
            },
          ]);
        } catch (fnErr) {
          console.error("Function call error:", fnErr);
          reportError(`Tool:${currentFunctionCall?.name}`, fnErr, {
            args: currentFunctionCall?.args,
          });
          currentFunctionCall = await handleStream([
            {
              functionResponse: {
                name: currentFunctionCall?.name || "unknown",
                response: { error: "Error contacting internal database API." },
              },
            },
          ]);
        }
      }

      // Mark the final AI response as complete
      setMessages((prev) =>
        prev.map((m) => (m.id === responseId ? { ...m, isComplete: true } : m))
      );

      if (isFirstChunk) {
        // Fallback if stream was empty
        setIsTyping(false);
      }
    } catch (error) {
      console.error("AI Error:", error);
      reportError("AIChat:handleSend", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "ai",
          timestamp: new Date(),
          isComplete: true,
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle cart confirmation — called when user clicks "Yes, add it!" on the inline card
  const handleConfirmCart = async (
    msgId: string,
    payload: CartConfirmPayload,
    qty: number
  ) => {
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isProcessing: true } : m))
      );
      if (payload.item_source === "Restaurant") {
        if (!foodCart) throw new Error("Food cart context not available");
        foodCart.addItem(payload.restaurant_payload, payload.dish_payload, qty);
      } else {
        // Default to Shop flow
        if (!shopCart) throw new Error("Shop cart context not available");
        const shopId = payload.cart_payload?.shopId || payload.shop_id;
        const productId = payload.cart_payload?.productId || payload.product_id;

        if (!shopId || !productId) {
          throw new Error("Missing shop_id or product_id for order");
        }

        await shopCart.addItem(shopId, productId, qty);
      }

      // Mark the card as "added"
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, cartAdded: true, isProcessing: false } : m
        )
      );

      // Add a follow-up AI message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          text: `✅ **${payload.product_name}** (×${qty}) has been added to your cart! Ready to checkout? Head to your cart whenever you're ready. 🛒`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Cart add error:", err);
      reportError("AIChat:handleConfirmCart", err, { payload, qty });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isProcessing: false } : m))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 3).toString(),
          text: `❌ Oops! I couldn't add that to your cart right now. Please try adding it manually from the shop page.`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleDeclineCart = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              cartAdded: false,
              cartConfirm: { ...m.cartConfirm!, quantity: -1 },
            }
          : m
      )
    );
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 3).toString(),
        text: `No problem! Let me know if there's anything else I can help you with. 😊`,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const handleConfirmCheckout = async (
    msgId: string,
    payload: CheckoutConfirmPayload & { comment?: string }
  ) => {
    console.log("[AI Chat] Confirming checkout:", payload);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isProcessing: true } : m))
    );
    try {
      const endpoint = payload.is_food ? "/api/food-checkout" : "/api/checkout";

      // Prepare payload for backend API
      const checkoutBody: any = {
        shop_id: payload.shop_id,
        delivery_address_id: payload.address_id,
        service_fee: Math.round(payload.service_fee).toString(),
        delivery_fee: Math.round(payload.delivery_fee).toString(),
        delivery_time: new Date(Date.now() + 45 * 60000).toISOString(),
        pricing_token: payload.pricing_token,
        subtotal: payload.subtotal,
        payment_method: payload.payment_method_type,
        payment_method_id: payload.payment_method_id,
        delivery_notes: payload.comment || "",
        items_count: 0,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutBody),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const checkoutData = await res.json();
      const orderId = checkoutData.order_id;
      const totalAmount = payload.total;

      // If it's a MoMo payment, we must initiate the RequestToPay prompt
      if (payload.payment_method_type === "mobile_money") {
        console.log("[AI Chat] Initiating MoMo payment for order:", orderId);
        const momoRes = await fetch("/api/momo/request-to-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            payerNumber: payload.payment_method_name,
            orderId: orderId,
            externalId: orderId,
            payerMessage: `Payment for order at ${payload.shop_name}`,
          }),
        });

        const momoData = await momoRes.json();
        if (momoRes.ok && momoData.referenceId) {
          const refId = momoData.referenceId;
          // Mark message with referenceId and start polling
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    referenceId: refId,
                    paymentStatus: "pending",
                    checkoutPlaced: true,
                    isProcessing: false,
                  }
                : m
            )
          );

          // Start Polling
          if (pollIntervals.current[msgId])
            clearInterval(pollIntervals.current[msgId]);
          pollIntervals.current[msgId] = setInterval(async () => {
            try {
              const statusRes = await fetch(
                `/api/momo/request-to-pay-status?referenceId=${refId}`
              );
              const statusData = await statusRes.json();

              if (statusData.status === "SUCCESSFUL") {
                clearInterval(pollIntervals.current[msgId]);
                delete pollIntervals.current[msgId];

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === msgId ? { ...m, paymentStatus: "success" } : m
                  )
                );

                // Final Success Message
                setMessages((prev) => [
                  ...prev,
                  {
                    id: (Date.now() + 5).toString(),
                    text: `✅ **Payment Received!** Your order for **${payload.shop_name}** is now being prepared. You can track it in your orders.`,
                    sender: "ai",
                    timestamp: new Date(),
                  },
                ]);

                // Clear Carts
                if (payload.is_food) {
                  foodCart.clearRestaurant(payload.shop_id);
                } else {
                  // Grocery carts are managed on backend, we just notify to refresh
                  window.dispatchEvent(
                    new CustomEvent("cartChanged", {
                      detail: { refetch: true, shop_id: payload.shop_id },
                    })
                  );
                }
              } else if (statusData.status === "FAILED") {
                clearInterval(pollIntervals.current[msgId]);
                delete pollIntervals.current[msgId];
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === msgId ? { ...m, paymentStatus: "failed" } : m
                  )
                );
              }
            } catch (e) {
              console.error("Polling error", e);
            }
          }, 3000);
        } else {
          console.error("[AI Chat] MoMo initiation failed:", momoData);
          throw new Error(momoData.error || "Failed to initiate MoMo payment");
        }
      } else {
        // Not MoMo (e.g. Wallet/Card - assuming immediate success for now)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  checkoutPlaced: true,
                  isProcessing: false,
                  paymentStatus: "success",
                }
              : m
          )
        );
      }

      // Dispatch event to refresh carts globally
      const detail = payload.is_food
        ? { refetch: true }
        : { shop_id: payload.shop_id, refetch: true };
      window.dispatchEvent(new CustomEvent("cartChanged", { detail }));

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          text: `🎉 **Success!** Your order for **${
            payload.shop_name
          }** has been placed! \n\n${
            payload.payment_method_type === "mobile_money"
              ? "Please **check your phone** for the MoMo payment prompt to complete the order."
              : "Your delivery is being prepared."
          }`,
          sender: "ai",
          timestamp: new Date(),
          checkoutConfirm: payload, // This will trigger CheckoutConfirmCard
        },
      ]);
    } catch (err: any) {
      console.error("[AI Chat] Checkout error:", err);
      reportError("AIChat:handleConfirmCheckout", err, { payload });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isProcessing: false } : m))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          text: `❌ **Checkout Failed:** ${
            err.message || "An unexpected error occurred."
          }`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleDeclineCheckout = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, checkoutPlaced: false, checkoutConfirm: undefined }
          : m
      )
    );
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 4).toString(),
        text: `Order cancelled. I'm still here if you'd like to try something else!`,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const handleConfirmDeliveryIssue = async (msgId: string, payload: DeliveryIssueSetupPayload, file: File | null) => {
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isProcessing: true } : m))
      );

      let image = null;
      if (file && storage) {
        const storageRef = ref(storage, `delivery_issues/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        image = await getDownloadURL(snapshot.ref);
      }

      await fetch("/api/queries/delivery-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, image }),
      });

      setMessages((prev) => [
        ...prev.map((m) =>
          m.id === msgId ? { ...m, isProcessing: false, deliveryIssuePlaced: true, isComplete: true } : m
        ),
        {
          id: (Date.now() + 1).toString(),
          text: "I have completed reporting your issue. The Agent will contact you in 10 to 20 minutes, but also expect it to be resolved below that time.",
          sender: "ai",
          timestamp: new Date(),
          isComplete: true,
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isProcessing: false } : m))
      );
    }
  };

  const handleDeclineDeliveryIssue = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (msg && msg.deliveryIssueSetup) {
      handleConfirmDeliveryIssue(msgId, msg.deliveryIssueSetup, null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Hidden on mobile, shown on desktop */}
      <div
        className="hidden md:fixed md:inset-0 md:z-40 md:bg-black/50 md:backdrop-blur-sm md:transition-opacity md:duration-300"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl transition-all duration-300 dark:bg-gray-900/95 md:inset-auto md:bottom-24 md:right-6 md:h-[600px] md:w-full md:max-w-md md:rounded-3xl md:border md:border-white/20 md:shadow-[0_20px_50px_-12px_rgba(17,94,89,0.3)] dark:md:border-gray-700/50">
        {/* Usage Overlay */}
        {(!usageStatus || usageStatus?.isBlocked) && (
          <div className="absolute bottom-0 left-0 right-0 z-[10001] flex transform flex-col items-center justify-center rounded-b-3xl border-t border-gray-200 bg-white/95 px-6 py-6 text-center shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-500 animate-in slide-in-from-bottom dark:bg-gray-900/95">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-inner dark:bg-amber-900/30 dark:text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v3m0-3h3m-3 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold">AI Usage Limit Reached</h3>
            <p className="mb-5 px-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              You've used all your AI requests for this month. Upgrade to{" "}
              <strong className="text-[#115e59] dark:text-[#84cc16]">
                AI Assistant Plus
              </strong>{" "}
              to continue chatting!
            </p>

            {!showSubscriptionPrompt ? (
              <button
                onClick={() => setShowSubscriptionPrompt(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#115e59]/20 transition hover:scale-[1.02] active:scale-95"
              >
                Upgrade for 1,000 RWF / month
              </button>
            ) : paymentStep !== "idle" ? (
              <div className="w-full space-y-4 py-2 duration-300 animate-in fade-in zoom-in-95">
                <div className="flex justify-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full shadow-inner transition-all duration-500 ${
                      paymentStep === "success"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                        : paymentStep === "error"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                        : "bg-[#115e59]/10 text-[#115e59] dark:bg-[#115e59]/30 dark:text-[#84cc16]"
                    }`}
                  >
                    {paymentStep === "success" ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : paymentStep === "error" ? (
                      <AlertCircle className="h-8 w-8" />
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {paymentStep === "initiating" && "Initiating Payment..."}
                    {paymentStep === "awaiting_approval" && "Awaiting Approval"}
                    {paymentStep === "success" && "Subscription Active!"}
                    {paymentStep === "error" && "Payment Failed"}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {paymentStep === "initiating" &&
                      "Connecting to MoMo securely..."}
                    {paymentStep === "awaiting_approval" && (
                      <span className="flex items-center justify-center gap-1 font-medium">
                        <Phone className="h-3 w-3" /> Check your phone to
                        approve (1,000 RWF).
                      </span>
                    )}
                    {paymentStep === "success" &&
                      "Thank you! You now have 100 requests."}
                    {paymentStep === "error" &&
                      (paymentError || "Please try again.")}
                  </p>
                </div>
                {(paymentStep === "error" || paymentStep === "success") && (
                  <button
                    onClick={() => {
                      if (paymentStep === "success") {
                        fetchUsageStatus();
                        onClose();
                        setShowSubscriptionPrompt(false);
                      }
                      setPaymentStep("idle");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white py-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {paymentStep === "success"
                      ? "Continue Chatting"
                      : "Try Again"}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <input
                  type="text"
                  placeholder="Enter MoMo Number (e.g. 078...)"
                  value={subscribePhone}
                  onChange={(e) => setSubscribePhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm focus:border-[#115e59] focus:outline-none focus:ring-2 focus:ring-[#115e59]/20 dark:border-gray-700 dark:bg-gray-800"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSubscriptionPrompt(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing || !subscribePhone}
                    className="flex-[2] rounded-xl bg-gradient-to-r from-[#115e59] to-[#047857] py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  >
                    Pay with MoMo
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 text-xs font-semibold text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
            >
              I'll do it later
            </button>
          </div>
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#064e3b] via-[#115e59] to-[#047857] px-6 py-4 shadow-md">
          {/* Subtle lime accent line */}
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#84cc16] to-transparent opacity-50"></div>

          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {/* Active pulsing dot */}
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#84cc16]"></span>
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
                Plas Agent
              </h3>
              <p className="text-xs font-medium text-[#84cc16]">
                Online & Ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-95"
            aria-label="Close chat"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-6">
          {messages.map((message) => {
            // 1. Cart confirmation card
            if (message.cartConfirm && message.cartConfirm.quantity !== -1) {
              return (
                <CartConfirmCard
                  key={message.id}
                  msgId={message.id}
                  payload={message.cartConfirm}
                  isDone={message.cartAdded}
                  isProcessing={message.isProcessing}
                  onConfirm={handleConfirmCart}
                  onDecline={handleDeclineCart}
                />
              );
            }

            // 2. Checkout setup card
            if (message.checkoutSetup) {
              return (
                <CheckoutSetupCard
                  key={message.id}
                  msgId={message.id}
                  payload={message.checkoutSetup}
                  isProcessing={message.isProcessing}
                  isPlaced={message.checkoutPlaced}
                  onConfirm={handleConfirmCheckout}
                  onDecline={handleDeclineCheckout}
                />
              );
            }

            // 3. Checkout confirmation card
            if (message.checkoutConfirm) {
              return (
                <CheckoutConfirmCard
                  key={message.id}
                  msgId={message.id}
                  payload={message.checkoutConfirm}
                  isDone={message.checkoutPlaced}
                  paymentStatus={message.paymentStatus}
                />
              );
            }

            // 3. Standard message bubble
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } duration-300 animate-in fade-in slide-in-from-bottom-3`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3.5 shadow-sm ${
                    message.sender === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-[#115e59] to-[#047857] text-white shadow-[#115e59]/20"
                      : "rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:shadow-none"
                  }`}
                >
                  <div
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageText(
                        message.text,
                        message.isComplete
                      ),
                    }}
                  />
                  <span
                    className={`mt-2 block text-[10px] font-medium uppercase tracking-wider ${
                      message.sender === "user"
                        ? "text-white/60"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="rounded-2xl rounded-tl-sm border border-gray-100 bg-white/80 px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center space-x-1.5">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]/60 [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]/80 [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white/80 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              disabled={!usageStatus || usageStatus.isBlocked}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 text-sm text-gray-900 shadow-inner transition-all placeholder:text-gray-400 focus:border-[#84cc16] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#84cc16]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:focus:bg-gray-800"
            />
            <button
              onClick={handleSend}
              disabled={
                !inputValue.trim() ||
                isTyping ||
                !usageStatus ||
                usageStatus.isBlocked
              }
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#115e59] to-[#047857] text-white shadow-md shadow-[#115e59]/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#115e59]/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-active:translate-x-0 group-active:translate-y-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
