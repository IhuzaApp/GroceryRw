import React, { useState, useEffect } from "react";
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
      if (isWeight && currentItem.product.final_price) {
        const price = parseFloat(currentItem.product.final_price);
        const quantity = currentItem.quantity;
        setPricePerUnit(price / quantity);
        setCustomerBudget(price);
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

    const itemBarcode = currentItem.product.ProductName?.barcode || currentItem.product.barcode;
    const itemSku = currentItem.product.ProductName?.sku || currentItem.product.sku;

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
      message: "This product has no barcode/SKU in our system. It cannot be scanned.",
      isWeightBased: false,
    });
  };

  if (!currentItem || !open) return null;

  return (
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
        className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

        <div
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 sm:rounded-[2.5rem] border ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
        style={{ 
          zIndex: 10001,
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
          
          <div className="flex items-center justify-between px-6 pt-10 pb-6 sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {(!isWeightBased && !barcodeValidation.isValid) ? "Verify Product" : "Select Amount"}
                </h2>
                <p className={`text-sm font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  {(!isWeightBased && !barcodeValidation.isValid) 
                    ? "Security check required" 
                    : (currentItem.product.ProductName?.name || "Premium Item")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                theme === "dark" ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 pb-10 sm:px-10">
            <div className="space-y-6">
              
              {/* Product Preview Card */}
              <div className={`rounded-3xl border p-5 flex items-center gap-5`} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: theme === "dark" ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white p-2 shadow-sm border border-gray-200/50">
                  {currentItem.product.ProductName?.image ? (
                    <Image src={currentItem.product.ProductName.image} alt="Product" width={80} height={80} className="object-contain h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`text-lg font-black leading-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {currentItem.product.ProductName?.name || "Product"}
                  </h4>
                  <p className={`text-sm font-bold opacity-60 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {currentItem.quantity} {isWeightBased ? measurementUnit : "units"} requested
                  </p>
                </div>
              </div>

              {!isWeightBased && !barcodeValidation.isValid && (
                <div className="space-y-6">
                  {!showBarcodeScanner && !showManualInput && (
                    <div className="grid grid-cols-2 gap-5">
                      {/* Scan with Camera Card */}
                      <button
                        onClick={() => setShowBarcodeScanner(true)}
                        className={`group flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 border-2 transition-all duration-300 ${
                          theme === "dark" 
                            ? "bg-gray-800/40 border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/10" 
                            : "bg-white border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 shadow-xl shadow-emerald-500/5"
                        }`}
                      >
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                        }`}>
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <span className={`block font-black text-sm tracking-tighter ${theme === "dark" ? "text-white" : "text-gray-900"}`}>SCANNER</span>
                          <span className={`text-[10px] font-bold opacity-50 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>CAMERA</span>
                        </div>
                      </button>

                      {/* Manual Entry Card */}
                      <button
                        onClick={() => setShowManualInput(true)}
                        className={`group flex flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 border-2 transition-all duration-300 ${
                          theme === "dark" 
                            ? "bg-gray-800/40 border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/10" 
                            : "bg-white border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 shadow-xl shadow-emerald-500/5"
                        }`}
                      >
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                        }`}>
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <span className={`block font-black text-sm tracking-tighter ${theme === "dark" ? "text-white" : "text-gray-900"}`}>MANUAL</span>
                          <span className={`text-[10px] font-bold opacity-50 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>TYPE CODE</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {showManualInput && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5">
                      <div className={`rounded-3xl border p-6 space-y-6`} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>ENTER CODE</h3>
                          <button onClick={() => { setShowManualInput(false); setManualSku(""); }} className="text-[10px] font-black tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-white uppercase">BACK</button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={manualSku}
                            onChange={(e) => setManualSku(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && manualSku.trim() && handleBarcodeScanned(manualSku.trim())}
                            placeholder="Type Barcode or SKU..."
                            className={`w-full rounded-2xl border-2 py-5 px-6 text-xl font-bold tracking-tight text-center transition-all focus:border-emerald-500`}
                            style={{ 
                              backgroundColor: 'var(--bg-primary)', 
                              color: 'var(--text-primary)',
                              borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => manualSku.trim() && handleBarcodeScanned(manualSku.trim())}
                          disabled={!manualSku.trim()}
                          className={`w-full rounded-2xl py-4 font-black tracking-widest text-white shadow-xl transition-all ${
                            manualSku.trim() ? "bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-600/20 active:scale-95" : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          VALIDATE
                        </button>
                      </div>
                    </div>
                  )}

                  {barcodeValidation.message && (
                    <div className={`animate-in zoom-in-95 p-5 rounded-[1.5rem] border-2 flex items-center gap-4 ${
                      barcodeValidation.isValid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                    }`}>
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${barcodeValidation.isValid ? "bg-emerald-500" : "bg-red-500"}`}>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          {barcodeValidation.isValid ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className={`font-black tracking-tight ${barcodeValidation.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                          {barcodeValidation.isValid ? "MATCH FOUND!" : "NO MATCH"}
                        </p>
                        <p className={`text-xs font-bold opacity-80 ${barcodeValidation.isValid ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                          {barcodeValidation.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(barcodeValidation.isValid || isWeightBased) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`}>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    </div>
                    <input
                      type="number"
                      value={isWeightBased ? (foundWeight || "") : (foundQuantity || "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numValue = val === "" ? 0 : parseFloat(val);
                        const maxAllowed = currentItem?.quantity || 0;
                        const validValue = Math.min(numValue, maxAllowed);
                        if (isWeightBased) { setFoundWeight(validValue); setFoundQuantity(validValue); }
                        else { setFoundQuantity(Math.floor(validValue)); }
                      }}
                      className={`w-full rounded-[2rem] border-2 py-8 pl-20 pr-8 text-center text-5xl font-black tracking-tighter transition-all focus:border-emerald-500`}
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)',
                        borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      }}
                      placeholder="0"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 justify-center">
                    {[0.5, 1].map((mult) => (
                      <button
                        key={mult}
                        onClick={() => {
                          const val = isWeightBased ? (currentItem.quantity * mult).toFixed(2) : Math.floor(currentItem.quantity * mult);
                          if (isWeightBased) setFoundWeight(Number(val));
                          setFoundQuantity(Number(val));
                        }}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          (isWeightBased ? foundWeight : foundQuantity) === Number(isWeightBased ? (currentItem.quantity * mult).toFixed(2) : Math.floor(currentItem.quantity * mult))
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105"
                            : theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {mult === 1 ? "FULL" : "HALF"} AMOUNT
                      </button>
                    ))}
                  </div>

                  {isWeightBased && (
                    <div className={`rounded-3xl p-6 border-2 ${exceedsBudget ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BUDGET</p>
                          <p className={`text-lg font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{customerBudget.toLocaleString()} RWF</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EST. COST</p>
                          <p className={`text-lg font-black ${exceedsBudget ? "text-red-500" : "text-emerald-500"}`}>{(foundWeight * pricePerUnit).toLocaleString()} RWF</p>
                        </div>
                      </div>
                      {refundAmount > 0 && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-500/20 flex justify-between items-center">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Refund:</p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{refundAmount.toLocaleString()} RWF</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`p-6 sm:p-10 border-t flex gap-4`} style={{ backgroundColor: 'var(--bg-secondary)', borderTopColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <button
              onClick={onClose}
              className={`flex-1 rounded-2xl py-4 font-black tracking-tight transition-all active:scale-95 border`}
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                color: 'var(--text-secondary)',
                borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              disabled={(!isWeightBased && !barcodeValidation.isValid) || (isWeightBased ? foundWeight : foundQuantity) <= 0}
              className={`flex-[2] rounded-2xl py-4 font-black tracking-tight shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                (barcodeValidation.isValid || isWeightBased) && (isWeightBased ? foundWeight : foundQuantity) > 0
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-600/30 hover:scale-[1.02]"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              {(!isWeightBased && !barcodeValidation.isValid) ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  VERIFY FIRST
                </>
              ) : (
                <>
                  CONFIRM FOUND
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
