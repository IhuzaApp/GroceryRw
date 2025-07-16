import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Loader, toaster } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { Invoice } from "./types";

interface ProofUploadModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onUploadSuccess: (invoiceId: string, proofImage: string) => void;
}

const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  open,
  onClose,
  invoice,
  onUploadSuccess,
}) => {
  const { theme } = useTheme();
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera functions
  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);

      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not access camera";
      setError(`Camera Error: ${errorMessage}. Please try uploading from gallery instead.`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as base64
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setProofImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please select an image smaller than 5MB.");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofImage(e.target?.result as string);
      };
      reader.onerror = () => {
        setError("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!invoice || !proofImage) return;

    setUploadingProof(true);
    setError(null);
    
    try {
      const response = await fetch("/api/invoices/upload-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          proof_image: proofImage,
          order_type: invoice.order_type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload proof");
      }

      // Call the success callback
      onUploadSuccess(invoice.id, proofImage);

      // Show success toast
      toaster.push(
        <div className="text-green-800">
          Proof uploaded successfully for invoice #{invoice.invoice_number}
        </div>,
        {
          duration: 3000,
          placement: 'topCenter'
        }
      );

      onClose();
    } catch (error) {
      console.error("Error uploading proof:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload proof";
      setError(errorMessage);
      
      // Show error toast
      toaster.push(
        <div className="text-red-800">
          Upload failed: {errorMessage}
        </div>,
        {
          duration: 5000,
          placement: 'topCenter'
        }
      );
    } finally {
      setUploadingProof(false);
    }
  };

  const handleClose = () => {
    if (uploadingProof) {
      return; // Prevent closing while uploading
    }
    stopCamera();
    setProofImage(null);
    setError(null);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        size="lg"
        className={theme === "dark" ? "rs-modal-dark" : ""}
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>Upload Proof of Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="mb-4 text-sm text-gray-600">
              Please upload a photo showing the delivered goods for invoice #
              {invoice?.invoice_number}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Make sure the photo clearly shows the
                delivered items and any relevant details like packaging or
                receipts.
              </p>
            </div>

            {!proofImage ? (
              <div className="space-y-4">
                {/* Camera Section */}
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                  <div className="text-center">
                    <h4 className="mb-2 font-medium">Take Photo</h4>
                    {!cameraActive ? (
                      <Button
                        appearance="primary"
                        onClick={startCamera}
                        className="mb-2"
                      >
                        Open Camera
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-lg">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                            style={{ transform: "scaleX(-1)" }} // Mirror the camera
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black bg-opacity-50 px-3 py-1 text-sm text-white">
                              📷 Camera Active
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-2">
                          <Button
                            appearance="primary"
                            onClick={capturePhoto}
                            size="lg"
                          >
                            📸 Capture Photo
                          </Button>
                          <Button appearance="ghost" onClick={stopCamera}>
                            ❌ Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                  <div className="text-center">
                    <h4 className="mb-2 font-medium">Or Upload from Gallery</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="mb-2 font-medium">Preview</h4>
                  <img
                    src={proofImage}
                    alt="Proof of delivery"
                    className="mx-auto w-full max-w-md rounded-lg shadow-md"
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    appearance="ghost"
                    onClick={() => {
                      setProofImage(null);
                      setError(null);
                    }}
                  >
                    📷 Take New Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="ghost"
            onClick={handleClose}
            disabled={uploadingProof}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={handleUploadProof}
            disabled={!proofImage || uploadingProof}
            loading={uploadingProof}
          >
            {uploadingProof ? "Uploading..." : "Upload Proof"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default ProofUploadModal;
