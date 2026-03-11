import React, { RefObject, useEffect } from "react";
import {
  FoodPost,
  getYouTubeVideoId,
  isYouTubeUrl,
  isImageUrl,
  isValidMediaUrl,
} from "./ReelTypes";

interface ReelMediaProps {
  post: FoodPost;
  isVisible: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  audioSource: string;
  videoLoading: boolean;
  videoError: boolean;
  handleVideoLoad: () => void;
  handleVideoError: (error: any) => void;
  handleVideoCanPlay: () => void;
  setVideoLoading: (loading: boolean) => void;
  setVideoError: (error: boolean) => void;
}

const ReelMedia: React.FC<ReelMediaProps> = ({
  post,
  isVisible,
  videoRef,
  audioRef,
  audioSource,
  videoLoading,
  videoError,
  handleVideoLoad,
  handleVideoError,
  handleVideoCanPlay,
  setVideoLoading,
  setVideoError,
}) => {
  const videoUrl = post.content.video;

  useEffect(() => {
    if (
      !isYouTubeUrl(videoUrl) &&
      !isImageUrl(videoUrl) &&
      !isValidMediaUrl(videoUrl)
    ) {
      setVideoError(true);
      setVideoLoading(false);
    }
  }, [videoUrl, setVideoError, setVideoLoading]);

  return (
    <>
      {isYouTubeUrl(videoUrl) ? (
        <iframe
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            minHeight: "100%",
            border: "none",
            zIndex: 1,
          }}
          src={`https://www.youtube.com/embed/${getYouTubeVideoId(
            videoUrl
          )}?autoplay=${isVisible ? 1 : 0}&mute=${
            isVisible ? 0 : 1
          }&loop=1&playlist=${getYouTubeVideoId(
            videoUrl
          )}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={handleVideoLoad}
        />
      ) : isImageUrl(videoUrl) ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        >
          <img
            src={videoUrl}
            alt={post.content.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
            onLoad={handleVideoLoad}
            onError={() => {
              setVideoError(true);
              setVideoLoading(false);
            }}
          />
        </div>
      ) : isValidMediaUrl(videoUrl) ? (
        <video
          ref={videoRef}
          src={videoUrl}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            minHeight: "100%",
            objectFit: "cover",
            objectPosition: "center",
            backgroundColor: "#000",
            margin: 0,
            padding: 0,
            display: "block",
            zIndex: 1,
          }}
          loop
          muted={!isVisible}
          playsInline
          preload="metadata"
          poster={post.creator.avatar || "/placeholder.svg"}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onLoadStart={() => setVideoLoading(true)}
          onCanPlay={handleVideoCanPlay}
        />
      ) : null}

      {/* Background Audio for Images */}
      {isImageUrl(videoUrl) && (
        <audio
          ref={audioRef}
          src={audioSource}
          loop
          muted={!isVisible}
          preload="auto"
        />
      )}

      {/* Loading overlay */}
      {videoLoading && (
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid #fff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}

      {/* Error overlay */}
      {videoError && (
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 5,
          }}
        >
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>
              Content unavailable
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              Please try again later
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReelMedia;
