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
}

export default function VideoReel({
  post,
  isVisible,
  isAuthenticated,
  onLike,
  onComment,
  onShare,
}: VideoReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mountedRef = useRef(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [audioSource, setAudioSource] = useState("/assets/sounds/reel-background.mp3");

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

    if (videoRef.current && !isYouTubeUrl(post.content.video) && !isImageUrl(post.content.video)) {
      if (isVisible) {
        const playVideo = async () => {
          try {
            if (!mountedRef.current || !videoRef.current) return;
            await videoRef.current.play();
            if (mountedRef.current) setIsPlaying(true);
          } catch (error) {
            if (mountedRef.current && (error as Error).name !== "AbortError") {
              setVideoError(true);
            }
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
        } catch (error) {
          if (mountedRef.current && (error as Error).name !== "AbortError") {
            toaster.push(
              <Message type="error" closable>
                {`Failed to play video: ${(error as Error).message || "Unknown error occurred"}`}
              </Message>,
              { placement: "topEnd" }
            );
          }
        }
      };
      playVideo();
    }
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
        }}
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

        {/* Gradient overlay */}
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
            background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent, rgba(0,0,0,0.3))",
            zIndex: 2,
          }}
        />

        <ReelHeader post={post} />

        <ReelActions
          post={post}
          isAuthenticated={isAuthenticated}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
        />

        <ReelBottomContent
          post={post}
          isAuthenticated={isAuthenticated}
          setShowOrderModal={setShowOrderModal}
        />

        {/* CSS for loading animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      <OrderModal open={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </>
  );
}
