import React from 'react';
import { X, ChevronLeft } from 'lucide-react';

interface BiometricCameraModalProps {
  show: boolean;
  captureMode: 'profile' | 'license' | 'national_id_front' | 'national_id_back';
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
  isMobile = false
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500 ${isMobile ? 'p-0' : 'p-12'}`}>
      <div className={`relative w-full h-full flex flex-col ${isMobile ? '' : 'max-w-5xl'}`}>
        
        {/* Header */}
        <header className={`flex items-center justify-between text-white translate-y-0 animate-in slide-in-from-top duration-700 ${isMobile ? 'p-6' : 'mb-10'}`}>
          <div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-black tracking-tight uppercase`}>
              {captureMode === 'profile' ? 'Biometric Check' : captureMode === 'profile_photo' ? 'Shopper Profile' : 'Document Scan'}
            </h2>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest opacity-60">
              {captureMode === 'profile' ? 'Liveness Verification' : captureMode === 'profile_photo' ? 'Secure Profile Photo' : 'Position clearly'}
            </p>
          </div>
          <button 
            onClick={stopCamera} 
            className={`p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90`}
          >
            {isMobile ? <ChevronLeft className="h-6 w-6" /> : <X className="h-8 w-8" />}
          </button>
        </header>

        {/* Viewport Area */}
        <div className={`flex-1 relative overflow-hidden bg-black animate-in zoom-in duration-1000 ${
          isMobile ? '' : 'rounded-[60px] border-8 border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.15)]'
        }`}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`relative transition-all duration-700 ${
              (captureMode === 'profile' || captureMode === 'profile_photo')
                ? (isMobile ? 'w-[75%] aspect-square rounded-full' : 'w-[45%] aspect-square rounded-full')
                : (isMobile ? 'w-[90%] aspect-[3/4] rounded-2xl' : 'w-[75%] aspect-video rounded-[40px]')
            } ${ (captureMode === 'profile' || captureMode === 'profile_photo') ? 'border-2 border-green-500/50' : 'border-2 border-white/20'} shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}>
               
               {/* Corners - Only for automated scanning */}
               {captureMode === 'profile' && (
                 <>
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-3xl" />
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-3xl" />
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-3xl" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-3xl" />
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />
                 </>
               )}
               
               {/* Liveness Progress Ring */}
               {captureMode === 'profile' && (
                 <svg className="absolute inset-0 w-full h-full -rotate-90">
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

               <div className={`absolute left-0 right-0 text-center ${isMobile ? '-bottom-24' : '-bottom-16'}`}>
                  <span className={`${isMobile ? 'text-sm' : 'text-xl'} font-black text-white uppercase tracking-widest px-8 py-3 rounded-full border border-white/10 backdrop-blur-xl transition-all duration-150 ${
                    livenessStep === 'success' ? 'bg-green-500 scale-110 shadow-[0_0_40px_rgba(34,197,94,0.5)]' : 
                    livenessProgress >= 100 ? 'bg-green-600' : 
                    livenessProgress > 0 ? 'bg-green-600/60' : 'bg-black/60'
                  }`}>
                    {livenessStep === 'success' && captureMode === 'profile' ? 'Verification Complete!' : 
                     captureMode === 'profile' ? `Action: Turn ${livenessStep.charAt(0).toUpperCase() + livenessStep.slice(1)}` : 
                     captureMode === 'profile_photo' ? 'Center your face' : 'Position clearly'}
                  </span>
               </div>

               {/* Low Light Warning */}
               {lowLight && captureMode === 'profile' && (
                 <div className={`absolute left-0 right-0 text-center animate-bounce ${isMobile ? 'top-[-60px]' : 'top-10'}`}>
                   <span className="bg-yellow-500 text-black text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-full shadow-xl">
                     ⚠️ Low Light Detected
                   </span>
                 </div>
               )}
            </div>
          </div>

          {/* Verification Overlay */}
          {verificationStatus === 'verifying' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent mb-4" />
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black text-white uppercase tracking-tighter`}>
                Processing...
              </h3>
            </div>
          )}
        </div>

        {/* Footer / Shutter Button - Always for documents and manual profile photos */}
        {(captureMode !== 'profile' || livenessStep === 'success') && (
          <footer className={`${isMobile ? 'pb-24' : 'mt-12'} flex justify-center animate-in slide-in-from-bottom duration-700`}>
             <button onClick={capturePhoto} className={`group relative rounded-full border-8 border-white/10 flex items-center justify-center transition-all hover:border-white/30 active:scale-90 ${isMobile ? 'w-24 h-24' : 'w-32 h-32'}`}>
                <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] group-hover:scale-95 transition-transform`} />
                <div className="absolute -inset-4 border-2 border-green-500 rounded-full animate-ping opacity-20" />
             </button>
          </footer>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
