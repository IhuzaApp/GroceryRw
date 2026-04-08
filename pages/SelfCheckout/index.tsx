import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "../../src/context/ThemeContext";
import BarcodeScanner from "../../src/components/shopper/BarcodeScanner";
import POSBarcodeScanner from "../../src/components/ui/POSBarcodeScanner";
import {
  ChevronLeft,
  ShoppingBag,
  Clock,
  ScanLine,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

interface CartItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
}

const MOCK_INVENTORY: Record<string, { name: string; price: number }> = {
  "6001234567890": { name: "Fresh Full Cream Milk (2L)", price: 34.99 },
  "5000159450311": { name: "Coca-Cola Original (500ml)", price: 14.5 },
  "1234567890123": { name: "Organic Brown Bread", price: 18.2 },
  DEFAULT: { name: "Supermarket Item", price: 25.0 },
};

export default function SelfCheckout() {
  const router = useRouter();
  const { theme } = useTheme();

  const [session, setSession] = useState<{
    store: string;
    expiresAt: number;
  } | null>(null);
  const [scannerMode, setScannerMode] = useState<"STORE_QR" | "ITEM" | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Check for existing session
    const existingSession = localStorage.getItem("self_checkout_session");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      if (parsed.expiresAt > Date.now()) {
        setSession(parsed);
      } else {
        localStorage.removeItem("self_checkout_session");
      }
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // Countdown timer
    const interval = setInterval(() => {
      const remaining = session.expiresAt - Date.now();
      if (remaining <= 0) {
        setSession(null);
        localStorage.removeItem("self_checkout_session");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleBarcodeDetected = (barcode: string) => {
    if (scannerMode === "STORE_QR") {
      console.log("🏪 Store QR Scanned:", barcode);
      const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
      const newSession = { store: barcode, expiresAt: expiry };
      localStorage.setItem("self_checkout_session", JSON.stringify(newSession));
      setSession(newSession);
      setScannerMode(null);
    } else if (scannerMode === "ITEM") {
      const product = MOCK_INVENTORY[barcode] || {
        ...MOCK_INVENTORY["DEFAULT"],
        name: `Product ${barcode.slice(-4)}`,
      };

      setCartItems((prev) => {
        const existing = prev.find((item) => item.barcode === barcode);
        if (existing) {
          return prev.map((item) =>
            item.barcode === barcode
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            barcode,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];
      });
      // We no longer setScannerMode(null) here to allow continuous scanning
    }
  };

  const updateQuantity = (barcode: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.barcode === barcode) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div
      className={`min-h-screen pb-20 ${
        theme === "dark"
          ? "bg-[var(--bg-primary)] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Head>
        <title>Self Checkout</title>
      </Head>

      {/* Top App Bar */}
      <div
        className={`sticky top-0 z-40 flex items-center justify-between px-4 py-4 shadow-sm backdrop-blur-lg ${
          theme === "dark"
            ? "border-b border-gray-800 bg-gray-900/80"
            : "border-b border-gray-200 bg-white/90"
        }`}
      >
        <button
          onClick={() => router.back()}
          className={`rounded-full p-2.5 transition active:scale-95 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black tracking-tight">Self Checkout</h1>
        <div className="w-10"></div>
      </div>

      <div className="mx-auto max-w-md p-6">
        {!session ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <div
              className={`mb-6 flex h-32 w-32 items-center justify-center rounded-full ${
                theme === "dark" ? "bg-green-500/10" : "bg-green-100"
              }`}
            >
              <ScanLine
                className={`h-14 w-14 ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <h2
              className={`mb-3 text-2xl font-black ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Start Shopping
            </h2>
            <p
              className={`mb-8 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Scan the supermarket QR code on the wall to begin your 1-hour
              self-checkout session.
            </p>
            <button
              onClick={() => setScannerMode("STORE_QR")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-600 active:scale-95"
            >
              <ScanLine className="h-5 w-5" />
              Scan Store QR Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div
              className={`mb-6 flex items-center justify-between rounded-2xl p-4 shadow-sm ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Store Connection
                  </p>
                  <p
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {session.store}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-1 text-xs font-bold uppercase text-gray-500">
                  <Clock className="h-3 w-3" /> Time Left
                </span>
                <span className="font-mono text-lg font-black text-rose-500">
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Virtual Cart UI */}
            <div className="mb-4 flex-1 space-y-4">
              {cartItems.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <ShoppingBag
                    className={`mb-4 h-12 w-12 ${
                      theme === "dark" ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`mb-6 text-center font-bold ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Your cart is empty. Scan items to add them.
                  </p>
                  <button
                    onClick={() => setScannerMode("ITEM")}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  >
                    <ScanLine className="h-5 w-5" />
                    Scan Item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.barcode}
                      className={`flex items-center justify-between rounded-2xl p-4 shadow-sm ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">
                            {item.barcode}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-400" />
                          <span className="text-sm font-black text-indigo-500">
                            R {item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 rounded-full border px-2 py-1 ${
                          theme === "dark"
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <button
                          onClick={() => updateQuantity(item.barcode, -1)}
                          className="rounded-full p-1 transition hover:bg-rose-500 hover:text-white"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="h-4 w-4 text-rose-500 hover:text-white" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </button>
                        <span className="w-4 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.barcode, 1)}
                          className="rounded-full p-1 transition hover:bg-green-500 hover:text-white"
                          title="Increase Quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setScannerMode("ITEM")}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 font-bold transition hover:border-solid hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800 ${
                      theme === "dark"
                        ? "border-gray-700 text-gray-400"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <ScanLine className="h-5 w-5" />
                    Scan Another Item
                  </button>
                </div>
              )}
            </div>

            <div
              className={`fixed bottom-0 left-0 z-30 flex w-full justify-between border-t p-4 shadow-lg backdrop-blur-md ${
                theme === "dark"
                  ? "border-gray-800 bg-gray-900/90"
                  : "border-gray-100 bg-white/90"
              }`}
            >
              <button
                className={`rounded-xl px-4 py-3 font-bold transition ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  setSession(null);
                  setCartItems([]);
                  localStorage.removeItem("self_checkout_session");
                }}
              >
                End Session
              </button>
              <div className="flex flex-col items-end">
                <span
                  className={`text-[10px] font-black uppercase tracking-tighter ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Total Amount
                </span>
                <span
                  className={`text-xl font-black ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  R{" "}
                  {cartItems
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
                <button
                  disabled={cartItems.length === 0}
                  className="mt-2 rounded-xl bg-green-500 px-8 py-3 font-bold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  Checkout{" "}
                  {cartItems.length > 0 &&
                    `(${cartItems.reduce(
                      (acc, item) => acc + item.quantity,
                      0
                    )})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {scannerMode === "STORE_QR" && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setScannerMode(null)}
        />
      )}

      {scannerMode === "ITEM" && (
        <POSBarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setScannerMode(null)}
        />
      )}
    </div>
  );
}
