"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, X, Check, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export type CameraType = "user" | "environment";

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  cameraType?: CameraType; // "user" for front camera, "environment" for back camera
  title?: string;
  mirrorVideo?: boolean; // Whether to mirror the video (useful for front camera)
  mode?: "photo" | "video"; // Capture mode
  maxVideoDuration?: number; // Max video duration in seconds
}

export default function CameraCapture({
  isOpen,
  onClose,
  onCapture,
  cameraType = "environment",
  title = "Capture Photo",
  mirrorVideo = false,
  mode = "photo",
  maxVideoDuration = 10,
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup stream on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !showPreview) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCapturedVideo(null);
      setShowPreview(false);
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxVideoDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, maxVideoDuration]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraType,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      toast.error(
        error.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : "Failed to access camera. Please try again."
      );
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
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
    // If mirroring, flip horizontally
    if (mirrorVideo) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    if (mirrorVideo) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

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
    setShowPreview(true);
  };

  const startRecording = () => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const localChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        localChunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(localChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedVideo(videoUrl);
      setShowPreview(true);
      stopCamera();
    };

    recorder.start();
    setMediaRecorder(recorder);
    setChunks(localChunks);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const confirmCapture = () => {
    if (mode === "photo" && capturedImage) {
      onCapture(capturedImage);
    } else if (mode === "video" && capturedVideo) {
      onCapture(capturedVideo);
    }
    
    setCapturedImage(null);
    setCapturedVideo(null);
    setShowPreview(false);
    onClose();
    toast.success(`${mode === 'photo' ? 'Photo' : 'Video'} captured successfully!`);
  };

  const retakeCapture = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setShowPreview(false);
    setIsRecording(false);
    setRecordingTime(0);
    // Restart camera
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCapturedVideo(null);
    setShowPreview(false);
    setIsRecording(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Camera View */}
      {!showPreview && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black"
          style={{
            zIndex: 99999999,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: mirrorVideo ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div
              className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center space-x-3 bg-black bg-opacity-90 p-4 backdrop-blur-sm sm:space-x-4 sm:p-6"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
              }}
            >
              <button
                onClick={handleClose}
                className="z-10 rounded-full bg-gray-600 p-3 text-white hover:bg-gray-700 sm:p-4"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
              {mode === "photo" ? (
                <button
                  onClick={capturePhoto}
                  className="z-10 rounded-full bg-green-500 p-4 text-white shadow-lg hover:bg-green-600 sm:p-6"
                >
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              ) : (
                <div className="relative flex items-center justify-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`z-10 rounded-full p-4 text-white shadow-lg transition-all sm:p-6 ${
                      isRecording ? "bg-red-600 scale-110" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {isRecording ? (
                      <div className="h-6 w-6 rounded-sm bg-white sm:h-8 sm:w-8" />
                    ) : (
                      <div className="h-8 w-8 rounded-full border-4 border-white sm:h-10 sm:w-10" />
                    )}
                  </button>
                  {isRecording && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                      {recordingTime}s / {maxVideoDuration}s
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleClose}
                className="z-10 rounded-full bg-gray-600 p-3 text-white hover:bg-gray-700 sm:p-4"
              >
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (capturedImage || capturedVideo) && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4"
          style={{
            zIndex: 99999999,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="relative h-full max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-black">
            <div className="relative flex h-full flex-col">
              {mode === "photo" ? (
                <img
                  src={capturedImage!}
                  alt="Preview"
                  className="w-full flex-1 object-contain"
                />
              ) : (
                <video
                  src={capturedVideo!}
                  controls
                  autoPlay
                  className="w-full flex-1 object-contain"
                />
              )}
              <div
                className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 bg-black bg-opacity-90 p-4 backdrop-blur-sm sm:space-x-4 sm:p-6"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
                }}
              >
                <button
                  onClick={retakeCapture}
                  className="z-10 flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm text-white hover:bg-gray-700 sm:px-6 sm:py-3 sm:text-base"
                >
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={confirmCapture}
                  className="z-10 flex items-center space-x-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm text-white shadow-lg hover:bg-green-600 sm:px-6 sm:py-3 sm:text-base"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Use {mode === 'photo' ? 'Photo' : 'Video'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
