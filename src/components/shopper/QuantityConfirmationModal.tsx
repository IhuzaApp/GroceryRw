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
        size="md"
        className={`${theme === "dark" ? "dark-theme" : ""} rounded-2xl`}
      >
        <Modal.Header
          className={`${
            theme === "dark"
              ? "border-b border-gray-700 bg-gray-800"
              : "border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50"
          } rounded-t-2xl`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                theme === "dark" ? "bg-blue-600" : "bg-blue-100"
              }`}
            >
              <svg
                className={`h-6 w-6 ${
                  theme === "dark" ? "text-white" : "text-blue-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <Modal.Title
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Confirm Found Quantity
              </Modal.Title>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {currentItem.product.ProductName?.name || "Unknown Product"}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body
          className={`${
            theme === "dark"
              ? "bg-gray-800 text-gray-100"
              : "bg-white text-gray-900"
          } px-6 py-6`}
        >
          <div className="space-y-6">
            {/* Barcode Scanning Section - Only for non-weight-based items */}
            {!isWeightBased && (
              <div
                className={`rounded-2xl border-2 p-6 ${
                  theme === "dark"
                    ? "border-purple-600 bg-purple-900/20"
                    : "border-purple-200 bg-purple-50"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      theme === "dark" ? "bg-purple-600" : "bg-purple-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        theme === "dark" ? "text-white" : "text-purple-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {currentItem?.product.ProductName?.barcode
                        ? "Scan Barcode"
                        : currentItem?.product.ProductName?.sku
                        ? "Enter SKU"
                        : "Scan Barcode or Enter SKU"}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {currentItem?.product.ProductName?.barcode
                        ? `Scan the product barcode: ${currentItem.product.ProductName.barcode}`
                        : currentItem?.product.ProductName?.sku
                        ? `Enter the product SKU: ${currentItem.product.ProductName.sku}`
                        : "This product has no barcode/SKU in our system"}
                    </p>
                  </div>
                </div>

                {/* Card-based selection */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Open Camera Scanner Card */}
                  <div
                    onClick={() => {
                      if (
                        currentItem?.product.ProductName?.barcode ||
                        currentItem?.product.ProductName?.sku
                      ) {
                        setShowManualInput(false);
                        setShowBarcodeScanner(true);
                      }
                    }}
                    className={`rounded-xl border-2 p-5 transition-all duration-200 ${
                      !currentItem?.product.ProductName?.barcode &&
                      !currentItem?.product.ProductName?.sku
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        : showBarcodeScanner
                        ? "cursor-pointer border-purple-500 bg-purple-100 shadow-lg dark:bg-purple-900/30"
                        : "cursor-pointer border-gray-300 hover:border-purple-400 hover:shadow-md dark:border-gray-600 dark:hover:border-purple-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          showBarcodeScanner
                            ? "bg-purple-500"
                            : "bg-purple-100 dark:bg-purple-800"
                        }`}
                      >
                        <svg
                          className={`h-5 w-5 ${
                            showBarcodeScanner
                              ? "text-white"
                              : "text-purple-600 dark:text-purple-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            theme === "dark" ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          Scan with Camera
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Use your device's camera
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual Entry Card */}
                  <div
                    onClick={() => {
                      if (
                        currentItem?.product.ProductName?.barcode ||
                        currentItem?.product.ProductName?.sku
                      ) {
                        setShowBarcodeScanner(false);
                        setShowManualInput(true);
                      }
                    }}
                    className={`rounded-xl border-2 p-5 transition-all duration-200 ${
                      !currentItem?.product.ProductName?.barcode &&
                      !currentItem?.product.ProductName?.sku
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                        : showManualInput
                        ? "cursor-pointer border-green-500 bg-green-100 shadow-lg dark:bg-green-900/30"
                        : "cursor-pointer border-gray-300 hover:border-green-400 hover:shadow-md dark:border-gray-600 dark:hover:border-green-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          showManualInput
                            ? "bg-green-500"
                            : "bg-green-100 dark:bg-green-800"
                        }`}
                      >
                        <svg
                          className={`h-5 w-5 ${
                            showManualInput
                              ? "text-white"
                              : "text-green-600 dark:text-green-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            theme === "dark" ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          Enter Manually
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Type in the SKU or barcode
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual SKU Input Form */}
                {showManualInput && (
                  <div
                    className={`mt-6 rounded-xl p-4 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (manualSku.trim()) {
                          handleBarcodeScanned(manualSku.trim());
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <div
                            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <svg
                              className={`h-5 w-5 ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                              />
                            </svg>
                          </div>
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
                            className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              theme === "dark"
                                ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-green-500"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                            }`}
                          />
                        </div>
                        <button
                          type="submit"
                          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-green-500/25"
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
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Validate
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Validation Status */}
                {barcodeValidation.message && (
                  <div
                    className={`mt-6 rounded-xl border-l-4 p-4 ${
                      barcodeValidation.isValid
                        ? theme === "dark"
                          ? "border-green-500 bg-green-900/20 text-green-300"
                          : "border-green-500 bg-green-50 text-green-800"
                        : theme === "dark"
                        ? "border-red-500 bg-red-900/20 text-red-300"
                        : "border-red-500 bg-red-50 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-1 ${
                          barcodeValidation.isValid
                            ? theme === "dark"
                              ? "bg-green-600"
                              : "bg-green-100"
                            : theme === "dark"
                            ? "bg-red-600"
                            : "bg-red-100"
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 ${
                            barcodeValidation.isValid
                              ? theme === "dark"
                                ? "text-white"
                                : "text-green-600"
                              : theme === "dark"
                              ? "text-white"
                              : "text-red-600"
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
                      <div>
                        <p className="mb-1 font-semibold">
                          {barcodeValidation.isValid
                            ? "Validation Successful"
                            : "Validation Failed"}
                        </p>
                        <p className="text-sm opacity-90">
                          {barcodeValidation.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Input Section - Only show if barcode is valid or item is weight-based */}
            {(barcodeValidation.isValid || isWeightBased) && (
              <div
                className={`rounded-2xl border-2 p-6 ${
                  theme === "dark"
                    ? "border-blue-600 bg-blue-900/20"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      theme === "dark" ? "bg-blue-600" : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        theme === "dark" ? "text-white" : "text-blue-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {isWeightBased
                        ? `How much ${measurementUnit} did you find?`
                        : "How many units did you find?"}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {isWeightBased
                        ? `Enter the weight you found (0 to ${currentItem.quantity} ${measurementUnit})`
                        : `Enter the quantity you found (0 to ${currentItem.quantity})`}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-4 rounded-xl p-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="relative flex-1">
                    <div
                      className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
                    >
                      <svg
                        className={`h-5 w-5 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    </div>
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
                      className={`w-full rounded-xl border-2 py-4 pl-10 pr-4 text-center text-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                      placeholder={
                        isWeightBased ? `0.00 ${measurementUnit}` : "0"
                      }
                    />
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
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
                className={`rounded-2xl border-l-4 p-6 ${
                  foundQuantity === 0
                    ? theme === "dark"
                      ? "border-red-500 bg-red-900/20 text-red-300"
                      : "border-red-500 bg-red-50 text-red-800"
                    : exceedsBudget
                    ? theme === "dark"
                      ? "border-red-500 bg-red-900/20 text-red-300"
                      : "border-red-500 bg-red-50 text-red-800"
                    : foundQuantity === currentItem.quantity
                    ? theme === "dark"
                      ? "border-green-500 bg-green-900/20 text-green-300"
                      : "border-green-500 bg-green-50 text-green-800"
                    : theme === "dark"
                    ? "border-yellow-500 bg-yellow-900/20 text-yellow-300"
                    : "border-yellow-500 bg-yellow-50 text-yellow-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      foundQuantity === 0
                        ? theme === "dark"
                          ? "bg-red-600"
                          : "bg-red-100"
                        : exceedsBudget
                        ? theme === "dark"
                          ? "bg-red-600"
                          : "bg-red-100"
                        : foundQuantity === currentItem.quantity
                        ? theme === "dark"
                          ? "bg-green-600"
                          : "bg-green-100"
                        : theme === "dark"
                        ? "bg-yellow-600"
                        : "bg-yellow-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        foundQuantity === 0
                          ? theme === "dark"
                            ? "text-white"
                            : "text-red-600"
                          : exceedsBudget
                          ? theme === "dark"
                            ? "text-white"
                            : "text-red-600"
                          : foundQuantity === currentItem.quantity
                          ? theme === "dark"
                            ? "text-white"
                            : "text-green-600"
                          : theme === "dark"
                          ? "text-white"
                          : "text-yellow-600"
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
                    <p className="mb-1 font-semibold">
                      {foundQuantity === 0
                        ? isWeightBased
                          ? `No ${measurementUnit} Found`
                          : "No Units Found"
                        : exceedsBudget
                        ? "Budget Exceeded"
                        : foundQuantity === currentItem.quantity
                        ? isWeightBased
                          ? `All ${measurementUnit} Found`
                          : "All Units Found"
                        : isWeightBased
                        ? `Partial ${measurementUnit} Found`
                        : "Partial Quantity Found"}
                    </p>
                    <p className="text-sm opacity-90">
                      {foundQuantity === 0
                        ? "Item not found in store"
                        : exceedsBudget
                        ? `Weight exceeds budget by $${(
                            foundWeight * pricePerUnit -
                            customerBudget
                          ).toFixed(2)}`
                        : foundQuantity === currentItem.quantity
                        ? "Perfect match! All items found"
                        : isWeightBased
                        ? "Refund will be processed for missing amount"
                        : "Some items were not found"}
                    </p>
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
          className={`${
            theme === "dark"
              ? "border-t border-gray-700 bg-gray-800"
              : "border-t border-gray-200 bg-gray-50"
          } rounded-b-2xl px-6 py-4`}
        >
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                theme === "dark"
                  ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
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
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                foundQuantity === 0 ||
                exceedsBudget ||
                (!isWeightBased && !barcodeValidation.isValid)
                  ? "cursor-not-allowed bg-gray-400"
                  : theme === "dark"
                  ? "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                  : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
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
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Confirm Found
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
