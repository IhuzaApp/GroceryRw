import React, { useEffect } from "react";
import RootLayout from "@components/ui/layout";
import VideoReel from "./VideoReel";
import CommentsDrawer from "./CommentsDrawer";

// Types - will be imported from parent component
type FoodPost = any;
type Comment = any;

interface DesktopReelsViewProps {
  posts: FoodPost[];
  visiblePostIndex: number;
  setVisiblePostIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isAuthenticated: boolean;
  activePost: FoodPost | null;
  showComments: boolean;
  openComments: (postId: string) => void;
  closeComments: () => void;
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
  activePost,
  showComments,
  closeComments,
  mergedActiveComments,
  toggleCommentLike,
  addComment,
  isRefreshingComments,
  toggleLike,
  handleShare,
  isRefreshing,
  theme,
}: DesktopReelsViewProps) {
  // Keyboard and scroll handling for desktop
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return;

    const container = containerRef.current;

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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [posts.length, visiblePostIndex, containerRef, setVisiblePostIndex]);

  return (
    <RootLayout>
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
        }}
      >
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
              onComment={(postId) => openComments(postId)}
              onShare={handleShare}
            />
          </div>
        ))}
        </div>
      </div>

      {/* Comments Drawer */}
      {activePost && (
        <CommentsDrawer
          open={showComments}
          onClose={closeComments}
          comments={mergedActiveComments}
          commentCount={activePost.stats.comments}
          postId={activePost.id}
          onToggleCommentLike={toggleCommentLike}
          onAddComment={addComment}
          isRefreshing={isRefreshingComments}
        />
      )}
    </RootLayout>
  );
}

