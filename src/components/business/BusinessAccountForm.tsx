"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, Check, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface BusinessAccountFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function BusinessAccountForm({
  onBack,
  onSuccess,
}: BusinessAccountFormProps) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [rdbCertificate, setRdbCertificate] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<"rdb" | "face" | null>(null);
  const [showPreview, setShowPreview] = useState<"rdb" | "face" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Handle video stream when it changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
        // Pre-fill email and phone from user details
        if (data.user.email) {
          setBusinessEmail(data.user.email);
        }
        if (data.user.phone) {
          setBusinessPhone(data.user.phone);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const startCamera = async (type: "rdb" | "face") => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: type === "face" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      setShowCamera(type);
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      toast.error(
        error.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : "Failed to access camera. Please try again."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Compress and convert to base64
    let quality = 0.9;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);

    // Compress if needed (max 200KB)
    const maxSizeKB = 200;
    while ((dataUrl.length * 0.75) / 1024 > maxSizeKB && quality > 0.1) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    // Resize if dimensions are too large
    const maxDimension = 1200;
    if (canvas.width > maxDimension || canvas.height > maxDimension) {
      const resizedCanvas = document.createElement("canvas");
      const resizedCtx = resizedCanvas.getContext("2d");
      if (resizedCtx) {
        let newWidth = canvas.width;
        let newHeight = canvas.height;

        if (newWidth > newHeight) {
          if (newWidth > maxDimension) {
            newHeight = (newHeight * maxDimension) / newWidth;
            newWidth = maxDimension;
          }
        } else {
          if (newHeight > maxDimension) {
            newWidth = (newWidth * maxDimension) / newHeight;
            newHeight = maxDimension;
          }
        }

        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        dataUrl = resizedCanvas.toDataURL("image/jpeg", quality);
      }
    }

    // Stop camera and show preview
    stopCamera();
    setCapturedImage(dataUrl);
    setShowPreview(showCamera);
  };

  const confirmPhoto = () => {
    if (!capturedImage || !showPreview) return;

    // Save the captured image
    if (showPreview === "rdb") {
      setRdbCertificate(capturedImage);
    } else if (showPreview === "face") {
      setFaceImage(capturedImage);
    }

    // Close preview
    setShowPreview(null);
    setCapturedImage(null);
    toast.success("Photo saved successfully!");
  };

  const retakePhoto = () => {
    const currentType = showPreview;
    setShowPreview(null);
    setCapturedImage(null);
    // Restart camera
    if (currentType) {
      setTimeout(() => {
        startCamera(currentType);
      }, 100);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (!businessEmail.trim()) {
      toast.error("Business email is required");
      return;
    }
    if (!businessPhone.trim()) {
      toast.error("Business phone is required");
      return;
    }
    if (!businessLocation.trim()) {
      toast.error("Business location is required");
      return;
    }
    if (!rdbCertificate) {
      toast.error("RDB certificate is required");
      return;
    }
    if (!faceImage) {
      toast.error("Face photo is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mutations/create-business-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: "business",
          business_name: businessName.trim(),
          business_email: businessEmail.trim(),
          business_phone: businessPhone.trim(),
          business_location: businessLocation.trim(),
          rdb_certificate: rdbCertificate,
          face_image: faceImage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account created successfully! Waiting for review.");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Business Account Registration
        </h3>
        <button
          onClick={onBack}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* User Details Display */}
      {userDetails && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-900">
          <h4 className="mb-2 sm:mb-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Your Details
          </h4>
          <div className="grid gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Name:</span> {userDetails.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {userDetails.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {userDetails.phone}
            </div>
          </div>
        </div>
      )}

      {/* Business Information */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          Business Information
        </h4>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            Business Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="Enter business email"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            Business Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            placeholder="Enter business phone"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            Business Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessLocation}
            onChange={(e) => setBusinessLocation(e.target.value)}
            placeholder="Enter business location/address"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm sm:text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* RDB Certificate Capture */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
          RDB Certificate <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Take a clear photo of your RDB (Rwanda Development Board)
          certificate
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {rdbCertificate ? (
            <div className="relative">
              <img
                src={rdbCertificate}
                alt="RDB Certificate"
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setRdbCertificate(null);
                }}
                className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startCamera("rdb")}
              className="flex h-24 w-24 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500"
            >
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              <span className="mt-1 sm:mt-2 text-xs text-gray-500">Capture</span>
            </button>
          )}
        </div>
      </div>

      {/* Face Image Capture */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
          Face Photo <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Take a clear face photo for verification
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {faceImage ? (
            <div className="relative">
              <img
                src={faceImage}
                alt="Face"
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setFaceImage(null);
                }}
                className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startCamera("face")}
              className="flex h-24 w-24 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500"
            >
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              <span className="mt-1 sm:mt-2 text-xs text-gray-500">Capture</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: showCamera === "face" ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center space-x-3 sm:space-x-4 bg-black bg-opacity-50 p-4 sm:p-6">
              <button
                onClick={stopCamera}
                className="rounded-full bg-gray-600 p-3 sm:p-4 text-white hover:bg-gray-700"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={capturePhoto}
                className="rounded-full bg-green-500 p-4 sm:p-6 text-white hover:bg-green-600"
              >
                <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
              <button
                onClick={stopCamera}
                className="rounded-full bg-gray-600 p-3 sm:p-4 text-white hover:bg-gray-700"
              >
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && capturedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
          <div className="relative w-full max-w-2xl h-full max-h-[90vh] bg-black rounded-lg overflow-hidden">
            <div className="relative h-full flex flex-col">
              <img
                src={capturedImage}
                alt="Preview"
                className="flex-1 w-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 sm:space-x-4 bg-black bg-opacity-50 p-4 sm:p-6">
                <button
                  onClick={retakePhoto}
                  className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex items-center space-x-2 rounded-lg bg-green-500 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:bg-green-600"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Use Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 border-t border-gray-200 pt-4 sm:pt-6 dark:border-gray-700">
        <button
          onClick={onBack}
          className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Submit for Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}


