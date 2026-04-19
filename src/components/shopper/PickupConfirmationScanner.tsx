"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import Tesseract from "tesseract.js";
import { useTheme } from "../../context/ThemeContext";
import { reportErrorToSlackClient } from "../../lib/reportErrorClient";

const SCAN_DEBUG = true; // Set to false to disable scan logs
// Errors are reported via reportErrorToSlackClient -> /api/report-error -> logErrorToSlack (slackErrorReporter)

/** Normalize order ID for comparison: strip # and non-digits, compare as string */
function normalizeOrderId(value: string | number): string {
  if (value === undefined || value === null) return "";
  const s = String(value).trim().replace(/^#/, "").replace(/\D/g, "");
  return s || "";
}

/**
 * Preprocess image for OCR: grayscale, contrast, and scaling.
 * Helps Tesseract recognize handwriting much better.
 */
function preprocessImage(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Grayscale + Contrast boost
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    // Simple high-contrast thresholding or curve
    const contrast = 1.2;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const newVal = factor * (avg - 128) + 128;

    data[i] = newVal;
    data[i + 1] = newVal;
    data[i + 2] = newVal;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Normalize OCR output for human handwriting: replace common letter/symbol confusions with digits
 */
function normalizeOcrForHandwriting(text: string): string {
  if (!text || !text.trim()) return "";
  let s = text.trim();

  // Clean separators
  s = s.replace(/^\+/, "#").replace(/\s\+\s?/g, " # ");

  // Visual confusions (OCR vs Handwriting)
  s = s.replace(/[HIl|!]/gi, "1"); // 1
  s = s.replace(/[B8]/gi, "8"); // 8 (sometimes 8 is read as B or vice versa)
  s = s.replace(/[Ss]/g, "5"); // 5
  s = s.replace(/[OQ0D]/gi, "0"); // 0
  s = s.replace(/[G6]/gi, "6"); // 6
  s = s.replace(/[Zz2]/gi, "2"); // 2
  s = s.replace(/[Aa4]/gi, "4"); // 4
  s = s.replace(/[Tt7]/gi, "7"); // 7

  return s;
}

/** Extract possible order IDs from OCR text: digits, #digits, standalone numbers, or all digits concatenated */
function extractOrderIdsFromText(text: string): string[] {
  if (!text || !text.trim()) return [];
  const normalized = text.trim();
  const ids: string[] = [];
  // #number
  (normalized.match(/#\s*\d+/g) || []).forEach((s) =>
    ids.push(s.replace(/#\s*/g, "").replace(/\D/g, ""))
  );
  // Standalone numbers (e.g. "19" or "1" "9")
  (normalized.match(/\b\d+\b/g) || []).forEach((s) =>
    ids.push(s.replace(/\D/g, ""))
  );
  // All digits in order concatenated (e.g. "1 9" or "1 9 1" -> "19" or "191")
  const digitsOnly = normalized.replace(/\D/g, "");
  if (digitsOnly) ids.push(digitsOnly);
  const seen = new Set<string>();
  return ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export interface PickupConfirmationScannerProps {
  /** Expected OrderID (reel_orders.OrderID or restaurant_orders.OrderID) - number or string */
  expectedOrderId: string | number;
  onConfirm: () => void;
  onClose: () => void;
}

const PickupConfirmationScanner: React.FC<PickupConfirmationScannerProps> = ({
  expectedOrderId,
  onConfirm,
  onClose,
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const isMatchRef = useRef(false);
  const ocrTimeoutRef = useRef<number | null>(null);
  const ocrMountedRef = useRef(true);
  const scannerStartedRef = useRef(false); // Prevent double start (e.g. Strict Mode) → avoids video play() interrupted
  const ocrWorkerRef = useRef<Tesseract.Worker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<"idle" | "match" | "no_match">(
    "idle"
  );
  const [confirming, setConfirming] = useState(false);
  const [lastOcrText, setLastOcrText] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualId, setManualId] = useState("");
  const [showManualButton, setShowManualButton] = useState(false);

  const expectedNormalized = normalizeOrderId(expectedOrderId);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (ocrTimeoutRef.current) {
      clearTimeout(ocrTimeoutRef.current);
      ocrTimeoutRef.current = null;
    }
    ocrMountedRef.current = false;
    // Do not clear scannerStartedRef here so a double effect run (e.g. Strict Mode) does not start the stream again and cause "play() interrupted"
  }, []);

  const checkMatch = useCallback(
    (source: string, raw: string) => {
      const scannedNormalized = normalizeOrderId(raw);
      if (!scannedNormalized) return false;
      return scannedNormalized === expectedNormalized;
    },
    [expectedNormalized]
  );

  // ZXing: barcode/QR — single start to avoid "play() interrupted by new load request"
  useEffect(() => {
    isMatchRef.current = false;

    const startScanner = async () => {
      if (!videoRef.current) return;
      if (scannerStartedRef.current) {
        if (SCAN_DEBUG)
          console.log("[PickupScan] ZXing skipped (already started)");
        return;
      }

      const reader = new BrowserMultiFormatReader();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        scannerStartedRef.current = true;
        controlsRef.current = await reader.decodeFromStream(
          stream,
          videoRef.current,
          (result, err) => {
            if (isMatchRef.current) return;

            if (result) {
              const text = result.getText().trim();
              const scannedNorm = normalizeOrderId(text);
              const matched = checkMatch("ZXing", text);
              if (SCAN_DEBUG) {
                console.log("[PickupScan] ZXing:", {
                  raw: text,
                  normalized: scannedNorm,
                  expected: expectedNormalized,
                  match: matched,
                });
              }
              if (matched) {
                isMatchRef.current = true;
                setMatchResult("match");
              } else {
                setMatchResult("no_match");
              }
            }

            if (err && err.name !== "NotFoundException") {
              reportErrorToSlackClient(
                "PickupConfirmationScanner (ZXing)",
                err,
                {
                  name: err?.name,
                  expectedOrderId: expectedOrderId,
                }
              );
              setError("Scan error.");
            }
          }
        );
      } catch (err) {
        scannerStartedRef.current = false;
        reportErrorToSlackClient(
          "PickupConfirmationScanner (camera/ZXing)",
          err
        );
        setError("Could not access the camera. Check permissions.");
      }
    };

    startScanner();
    return () => stopScanner();
  }, [expectedNormalized, stopScanner, checkMatch]);

  // OCR: written/printed numbers (e.g. "19" on paper) — focus on digits and # only
  // Use recursive setTimeout so we only schedule the next run after the current OCR finishes
  useEffect(() => {
    ocrMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvasRef.current = canvas;
    let ocrRunning = false;
    const delayMs = 2500;

    // Worker with whitelist so OCR focuses on QR/number content only (digits + #)
    const getWorker = async () => {
      if (ocrWorkerRef.current) return ocrWorkerRef.current;
      const w = await Tesseract.createWorker("eng", 1, { logger: () => {} });
      ocrWorkerRef.current = w;
      return w;
    };

    const runOcr = async () => {
      if (!ocrMountedRef.current || isMatchRef.current) return;
      if (ocrRunning || video.readyState < 2) {
        scheduleNext();
        return;
      }

      ocrRunning = true;
      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const cropW = Math.floor(vw * 0.6);
        const cropH = Math.floor(vh * 0.5);
        const sx = Math.floor((vw - cropW) / 2);
        const sy = Math.floor((vh - cropH) / 2);

        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          ocrRunning = false;
          scheduleNext();
          return;
        }
        ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH);

        // APPLY PREPROCESSING
        preprocessImage(canvas, ctx);

        const imageData = canvas.toDataURL("image/png");

        const worker = await getWorker();
        const {
          data: { text },
        } = await worker.recognize(imageData, {
          tessedit_char_whitelist: "0123456789#",
        } as Tesseract.RecognizeOptions & { tessedit_char_whitelist?: string });

        if (!ocrMountedRef.current || isMatchRef.current) return;

        const rawText = (text || "").trim();
        if (rawText) {
          setLastOcrText(rawText);

          const normalizedForHandwriting = normalizeOcrForHandwriting(rawText);
          const idsRaw = extractOrderIdsFromText(rawText);
          const idsNorm = extractOrderIdsFromText(normalizedForHandwriting);
          const ids = Array.from(new Set<string>([...idsRaw, ...idsNorm]));

          let matched = false;
          for (const id of ids) {
            if (normalizeOrderId(id) === expectedNormalized) {
              isMatchRef.current = true;
              setMatchResult("match");
              matched = true;
              break;
            }
          }
          if (
            !isMatchRef.current &&
            ids.length > 0 &&
            ids.join("") === expectedNormalized
          ) {
            isMatchRef.current = true;
            setMatchResult("match");
            matched = true;
          }
          if (!isMatchRef.current && ids.length > 0) {
            setMatchResult("no_match");
          }

          if (SCAN_DEBUG) {
            console.log("[PickupScan] OCR:", {
              raw: rawText,
              normalizedHandwriting: normalizedForHandwriting,
              extractedIds: ids,
              expected: expectedNormalized,
              match: matched || isMatchRef.current,
            });
          }
        }
      } catch (err) {
        reportErrorToSlackClient("PickupConfirmationScanner (OCR)", err);
      } finally {
        ocrRunning = false;
        scheduleNext();
      }
    };

    function scheduleNext() {
      if (!ocrMountedRef.current || isMatchRef.current) return;
      ocrTimeoutRef.current = window.setTimeout(runOcr, delayMs);
    }

    // Start first run after a short delay so video is ready
    ocrTimeoutRef.current = window.setTimeout(runOcr, 800);

    return () => {
      ocrMountedRef.current = false;
      if (ocrTimeoutRef.current) {
        clearTimeout(ocrTimeoutRef.current);
        ocrTimeoutRef.current = null;
      }
      canvasRef.current = null;
      if (ocrWorkerRef.current) {
        ocrWorkerRef.current.terminate().catch(() => {});
        ocrWorkerRef.current = null;
      }
    };
  }, [expectedNormalized]);

  // Show manual button after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowManualButton(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = async () => {
    const isManualMatch =
      showManualInput && normalizeOrderId(manualId) === expectedNormalized;
    if (matchResult !== "match" && !isManualMatch) return;
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      reportErrorToSlackClient(
        "PickupConfirmationScanner (handleConfirm)",
        err,
        {
          expectedOrderId: expectedOrderId,
        }
      );
      setError("Failed to confirm pickup.");
    } finally {
      setConfirming(false);
    }
  };

  const scannerContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-md transform overflow-hidden rounded-t-[2.5rem] border-0 transition-all duration-300 sm:rounded-[2.5rem] sm:border ${
          theme === "dark"
            ? "border-white/10 bg-[#0A0A0A]/90 text-white"
            : "border-black/5 bg-white/90 text-gray-900"
        } shadow-2xl backdrop-blur-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Laser Style */}
        <style jsx>{`
          @keyframes scan {
            0% {
              top: 0%;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
          .scanning-line {
            height: 2px;
            width: 100%;
            background: linear-gradient(
              to right,
              transparent,
              #10b981,
              transparent
            );
            position: absolute;
            z-index: 20;
            box-shadow: 0 0 15px #10b981;
            animation: scan 2s linear infinite;
          }
          .cyber-corner {
            position: absolute;
            width: 24px;
            height: 24px;
            border-color: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pb-4 pt-8">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner`}
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">
                Verify Pickup
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 opacity-80">
                OCR Scanner Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
              theme === "dark"
                ? "bg-white/5 text-white/40 hover:text-white"
                : "bg-black/5 text-black/40 hover:text-black"
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

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500 backdrop-blur-sm">
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {!showManualInput ? (
            <div className="space-y-6">
              {/* Camera Container */}
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-black shadow-2xl ring-1 ring-white/10">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover opacity-80"
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="relative h-full w-full">
                    {/* Scanning Line */}
                    {!isMatchRef.current && <div className="scanning-line" />}

                    {/* Corners */}
                    <div className="cyber-corner left-0 top-0 rounded-tl-xl border-l-4 border-t-4" />
                    <div className="cyber-corner right-0 top-0 rounded-tr-xl border-r-4 border-t-4" />
                    <div className="cyber-corner bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4" />
                    <div className="cyber-corner bottom-0 right-0 rounded-br-xl border-b-4 border-r-4" />

                    {/* Center Target */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-brightness-125">
                      <span
                        className={`text-2xl font-black tracking-tighter transition-all duration-300 ${
                          matchResult === "match"
                            ? "scale-125 text-emerald-500"
                            : "text-white/40"
                        }`}
                      >
                        #{expectedNormalized}
                      </span>
                      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/60">
                        Align with receipt
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status HUD Badge */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                      {matchResult === "match"
                        ? "Order Verified"
                        : "Ready to Scan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              <div className="text-center">
                {matchResult === "no_match" ? (
                  <p className="animate-pulse text-xs font-bold text-red-400">
                    Keep order ID inside the target zone
                  </p>
                ) : matchResult === "match" ? (
                  <p className="text-xs font-bold text-emerald-500">
                    Match confirmed. Proceed to pickup.
                  </p>
                ) : (
                  <p
                    className={`text-xs font-bold opacity-40 ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    Scanning for #{expectedNormalized}...
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Manual Input Form */
            <div className="space-y-6 pt-4">
              <div className="text-center">
                <h4 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
                  Manual Entry
                </h4>
                <p
                  className={`text-xs opacity-60 ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  Enter order number exactly as seen on receipt
                </p>
              </div>

              <div
                className={`relative overflow-hidden rounded-[2rem] border p-8 ${
                  theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-black/5 bg-black/5"
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                    Required ID
                  </span>
                  <span className="text-3xl font-black tracking-tighter text-emerald-500">
                    #{expectedNormalized}
                  </span>
                </div>

                <div className="mt-8">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Enter Order #"
                    className={`w-full bg-transparent text-center text-2xl font-black tracking-tighter focus:outline-none ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  />
                  <div
                    className={`mx-auto mt-2 h-1 w-24 rounded-full ${
                      manualId
                        ? "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        : "bg-white/10"
                    }`}
                  />
                </div>
              </div>

              {manualId &&
                normalizeOrderId(manualId) !== expectedNormalized && (
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-red-500">
                    ID mismatch - try again
                  </p>
                )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3">
            {matchResult === "match" ||
            (showManualInput &&
              normalizeOrderId(manualId) === expectedNormalized) ? (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-emerald-600 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {confirming ? "Verifying..." : "Confirm Pickup"}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            ) : (
              !showManualInput &&
              showManualButton && (
                <button
                  onClick={() => setShowManualInput(true)}
                  className={`w-full rounded-[1.5rem] border py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 ${
                    theme === "dark"
                      ? "border-white/10 text-white/40 hover:text-white"
                      : "border-black/5 text-black/40 hover:text-black"
                  }`}
                >
                  Enter Manually
                </button>
              )
            )}

            {showManualInput && (
              <button
                onClick={() => {
                  setShowManualInput(false);
                  setManualId("");
                }}
                className={`w-full py-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Back to Scanner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default PickupConfirmationScanner;
