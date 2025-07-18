import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const isScannedRef = useRef(false); // Guard flag to prevent multiple scans
  const [error, setError] = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      console.log('📷 Stopping scanner and camera...');
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
          video: { facingMode: 'environment' },
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
              
              console.log('📷 Barcode detected:', result.getText());
              
              stopScanner();
              onBarcodeDetected(result.getText());
              onClose();
            }

            if (err && err.name !== 'NotFoundException') {
              console.error('📷 Barcode detection error:', err);
              setError('An error occurred while scanning.');
            }
          },
        );
      } catch (err) {
        console.error('📷 Failed to start scanner:', err);
        setError('Could not access the camera. Please check permissions.');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onBarcodeDetected, onClose, stopScanner]);

  const scannerContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Barcode</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-gray-900 rounded"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-80 border border-white border-dashed rounded-lg opacity-50" />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(scannerContent, document.body);
};

export default BarcodeScanner; 