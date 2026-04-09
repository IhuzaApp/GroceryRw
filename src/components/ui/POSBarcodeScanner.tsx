import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  readBarcodesFromImageData,
  type ReadResult,
  type BarcodeFormat,
  prepareZXingModule,
} from "zxing-wasm";
import { useTheme } from "../../context/ThemeContext";
import {
  Zap,
  ZapOff,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
} from "lucide-react";

interface POSBarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

const POSBarcodeScanner: React.FC<POSBarcodeScannerProps> = ({
  onBarcodeDetected,
  onClose,
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isScannedRef = useRef(false);
  const consensusRef = useRef({ code: "", count: 0 });

  const [error, setError] = useState<string | null>(null);
  const [debugStatus, setDebugStatus] = useState<string>("Initializing...");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capabilities, setCapabilities] = useState<{
    torch?: boolean;
    zoom?: boolean;
  }>({});
  const [hasVisualLines, setHasVisualLines] = useState(false);
  const [enginePulse, setEnginePulse] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Standard register beep sound
    beepRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/766/766-preview.mp3"
    );
    beepRef.current.load();
  }, []);

  const onBarcodeDetectedRef = useRef(onBarcodeDetected);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onBarcodeDetectedRef.current = onBarcodeDetected;
    onCloseRef.current = onClose;
  }, [onBarcodeDetected, onClose]);

  const stopScanner = useCallback(() => {
    // No explicit stop needed for loop-based BarcodeDetector
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!videoRef.current || !capabilities.torch) return;
    try {
      const track = (
        videoRef.current.srcObject as MediaStream
      )?.getVideoTracks()[0];
      if (track) {
        const newState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: newState } as any],
        });
        setIsTorchOn(newState);
      }
    } catch (e) {
      console.warn("Torch failed:", e);
    }
  }, [isTorchOn, capabilities]);

  const handleZoom = useCallback(
    async (value: number) => {
      if (!videoRef.current || !capabilities.zoom) return;
      try {
        const track = (
          videoRef.current.srcObject as MediaStream
        )?.getVideoTracks()[0];
        if (track) {
          await track.applyConstraints({
            advanced: [{ zoom: value } as any],
          });
          setZoomLevel(value);
        }
      } catch (e) {
        console.warn("Zoom failed:", e);
      }
    },
    [capabilities]
  );

  useEffect(() => {
    isScannedRef.current = false;
    consensusRef.current = { code: "", count: 0 };
    let isMounted = true;
    let localStream: MediaStream | null = null;
    let animationFrameId: number;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const startScanner = async () => {
      try {
        setDebugStatus("Booting WASM...");
        await prepareZXingModule();
        console.log("[SCANNER] WASM prepared.");

        console.log("[SCANNER] Requesting camera stream...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            aspectRatio: { ideal: 1.7777777778 },
          },
        });
        console.log("[SCANNER] Stream acquired successfully!");

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          const track = stream.getVideoTracks()[0];
          const caps = track.getCapabilities() as any;
          setCapabilities({
            torch: !!caps.torch,
            zoom: !!caps.zoom,
          });
        }

        let isProcessing = false;
        let frameCount = 0;
        console.log("[SCANNER] Starting optimized detection loop...");

        const scanFrame = async () => {
          if (
            !isMounted ||
            isScannedRef.current ||
            successMode ||
            isProcessing ||
            !videoRef.current ||
            !ctx
          )
            return;

          isProcessing = true;

          try {
            frameCount++;

            // Focus pulse (Silent)
            if (frameCount % 60 === 0 && capabilities.torch) {
              const track = (
                videoRef.current.srcObject as MediaStream
              )?.getVideoTracks()[0];
              if (track) {
                track
                  .applyConstraints({
                    advanced: [{ focusMode: "continuous" } as any],
                  })
                  .catch(() => {});
              }
            }

            // Use a fixed internal resolution for consistency and speed
            const targetWidth = 1280;
            const targetHeight = 720;
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Draw frame with high sharpness
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);

            // ROI: We only scan the middle 30% of the screen
            const roiH = Math.floor(targetHeight * 0.3);
            const roiY = Math.floor((targetHeight - roiH) / 2);
            const roiImageData = ctx.getImageData(0, roiY, targetWidth, roiH);

            // Render to debug canvas if visible
            if (debugCanvasRef.current) {
              const dCtx = debugCanvasRef.current.getContext("2d");
              if (dCtx) {
                debugCanvasRef.current.width = canvas.width;
                debugCanvasRef.current.height = roiH;
                dCtx.putImageData(roiImageData, 0, 0);
              }
            }

            // --- Triple-Row Line Vision Check ---
            // We check the top, middle, and bottom of the ROI for contrast
            let lineScore = 0;
            const rows = [0.25, 0.5, 0.75].map(
              (p) => Math.floor(roiH * p) * targetWidth * 4
            );

            for (const rowOffset of rows) {
              for (let x = 100; x < targetWidth - 100; x += 10) {
                const i = rowOffset + x * 4;
                const lum =
                  (roiImageData.data[i] +
                    roiImageData.data[i + 1] +
                    roiImageData.data[i + 2]) /
                  3;
                if (lum < 60 || lum > 190) lineScore++;
              }
            }
            setHasVisualLines(lineScore > 50);

            if (frameCount % 10 === 0) setEnginePulse((p) => (p + 1) % 4);

            const results = await readBarcodesFromImageData(roiImageData, {
              formats: [
                "EAN_13",
                "EAN_8",
                "UPC_A",
                "UPC_E",
                "Code_128",
                "Code_39",
                "ITF",
                "Codabar",
              ] as BarcodeFormat[],
              tryHarder: true,
              tryInverted: true, // Support for light barcodes on dark backgrounds
              maxNumberOfSymbols: 1,
            });

            if (results.length > 0) {
              const decodedText = results[0].text;
              console.log(
                `[SCANNER HIT] ${decodedText} (${results[0].format})`
              );

              if (consensusRef.current.code === decodedText) {
                consensusRef.current.count++;
                console.log(
                  `[Diagnostic] 📊 Consensus: ${consensusRef.current.count}/2 for ${decodedText}`
                );
                setDebugStatus(
                  `VERIFYING: ${decodedText} (${consensusRef.current.count}/2)`
                );
              } else {
                consensusRef.current.code = decodedText;
                consensusRef.current.count = 1;
                console.log(
                  `[Diagnostic] 🔍 Locking on new code: ${decodedText}`
                );
                setDebugStatus(`DETECTED: ${decodedText}`);
              }

              if (consensusRef.current.count >= 2) {
                console.log(`[SCANNER] ✅ SUCCESS: ${decodedText}`);
                setDebugStatus(`✅ SUCCESS: ${decodedText}`);

                // --- Professional Retail Feedback ---
                setSuccessMode(true);
                beepRef.current?.play().catch(() => {});
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  navigator.vibrate(60);
                }

                // Trigger item addition
                onBarcodeDetectedRef.current(decodedText);

                // --- Continuous Scanning Logic ---
                // Instead of closing, we wait 1.5s then reset for the next item
                setTimeout(() => {
                  if (isMounted) {
                    setSuccessMode(false);
                    consensusRef.current = { code: "", count: 0 };
                    setDebugStatus("READY - ALIGN BARCODE");
                    // We don't need to manually restart the loop because isScannedRef was never set to true
                  }
                }, 1500);

                return;
              }
            } else {
              // Frame heartbeat every 2 seconds
              if (frameCount % 120 === 0) {
                console.log(`[SCANNER] Loop alive. Frame: ${frameCount}`);
              }
              if (consensusRef.current.count === 0 && frameCount % 60 === 0) {
                setDebugStatus("READY - ALIGN BARCODE");
              }
            }
          } catch (e) {
            console.error("[SCANNER ERROR] Loop Crash:", e);
          } finally {
            isProcessing = false;
          }

          if (isMounted && !isScannedRef.current) {
            animationFrameId = requestAnimationFrame(scanFrame);
          }
        };

        // Allow camera to focus first
        setTimeout(() => {
          if (isMounted) scanFrame();
        }, 1000);
      } catch (err) {
        if (isMounted) {
          setError("Industrial engine failed to start.");
          setDebugStatus("Engine Error");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const scannerContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
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
        <div
          className={`flex items-center justify-between px-6 pb-6 pt-8 sm:px-8`}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
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
                Product Scanner
              </h3>
              <p
                className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                1D Barcode Target
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

        <div className="px-6 pb-8 sm:px-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-500 backdrop-blur-sm">
              <p className="font-bold tracking-wide">Camera Error</p>
              <p className="text-sm font-medium opacity-80">{error}</p>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-inner ring-1 ring-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-64 w-full object-cover sm:h-[450px]"
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-96 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />

                <div
                  className={`relative h-40 w-80 overflow-hidden rounded-xl border-2 shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all duration-300 ${
                    successMode
                      ? "scale-105 border-emerald-500 bg-emerald-500/10"
                      : "border-indigo-500/50"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-1/2 h-0.5 w-full shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-colors ${
                      successMode ? "bg-emerald-400" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Debug Mirror - Corner Vision */}
            {showDebug && (
              <div className="absolute left-4 top-24 z-50 overflow-hidden rounded-lg border-2 border-indigo-500 bg-black shadow-2xl">
                <div className="bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-white">
                  Engine Vision Crop
                </div>
                <canvas
                  ref={debugCanvasRef}
                  className="h-auto w-48 opacity-90 contrast-150 grayscale invert"
                />
              </div>
            )}

            {/* Laser Guideline HUD */}
            <div className="absolute right-4 top-4 z-20 flex flex-col gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDebug(!showDebug);
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-md transition-all ${
                  showDebug
                    ? "border-indigo-400 bg-indigo-500 text-white"
                    : "bg-black/40 text-white"
                }`}
                title="Toggle Debug Vision"
              >
                <Eye className="h-5 w-5" />
              </button>

              {capabilities.torch && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTorch();
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 backdrop-blur-md transition-all ${
                    isTorchOn
                      ? "border-yellow-300 bg-yellow-400 text-black"
                      : "bg-black/40 text-white"
                  }`}
                >
                  {isTorchOn ? (
                    <Zap className="h-5 w-5 fill-current" />
                  ) : (
                    <ZapOff className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {capabilities.zoom && (
              <div className="absolute left-6 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-4">
                <div className="relative h-48 w-1.5 overflow-hidden rounded-full border border-white/10 bg-black/40">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => handleZoom(parseFloat(e.target.value))}
                    className="absolute inset-0 h-full w-full rotate-180 cursor-pointer opacity-0"
                    style={
                      {
                        writingMode: "bt-lr",
                        appearance: "slider-vertical",
                      } as any
                    }
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full bg-indigo-500 transition-all"
                    style={{ height: `${((zoomLevel - 1) / 4) * 100}%` }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Maximize2 className="h-4 w-4 text-white/60" />
                  <span className="text-[10px] font-bold text-white/80">
                    {zoomLevel.toFixed(1)}x
                  </span>
                </div>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform whitespace-nowrap">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full border border-white/20 bg-black/80 px-4 py-2 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-3 rounded-sm transition-colors ${
                            enginePulse >= i ? "bg-indigo-400" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-white">
                      {debugStatus}
                    </p>
                    <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          hasVisualLines
                            ? "bg-yellow-400 shadow-[0_0_10px_#facc15]"
                            : "bg-white/10"
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase text-white/40">
                        Stripes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default POSBarcodeScanner;
