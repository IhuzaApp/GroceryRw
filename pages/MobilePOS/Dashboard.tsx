import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "../../src/context/ThemeContext";
import {
  ChevronLeft,
  Box,
  ShoppingCart,
  Printer,
  LogOut,
  ClipboardCheck,
  Store,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import POSBarcodeScanner from "../../src/components/ui/POSBarcodeScanner";

type ShiftState = "PENDING_OPEN" | "ACTIVE" | "PENDING_CLOSE";

export default function MobilePOSDashboard() {
  const router = useRouter();
  const { theme } = useTheme();

  const [session, setSession] = useState<{
    shopName: string;
    employeeId: string;
    expiresAt: number;
  } | null>(null);
  const [shiftState, setShiftState] = useState<ShiftState>("PENDING_OPEN");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<
    "ADD_STOCK" | "CHECKOUT" | null
  >(null);

  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      if (parsed.expiresAt > Date.now()) {
        setSession(parsed);
      } else {
        // Session expired, force close and go to login
        localStorage.removeItem("mobile_pos_session");
        router.push("/MobilePOS/Connect");
      }
    } else {
      router.push("/MobilePOS/Connect");
    }

    const savedShiftState = localStorage.getItem("mobile_pos_shift_state");
    if (savedShiftState === "ACTIVE") {
      setShiftState("ACTIVE");
    }
  }, [router]);

  const handleOpenShift = () => {
    // Logic to record Opening Stock Balance
    // Provide a simple prompt or assume it calls an API
    console.log("Recording Opening Stock...");
    localStorage.setItem("mobile_pos_shift_state", "ACTIVE");
    setShiftState("ACTIVE");
  };

  const handleCloseShift = () => {
    setShiftState("PENDING_CLOSE");
    // User must record closing stock here
  };

  const submitCloseShift = () => {
    console.log("Recording Closing Stock...");
    setShiftState("PENDING_OPEN");
    localStorage.removeItem("mobile_pos_shift_state");
    localStorage.removeItem("mobile_pos_session");
    router.push("/MobilePOS/Connect");
  };

  const handleBarcodeDetected = (barcode: string) => {
    if (scannerMode === "ADD_STOCK") {
      console.log("📦 POS Action: Add to Stock - Barcode:", barcode);
      alert(`Scanned item to add to stock: ${barcode}`);
    } else if (scannerMode === "CHECKOUT") {
      console.log("💰 POS Action: Customer Checkout - Barcode:", barcode);
      // Continuous mode - don't alert, just log or update state
    }
    // We stay open for continuous scanning!
    // setShowScanner(false);
    // setScannerMode(null);
  };

  const startScanner = (mode: "ADD_STOCK" | "CHECKOUT") => {
    setScannerMode(mode);
    setShowScanner(true);
  };

  if (!session) return null;

  return (
    <div
      className={`min-h-screen pb-20 ${
        theme === "dark"
          ? "bg-[var(--bg-primary)] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Head>
        <title>Mobile POS Dashboard</title>
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
          onClick={() => router.push("/")}
          className={`rounded-full p-2.5 transition active:scale-95 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-center text-lg font-black tracking-tight">
          {session.shopName} <br />{" "}
          <span className="text-xs font-medium uppercase text-blue-500">
            POS Terminal
          </span>
        </h1>
        <button
          onClick={handleCloseShift}
          className={`rounded-full p-2.5 transition active:scale-95 ${
            theme === "dark"
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-md p-6">
        {/* SHIFT: PENDING OPEN */}
        {shiftState === "PENDING_OPEN" && (
          <div className="mt-10 duration-500 animate-in fade-in zoom-in-95">
            <div
              className={`rounded-3xl p-8 text-center shadow-2xl ${
                theme === "dark"
                  ? "border border-gray-700 bg-gray-800/80 shadow-black/50"
                  : "border border-gray-100 bg-white shadow-xl"
              }`}
            >
              <div
                className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  theme === "dark"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <PlayCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-2xl font-black">Start Shift</h2>
              <p
                className={`mb-8 text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                To begin your 24-hour shift, you must first record the opening
                stock balance.
              </p>
              <button
                onClick={handleOpenShift}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
              >
                <ClipboardCheck className="h-5 w-5" />
                Record Opening Stock
              </button>
            </div>
          </div>
        )}

        {/* SHIFT: PENDING CLOSE */}
        {shiftState === "PENDING_CLOSE" && (
          <div className="mt-10 duration-500 animate-in fade-in zoom-in-95">
            <div
              className={`rounded-3xl p-8 text-center shadow-2xl ${
                theme === "dark"
                  ? "border border-gray-700 bg-gray-800/80 shadow-black/50"
                  : "border border-gray-100 bg-white shadow-xl"
              }`}
            >
              <div
                className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  theme === "dark"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <StopCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-2xl font-black">End Shift</h2>
              <p
                className={`mb-8 text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                You are about to close this register. Please record the closing
                stock balance before you logout.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShiftState("ACTIVE")}
                  className={`w-full rounded-2xl py-4 font-bold transition active:scale-95 ${
                    theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={submitCloseShift}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 active:scale-95"
                >
                  <ClipboardCheck className="h-5 w-5" />
                  Record & Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHIFT: ACTIVE */}
        {shiftState === "ACTIVE" && (
          <div className="mt-4 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Status Header */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm ${
                theme === "dark"
                  ? "border-indigo-500/20 bg-indigo-900/20"
                  : "border-indigo-100 bg-indigo-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <Store className="h-5 w-5" />
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"></span>
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                    Active Shift
                  </p>
                  <p
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Employee #{session.employeeId}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-4">
              {/* 1. Add to Stock */}
              <button
                onClick={() => startScanner("ADD_STOCK")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800 hover:bg-gray-800/80"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
                  <Box className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3
                    className={`font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Add Stock
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Scan Inventory
                  </p>
                </div>
              </button>

              {/* 2. Customer Checkout */}
              <button
                onClick={() => startScanner("CHECKOUT")}
                className={`group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800 hover:bg-gray-800/80"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3
                    className={`font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Checkout
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Mobile Registers
                  </p>
                </div>
              </button>

              {/* 3. Print Invoices */}
              <button
                className={`group col-span-2 flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800 hover:bg-gray-800/80"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-110">
                  <Printer className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3
                    className={`font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Print Invoices
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Generate PDF / AirPrint
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {showScanner && (
        <POSBarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => {
            setShowScanner(false);
            setScannerMode(null);
          }}
        />
      )}
    </div>
  );
}
