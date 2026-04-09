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
    shopId: string;
    employeeId: string;
    expiresAt: number;
  } | null>(null);
  const [shiftState, setShiftState] = useState<ShiftState>("PENDING_OPEN");
  const [shiftStartedAt, setShiftStartedAt] = useState<number | null>(null);
  const [openingStock, setOpeningStock] = useState<string>("0");
  const [closingStockInput, setClosingStockInput] = useState<string>("");
  const [shiftStats, setShiftStats] = useState<{ totalItems: number; totalSales: number }>({ totalItems: 0, totalSales: 0 });
  
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<"ADD_STOCK" | "CHECKOUT" | null>(null);

  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      // VALIDATION: Ensure session has modern UUID format and shopId
      const isLegacy = !parsed.shopId || typeof parsed.employeeId === 'number';
      
      if (parsed.expiresAt > Date.now() && !isLegacy) {
        setSession(parsed);
      } else {
        // Session expired or legacy format, force re-login
        localStorage.removeItem("mobile_pos_session");
        router.push("/MobilePOS/Connect");
      }
    } else {
      router.push("/MobilePOS/Connect");
    }

    const savedShiftState = localStorage.getItem("mobile_pos_shift_state");
    const savedStart = localStorage.getItem("mobile_pos_shift_start");
    const savedOpening = localStorage.getItem("mobile_pos_opening_stock");

    if (savedShiftState === "ACTIVE") {
      setShiftState("ACTIVE");
      if (savedStart) setShiftStartedAt(parseInt(savedStart));
      if (savedOpening) setOpeningStock(savedOpening);
    }
  }, [router]);

  const handleOpenShift = async () => {
    try {
      if (!session) return;
      // Fetch last closing stock and initial stats
      const res = await fetch("/api/mobile-pos/shift-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: session.shopId, employeeId: session.employeeId })
      });
      const data = await res.json();
      const lastStock = data.stats?.lastClosingStock || "0";
      
      const startTime = Date.now();
      setOpeningStock(lastStock);
      setShiftStartedAt(startTime);
      setShiftState("ACTIVE");
      
      localStorage.setItem("mobile_pos_shift_state", "ACTIVE");
      localStorage.setItem("mobile_pos_shift_start", String(startTime));
      localStorage.setItem("mobile_pos_opening_stock", lastStock);
    } catch (e) {
      console.error("Failed to open shift", e);
      // Fallback if API fails
      setShiftState("ACTIVE");
    }
  };

  const handleCloseShift = async () => {
    if (!session) return;
    setShiftState("PENDING_CLOSE");
    // Fetch latest stats for the summary
    try {
      const res = await fetch("/api/mobile-pos/shift-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: session.shopId, employeeId: session.employeeId })
      });
      const data = await res.json();
      if (data.success) {
        setShiftStats(data.stats);
        // Pre-fill closing stock based on sales (Opening + Sales)
        const calculatedClosing = parseFloat(openingStock) + data.stats.totalSales;
        setClosingStockInput(String(calculatedClosing));
      }
    } catch (e) {
      console.error("Failed to fetch final stats", e);
    }
  };

  const calculateDuration = () => {
    if (!shiftStartedAt) return "0h 0m";
    const diff = Date.now() - shiftStartedAt;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const submitCloseShift = async () => {
    if (!session || !closingStockInput) {
      alert("Please enter the closing stock balance.");
      return;
    }

    try {
      const res = await fetch("/api/mobile-pos/record-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closing_stock: closingStockInput,
          opening_stock: openingStock,
          orgUser_id: session.employeeId,
          shift_durantion: calculateDuration(),
          shop_id: session.shopId
        })
      });

      if (res.ok) {
        setShiftState("PENDING_OPEN");
        localStorage.removeItem("mobile_pos_shift_state");
        localStorage.removeItem("mobile_pos_shift_start");
        localStorage.removeItem("mobile_pos_opening_stock");
        localStorage.removeItem("mobile_pos_session");
        router.push("/MobilePOS/Connect");
      }
    } catch (e) {
      console.error("Failed to record shift", e);
      alert("Failed to save shift recording. Please try again.");
    }
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
      className="min-h-screen pb-20 bg-gray-50 text-gray-900 dark:bg-black dark:text-white"
    >
      <Head>
        <title>Mobile POS Dashboard</title>
      </Head>

      {/* Top App Bar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 shadow-sm backdrop-blur-lg 
          border-b border-gray-200 bg-white/90 dark:border-gray-800 dark:bg-gray-900/80"
      >
        <button
          onClick={() => router.push("/")}
          className="rounded-full p-2.5 transition active:scale-95 
            bg-gray-100 text-gray-700 hover:bg-gray-200 
            dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-center text-lg font-black tracking-tight">
          {session.shopName} <br />{" "}
          <span className="text-xs font-medium uppercase text-green-500">
            POS Terminal
          </span>
        </h1>
        <button
          onClick={handleCloseShift}
          className="flex items-center gap-2 rounded-xl px-4 py-2 transition active:scale-95 
            bg-red-50 text-red-600 hover:bg-red-100 
            dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <span className="text-xs font-black uppercase">End Shift</span>
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-auto max-w-md p-6">
        {/* SHIFT: PENDING OPEN */}
        {shiftState === "PENDING_OPEN" && (
          <div className="mt-10 duration-500 animate-in fade-in zoom-in-95">
            <div
              className="rounded-3xl p-8 text-center shadow-2xl border border-gray-100 bg-white shadow-xl
                dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/50"
            >
              <div
                className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  theme === "dark"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-600"
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
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <Loader size="md" />
                ) : (
                  <>
                    <ClipboardCheck className="h-5 w-5" />
                    Record Opening Stock
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SHIFT: PENDING CLOSE */}
        {shiftState === "PENDING_CLOSE" && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full max-w-md rounded-t-[3rem] bg-white p-10 shadow-2xl animate-in slide-in-from-bottom dark:bg-gray-900">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <StopCircle className="h-12 w-12" />
              </div>
              
              <h2 className="mb-2 text-3xl font-black tracking-tight text-center">Closing Shift</h2>
              {/* Accurate Shift Summary */}
              <div className="mb-8 space-y-3 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Opening Stock</span>
                  <span className="font-black">{parseFloat(openingStock).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items Processed</span>
                  <span className="font-black">{shiftStats.totalItems} Items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Session Total Sales</span>
                  <span className="font-black text-green-600">{shiftStats.totalSales.toLocaleString()} RWF</span>
                </div>
                <div className="border-t border-gray-100 pt-3 dark:border-gray-700 mt-2 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Shift Duration</span>
                  <span>{calculateDuration()}</span>
                </div>
              </div>

              {/* Closing Stock Input */}
              <div className="mb-8">
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400 text-left">Enter Closing Stock Balance</label>
                <input 
                  type="number"
                  placeholder="e.g. 150000"
                  value={closingStockInput}
                  onChange={(e) => setClosingStockInput(e.target.value)}
                  className="w-full rounded-2xl border-none bg-gray-50 p-4 font-black text-center text-lg placeholder:text-gray-300 dark:bg-gray-800"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={submitCloseShift}
                  className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95"
                >
                  <ClipboardCheck className="h-6 w-6" />
                  <span>Save & Log Out</span>
                </button>
                
                <button
                  onClick={() => setShiftState("ACTIVE")}
                  className="w-full rounded-[2rem] py-4 font-bold text-gray-500 transition hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Return to Dashboard
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
              className="flex items-center justify-between rounded-2xl border p-4 shadow-xl 
                border-green-100 bg-green-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-500/20">
                  <Store className="h-5 w-5" />
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></span>
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-green-500">
                    Active Shift
                  </p>
                  <p
                    className="font-semibold text-gray-900 dark:text-white"
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
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
                  border-gray-100 bg-white hover:border-gray-200 
                  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
                  <Box className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Add Stock
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Scan Inventory
                  </p>
                </div>
              </button>

              {/* 2. Customer Checkout */}
              <button
                onClick={() => router.push("/MobilePOS/Checkout")}
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
                  border-gray-100 bg-white hover:border-gray-200 
                  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Checkout
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Mobile Registers
                  </p>
                </div>
              </button>

              {/* 3. Print Invoices */}
              <button
                className="group col-span-2 flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
                  border-gray-100 bg-white hover:border-gray-200 
                  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
                  <Printer className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">
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
