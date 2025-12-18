import React, { useEffect } from "react";
import VideoReel from "./VideoReel";
import CommentsDrawer from "./CommentsDrawer";

// Types - will be imported from parent component
type FoodPost = any;
type Comment = any;

interface MobileReelsViewProps {
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
}

export default function MobileReelsView({
  posts,
  visiblePostIndex,
  setVisiblePostIndex,
  containerRef,
  isAuthenticated,
  activePost,
  showComments,
  openComments,
  closeComments,
  mergedActiveComments,
  toggleCommentLike,
  addComment,
  isRefreshingComments,
  toggleLike,
  handleShare,
  isRefreshing,
}: MobileReelsViewProps) {
  // Scroll handling for mobile
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return;

    const container = containerRef.current;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const scrollPosition = container.scrollTop;
      const windowHeight = window.innerHeight;
      const currentIndex = Math.round(scrollPosition / windowHeight);

      if (currentIndex !== visiblePostIndex && currentIndex >= 0 && currentIndex < posts.length) {
        setVisiblePostIndex(currentIndex);
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, visiblePostIndex, containerRef, setVisiblePostIndex]);

  return (
    <>
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-black bg-opacity-75 px-4 py-2 text-sm text-white">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Refreshing...
        </div>
      )}

      {/* Main Reels Container - Full Screen */}
      <div
        ref={containerRef}
        className="scrollbar-hide reels-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          overscrollBehavior: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {posts.map((post, index) => (
          <div
            key={`${post.id}-mobile`}
            data-index={index}
            style={{ 
              scrollSnapAlign: "start",
              width: "100%",
              height: "100vh",
              minHeight: "100vh",
              flexShrink: 0
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
    </>
  );
}

