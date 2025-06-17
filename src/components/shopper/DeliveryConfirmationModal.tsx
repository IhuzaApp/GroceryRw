import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Loader } from "rsuite";
import { useRouter } from "next/router";
import { formatCurrency } from "../../lib/formatCurrency";
import { useTheme } from "../../context/ThemeContext";
import Image from "next/image";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  shop: string;
  shopAddress: string;
  dateCreated: string;
  dateCompleted: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
}

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
}

const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For file selection management
  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/heic",
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Check localStorage on mount
  useEffect(() => {
    if (invoiceData?.orderId) {
      const uploadState = localStorage.getItem(`delivery_upload_${invoiceData.orderId}`);
      if (uploadState === 'pending') {
        setForceOpen(true);
        setPhotoUploading(true);
      }
    }
  }, [invoiceData?.orderId]);

  // Save upload state to localStorage
  useEffect(() => {
    if (invoiceData?.orderId) {
      if (photoUploading) {
        localStorage.setItem(`delivery_upload_${invoiceData.orderId}`, 'pending');
      } else if (photoUploaded) {
        localStorage.removeItem(`delivery_upload_${invoiceData.orderId}`);
      }
    }
  }, [photoUploading, photoUploaded, invoiceData?.orderId]);

  const handleViewInvoiceDetails = () => {
    if (!invoiceData?.id) {
      console.error("Invoice ID is missing");
      setUploadError("Unable to view invoice details: Invoice ID is missing");
      return;
    }
    onClose();
    router.push(`/Plasa/invoices/${invoiceData.id}`);
  };

  const handleReturnToBatches = () => {
    onClose();
    router.push("/Plasa/active-batches");
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      setStream(mediaStream);
      setShowCamera(true);

      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setUploadError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as base64
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setShowPreview(true);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const confirmPhoto = async () => {
    if (capturedImage) {
      await handleUpdateDatabase(capturedImage);
      stopCamera();
    }
  };

  const handleClose = () => {
    if (photoUploading || forceOpen) {
      return; // Prevent closing while uploading or if force open
    }
    onClose();
  };

  const handleUpdateDatabase = async (imageData: string) => {
    if (!invoiceData?.orderId) return;

    try {
      setPhotoUploading(true);
      setForceOpen(true);
      
      // Send the image data directly to the API
      const response = await fetch("/api/shopper/uploadDeliveryPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          file: imageData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload delivery photo");
      }

      const data = await response.json();
      
      // Update the order with the delivery photo URL
      const updateResponse = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation UpdateOrderDeliveryPhoto($order_id: uuid!, $delivery_photo_url: String!, $updated_at: timestamptz!) {
              update_Orders(where: {id: {_eq: $order_id}}, _set: {delivery_photo_url: $delivery_photo_url, updated_at: $updated_at}) {
                affected_rows
              }
            }
          `,
          variables: {
            order_id: invoiceData.orderId,
            delivery_photo_url: data.fileName,
            updated_at: new Date().toISOString()
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update order with delivery photo");
      }

      const updateData = await updateResponse.json();
      
      if (updateData.errors) {
        throw new Error(updateData.errors[0].message);
      }

      setSelectedFileName(data.fileName);
      setPhotoUploaded(true);
      setUploadError(null);
      setForceOpen(false);
    } catch (error) {
      console.error("Error uploading delivery photo:", error);
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !invoiceData?.orderId) {
      setUploadError("No file selected");
      return;
    }

    const file = fileList[0];

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPEG or PNG image.");
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }

    setPhotoUploading(true);
    setUploadError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await handleUpdateDatabase(base64data);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      setUploadError("Failed to process photo. Please try again.");
      setPhotoUploading(false);
    }
  };

  // Determine if modal should be open
  const isModalOpen = open || forceOpen;

  if (loading) {
    return (
      <Modal open={open} onClose={onClose} size="md" className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}>
        <Modal.Header className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}>
          <Modal.Title>Delivery Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size="lg" content="Processing..." />
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!invoiceData) {
    return (
      <Modal open={open} onClose={onClose} size="md" className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}>
        <Modal.Header className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}>
          <div className={`py-4 text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            Could not process delivery confirmation. Please try again later.
          </div>
        </Modal.Body>
        <Modal.Footer className={theme === "dark" ? "bg-gray-800" : ""}>
          <Button onClick={onClose} appearance="primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal 
      open={isModalOpen} 
      onClose={handleClose} 
      size="md" 
      className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
      backdrop="static"
    >
      <Modal.Header className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}>
        <Modal.Title>
          {photoUploading ? "Uploading Delivery Photo..." : "Delivery Confirmation"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}>
        <div className="space-y-4 p-2">
          {/* Success message */}
          <div className={`rounded-md p-4 text-center ${
            theme === "dark" 
              ? "bg-green-900/20 text-green-300" 
              : "bg-green-50 text-green-800"
          }`}>
            <div className="mb-2 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-12 w-12 ${theme === "dark" ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">
              Order Successfully Delivered!
            </h3>
            <p className="mt-1">
              Order #{invoiceData.orderNumber} has been marked as delivered.
            </p>
          </div>

          {/* Order summary */}
          <div className={`rounded-lg border p-4 ${
            theme === "dark" 
              ? "border-gray-700 bg-gray-800" 
              : "bg-gray-50"
          }`}>
            <h3 className="mb-2 text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{invoiceData.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">
                  {formatCurrency(invoiceData.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Photo upload section */}
          <div className={`rounded-lg border p-4 ${
            theme === "dark" 
              ? "border-gray-700 bg-gray-800" 
              : "bg-white"
          }`}>
            <h3 className="mb-3 text-lg font-semibold">
              Delivery Photo
            </h3>
            <p className={`mb-3 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              {photoUploading 
                ? "Please wait while we upload your photo..."
                : "Please take a photo of the delivered package as proof of delivery."}
            </p>

            {photoUploading && (
              <div className="mb-4 text-center">
                <Loader size="md" content="Uploading photo..." />
                <p className="mt-2 text-sm text-gray-500">
                  Please don't close this window until the upload is complete
                </p>
              </div>
            )}

            {photoUploaded ? (
              <div className="mt-4 text-center">
                <div className={`rounded-lg border p-4 ${
                  theme === "dark" 
                    ? "border-gray-700 bg-gray-700" 
                    : "bg-gray-50"
                }`}>
                  <p className="font-medium">Photo uploaded successfully!</p>
                  {capturedImage && (
                    <div className="relative mx-auto mt-2 h-48 w-64 overflow-hidden rounded-lg">
                      <Image
                        src={capturedImage}
                        alt="Delivery proof"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={startCamera}
                    appearance="primary"
                    className="mr-2"
                    disabled={photoUploading}
                  >
                    Take Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={photoUploading}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    appearance="subtle"
                    disabled={photoUploading}
                  >
                    Upload Photo
                  </Button>
                </div>
                {uploadError && (
                  <p className={`mt-2 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {uploadError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className={theme === "dark" ? "bg-gray-800" : ""}>
        <Button
          onClick={handleViewInvoiceDetails}
          appearance="primary"
          className="mr-2"
          disabled={!photoUploaded || photoUploading}
        >
          View Invoice Details
        </Button>
        <Button
          onClick={handleReturnToBatches}
          appearance="subtle"
          disabled={photoUploading}
        >
          Return to Batches
        </Button>
      </Modal.Footer>

      {/* Camera Modal */}
      <Modal 
        open={showCamera} 
        onClose={photoUploading ? undefined : stopCamera} 
        size="md"
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>Take Delivery Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center">
            {!showPreview ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-auto w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <Button
                  appearance="primary"
                  onClick={captureImage}
                  className="mt-4"
                  disabled={photoUploading}
                >
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg">
                  <Image
                    src={capturedImage || ''}
                    alt="Captured delivery"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button 
                    appearance="ghost" 
                    onClick={retakePhoto}
                    disabled={photoUploading}
                  >
                    Retake
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={confirmPhoto}
                    disabled={photoUploading}
                  >
                    Use This Photo
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            onClick={stopCamera} 
            appearance="subtle"
            disabled={photoUploading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default DeliveryConfirmationModal;
