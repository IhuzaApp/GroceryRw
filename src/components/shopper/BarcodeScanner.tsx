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
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300`}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 sm:rounded-[2.5rem] ${
          theme === "dark"
            ? "border border-gray-700 bg-gray-900/95 text-white backdrop-blur-xl"
            : "border border-gray-200 bg-white/95 text-gray-900 backdrop-blur-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 pb-6 pt-8 sm:px-8`}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity hover:opacity-100"></div>
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">
                Scan Barcode
              </h3>
              <p
                className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                Auto-Detection Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
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

        {/* Body */}
        <div className="px-6 pb-8 sm:px-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-2">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold tracking-wide">Camera Error</p>
                  <p className="text-sm font-medium opacity-80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Scanner Section */}
          <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-inner ring-1 ring-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="container h-64 w-full object-cover sm:h-[350px]"
            />

            {/* Tactical Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Dark Vignette outside frame */}
                <div className="pointer-events-none absolute -inset-96 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />

                {/* Laser Frame bounds */}
                <div className="relative h-40 w-64 overflow-hidden rounded-xl border border-white/20 sm:h-52 sm:w-80">
                  {/* Scanning Laser Beam Effect */}
                  <div className="absolute left-0 top-0 h-[30%] w-full animate-[bounce_2s_infinite] bg-gradient-to-b from-transparent via-green-400/40 to-green-400/90 shadow-[0_5px_20px_rgba(74,222,128,0.5)]" />
                </div>

                {/* Cyberpunk Corner Indicators */}
                <div className="absolute -left-2 -top-2 flex h-8 w-8">
                  <div className="h-full w-1 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <div className="h-1 w-full rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-8 w-8 flex-col items-end">
                  <div className="h-1 w-full rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <div className="h-full w-1 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                </div>
                <div className="absolute -bottom-2 -left-2 flex h-8 w-8 items-end">
                  <div className="h-full w-1 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <div className="h-1 w-full rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 flex-col items-end justify-end">
                  <div className="h-full w-1 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <div className="h-1 w-full rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                </div>
              </div>
            </div>

            {/* Tactical HUD Additions */}
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform whitespace-nowrap">
              <div className="rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  Align code inside frame
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default BarcodeScanner;
