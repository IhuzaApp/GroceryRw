"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, Check, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface PersonalBusinessFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function PersonalBusinessForm({
  onBack,
  onSuccess,
}: PersonalBusinessFormProps) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [businessLocation, setBusinessLocation] = useState("");
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<"face" | "id" | null>(null);
  const [showPreview, setShowPreview] = useState<"face" | "id" | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchUserDetails();
    fetchDefaultAddress();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch("/api/queries/addresses");
      if (response.ok) {
        const data = await response.json();
        const defaultAddr = (data.addresses || []).find(
          (addr: any) => addr.is_default
        );
        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
          // Pre-fill with default address if available
          const addressString = `${defaultAddr.street || ""}, ${defaultAddr.city || ""}${defaultAddr.postal_code ? `, ${defaultAddr.postal_code}` : ""}`.trim().replace(/^,\s*|,\s*$/g, '');
          setBusinessLocation(addressString);
        }
      }
    } catch (error) {
      console.error("Error fetching default address:", error);
    }
  };

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

  const startCamera = async (type: "face" | "id") => {
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
    if (showPreview === "face") {
      setFaceImage(capturedImage);
    } else if (showPreview === "id") {
      setIdImage(capturedImage);
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
    if (!faceImage || !idImage) {
      toast.error("Please capture both face and ID images");
      return;
    }
    if (!businessLocation.trim()) {
      toast.error("Operating address is required");
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
          account_type: "personal",
          face_image: faceImage,
          id_image: idImage,
          business_location: businessLocation.trim(),
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
          Personal Account Registration
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

      {/* Operating Address */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Operating Address <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter the address where you will be operating your business
        </p>
        <textarea
          value={businessLocation}
          onChange={(e) => setBusinessLocation(e.target.value)}
          placeholder={
            defaultAddress
              ? `${defaultAddress.street || ""}, ${defaultAddress.city || ""}${defaultAddress.postal_code ? `, ${defaultAddress.postal_code}` : ""}`.trim().replace(/^,\s*|,\s*$/g, '')
              : "Enter your operating address (e.g., Street, City, Postal Code)"
          }
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          required
        />
        {defaultAddress && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Default address:</span> {defaultAddress.street}, {defaultAddress.city}
            {defaultAddress.postal_code && `, ${defaultAddress.postal_code}`}
          </p>
        )}
      </div>

      {/* Face Image Capture */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
          Face Photo <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Take a clear photo of your face for verification
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

      {/* ID Image Capture */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
          ID Photo <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Take a clear photo of your ID card (front side)
        </p>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {idImage ? (
            <div className="relative">
              <img
                src={idImage}
                alt="ID"
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover"
              />
              <button
                onClick={() => {
                  setIdImage(null);
                }}
                className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startCamera("id")}
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
              style={{ transform: "scaleX(-1)" }}
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
      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !faceImage || !idImage}
          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Submit for Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}


