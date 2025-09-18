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
  isReelOrder?: boolean;
}

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
  orderType?: "regular" | "reel";
}

const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
  orderType = "regular",
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
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

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
      const uploadState = localStorage.getItem(
        `delivery_upload_${invoiceData.orderId}`
      );
      if (uploadState === "pending") {
        setForceOpen(true);
        setPhotoUploading(true);
      }
    }
  }, [invoiceData?.orderId]);

  // Save upload state to localStorage
  useEffect(() => {
    if (invoiceData?.orderId) {
      if (photoUploading) {
        localStorage.setItem(
          `delivery_upload_${invoiceData.orderId}`,
          "pending"
        );
      } else if (photoUploaded) {
        localStorage.removeItem(`delivery_upload_${invoiceData.orderId}`);
      }
    }
  }, [photoUploading, photoUploaded, invoiceData?.orderId]);

  // Handle delivery confirmation and redirect
  const handleConfirmDelivery = async () => {
    if (!invoiceData?.orderId) {
      setUploadError("Order ID is missing");
      return;
    }

    try {
      setConfirmingDelivery(true);
      setForceOpen(true);

      // Step 1: Process wallet operations first (before invoice generation)
      const walletResponse = await fetch("/api/shopper/walletOperations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          operation: "delivered",
          isReelOrder: invoiceData.isReelOrder || false,
        }),
      });

      if (!walletResponse.ok) {
        const walletErrorData = await walletResponse.json();
        throw new Error(
          walletErrorData.error || "Failed to process wallet operations"
        );
      }

      const walletResult = await walletResponse.json();
      console.log("Wallet operations completed:", walletResult);

      // Step 2: Update order status to delivered (after wallet operations)
      const response = await fetch("/api/shopper/updateOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          status: "delivered",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm delivery");
      }

      setDeliveryConfirmed(true);

      // Redirect to active batches page after a short delay
      setTimeout(() => {
        router.push("/Plasa/active-batches");
      }, 1500);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      setUploadError("Failed to confirm delivery. Please try again.");
    } finally {
      setConfirmingDelivery(false);
    }
  };

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
        video: { facingMode: "environment" },
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
      stream.getTracks().forEach((track) => track.stop());
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
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as base64
        const imageData = canvas.toDataURL("image/jpeg");
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
    if (photoUploading || forceOpen || confirmingDelivery) {
      return; // Prevent closing while uploading, confirming, or if force open
    }
    onClose();
  };

  const handleUpdateDatabase = async (imageData: string) => {
    if (!invoiceData?.orderId) return;

    try {
      setPhotoUploading(true);
      setForceOpen(true);

      // Send the image data and updatedAt directly to the API
      const response = await fetch("/api/shopper/uploadDeliveryPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          file: imageData,
          updatedAt: new Date().toISOString(),
          orderType: orderType, // Pass order type to API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload delivery photo");
      }

      const data = await response.json();

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
      <Modal
        open={open}
        onClose={onClose}
        size="md"
        className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
      >
        <Modal.Header
          className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}
        >
          <Modal.Title>Delivery Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size="lg" content="Processing..." />
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!invoiceData) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        size="md"
        className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
      >
        <Modal.Header
          className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}
        >
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
        >
          <div
            className={`py-4 text-center ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
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
      size="sm"
      className={`${
        theme === "dark" ? "bg-gray-900 text-gray-100" : ""
      } rounded-2xl`}
      backdrop="static"
    >
      <Modal.Header
        className={`${
          theme === "dark"
            ? "bg-gray-800 text-gray-100"
            : "bg-gradient-to-r from-green-50 to-blue-50"
        } rounded-t-2xl px-4 py-3`}
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
            <Modal.Title className="text-lg font-bold">
              {photoUploading
                ? "Uploading Delivery Photo..."
                : confirmingDelivery
                ? "Confirming Delivery..."
                : deliveryConfirmed
                ? "Delivery Confirmed!"
                : "Delivery Confirmation"}
            </Modal.Title>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Order #{invoiceData.orderNumber}
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body
        className={`${
          theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white"
        } px-4 py-4`}
      >
        <div className="space-y-3">
          {/* Success message */}
          <div
            className={`rounded-xl border-l-4 p-3 text-center ${
              theme === "dark"
                ? "border-green-500 bg-green-900/20 text-green-300"
                : "border-green-500 bg-green-50 text-green-800"
            }`}
          >
            <div className="mb-2 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 sm:h-12 sm:w-12 ${
                  theme === "dark" ? "text-green-400" : "text-green-500"
                }`}
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
            <h3 className="text-base font-semibold sm:text-lg">
              {deliveryConfirmed
                ? "Order Successfully Delivered!"
                : "Order Ready for Delivery Confirmation!"}
            </h3>
            <p className="mt-1 text-sm sm:text-base">
              {deliveryConfirmed
                ? "Redirecting to active batches..."
                : `Order #${invoiceData.orderNumber} has been prepared for delivery confirmation.`}
            </p>
          </div>

          {/* Photo upload section */}
          <div
            className={`rounded-xl border-2 p-4 ${
              theme === "dark"
                ? "border-blue-600 bg-blue-900/20"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  theme === "dark" ? "bg-blue-600" : "bg-blue-100"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-white" : "text-blue-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold">Delivery Photo</h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Take a photo as proof of delivery
                </p>
              </div>
            </div>
            <p
              className={`mb-3 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {photoUploading
                ? "Please wait while we upload your photo..."
                : "Please take a photo of the delivered package as proof of delivery."}
            </p>

            {photoUploading && (
              <div className="mb-4 text-center">
                <Loader size="md" content="Uploading photo..." />
                <p className="mt-2 text-sm text-gray-500">
                  Please don&apos;t close this window until the upload is
                  complete
                </p>
              </div>
            )}

            {photoUploaded ? (
              <div className="mt-4 text-center">
                <div
                  className={`rounded-lg border p-4 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-700"
                      : "bg-gray-50"
                  }`}
                >
                  <p className="font-medium">Photo uploaded successfully!</p>
                  {capturedImage && (
                    <div className="relative mx-auto mt-2 h-32 w-48 overflow-hidden rounded-lg sm:h-48 sm:w-64">
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
              <div className="mt-3 space-y-3">
                {/* Camera View - Integrated */}
                {showCamera && !showPreview ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
                      <Button
                        appearance="primary"
                        onClick={captureImage}
                        className="w-full sm:w-auto"
                        disabled={photoUploading}
                      >
                        📸 Capture Photo
                      </Button>
                      <Button
                        appearance="subtle"
                        onClick={stopCamera}
                        className="w-full sm:w-auto"
                        disabled={photoUploading}
                      >
                        ❌ Cancel
                      </Button>
                    </div>
                  </div>
                ) : showPreview ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600">
                      <Image
                        src={capturedImage || ""}
                        alt="Captured delivery"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
                      <Button
                        appearance="ghost"
                        onClick={retakePhoto}
                        className="w-full sm:w-auto"
                        disabled={photoUploading}
                      >
                        🔄 Retake
                      </Button>
                      <Button
                        appearance="primary"
                        onClick={confirmPhoto}
                        className="w-full sm:w-auto"
                        disabled={photoUploading}
                      >
                        ✅ Use This Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!photoUploaded && !photoUploading && !capturedImage && (
                      <div className="mb-3 flex flex-col items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7h2l2-3h6l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2zm9 4a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          No photo added yet
                        </p>
                        <p className="mt-1 text-xs text-red-500">
                          * Delivery photo is required
                        </p>
                      </div>
                    )}
                    <div className="flex justify-center">
                      <Button
                        onClick={startCamera}
                        appearance="primary"
                        className="w-full sm:w-auto"
                        disabled={photoUploading}
                      >
                        📷 Take Photo
                      </Button>
                    </div>
                  </>
                )}
                {uploadError && (
                  <p
                    className={`mt-2 text-center text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {uploadError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Delivery Button - Only show after photo is uploaded */}
          {photoUploaded && !deliveryConfirmed && (
            <div className="mt-4 text-center">
              <Button
                onClick={handleConfirmDelivery}
                appearance="primary"
                size="lg"
                className="w-full py-3 text-lg font-bold"
                disabled={confirmingDelivery}
                loading={confirmingDelivery}
              >
                {confirmingDelivery
                  ? "Confirming Delivery..."
                  : "✅ Confirm Delivery"}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                This will mark the order as delivered and update your earnings
              </p>
            </div>
          )}

          {/* Delivery Confirmation Loading */}
          {confirmingDelivery && (
            <div className="mt-4 text-center">
              <Loader size="md" content="Updating order status..." />
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we confirm your delivery...
              </p>
            </div>
          )}

          {/* Delivery Confirmed Success */}
          {deliveryConfirmed && (
            <div className="mt-4 text-center">
              <div
                className={`rounded-lg border p-4 ${
                  theme === "dark"
                    ? "border-green-700 bg-green-900/20"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <p className="font-medium text-green-600 dark:text-green-400">
                  Delivery confirmed successfully!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Redirecting to active batches...
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer
        className={`${
          theme === "dark"
            ? "border-t border-gray-700 bg-gray-800"
            : "border-t border-gray-200 bg-gray-50"
        } rounded-b-2xl px-4 py-3`}
      >
        <div className="flex flex-col justify-end space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
          <Button
            onClick={handleViewInvoiceDetails}
            appearance="primary"
            className="w-full sm:w-auto"
            disabled={!photoUploaded || photoUploading || confirmingDelivery}
          >
            📄 View Invoice Details
          </Button>
          <Button
            onClick={handleReturnToBatches}
            appearance="subtle"
            className="w-full sm:w-auto"
            disabled={photoUploading || confirmingDelivery}
          >
            ← Return to Batches
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeliveryConfirmationModal;
