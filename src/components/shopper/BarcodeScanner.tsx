import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { useTheme } from "../../context/ThemeContext"; // Import useTheme

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  onClose,
}) => {
  const { theme } = useTheme(); // Get theme context
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const isScannedRef = useRef(false); // Guard flag to prevent multiple scans
  const [error, setError] = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    isScannedRef.current = false; // Reset guard flag on each mount

    const startScanner = async () => {
      if (!videoRef.current) return;

      const reader = new BrowserMultiFormatReader();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        controlsRef.current = await reader.decodeFromStream(
          stream,
          videoRef.current,
          (result, err) => {
            // Immediately exit if a scan has already been processed.
            if (isScannedRef.current) {
              return;
            }

            if (result) {
              // Set the guard flag IMMEDIATELY to prevent re-entry.
              isScannedRef.current = true;

              stopScanner();
              onBarcodeDetected(result.getText());
              onClose();
            }

            if (err && err.name !== "NotFoundException") {
              console.error("📷 Barcode detection error:", err);
              setError("An error occurred while scanning.");
            }
          }
        );
      } catch (err) {
        console.error("📷 Failed to start scanner:", err);
        setError("Could not access the camera. Please check permissions.");
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onBarcodeDetected, onClose, stopScanner]);

  const scannerContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4 sm:p-6"
      style={{ zIndex: 999999 }}
    >
      <div
        className={`relative mx-auto w-full max-w-md rounded-2xl ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } shadow-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${theme === "dark" ? "bg-purple-600" : "bg-purple-100"}`}>
              <svg className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Scan Barcode</h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Position barcode within the frame
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mx-6 mt-4 rounded-xl border-l-4 p-4 ${
            theme === "dark" 
              ? "border-red-500 bg-red-900/20 text-red-300" 
              : "border-red-500 bg-red-50 text-red-800"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-1 rounded-full ${theme === "dark" ? "bg-red-600" : "bg-red-100"}`}>
                <svg className={`w-4 h-4 ${theme === "dark" ? "text-white" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold mb-1">Camera Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Scanner Section */}
        <div className="p-6">
          <div className="relative overflow-hidden rounded-xl bg-gray-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-64 w-full object-cover sm:h-80"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="h-48 w-64 rounded-lg border-2 border-white opacity-80 sm:h-56 sm:w-80" />
                
                {/* Corner Indicators */}
                <div className="absolute -top-1 -left-1 h-6 w-6 border-l-4 border-t-4 border-white opacity-90" />
                <div className="absolute -top-1 -right-1 h-6 w-6 border-r-4 border-t-4 border-white opacity-90" />
                <div className="absolute -bottom-1 -left-1 h-6 w-6 border-l-4 border-b-4 border-white opacity-90" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 border-r-4 border-b-4 border-white opacity-90" />
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Scanning Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className={`rounded-lg px-4 py-2 ${
                theme === "dark" ? "bg-gray-800/90 text-white" : "bg-white/90 text-gray-900"
              } shadow-lg`}>
                <p className="text-sm font-medium text-center">
                  📱 Point camera at barcode
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-6 border-t ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700 border border-gray-600"
                : "text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default BarcodeScanner;
