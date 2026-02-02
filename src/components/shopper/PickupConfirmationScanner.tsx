"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import Tesseract from "tesseract.js";
import { useTheme } from "../../context/ThemeContext";
import { reportErrorToSlackClient } from "../../lib/reportErrorClient";

const PICKUP_SCAN_LOG = "[PickupConfirmationScanner]";

/** Normalize order ID for comparison: strip # and non-digits, compare as string */
function normalizeOrderId(value: string | number): string {
  const s = String(value).trim().replace(/^#/, "").replace(/\D/g, "");
  return s || "";
}

/**
 * Normalize OCR output for human handwriting: replace common letter/symbol confusions with digits
 * so "H8", "1B", "I8", "+18" can match "18".
 */
function normalizeOcrForHandwriting(text: string): string {
  if (!text || !text.trim()) return "";
  let s = text.trim();
  // + is often read instead of # or 1
  s = s.replace(/^\+/, "#").replace(/\s\+\s?/g, " # ");
  // Digits commonly confused with letters (handwriting/OCR)
  s = s.replace(/[HIl|]/gi, "1");  // 1
  s = s.replace(/B/gi, "8");       // 8
  s = s.replace(/[Ss]/g, "5");     // 5
  s = s.replace(/[OQ]/gi, "0");    // 0
  s = s.replace(/G/gi, "6");       // 6
  s = s.replace(/Z/gi, "2");       // 2
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
  (normalized.match(/\b\d+\b/g) || []).forEach((s) => ids.push(s.replace(/\D/g, "")));
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
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<"idle" | "match" | "no_match">(
    "idle"
  );
  const [confirming, setConfirming] = useState(false);
  const [lastOcrText, setLastOcrText] = useState<string>("");

  const expectedNormalized = normalizeOrderId(expectedOrderId);

  useEffect(() => {
    console.log(
      `${PICKUP_SCAN_LOG} Expected OrderID (normalized): "${expectedNormalized}" (raw: ${expectedOrderId})`
    );
  }, [expectedNormalized, expectedOrderId]);

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
  }, []);

  const checkMatch = useCallback(
    (source: string, raw: string) => {
      const scannedNormalized = normalizeOrderId(raw);
      console.log(
        `${PICKUP_SCAN_LOG} [${source}] raw="${raw}" normalized="${scannedNormalized}" expected="${expectedNormalized}"`
      );
      if (!scannedNormalized) return false;
      const match = scannedNormalized === expectedNormalized;
      if (match) {
        console.log(`${PICKUP_SCAN_LOG} [${source}] MATCH ✓`);
        return true;
      }
      console.log(`${PICKUP_SCAN_LOG} [${source}] no match`);
      return false;
    },
    [expectedNormalized]
  );

  // ZXing: barcode/QR
  useEffect(() => {
    isMatchRef.current = false;

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
            if (isMatchRef.current) return;

            if (result) {
              const text = result.getText().trim();
              if (checkMatch("ZXing", text)) {
                isMatchRef.current = true;
                setMatchResult("match");
              } else {
                setMatchResult("no_match");
              }
            }

            if (err && err.name !== "NotFoundException") {
              console.error(`${PICKUP_SCAN_LOG} ZXing error:`, err);
              setError("Scan error.");
            }
          }
        );
        console.log(`${PICKUP_SCAN_LOG} ZXing (barcode/QR) scanner started`);
      } catch (err) {
        reportErrorToSlackClient("PickupConfirmationScanner (camera/ZXing)", err);
        setError("Could not access the camera. Check permissions.");
      }
    };

    startScanner();
    return () => stopScanner();
  }, [expectedNormalized, stopScanner, checkMatch]);

  // OCR: written/printed numbers (e.g. "19" on paper)
  // Use recursive setTimeout instead of setInterval so we only schedule the next run
  // after the current OCR finishes — avoids stacking and reduces "[Violation] 'setTimeout' handler took Nms"
  useEffect(() => {
    ocrMountedRef.current = true;
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvasRef.current = canvas;
    let ocrRunning = false;
    const delayMs = 2500;

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
        ctx.drawImage(
          video,
          sx, sy, cropW, cropH,
          0, 0, cropW, cropH
        );
        const imageData = canvas.toDataURL("image/png");

        const {
          data: { text },
        } = await Tesseract.recognize(imageData, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text" && m.progress === 1) {
              console.log(`${PICKUP_SCAN_LOG} OCR done`);
            }
          },
        });

        if (!ocrMountedRef.current || isMatchRef.current) return;

        const rawText = (text || "").trim();
        if (rawText) {
          setLastOcrText(rawText);
          console.log(`${PICKUP_SCAN_LOG} [OCR] raw text: "${rawText}"`);

          const normalizedForHandwriting = normalizeOcrForHandwriting(rawText);
          if (normalizedForHandwriting !== rawText) {
            console.log(`${PICKUP_SCAN_LOG} [OCR] after handwriting norm: "${normalizedForHandwriting}"`);
          }

          const idsRaw = extractOrderIdsFromText(rawText);
          const idsNorm = extractOrderIdsFromText(normalizedForHandwriting);
          const ids = Array.from(
            new Set<string>([...idsRaw, ...idsNorm])
          );
          console.log(`${PICKUP_SCAN_LOG} [OCR] extracted ids:`, ids, `(expected: "${expectedNormalized}")`);

          for (const id of ids) {
            if (normalizeOrderId(id) === expectedNormalized) {
              console.log(`${PICKUP_SCAN_LOG} [OCR] MATCH ✓ id="${id}"`);
              isMatchRef.current = true;
              setMatchResult("match");
              break;
            }
          }
          if (!isMatchRef.current && ids.length > 0 && ids.join("") === expectedNormalized) {
            console.log(`${PICKUP_SCAN_LOG} [OCR] MATCH ✓ joined ids="${ids.join("")}"`);
            isMatchRef.current = true;
            setMatchResult("match");
          }
          if (!isMatchRef.current && ids.length > 0) {
            setMatchResult("no_match");
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
    console.log(
      `${PICKUP_SCAN_LOG} OCR started (next run after each completion, delay ${delayMs}ms)`
    );

    return () => {
      ocrMountedRef.current = false;
      if (ocrTimeoutRef.current) {
        clearTimeout(ocrTimeoutRef.current);
        ocrTimeoutRef.current = null;
      }
      canvasRef.current = null;
    };
  }, [expectedNormalized]);

  const handleConfirm = async () => {
    if (matchResult !== "match") return;
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-md rounded-t-2xl border-0 shadow-2xl sm:rounded-2xl sm:border ${
          theme === "dark"
            ? "bg-gray-800 text-white sm:border-gray-700"
            : "bg-white text-gray-900 sm:border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-6 py-6 sm:px-8 ${
            theme === "dark"
              ? "border-b border-gray-700"
              : "border-b border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                theme === "dark" ? "bg-green-600" : "bg-green-100"
              }`}
            >
              <svg
                className={`h-6 w-6 ${
                  theme === "dark" ? "text-white" : "text-green-600"
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
              <h3 className="text-xl font-bold">Confirm pickup</h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Scan #OrderID only (e.g. #19) — number must start with #
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
        </div>

        <div
          className={`max-h-[70vh] overflow-y-auto px-6 py-8 sm:px-8 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {error && (
            <div
              className={`mb-4 rounded-xl border-l-4 p-4 ${
                theme === "dark"
                  ? "border-red-500 bg-red-900/20 text-red-300"
                  : "border-red-500 bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="relative overflow-hidden rounded-xl bg-gray-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-48 w-full object-cover sm:h-56"
            />
            {/* Center scan zone (matches OCR crop: 60% x 50%) - show #OrderID here */}
            <div
              className="absolute left-1/2 top-1/2 flex h-[50%] w-[60%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/70 bg-black/20"
              aria-hidden
            >
              <span className="text-center text-sm font-medium text-white/90">
                #OrderID
              </span>
              <span className="mt-1 text-center text-xs text-white/70">
                e.g. #{expectedNormalized}
              </span>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white">
              Hold <strong>#{expectedNormalized}</strong> (always start with #) inside the frame
            </div>
          </div>

          {lastOcrText && matchResult === "idle" && (
            <p
              className={`mt-2 text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Last read: &quot;{lastOcrText}&quot;
            </p>
          )}

          {matchResult === "match" && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                theme === "dark"
                  ? "border-green-600 bg-green-900/20 text-green-300"
                  : "border-green-500 bg-green-50 text-green-800"
              }`}
            >
              <p className="font-semibold">Order # matches. Confirm pickup?</p>
            </div>
          )}
          {matchResult === "no_match" && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                theme === "dark"
                  ? "border-red-500 bg-red-900/20 text-red-300"
                  : "border-red-500 bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm">
                Order number does not match. Show <strong>#OrderID</strong> (e.g. #{expectedNormalized}) — always start with #.
              </p>
            </div>
          )}
        </div>

        <div
          className={`flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 ${
            theme === "dark"
              ? "border-t border-gray-700"
              : "border-t border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold ${
              theme === "dark"
                ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          {matchResult === "match" && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? "Confirming…" : "Confirm pickup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default PickupConfirmationScanner;
