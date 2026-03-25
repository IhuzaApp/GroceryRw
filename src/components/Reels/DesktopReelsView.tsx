import React, { useEffect, useState } from "react";
import Link from "next/link";
import RootLayout from "@components/ui/layout";
import VideoReel from "./VideoReel";
import DesktopCommentsSidebar from "./DesktopCommentsSidebar";
import { ChevronUp, ChevronDown, Home } from "lucide-react";
import {
  isValidMediaUrl,
  isYouTubeUrl,
  getYouTubeVideoId,
} from "./ReelTypes";

// Types
type FoodPost = any;
type Comment = any;

interface DesktopReelsViewProps {
  posts: FoodPost[];
  visiblePostIndex: number;
  setVisiblePostIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isAuthenticated: boolean;
  mergedActiveComments: Comment[];
  toggleCommentLike: (commentId: string) => void;
  addComment: (text: string) => void;
  isRefreshingComments: boolean;
  toggleLike: (postId: string) => void;
  handleShare: (post: FoodPost) => void;
  onAuthRequired: () => void;
  isRefreshing: boolean;
  theme: "light" | "dark";
}

export default function DesktopReelsView({
  posts,
  visiblePostIndex,
  setVisiblePostIndex,
  containerRef,
  isAuthenticated,
  mergedActiveComments,
  toggleCommentLike,
  addComment,
  isRefreshingComments,
  toggleLike,
  handleShare,
  onAuthRequired,
  isRefreshing,
  theme,
}: DesktopReelsViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get active post based on visible index
  const activePost =
    posts.length > 0 && visiblePostIndex >= 0 && visiblePostIndex < posts.length
      ? posts[visiblePostIndex]
      : null;

  // Keyboard and scroll handling for desktop
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return;

    const container = containerRef.current;
    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const scrollPosition = container.scrollTop;
      const containerHeight = container.clientHeight;
      const currentIndex = Math.round(scrollPosition / containerHeight);

      if (
        currentIndex !== visiblePostIndex &&
        currentIndex >= 0 &&
        currentIndex < posts.length
      ) {
        setVisiblePostIndex(currentIndex);
      }

      setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      if (e.key === " " && isTyping) return;

      const currentIndex = visiblePostIndex;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          if (currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
            scrollToIndex(nextIndex);
          }
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
            scrollToIndex(nextIndex);
          }
          break;
        default:
          return;
      }
    };

    const scrollToIndex = (index: number) => {
      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setVisiblePostIndex(index);
      }
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [posts.length, visiblePostIndex, containerRef, setVisiblePostIndex]);

  const handleNavClick = (direction: "up" | "down") => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const nextIndex = direction === "up" ? visiblePostIndex - 1 : visiblePostIndex + 1;

    if (nextIndex >= 0 && nextIndex < posts.length) {
      const targetElement = container.children[nextIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setVisiblePostIndex(nextIndex);
      }
    }
  };

  const isDark = theme === "dark";

  return (
    <RootLayout>
      <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? "bg-black" : "bg-gray-100"}`}>
        {/* Immersive Blurred Background */}
        {activePost &&
          (() => {
            let bgUrl = "";
            const mediaUrl = activePost.content.video;

            if (isYouTubeUrl(mediaUrl)) {
              const videoId = getYouTubeVideoId(mediaUrl);
              if (videoId) {
                bgUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              }
            } else if (isValidMediaUrl(mediaUrl)) {
              bgUrl = mediaUrl;
            }

            if (!bgUrl) return null;

            return (
              <div className="absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000">
                <div
                  className="absolute inset-0 scale-110 blur-[80px] brightness-[0.4]"
                  style={{
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div
                  className={`absolute inset-0 ${
                    isDark ? "bg-black/40" : "bg-white/20"
                  }`}
                />
              </div>
            );
          })()}

        {/* Navigation - Back to Home */}
        <div className="fixed left-8 top-1/2 z-50 -translate-y-1/2 space-y-4">
          <Link href="/">
            <button
              className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all hover:scale-110 active:scale-95 ${
                isDark
                  ? "border-gray-700 bg-gray-900/40 text-white hover:bg-gray-800/60"
                  : "border-white/40 bg-white/40 text-gray-900 hover:bg-white/60"
              }`}
              title="Back to Home"
            >
              <Home size={28} />
            </button>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 mx-auto flex h-screen w-full items-center justify-center px-4 py-6 lg:gap-8 xl:gap-12">
          {/* Video Reel Container */}
          <div className="relative flex flex-col items-center">
            <div
              ref={containerRef}
              className="scrollbar-hide relative aspect-[9/16] h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500"
              style={{
                width: "calc(90vh * 9/16)",
                maxWidth: "28rem",
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
                overscrollBehavior: "none",
              }}
            >
              {posts.map((post, index) => (
                <div
                  key={`${post.id}-desktop`}
                  className="h-full w-full shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <VideoReel
                    post={post}
                    isVisible={visiblePostIndex === index}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={onAuthRequired}
                    onLike={toggleLike}
                    onComment={() => {}}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>

            {/* Floating Navigation Controls */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => handleNavClick("up")}
                disabled={visiblePostIndex === 0}
                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 ${
                  isDark
                    ? "border-gray-700 bg-gray-900/40 text-white"
                    : "border-white/40 bg-white/40 text-gray-800"
                }`}
              >
                <ChevronUp size={24} />
              </button>
              <button
                onClick={() => handleNavClick("down")}
                disabled={visiblePostIndex === posts.length - 1}
                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 ${
                  isDark
                    ? "border-gray-700 bg-gray-900/40 text-white"
                    : "border-white/40 bg-white/40 text-gray-800"
                }`}
              >
                <ChevronDown size={24} />
              </button>
            </div>
          </div>

          {/* Comments Sidebar */}
          {activePost && (
            <div className="flex h-[90vh] w-full max-w-[500px] flex-col">
              <DesktopCommentsSidebar
                comments={mergedActiveComments}
                commentCount={activePost.stats.comments}
                postId={activePost.id}
                onToggleCommentLike={toggleCommentLike}
                onAddComment={addComment}
                isRefreshing={isRefreshingComments}
              />
            </div>
          )}
        </div>

        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="fixed left-1/2 top-8 z-50 flex -translate-x-1/2 transform items-center gap-3 rounded-full bg-black/60 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all shadow-2xl">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            <span>Refreshing Feed...</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </RootLayout>
  );
}
