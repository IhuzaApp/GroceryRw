import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";
import CameraCapture from "../ui/CameraCapture";

interface InvoiceProofModalProps {
  open: boolean;
  onClose: () => void;
  onProofCaptured: (imageDataUrl: string) => Promise<void>;
  orderId: string;
  orderNumber: string;
  combinedOrderIds?: string[];
  combinedOrderNumbers?: string[];
}

const InvoiceProofModal: React.FC<InvoiceProofModalProps> = ({
  open,
  onClose,
  onProofCaptured,
  orderId,
  orderNumber,
  combinedOrderIds = [],
  combinedOrderNumbers = [],
}) => {
  const { theme } = useTheme();

  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Check if component is mounted (for SSR compatibility)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCapturedImage(null);
      setUploadError(null);
      setUploading(false);
      setShowCameraCapture(false);
    }
  }, [open]);

  // Handle photo capture from CameraCapture component
  const handlePhotoCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setShowCameraCapture(false);
  };

  // Handle confirm and upload
  const handleConfirm = async () => {
    if (!capturedImage) {
      setUploadError("Please capture an invoice photo first");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Call the parent handler with the captured image
      await onProofCaptured(capturedImage);

      // Success - modal will be closed by parent
    } catch (error) {
      console.error("Error uploading invoice proof:", error);
      setUploadError("Failed to upload invoice proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading || showCameraCapture) {
      return; // Don't allow closing while uploading or camera is open
    }
    onClose();
  };

  // Don't render if not mounted or not open
  if (!isMounted || !open) return null;

  const renderContent = () => {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div
          className={`relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-[2.5rem] border shadow-2xl transition-all duration-300 sm:max-h-[90vh] sm:rounded-[3rem]`}
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Gradient */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
          {/* Header */}
          <div
            className={`flex flex-shrink-0 items-center justify-between px-6 py-6 sm:px-8 ${
              theme === "dark"
                ? "border-b border-gray-700"
                : "border-b border-gray-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className={`text-xl font-black tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {uploading ? "Uploading Proof..." : "Upload Invoice"}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {combinedOrderNumbers.length > 0
                    ? `${
                        combinedOrderNumbers.length + 1
                      } Orders: #${orderNumber}${
                        combinedOrderNumbers.length > 0
                          ? ", " + combinedOrderNumbers.join(", ")
                          : ""
                      }`
                    : `Order #${orderNumber}`}
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={handleClose}
                className={`rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Body */}
          <div
            className={`max-h-[70vh] flex-1 overflow-y-auto px-6 py-8 sm:px-8 ${
              theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white"
            }`}
          >
            <div className="space-y-4">
              {/* Capture Section */}
              {!capturedImage && !uploading && (
                <div
                  className={`rounded-xl border-2 p-6 text-center ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-900/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
                    <svg
                      className="h-12 w-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`mb-2 text-lg font-semibold ${
                      theme === "dark" ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    No Invoice Photo Yet
                  </h3>
                  <p
                    className={`mb-4 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Capture a photo of your payment receipt or invoice
                  </p>
                  <button
                    onClick={() => setShowCameraCapture(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 font-black tracking-tight text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                    TAKE INVOICE PHOTO
                  </button>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && !uploading && (
                <div
                  className={`rounded-xl border-2 p-4 ${
                    theme === "dark"
                      ? "border-green-600 bg-green-900/20"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      className={`h-5 w-5 ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <h3
                      className={`font-semibold ${
                        theme === "dark" ? "text-green-400" : "text-green-700"
                      }`}
                    >
                      Invoice Photo Captured
                    </h3>
                  </div>
                  <div className="relative mx-auto h-64 w-full overflow-hidden rounded-lg sm:h-96">
                    <Image
                      src={capturedImage}
                      alt="Invoice proof"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setShowCameraCapture(true);
                      }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all duration-200 ${
                        theme === "dark"
                          ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
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
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Retake Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Uploading State */}
              {uploading && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 h-16 w-16">
                    <div className="h-full w-full animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
                  </div>
                  <p
                    className={`text-lg font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Uploading invoice proof and generating invoice...
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Please wait, do not close this window
                  </p>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div
                  className={`rounded-lg border-l-4 p-3 text-sm ${
                    theme === "dark"
                      ? "border-red-500 bg-red-900/20 text-red-300"
                      : "border-red-500 bg-red-50 text-red-600"
                  }`}
                >
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {capturedImage && !uploading && (
            <div
              className={`flex w-full flex-col-reverse gap-3 border-t px-6 py-8 sm:flex-row sm:justify-end sm:px-10`}
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderTopColor:
                  theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
              }}
            >
              <button
                onClick={handleConfirm}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-5 font-black tracking-tight text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                CONFIRM & GENERATE INVOICE
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {createPortal(
        <>
          {renderContent()}
          {showCameraCapture && (
            <CameraCapture
              isOpen={showCameraCapture}
              onClose={() => setShowCameraCapture(false)}
              onCapture={handlePhotoCapture}
              cameraType="environment"
              title="Invoice/Receipt Photo"
            />
          )}
        </>,
        document.body
      )}
    </>
  );
};

export default InvoiceProofModal;
