"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

interface VideoValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  productName: string;
  productDescription?: string;
  price: number;
  onApprove: () => void;
  onReject: () => void;
}

export default function VideoValidationModal({
  isOpen,
  onClose,
  videoUrl,
  productName,
  productDescription,
  price,
  onApprove,
  onReject,
}: VideoValidationModalProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const mountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle video loading and playing
  useEffect(() => {
    if (!mountedRef.current || !videoRef.current) return;

    if (isOpen && videoUrl) {
      setVideoLoading(true);
      setVideoError(false);
      
      const playVideo = async () => {
        try {
          if (!mountedRef.current || !videoRef.current) return;
          
          await videoRef.current.play();
          if (mountedRef.current) {
            setIsPlaying(true);
            setVideoLoading(false);
          }
        } catch (error) {
          if (mountedRef.current && (error as Error).name !== "AbortError") {
            setVideoError(true);
            setVideoLoading(false);
          }
        }
      };

      // Small delay to ensure video is ready
      const timer = setTimeout(playVideo, 100);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      if (videoRef.current && mountedRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isOpen, videoUrl]);

  const handleVideoLoad = () => {
    if (!mountedRef.current) return;
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    if (!mountedRef.current) return;
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoCanPlay = () => {
    if (!mountedRef.current || !videoRef.current) return;
    
    const playVideo = async () => {
      try {
        if (!mountedRef.current || !videoRef.current) return;
        await videoRef.current.play();
        if (mountedRef.current) {
          setIsPlaying(true);
        }
      } catch (error) {
        if (mountedRef.current && (error as Error).name !== "AbortError") {
          setVideoError(true);
        }
      }
    };
    
    playVideo();
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove();
      onClose();
    } catch (error) {
      console.error("Error approving product:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject();
      onClose();
    } catch (error) {
      console.error("Error rejecting product:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Video Validation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {/* Video Player */}
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 relative">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                  onLoadStart={() => setVideoLoading(true)}
                  onCanPlay={handleVideoCanPlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Loading overlay */}
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
                      <p className="text-white text-sm">Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                    <div className="text-center text-white">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium mb-2">Video unavailable</p>
                      <p className="text-sm opacity-70">Please check the video URL and try again</p>
                    </div>
                  </div>
                )}

                {/* Play/Pause overlay */}
                {!videoLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                          } else {
                            videoRef.current.play();
                          }
                        }
                      }}
                      className="rounded-full bg-black/50 p-4 text-white hover:bg-black/70 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No Video Available</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No video URL provided for this product</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Product Information</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</p>
                <p className="text-gray-900 dark:text-white">{productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</p>
                <p className="text-gray-900 dark:text-white">{formatCurrency(price)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                <p className="text-gray-900 dark:text-white">
                  {productDescription || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
