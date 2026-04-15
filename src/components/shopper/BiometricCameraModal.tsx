import React from "react";
import { X, ChevronLeft } from "lucide-react";

interface BiometricCameraModalProps {
  show: boolean;
  captureMode: "profile" | "license" | "national_id_front" | "national_id_back";
  livenessStep: string;
  livenessProgress: number;
  lowLight: boolean;
  verificationStatus: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stopCamera: () => void;
  capturePhoto: () => void;
  isMobile?: boolean;
}

export const BiometricCameraModal: React.FC<BiometricCameraModalProps> = ({
  show,
  captureMode,
  livenessStep,
  livenessProgress,
  lowLight,
  verificationStatus,
  videoRef,
  canvasRef,
  stopCamera,
  capturePhoto,
  isMobile = false,
}) => {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl duration-500 animate-in fade-in ${
        isMobile ? "p-0" : "p-12"
      }`}
    >
      <div
        className={`relative flex h-full w-full flex-col ${
          isMobile ? "" : "max-w-5xl"
        }`}
      >
        {/* Header */}
        <header
          className={`flex translate-y-0 items-center justify-between text-white duration-700 animate-in slide-in-from-top ${
            isMobile ? "p-6" : "mb-10"
          }`}
        >
          <div>
            <h2
              className={`${
                isMobile ? "text-xl" : "text-3xl"
              } font-black uppercase tracking-tight`}
            >
              {captureMode === "profile"
                ? "Biometric Check"
                : captureMode === "profile_photo"
                ? "Shopper Profile"
                : "Document Scan"}
            </h2>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 opacity-60">
              {captureMode === "profile"
                ? "Liveness Verification"
                : captureMode === "profile_photo"
                ? "Secure Profile Photo"
                : "Position clearly"}
            </p>
          </div>
          <button
            onClick={stopCamera}
            className={`rounded-full bg-white/10 p-4 transition-all hover:bg-white/20 active:scale-90`}
          >
            {isMobile ? (
              <ChevronLeft className="h-6 w-6" />
            ) : (
              <X className="h-8 w-8" />
            )}
          </button>
        </header>

        {/* Viewport Area */}
        <div
          className={`relative flex-1 overflow-hidden bg-black duration-1000 animate-in zoom-in ${
            isMobile
              ? ""
              : "rounded-[60px] border-8 border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.15)]"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full scale-x-[-1] object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`relative transition-all duration-700 ${
                captureMode === "profile" || captureMode === "profile_photo"
                  ? isMobile
                    ? "aspect-square w-[75%] rounded-full"
                    : "aspect-square w-[45%] rounded-full"
                  : isMobile
                  ? "aspect-[3/4] w-[90%] rounded-2xl"
                  : "aspect-video w-[75%] rounded-[40px]"
              } ${
                captureMode === "profile" || captureMode === "profile_photo"
                  ? "border-2 border-green-500/50"
                  : "border-2 border-white/20"
              } shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}
            >
              {/* Corners - Only for automated scanning */}
              {captureMode === "profile" && (
                <>
                  <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-green-500" />
                  <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-green-500" />
                  <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-green-500" />
                  <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-green-500" />
                  <div className="animate-scan absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                </>
              )}

              {/* Liveness Progress Ring */}
              {captureMode === "profile" && (
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="280"
                    strokeDashoffset={280 - (livenessProgress / 100) * 280}
                    className="text-green-500 transition-all duration-300"
                  />
                </svg>
              )}

              <div
                className={`absolute left-0 right-0 text-center ${
                  isMobile ? "-bottom-24" : "-bottom-16"
                }`}
              >
                <span
                  className={`${
                    isMobile ? "text-sm" : "text-xl"
                  } rounded-full border border-white/10 px-8 py-3 font-black uppercase tracking-widest text-white backdrop-blur-xl transition-all duration-150 ${
                    livenessStep === "success"
                      ? "scale-110 bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                      : livenessProgress >= 100
                      ? "bg-green-600"
                      : livenessProgress > 0
                      ? "bg-green-600/60"
                      : "bg-black/60"
                  }`}
                >
                  {livenessStep === "success" && captureMode === "profile"
                    ? "Verification Complete!"
                    : captureMode === "profile"
                    ? `Action: Turn ${
                        livenessStep.charAt(0).toUpperCase() +
                        livenessStep.slice(1)
                      }`
                    : captureMode === "profile_photo"
                    ? "Center your face"
                    : "Position clearly"}
                </span>
              </div>

              {/* Low Light Warning */}
              {lowLight && captureMode === "profile" && (
                <div
                  className={`absolute left-0 right-0 animate-bounce text-center ${
                    isMobile ? "top-[-60px]" : "top-10"
                  }`}
                >
                  <span className="rounded-full bg-yellow-500 px-4 py-2 text-[10px] font-black uppercase tracking-tighter text-black shadow-xl">
                    ⚠️ Low Light Detected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Overlay */}
          {verificationStatus === "verifying" && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              <h3
                className={`${
                  isMobile ? "text-lg" : "text-2xl"
                } font-black uppercase tracking-tighter text-white`}
              >
                Processing...
              </h3>
            </div>
          )}
        </div>

        {/* Footer / Shutter Button - Always for documents and manual profile photos */}
        {(captureMode !== "profile" || livenessStep === "success") && (
          <footer
            className={`${
              isMobile ? "pb-24" : "mt-12"
            } flex justify-center duration-700 animate-in slide-in-from-bottom`}
          >
            <button
              onClick={capturePhoto}
              className={`group relative flex items-center justify-center rounded-full border-8 border-white/10 transition-all hover:border-white/30 active:scale-90 ${
                isMobile ? "h-24 w-24" : "h-32 w-32"
              }`}
            >
              <div
                className={`${
                  isMobile ? "h-16 w-16" : "h-20 w-20"
                } rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-transform group-hover:scale-95`}
              />
              <div className="absolute -inset-4 animate-ping rounded-full border-2 border-green-500 opacity-20" />
            </button>
          </footer>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
