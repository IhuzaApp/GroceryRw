import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const cancelledRef = useRef(false);
  const scannedRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    initializeScanner();
    return () => {
      console.log('📷 Component unmounting - cleaning up camera...');
      destroyScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      console.log('📷 Initializing barcode scanner with @zxing/browser...');
      
      // Reset flags
      cancelledRef.current = false;
      scannedRef.current = false;
      
      // Get available cameras
      await getAvailableCameras();
      
      // Create the browser reader with optimized settings
      readerRef.current = new BrowserMultiFormatReader();
      
      // Start scanning from video device with optimized camera settings
      await readerRef.current.decodeFromVideoDevice(
        selectedCamera || undefined, // Use selected camera or default
        videoRef.current!,
        (result, err) => {
          // ✅ Cancel future scans immediately if cancelled, destroyed, or processing
          if (cancelledRef.current || isDestroyed || isProcessing) {
            return;
          }
          
          if (result) {
            const barcode = result.getText();
            const format = result.getBarcodeFormat();
            
            // ✅ Prevent duplicate scans with scannedRef
            if (scannedRef.current) {
              console.log('📷 Skipping duplicate scan:', barcode);
              return;
            }
            
            // Prevent duplicate scans and multiple processing
            if (barcode !== lastScannedBarcode && !isProcessing && !isDestroyed) {
              console.log('📷 Barcode detected:', barcode);
              console.log('📷 Format:', format);
              
              // ✅ Mark as scanned immediately to prevent duplicates
              scannedRef.current = true;
              setIsProcessing(true);
              setLastScannedBarcode(barcode);
              
              // ✅ Cancel future scans before calling anything
              cancelledRef.current = true;
              
              // Provide feedback
              provideScanFeedback();
              
              // Immediately destroy scanner and close modal
              destroyScanner();
              onBarcodeDetected(barcode);
              onClose();
            }
          }
          
          if (err && err.name !== 'NotFoundException') {
            console.error('📷 Detection error:', err);
          }
        }
      );
      
      setIsScanning(true);
      setError(null);
      console.log('📷 Barcode scanner started successfully');
      
    } catch (err) {
      console.error('📷 Scanner initialization failed:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // Auto-select rear camera if available
      const rearCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      
      if (rearCamera) {
        setSelectedCamera(rearCamera.deviceId);
      }
      
      console.log('📷 Available cameras:', cameras.length);
    } catch (err) {
      console.error('📷 Failed to get cameras:', err);
    }
  };

  const provideScanFeedback = () => {
    // Audio feedback
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio errors
      });
    } catch (err) {
      // Ignore audio errors
    }
    
    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const toggleTorch = async () => {
    if (!readerRef.current) return;
    
    try {
      // Note: Torch support varies by device and browser
      // Check if setTorch method exists
      if ('setTorch' in readerRef.current) {
        if (torchEnabled) {
          await (readerRef.current as any).setTorch(false);
          setTorchEnabled(false);
        } else {
          await (readerRef.current as any).setTorch(true);
          setTorchEnabled(true);
        }
      } else {
        console.log('📷 Torch not supported on this device');
      }
    } catch (err) {
      console.log('📷 Torch not supported on this device');
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length < 2) return;
    
    const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    setSelectedCamera(nextCamera.deviceId);
    
    // Restart scanner with new camera
    destroyScanner();
    setTimeout(() => {
      initializeScanner();
    }, 500);
  };

  const destroyScanner = () => {
    console.log('📷 Destroying barcode scanner...');
    
    try {
      // ✅ Set cancelled flag immediately to prevent any further callbacks
      cancelledRef.current = true;
      scannedRef.current = true;
      setIsDestroyed(true);
      setIsProcessing(true);
      setIsScanning(false);
      
      // ✅ Stop continuous decode loop first
      if (readerRef.current) {
        console.log('📷 Stopping continuous decode...');
        // Try to stop continuous decode if method exists
        if ('stopContinuousDecode' in readerRef.current) {
          (readerRef.current as any).stopContinuousDecode();
        }
        // Try to reset if method exists
        if ('reset' in readerRef.current) {
          (readerRef.current as any).reset();
        }
        readerRef.current = null;
      }
      
      // Stop video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        console.log('📷 Stopping video stream tracks...');
        stream.getTracks().forEach(track => {
          console.log('📷 Stopping track:', track.kind, track.label);
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
      
      // Aggressively stop all camera streams
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          console.log('📷 Stopping all camera streams...');
          stream.getTracks().forEach(track => {
            track.stop();
          });
        })
        .catch(err => {
          console.log('📷 No active camera streams to stop');
        });
      
      // Stop any active camera stream for selected device
      if (selectedCamera) {
        navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } })
          .then(stream => {
            console.log('📷 Stopping selected camera stream...');
            stream.getTracks().forEach(track => {
              track.stop();
            });
          })
          .catch(err => {
            console.log('📷 No active selected camera stream to stop');
          });
      }
      
      // Force garbage collection hint
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      }
      
      // Clear any remaining references
      setSelectedCamera('');
      setAvailableCameras([]);
      
      console.log('📷 Scanner destroyed completely - camera released');
    } catch (err) {
      console.error('❌ Failed to destroy scanner:', err);
    }
  };

  const handleClose = () => {
    destroyScanner();
    onClose();
  };

  const scannerContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative" style={{ zIndex: 999999 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Barcode</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-900 rounded"
            />
            
            {/* Simple scanning indicator - no restrictive frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Large scanning area indicator */}
                <div className="h-48 w-80 border border-white border-dashed rounded-lg opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-sm font-medium">📷</div>
                      <div className="text-xs mt-1">Point camera at barcode</div>
                    </div>
                  </div>
                </div>
                
                {/* Scanning animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-400 animate-pulse opacity-75"></div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-lg bg-black bg-opacity-50 p-2 text-center text-white">
                {isScanning ? "Scanning for barcodes..." : "Camera not ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="mt-4 flex gap-2">
          {availableCameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              title="Switch Camera"
            >
              🔄
            </button>
          )}
          
          <button
            onClick={toggleTorch}
            className={`px-3 py-2 rounded ${
              torchEnabled 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={torchEnabled ? "Turn off flashlight" : "Turn on flashlight"}
          >
            {torchEnabled ? '💡' : '🔦'}
          </button>
          
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-600 text-center">
          Point camera at any barcode - no need to fit in frame
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(scannerContent, document.body);
};

export default BarcodeScanner; 