import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { OrderItem } from "../../types/order";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";
import BarcodeScanner from "./BarcodeScanner";

interface QuantityConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  currentItem: OrderItem | null;
  foundQuantity: number;
  setFoundQuantity: (quantity: number) => void;
  onConfirm: () => void;
}

export default function QuantityConfirmationModal({
  open,
  onClose,
  currentItem,
  foundQuantity,
  setFoundQuantity,
  onConfirm,
}: QuantityConfirmationModalProps) {
  const { theme } = useTheme();

  // State for barcode scanning
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualSku, setManualSku] = useState("");
  const [barcodeValidation, setBarcodeValidation] = useState<{
    isValid: boolean;
    message: string;
    isWeightBased: boolean;
  }>({
    isValid: false,
    message: "",
    isWeightBased: false,
  });

  // State for weight-based measurements
  const [foundWeight, setFoundWeight] = useState(0);
  const [isWeightBased, setIsWeightBased] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [customerBudget, setCustomerBudget] = useState(0);
  const [exceedsBudget, setExceedsBudget] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [missingWeight, setMissingWeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // SSR compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile detection
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if item is weight-based
  useEffect(() => {
    if (currentItem) {
      let unit = "";

      if (currentItem.product.measurement_unit) {
        unit = currentItem.product.measurement_unit.toLowerCase().trim();
      }

      const isWeight = [
        "kg",
        "g",
        "mg",
        "kilogram",
        "gram",
        "milligram",
        "lbs",
        "oz",
        "pound",
        "ounce",
      ].includes(unit);

      setIsWeightBased(isWeight);
      setMeasurementUnit(unit);

      // Calculate price per unit weight
      if (isWeight && currentItem.price) {
        const unitPrice = currentItem.price;
        const requestedQuantity = currentItem.quantity;
        setPricePerUnit(unitPrice);
        setCustomerBudget(unitPrice * requestedQuantity);
      }

      // Reset barcode validation for new item
      if (isWeight) {
        setBarcodeValidation({
          isValid: true,
          message: "Weight-based item - no barcode required",
          isWeightBased: true,
        });
      } else {
        setBarcodeValidation({
          isValid: false,
          message: "",
          isWeightBased: false,
        });
      }

      // Reset found quantity for new item
      setFoundQuantity(0);
      setFoundWeight(0);
    }
  }, [currentItem, setFoundQuantity]);

  // Calculate if weight exceeds budget and refund amounts
  useEffect(() => {
    if (isWeightBased && foundWeight > 0) {
      const totalCost = foundWeight * pricePerUnit;
      setExceedsBudget(totalCost > customerBudget);

      const requestedWeight = currentItem?.quantity || 0;
      const missing = Math.max(0, requestedWeight - foundWeight);
      setMissingWeight(missing);

      const refund = missing * pricePerUnit;
      setRefundAmount(refund);
    } else {
      setMissingWeight(0);
      setRefundAmount(0);
    }
  }, [foundWeight, pricePerUnit, customerBudget, isWeightBased, currentItem]);

  // Function to handle barcode scan result
  const handleBarcodeScanned = (scannedBarcode: string) => {
    if (!currentItem) {
      setBarcodeValidation({
        isValid: false,
        message: "No item selected",
        isWeightBased: false,
      });
      return;
    }

    const itemBarcode =
      currentItem.product.ProductName?.barcode || currentItem.product.barcode;
    const itemSku =
      currentItem.product.ProductName?.sku || currentItem.product.sku;

    if (itemBarcode || itemSku) {
      let isValid = false;
      let validationMessage = "";

      if (itemBarcode && scannedBarcode === itemBarcode) {
        isValid = true;
        validationMessage = "Barcode matches!";
      } else if (itemSku && scannedBarcode === itemSku) {
        isValid = true;
        validationMessage = "SKU matches!";
      } else {
        isValid = false;
        validationMessage = "Scanned code does not match the product.";
      }

      if (isValid) {
        setBarcodeValidation({
          isValid: true,
          message: validationMessage,
          isWeightBased: false,
        });
        setShowBarcodeScanner(false);
        setShowManualInput(false);
      } else {
        setBarcodeValidation({
          isValid: false,
          message: validationMessage,
          isWeightBased: false,
        });
      }
      return;
    }

    setBarcodeValidation({
      isValid: false,
      message:
        "This product has no barcode/SKU in our system. It cannot be scanned.",
      isWeightBased: false,
    });
  };

  if (!currentItem || !open || !mounted) return null;

  return createPortal(
    <>
      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Quantity Confirmation Modal */}
      <div
        className="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          aria-hidden="true"
        />

        <div
          className={`relative z-[100001] w-full max-w-sm transform overflow-hidden rounded-t-[2rem] border shadow-2xl transition-all duration-300 sm:rounded-[2rem] ${
            theme === "dark" ? "border-white/10" : "border-gray-200"
          }`}
          style={{
            backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "#ffffff",
            color: "var(--text-primary)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Gradient */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="flex items-center justify-between px-5 pb-4 pt-8 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2
                  className={`text-base font-black tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {!isWeightBased && !barcodeValidation.isValid
                    ? "Verify Product"
                    : "Select Amount"}
                </h2>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    theme === "dark" ? "text-emerald-400/80" : "text-emerald-600/80"
                  }`}
                >
                  {currentItem.product.ProductName?.name || "Premium Item"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                theme === "dark"
                  ? "bg-white/5 text-gray-400 hover:text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-5 pb-8 sm:px-8">
            <div className="space-y-4">
              {/* Product Preview Card */}
              <div
                className={`flex items-center gap-3 rounded-2xl border p-3`}
                style={{
                  backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                }}
              >
                <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white p-1.5 shadow-sm">
                  {currentItem.product.ProductName?.image ? (
                    <Image
                      src={currentItem.product.ProductName.image}
                      alt="Product"
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm font-black leading-tight ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {currentItem.product.ProductName?.name || "Product"}
                  </h4>
                  <p
                    className={`text-xs font-bold opacity-60 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {currentItem.quantity} {isWeightBased ? measurementUnit : "units"} requested
                  </p>
                </div>
              </div>

              {!isWeightBased && !barcodeValidation.isValid && (
                <div className="space-y-4">
                  {!showBarcodeScanner && !showManualInput && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Scan with Camera Card */}
                      <button
                        onClick={() => setShowBarcodeScanner(true)}
                        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 ${
                          theme === "dark"
                            ? "border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                            : "border-gray-50 bg-white hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
                            theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className={`text-[10px] font-black tracking-widest ${theme === "dark" ? "text-white" : "text-gray-900"}`}>SCANNER</span>
                      </button>

                      {/* Manual Entry Card */}
                      <button
                        onClick={() => setShowManualInput(true)}
                        className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 ${
                          theme === "dark"
                            ? "border-white/5 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                            : "border-gray-50 bg-white hover:border-emerald-500 hover:bg-emerald-50"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
                            theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <span className={`text-[10px] font-black tracking-widest ${theme === "dark" ? "text-white" : "text-gray-900"}`}>MANUAL</span>
                      </button>
                    </div>
                  )}

                  {showManualInput && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                      <div
                        className={`space-y-4 rounded-2xl border p-4`}
                        style={{
                          backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className={`text-xs font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>ENTER CODE</h3>
                          <button
                            onClick={() => { setShowManualInput(false); setManualSku(""); }}
                            className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-500"
                          >
                            BACK
                          </button>
                        </div>
                        <input
                          type="text"
                          value={manualSku}
                          onChange={(e) => setManualSku(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && manualSku.trim() && handleBarcodeScanned(manualSku.trim())}
                          placeholder="Type Barcode or SKU..."
                          className={`w-full rounded-xl border-2 px-4 py-3 text-center text-sm font-bold tracking-tight transition-all focus:border-emerald-500`}
                          style={{
                            backgroundColor: theme === "dark" ? "rgba(0,0,0,0.2)" : "#ffffff",
                            color: "var(--text-primary)",
                            borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => manualSku.trim() && handleBarcodeScanned(manualSku.trim())}
                          disabled={!manualSku.trim()}
                          className={`w-full rounded-xl py-3 text-[10px] font-black tracking-widest text-white shadow-lg transition-all ${
                            manualSku.trim() ? "bg-gradient-to-r from-emerald-600 to-teal-700 active:scale-95" : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800"
                          }`}
                        >
                          VALIDATE
                        </button>
                      </div>
                    </div>
                  )}

                  {barcodeValidation.message && (
                    <div className={`flex items-center gap-3 rounded-xl border p-3 animate-in zoom-in-95 ${barcodeValidation.isValid ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${barcodeValidation.isValid ? "bg-emerald-500" : "bg-red-500"}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          {barcodeValidation.isValid ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] font-black tracking-tight ${barcodeValidation.isValid ? "text-emerald-500" : "text-red-500"}`}>
                          {barcodeValidation.isValid ? "MATCH FOUND!" : "NO MATCH"}
                        </p>
                        <p className={`text-[9px] font-bold opacity-80 ${barcodeValidation.isValid ? "text-emerald-400" : "text-red-400"}`}>
                          {barcodeValidation.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(barcodeValidation.isValid || isWeightBased) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="group relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-4 flex items-center transition-colors ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      value={isWeightBased ? foundWeight || "" : foundQuantity || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numValue = val === "" ? 0 : parseFloat(val);
                        const maxAllowed = currentItem?.quantity || 0;
                        const validValue = Math.min(numValue, maxAllowed);
                        if (isWeightBased) {
                          setFoundWeight(validValue);
                          setFoundQuantity(validValue);
                        } else {
                          setFoundQuantity(Math.floor(validValue));
                        }
                      }}
                      className={`w-full rounded-2xl border-2 py-4 pl-12 pr-6 text-center text-3xl font-black tracking-tighter transition-all focus:border-emerald-500`}
                      style={{
                        backgroundColor: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
                        color: "var(--text-primary)",
                        borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      }}
                      placeholder="0"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-center gap-2">
                    {[0.5, 1].map((mult) => (
                      <button
                        key={mult}
                        onClick={() => {
                          const val = isWeightBased ? (currentItem.quantity * mult).toFixed(2) : Math.floor(currentItem.quantity * mult);
                          if (isWeightBased) setFoundWeight(Number(val));
                          setFoundQuantity(Number(val));
                        }}
                        className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${
                          (isWeightBased ? foundWeight : foundQuantity) === Number(isWeightBased ? (currentItem.quantity * mult).toFixed(2) : Math.floor(currentItem.quantity * mult))
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                            : theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {mult === 1 ? "FULL" : "HALF"}
                      </button>
                    ))}
                  </div>

                  {isWeightBased && (
                    <div className={`rounded-2xl border-2 p-4 ${exceedsBudget ? "border-red-500/10 bg-red-500/5" : "border-emerald-500/10 bg-emerald-500/5"}`}>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">BUDGET</p>
                          <p className={`text-xs font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{customerBudget.toLocaleString()} RWF</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">EST. COST</p>
                          <p className={`text-xs font-black ${exceedsBudget ? "text-red-500" : "text-emerald-500"}`}>{(foundWeight * pricePerUnit).toLocaleString()} RWF</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={`flex gap-3 border-t p-5 sm:p-8`}
            style={{
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
              borderTopColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            }}
          >
            <button
              onClick={onClose}
              className={`flex-1 rounded-xl border py-3 text-[10px] font-black tracking-widest transition-all active:scale-95`}
              style={{
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: "var(--text-secondary)",
                borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
              }}
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              disabled={(!isWeightBased && !barcodeValidation.isValid) || (isWeightBased ? foundWeight : foundQuantity) <= 0}
              className={`flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black tracking-widest shadow-lg transition-all active:scale-95 ${
                (barcodeValidation.isValid || isWeightBased) && (isWeightBased ? foundWeight : foundQuantity) > 0
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-600/30"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800"
              }`}
              style={{ color: "white" }}
            >
              {!isWeightBased && !barcodeValidation.isValid ? "VERIFY FIRST" : "CONFIRM FOUND"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
