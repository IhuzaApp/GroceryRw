import React, { useState, useEffect } from "react";
import { Modal, Button, InputNumber, Form } from "rsuite";
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

  // Check if item is weight-based
  useEffect(() => {
    if (currentItem) {
      const unit =
        currentItem.product.measurement_unit?.toLowerCase().trim() || "";
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
        // Reset barcode validation for non-weight-based items
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

      // Calculate missing weight and refund amount
      const requestedWeight = currentItem?.quantity || 0;
      const missing = Math.max(0, requestedWeight - foundWeight);
      setMissingWeight(missing);

      // Calculate refund amount for missing weight
      const refund = missing * pricePerUnit;
      setRefundAmount(refund);
    } else {
      setMissingWeight(0);
      setRefundAmount(0);
    }
  }, [foundWeight, pricePerUnit, customerBudget, isWeightBased, currentItem]);

  // Function to handle barcode scan result
  const handleBarcodeScanned = (scannedBarcode: string) => {
    console.log("🔍 Barcode scanned:", scannedBarcode);
    console.log("🔍 Current item:", currentItem);

    if (!currentItem) {
      setBarcodeValidation({
        isValid: false,
        message: "No item selected",
        isWeightBased: false,
      });
      return;
    }

    const itemBarcode = currentItem.product.ProductName?.barcode;
    const itemSku = currentItem.product.ProductName?.sku;

    console.log("🔍 Item barcode from ProductName table:", itemBarcode);
    console.log("🔍 Item SKU from ProductName table:", itemSku);
    console.log("🔍 Scanned barcode:", scannedBarcode);

    // Check if the item has a barcode or SKU in the database
    if (itemBarcode || itemSku) {
      let isValid = false;
      let validationMessage = "";
      
      // Priority: Check barcode first, then SKU if barcode is null
      if (itemBarcode) {
        isValid = scannedBarcode === itemBarcode;
        validationMessage = isValid 
          ? "Barcode matches!" 
          : "Scanned code does not match the product's barcode.";
      } else if (itemSku) {
        isValid = scannedBarcode === itemSku;
        validationMessage = isValid 
          ? "SKU matches!" 
          : "Scanned code does not match the product's SKU.";
      }
      
      if (isValid) {
        setBarcodeValidation({
          isValid: true,
          message: validationMessage,
          isWeightBased: false,
        });
        setShowBarcodeScanner(false);
      } else {
        setBarcodeValidation({
          isValid: false,
          message: validationMessage,
          isWeightBased: false,
        });
      }
      return;
    }

    // If the item has NO barcode or SKU in the database, it cannot be validated.
    setBarcodeValidation({
      isValid: false,
      message:
        "This product has no barcode/SKU in our system. It cannot be scanned and must be marked as 'Not Found'.",
      isWeightBased: false,
    });
  };

  if (!currentItem) return null;

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
      <Modal
        open={open}
        onClose={onClose}
        size="sm"
        className={`${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-xl`}
      >
        <Modal.Header
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
        >
          <Modal.Title
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Confirm Found Quantity:{" "}
            {currentItem.product.ProductName?.name || "Unknown Product"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className={`${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-white text-gray-900"
          } p-6`}
        >
          <div className="space-y-4">
            {/* Barcode Scanning Section - Only for non-weight-based items */}
            {!isWeightBased && (
              <div className={`rounded-lg bg-transparent`}>
                <div className="mb-3">
                  <label
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {currentItem?.product.ProductName?.barcode 
                      ? "Scan Barcode" 
                      : currentItem?.product.ProductName?.sku 
                        ? "Enter SKU" 
                        : "Scan Barcode or Enter SKU"}
                  </label>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    } mt-1`}
                  >
                    {currentItem?.product.ProductName?.barcode 
                      ? `Scan the product barcode: ${currentItem.product.ProductName.barcode}`
                      : currentItem?.product.ProductName?.sku 
                        ? `Enter the product SKU: ${currentItem.product.ProductName.sku}`
                        : "This product has no barcode/SKU in our system"}
                  </p>
                </div>

                {/* Card-based selection */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Open Camera Scanner Card */}
                  <div
                    onClick={() => {
                      if (currentItem?.product.ProductName?.barcode || currentItem?.product.ProductName?.sku) {
                        setShowManualInput(false);
                        setShowBarcodeScanner(true);
                      }
                    }}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      !currentItem?.product.ProductName?.barcode && !currentItem?.product.ProductName?.sku
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        : showBarcodeScanner
                        ? "cursor-pointer border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "cursor-pointer border-gray-300 hover:border-purple-400 dark:border-gray-600 dark:hover:border-purple-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-6 w-6 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold">Scan with Camera</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Use your device's camera
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual Entry Card */}
                  <div
                    onClick={() => {
                      if (currentItem?.product.ProductName?.barcode || currentItem?.product.ProductName?.sku) {
                        setShowBarcodeScanner(false);
                        setShowManualInput(true);
                      }
                    }}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      !currentItem?.product.ProductName?.barcode && !currentItem?.product.ProductName?.sku
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        : showManualInput
                        ? "cursor-pointer border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "cursor-pointer border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-3 h-6 w-6 text-green-500"
                      >
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Enter Manually</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Type in the SKU or barcode
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual SKU Input Form */}
                {showManualInput && (
                  <div className="mt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (manualSku.trim()) {
                          handleBarcodeScanned(manualSku.trim());
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={manualSku}
                          onChange={(e) => setManualSku(e.target.value)}
                          placeholder={
                            currentItem?.product.ProductName?.barcode 
                              ? `Enter barcode: ${currentItem.product.ProductName.barcode}`
                              : currentItem?.product.ProductName?.sku 
                                ? `Enter SKU: ${currentItem.product.ProductName.sku}`
                                : "Enter SKU or barcode"
                          }
                          className={`flex-1 rounded-lg border px-3 py-2 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-800"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                        >
                          Validate
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Validation Status */}
                {barcodeValidation.message && (
                  <div
                    className={`mt-3 rounded-lg p-3 ${
                      barcodeValidation.isValid
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full p-1 ${
                          barcodeValidation.isValid
                            ? "bg-green-100 dark:bg-green-800"
                            : "bg-red-100 dark:bg-red-800"
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 ${
                            barcodeValidation.isValid
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {barcodeValidation.isValid ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          )}
                        </svg>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          barcodeValidation.isValid
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        {barcodeValidation.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Input Section - Only show if barcode is valid or item is weight-based */}
            {(barcodeValidation.isValid || isWeightBased) && (
              <div className={`rounded-lg bg-white p-4 dark:bg-slate-700`}>
                <div className="mb-3">
                  <label
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {isWeightBased
                      ? `How much ${measurementUnit} did you find?`
                      : "How many units did you find?"}
                  </label>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    } mt-1`}
                  >
                    {isWeightBased
                      ? `Enter the weight you found (0 to ${currentItem.quantity} ${measurementUnit})`
                      : `Enter the quantity you found (0 to ${currentItem.quantity})`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={isWeightBased ? foundWeight : foundQuantity}
                      onChange={(e) => {
                        const numValue = Number(e.target.value) || 0;
                        if (isWeightBased) {
                          setFoundWeight(numValue);
                          setFoundQuantity(numValue); // Update quantity for compatibility
                        } else {
                          setFoundQuantity(numValue);
                        }
                      }}
                      min={0}
                      max={currentItem.quantity}
                      step={isWeightBased ? "0.01" : "1"}
                      className={`w-full ${
                        theme === "dark"
                          ? "border-slate-500 bg-slate-600 text-gray-100"
                          : "border-slate-300 bg-white text-gray-900"
                      } rounded-lg border px-3 py-2 text-center text-lg font-semibold focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder={
                        isWeightBased ? `0.00 ${measurementUnit}` : "0"
                      }
                    />
                  </div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {isWeightBased
                      ? `of ${currentItem.quantity} ${measurementUnit}`
                      : `of ${currentItem.quantity}`}
                  </div>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            {(barcodeValidation.isValid || isWeightBased) && (
              <div
                className={`rounded-lg p-3 ${
                  foundQuantity === 0
                    ? "bg-red-50 dark:bg-red-900/20"
                    : exceedsBudget
                    ? "bg-red-50 dark:bg-red-900/20"
                    : foundQuantity === currentItem.quantity
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "bg-amber-50 dark:bg-amber-900/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full p-1 ${
                      foundQuantity === 0
                        ? "bg-red-100 dark:bg-red-800"
                        : exceedsBudget
                        ? "bg-red-100 dark:bg-red-800"
                        : foundQuantity === currentItem.quantity
                        ? "bg-emerald-100 dark:bg-emerald-800"
                        : "bg-amber-100 dark:bg-amber-800"
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 ${
                        foundQuantity === 0
                          ? "text-red-600 dark:text-red-400"
                          : exceedsBudget
                          ? "text-red-600 dark:text-red-400"
                          : foundQuantity === currentItem.quantity
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {foundQuantity === 0 ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : exceedsBudget ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      ) : foundQuantity === currentItem.quantity ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        foundQuantity === 0
                          ? "text-red-800 dark:text-red-300"
                          : exceedsBudget
                          ? "text-red-800 dark:text-red-300"
                          : foundQuantity === currentItem.quantity
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {foundQuantity === 0
                        ? isWeightBased
                          ? `No ${measurementUnit} found`
                          : "No units found"
                        : exceedsBudget
                        ? `Weight exceeds budget by $${(
                            foundWeight * pricePerUnit -
                            customerBudget
                          ).toFixed(2)}`
                        : foundQuantity === currentItem.quantity
                        ? isWeightBased
                          ? `All ${measurementUnit} found`
                          : "All units found"
                        : isWeightBased
                        ? `Partial ${measurementUnit} found - Refund will be processed`
                        : "Partial quantity found"}
                    </span>
                    {isWeightBased && foundQuantity > 0 && (
                      <div className="mt-1 space-y-1 text-xs">
                        <p
                          className={`${
                            exceedsBudget
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Cost: ${(foundWeight * pricePerUnit).toFixed(2)} |
                          Budget: ${customerBudget.toFixed(2)}
                        </p>
                        {missingWeight > 0 && (
                          <p className="text-amber-600 dark:text-amber-400">
                            Missing: {missingWeight.toFixed(2)}{" "}
                            {measurementUnit} | Refund: $
                            {refundAmount.toFixed(2)}
                          </p>
                        )}
                        {missingWeight > 0 && (
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            Customer will be charged: $
                            {(foundWeight * pricePerUnit).toFixed(2)} | Refund:
                            ${refundAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-4`}
        >
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className={`flex-1 rounded-lg border-0 bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={
                foundQuantity === 0 ||
                exceedsBudget ||
                (!isWeightBased && !barcodeValidation.isValid)
              }
              className={`flex-1 rounded-lg border-0 bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500`}
            >
              Confirm Found
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
