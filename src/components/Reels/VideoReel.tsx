"use client";

import React, { useRef, useEffect, useState } from "react";
import { toaster, Message } from "rsuite";
import OrderModal from "./OrderModal";
import { FoodPost, isYouTubeUrl, isImageUrl } from "./ReelTypes";
import ReelMedia from "./ReelMedia";
import ReelHeader from "./ReelHeader";
import ReelActions from "./ReelActions";
import ReelBottomContent from "./ReelBottomContent";

interface VideoReelProps {
  post: FoodPost;
  isVisible: boolean;
  isAuthenticated: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (post: FoodPost) => void;
  onAuthRequired: () => void;
}

export default function VideoReel({
  post,
  isVisible,
  isAuthenticated,
  onLike,
  onComment,
  onShare,
  onAuthRequired,
}: VideoReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mountedRef = useRef(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [audioSource, setAudioSource] = useState(
    "/assets/sounds/reel-background.mp3"
  );
  const [lastTap, setLastTap] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();

    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        if (videoRef.current && mountedRef.current) {
          videoRef.current.load();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (
      videoRef.current &&
      !isYouTubeUrl(post.content.video) &&
      !isImageUrl(post.content.video)
    ) {
      if (isVisible) {
        const playVideo = async () => {
          try {
            if (!mountedRef.current || !videoRef.current) return;
            await videoRef.current.play();
            if (mountedRef.current) setIsPlaying(true);
          } catch (error) {
            const errorName = (error as Error).name;
            // Ignore AbortError and NotAllowedError (autoplay block)
            if (
              mountedRef.current &&
              errorName !== "AbortError" &&
              errorName !== "NotAllowedError"
            ) {
              setVideoError(true);
            }
            if (mountedRef.current) setIsPlaying(false);
          }
        };
        playVideo();
      } else {
        if (videoRef.current && mountedRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [isVisible, post.id, isMobile]);
  
  // Trigger like animation when post.isLiked becomes true
  useEffect(() => {
    if (post.isLiked && !showLikeAnimation) {
      console.log(`[VideoReel] Like detected for ${post.id}. Triggering animation.`);
      setShowLikeAnimation(true);
      const timer = setTimeout(() => setShowLikeAnimation(false), 800);
      return () => clearTimeout(timer);
    }
  }, [post.isLiked]);

  // Handle background audio for images
  useEffect(() => {
    if (!mountedRef.current || !isImageUrl(post.content.video)) return;

    if (audioRef.current) {
      if (isVisible) {
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.log(`Audio playback failed for ${audioSource}:`, err);
            if (!audioSource.includes("newMessage.mp3")) {
              setAudioSource("/assets/sounds/newMessage.mp3");
            }
          }
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isVisible, post.content.video, audioSource]);

  const handleVideoLoad = () => {
    if (!mountedRef.current) return;
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = (error: any) => {
    if (!mountedRef.current) return;
    toaster.push(
      <Message type="error" closable>
        {`Video error: ${(error as Error).message || "Unknown error occurred"}`}
      </Message>,
      { placement: "topEnd" }
    );
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoCanPlay = () => {
    if (!mountedRef.current) return;
    if (isVisible && videoRef.current && mountedRef.current) {
      const playVideo = async () => {
        try {
          if (!mountedRef.current || !videoRef.current) return;
          await videoRef.current.play();
          if (mountedRef.current) setIsPlaying(true);
        } catch (error) {
          const errorName = (error as Error).name;
          // Silence autoplay block errors as it's standard browser behavior
          if (
            mountedRef.current &&
            errorName !== "AbortError" &&
            errorName !== "NotAllowedError"
          ) {
            toaster.push(
              <Message type="error" closable>
                {`Failed to play video: ${(error as Error).message || "Unknown error occurred"
                  }`}
              </Message>,
              { placement: "topEnd" }
            );
          }
          if (mountedRef.current) setIsPlaying(false);
        }
      };
      playVideo();
    }
  };
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent interaction if clicking on buttons/actions
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double Tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTap();
      setLastTap(0);
    } else {
      // Potential Single Tap
      setLastTap(now);
      tapTimeoutRef.current = setTimeout(() => {
        handleSingleTap();
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleSingleTap = () => {
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current) videoRef.current.play().catch(console.error);
      if (audioRef.current) audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleDoubleTap = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    if (!post.isLiked) {
      onLike(post.id);
    }
    // Animation is now handled by useEffect watching post.isLiked
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "100%",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          backgroundColor: "#000",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
        onClick={handleInteraction}
      >
        <ReelMedia
          post={post}
          isVisible={isVisible}
          videoRef={videoRef}
          audioRef={audioRef}
          audioSource={audioSource}
          videoLoading={videoLoading}
          videoError={videoError}
          handleVideoLoad={handleVideoLoad}
          handleVideoError={handleVideoError}
          handleVideoCanPlay={handleVideoCanPlay}
          setVideoLoading={setVideoLoading}
          setVideoError={setVideoError}
        />

        {/* Gradient overlays for cinematic feel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            minHeight: "100%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.15) 35%, transparent 50%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.4) 100%)",
            zIndex: 2,
            pointerEvents: "none", // Let clicks pass through to the main container
          }}
        />

        {/* Large Heart Animation Overlay */}
        {showLikeAnimation && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 30,
              pointerEvents: "none",
              animation: "heartPop 0.8s ease-out forwards",
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth="1"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}

        {/* Play/Pause Indicator Overlay */}
        {!isPlaying && isVisible && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
              pointerEvents: "none",
              opacity: 0.6,
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}

        <ReelHeader post={post} />

        <ReelActions
          post={post}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
        />

        <ReelBottomContent
          post={post}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          setShowOrderModal={setShowOrderModal}
        />

        {/* CSS for loading animation */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes heartPop {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        post={post}
        shopLat={post.shopLat || 0}
        shopLng={post.shopLng || 0}
        shopAlt={post.shopAlt || 0}
        shopId={post.shop_id || post.restaurant_id || ""}
      />
    </>
  );
}
