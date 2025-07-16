import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Loader } from "rsuite";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
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
      alert("Could not access camera. Please check permissions.");
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
        const imageData = canvas.toDataURL("image/jpeg");
        setProofImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!invoice || !proofImage) return;

    setUploadingProof(true);
    try {
      const response = await fetch('/api/invoices/upload-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          proof_image: proofImage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload proof');
      }

      const result = await response.json();
      
      // Call the success callback
      onUploadSuccess(invoice.id, proofImage);

      onClose();
      alert('Proof uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof. Please try again.');
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
            <p className="text-sm text-gray-600 mb-4">
              Please upload a photo showing the delivered goods for invoice #{invoice?.invoice_number}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Make sure the photo clearly shows the delivered items and any relevant details like packaging or receipts.
              </p>
            </div>
            
            {!proofImage ? (
              <div className="space-y-4">
                {/* Camera Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Take Photo</h4>
                    {!cameraActive ? (
                      <Button
                        appearance="primary"
                        onClick={startCamera}
                        className="mb-2"
                      >
                        📷 Open Camera
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the camera
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
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
                          <Button
                            appearance="ghost"
                            onClick={stopCamera}
                          >
                            ❌ Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Or Upload from Gallery</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <img
                    src={proofImage}
                    alt="Proof of delivery"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    appearance="ghost"
                    onClick={() => setProofImage(null)}
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
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </>
  );
};

export default ProofUploadModal; 