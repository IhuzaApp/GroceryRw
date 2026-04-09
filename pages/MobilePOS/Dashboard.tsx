import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LogOut } from "lucide-react";

// Components
import { POSHeader } from "../../src/components/MobilePOS/POSHeader";
import { OpenShiftCard } from "../../src/components/MobilePOS/Dashboard/OpenShiftCard";
import { CloseShiftModal } from "../../src/components/MobilePOS/Dashboard/CloseShiftModal";
import { DashboardStats } from "../../src/components/MobilePOS/Dashboard/DashboardStats";
import { DashboardGrid } from "../../src/components/MobilePOS/Dashboard/DashboardGrid";
import POSBarcodeScanner from "../../src/components/ui/POSBarcodeScanner";

type ShiftState = "PENDING_OPEN" | "ACTIVE" | "PENDING_CLOSE";

export default function MobilePOSDashboard() {
  const router = useRouter();

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      const isLegacy = !parsed.shopId || typeof parsed.employeeId === 'number';
      
      if (parsed.expiresAt > Date.now() && !isLegacy) {
        setSession(parsed);
      } else {
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
      setLoading(true);
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
      setShiftState("ACTIVE");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShiftCheck = async () => {
    if (!session) return;
    setShiftState("PENDING_CLOSE");
    try {
      const res = await fetch("/api/mobile-pos/shift-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: session.shopId, employeeId: session.employeeId })
      });
      const data = await res.json();
      if (data.success) {
        setShiftStats(data.stats);
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

    setLoading(true);
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
      } else {
        const errData = await res.json();
        throw new Error(errData.details || "Unknown error");
      }
    } catch (e: any) {
      console.error("Failed to record shift", e);
      alert("Failed to save shift recording: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    if (scannerMode === "ADD_STOCK") {
      alert(`Scanned item to add to stock: ${barcode}`);
    }
  };

  const startScanner = (mode: "ADD_STOCK" | "CHECKOUT") => {
    setScannerMode(mode);
    setShowScanner(true);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
      <Head>
        <title>Mobile POS Dashboard</title>
      </Head>

      <POSHeader 
        title={session.shopName}
        subtitle="POS Terminal"
        onBack={() => router.push("/")}
        rightAction={
          <button
            onClick={handleCloseShiftCheck}
            className="flex items-center gap-2 rounded-xl px-4 py-2 transition active:scale-95 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <span className="text-xs font-black uppercase">End Shift</span>
            <LogOut className="h-4 w-4" />
          </button>
        }
      />

      <div className="mx-auto max-w-md p-6">
        {shiftState === "PENDING_OPEN" && (
          <OpenShiftCard onOpen={handleOpenShift} loading={loading} />
        )}

        {shiftState === "PENDING_CLOSE" && (
          <CloseShiftModal 
            onCancel={() => setShiftState("ACTIVE")}
            onSubmit={submitCloseShift}
            loading={loading}
            openingStock={openingStock}
            totalItems={shiftStats.totalItems}
            totalSales={shiftStats.totalSales}
            duration={calculateDuration()}
            closingStockInput={closingStockInput}
          />
        )}

        {shiftState === "ACTIVE" && (
          <div className="mt-4 space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
            <DashboardStats employeeId={session.employeeId} />
            <DashboardGrid 
              onAddStock={() => startScanner("ADD_STOCK")}
              onCheckout={() => router.push("/MobilePOS/Checkout")}
              onPrintInvoices={() => {}}
            />
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
