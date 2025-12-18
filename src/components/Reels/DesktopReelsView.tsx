import React, { useEffect } from "react";
import Link from "next/link";
import RootLayout from "@components/ui/layout";
import VideoReel from "./VideoReel";
import DesktopCommentsSidebar from "./DesktopCommentsSidebar";

// Types - will be imported from parent component
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
  isRefreshing,
  theme,
}: DesktopReelsViewProps) {
  // Get active post based on visible index - always show sidebar if there's a post
  const activePost = (posts.length > 0 && visiblePostIndex >= 0 && visiblePostIndex < posts.length) 
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

      if (currentIndex !== visiblePostIndex && currentIndex >= 0 && currentIndex < posts.length) {
        setVisiblePostIndex(currentIndex);
      }

      setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = visiblePostIndex;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          if (currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
          }
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = posts.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        const targetElement = container.children[nextIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          setVisiblePostIndex(nextIndex);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [posts.length, visiblePostIndex, containerRef, setVisiblePostIndex]);

  return (
    <RootLayout>
      {/* Back to Home Button */}
      <Link href="/">
        <button
          style={{
            position: "fixed",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 100,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: theme === "dark" ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
            border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(55, 65, 81, 0.95)" : "rgba(255, 255, 255, 1)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme === "dark" ? "#f9fafb" : "#111827"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </Link>

      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-black bg-opacity-75 px-4 py-2 text-sm text-white">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Refreshing...
        </div>
      )}

      {/* Main Reels Container - Centered vertically and horizontally */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2.5vh 0",
          gap: "16px",
        }}
      >
        {/* Video Reel Container */}
        <div
          ref={containerRef}
          className="scrollbar-hide reels-container"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "28rem",
            height: "95vh",
            minHeight: "95vh",
            maxHeight: "95vh",
            overflowY: "auto",
            overflowX: "hidden",
            scrollSnapType: "y mandatory",
            scrollBehavior: "smooth",
            overscrollBehavior: "none",
            padding: 0,
            borderRadius: "1rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
          }}
        >
          {posts.map((post, index) => (
            <div
              key={`${post.id}-desktop`}
              data-index={index}
              style={{ 
                scrollSnapAlign: "start",
                width: "100%",
                height: "95vh",
                minHeight: "95vh",
                maxHeight: "95vh",
                flexShrink: 0,
                margin: 0,
                padding: 0
              }}
            >
              <VideoReel
                post={post}
                isVisible={visiblePostIndex === index}
                isAuthenticated={isAuthenticated}
                onLike={toggleLike}
                onComment={() => {}}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>

        {/* Comments Sidebar - Outside and next to the reel container */}
        {activePost && (
          <DesktopCommentsSidebar
            comments={mergedActiveComments}
            commentCount={activePost.stats.comments}
            postId={activePost.id}
            onToggleCommentLike={toggleCommentLike}
            onAddComment={addComment}
            isRefreshing={isRefreshingComments}
          />
        )}
      </div>
    </RootLayout>
  );
}

