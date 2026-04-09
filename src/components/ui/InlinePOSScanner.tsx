import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  readBarcodesFromImageData,
  type BarcodeFormat,
  prepareZXingModule,
} from "zxing-wasm";
import { useTheme } from "../../context/ThemeContext";
import {
  Zap,
  ZapOff,
  Eye,
  Maximize2,
  Camera,
} from "lucide-react";

interface InlinePOSScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  className?: string;
}

const InlinePOSScanner: React.FC<InlinePOSScannerProps> = ({
  onBarcodeDetected,
  className = "",
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
    beepRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/766/766-preview.mp3"
    );
    beepRef.current.load();
  }, []);

  const onBarcodeDetectedRef = useRef(onBarcodeDetected);
  useEffect(() => {
    onBarcodeDetectedRef.current = onBarcodeDetected;
  }, [onBarcodeDetected]);

  const toggleTorch = useCallback(async () => {
    if (!videoRef.current || !capabilities.torch) return;
    try {
      const track = (videoRef.current.srcObject as MediaStream)?.getVideoTracks()[0];
      if (track) {
        const newState = !isTorchOn;
        await track.applyConstraints({ advanced: [{ torch: newState } as any] });
        setIsTorchOn(newState);
      }
    } catch (e) {
      console.warn("Torch failed:", e);
    }
  }, [isTorchOn, capabilities]);

  const handleZoom = useCallback(async (value: number) => {
    if (!videoRef.current || !capabilities.zoom) return;
    try {
      const track = (videoRef.current.srcObject as MediaStream)?.getVideoTracks()[0];
      if (track) {
        await track.applyConstraints({ advanced: [{ zoom: value } as any] });
        setZoomLevel(value);
      }
    } catch (e) {
      console.warn("Zoom failed:", e);
    }
  }, [capabilities]);

  useEffect(() => {
    let isMounted = true;
    let localStream: MediaStream | null = null;
    let animationFrameId: number;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const startScanner = async () => {
      try {
        setDebugStatus("Booting Engine...");
        await prepareZXingModule();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const track = stream.getVideoTracks()[0];
          const caps = track.getCapabilities() as any;
          setCapabilities({ torch: !!caps.torch, zoom: !!caps.zoom });
        }

        let isProcessing = false;
        let frameCount = 0;

        const scanFrame = async () => {
          if (!isMounted || successMode || isProcessing || !videoRef.current || !ctx) return;
          isProcessing = true;

          try {
            frameCount++;
            const targetWidth = 1280;
            const targetHeight = 720;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);

            const roiH = Math.floor(targetHeight * 0.4);
            const roiY = Math.floor((targetHeight - roiH) / 2);
            const roiImageData = ctx.getImageData(0, roiY, targetWidth, roiH);

            if (debugCanvasRef.current) {
              const dCtx = debugCanvasRef.current.getContext("2d");
              if (dCtx) {
                debugCanvasRef.current.width = canvas.width;
                debugCanvasRef.current.height = roiH;
                dCtx.putImageData(roiImageData, 0, 0);
              }
            }

            let lineScore = 0;
            const row = Math.floor(roiH * 0.5) * targetWidth * 4;
            for (let x = 100; x < targetWidth - 100; x += 15) {
              const i = row + x * 4;
              const lum = (roiImageData.data[i] + roiImageData.data[i + 1] + roiImageData.data[i + 2]) / 3;
              if (lum < 60 || lum > 190) lineScore++;
            }
            setHasVisualLines(lineScore > 30);
            if (frameCount % 10 === 0) setEnginePulse((p) => (p + 1) % 4);

            const results = await readBarcodesFromImageData(roiImageData, {
              formats: ["EAN_13", "EAN_8", "UPC_A", "UPC_E", "Code_128", "Code_39"] as BarcodeFormat[],
              tryHarder: true,
              maxNumberOfSymbols: 1,
            });

            if (results.length > 0) {
              const decodedText = results[0].text;
              if (consensusRef.current.code === decodedText) {
                consensusRef.current.count++;
              } else {
                consensusRef.current.code = decodedText;
                consensusRef.current.count = 1;
              }

              if (consensusRef.current.count >= 2) {
                setSuccessMode(true);
                beepRef.current?.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate(60);

                onBarcodeDetectedRef.current(decodedText);

                setTimeout(() => {
                  if (isMounted) {
                    setSuccessMode(false);
                    consensusRef.current = { code: "", count: 0 };
                    setDebugStatus("READY");
                  }
                }, 1000);
              }
            } else if (frameCount % 60 === 0) {
              setDebugStatus("READY");
            }
          } catch (e) {
            console.error("Scanner loop error:", e);
          } finally {
            isProcessing = false;
          }

          if (isMounted) animationFrameId = requestAnimationFrame(scanFrame);
        };

        setTimeout(() => { if (isMounted) scanFrame(); }, 500);
      } catch (err) {
        if (isMounted) setError("Could not start camera.");
      }
    };

    startScanner();
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {error ? (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-red-400">
          <Camera className="mb-2 h-8 w-8 opacity-50" />
          <p className="text-xs font-bold leading-tight">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover transition-opacity duration-700 ${
              successMode ? "opacity-40" : "opacity-100"
            }`}
          />
          
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={`h-[40%] w-[85%] rounded-xl border-2 transition-all duration-300 ${
              successMode ? "scale-105 border-green-500 bg-green-500/20" : "border-white/30"
            }`}>
              <div className={`absolute top-1/2 h-0.5 w-full transition-colors ${
                successMode ? "bg-green-400" : "bg-red-500/50"
              }`} />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 w-2 rounded-full ${enginePulse >= i ? "bg-green-400" : "bg-white/20"}`} />
              ))}
            </div>
            <span className="font-mono text-[9px] font-black uppercase tracking-tighter text-white/80">
              {debugStatus}
            </span>
          </div>

          {showDebug && (
            <canvas ref={debugCanvasRef} className="absolute left-2 top-2 h-20 w-32 rounded border border-green-500/50 object-cover opacity-80" />
          )}

          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`p-2 rounded-full backdrop-blur-md ${showDebug ? "bg-green-500 text-white" : "bg-black/40 text-white"}`}
            >
              <Eye className="h-4 w-4" />
            </button>
            {capabilities.torch && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-full backdrop-blur-md ${isTorchOn ? "bg-yellow-400 text-black" : "bg-black/40 text-white"}`}
              >
                {isTorchOn ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InlinePOSScanner;
