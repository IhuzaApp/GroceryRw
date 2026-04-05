"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar, Input } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "next-auth/react";

// Inline SVGs for icons
const XIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#fff" : "#9ca3af"}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

interface Comment {
  id: string;
  user_id?: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  comments: Comment[];
  commentCount: number;
  postId: string;
  onToggleCommentLike: (commentId: string) => void;
  onAddComment: (comment: string) => void;
  onDeleteComment: (commentId: string) => void;
  isRefreshing?: boolean;
}

export default function CommentsDrawer({
  open,
  onClose,
  comments,
  commentCount,
  postId,
  onToggleCommentLike,
  onAddComment,
  onDeleteComment,
  isRefreshing = false,
}: CommentsDrawerProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Check screen size on mount and resize
  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkScreenSize();

    const handleResize = () => {
      checkScreenSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset drag state when drawer opens/closes
  useEffect(() => {
    if (open) {
      setCurrentTranslateY(0);
      setIsDragging(false);
    }
  }, [open]);

  const handleAddComment = () => {
    if (!newComment.trim() || isAddingComment) return;

    const commentText = newComment;
    setNewComment(""); // Clear instantly

    // Trigger background submission without awaiting
    onAddComment(commentText);

    // Optional: Subtle haptic-like feedback or animation could be triggered here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Mobile drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;

    if (diff > 0) {
      // Only allow downward drag
      setCurrentTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);

    if (currentTranslateY > 100) {
      // Threshold to close
      onClose();
    } else {
      setCurrentTranslateY(0);
    }
  };

  if (!open) return null;

  const isDark = theme === "dark";
  const bgColor = isDark
    ? "rgba(17, 24, 39, 0.85)"
    : "rgba(255, 255, 255, 0.9)";
  const textColor = isDark ? "#ffffff" : "#111827";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.05)";
  const commentBgColor = isDark
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)";
  const commentTextColor = isDark ? "#e5e7eb" : "#374151";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";

  // Responsive styles based on screen size
  const getDrawerStyles = () => {
    if (isMobile) {
      return {
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: "85vh",
        width: "100%",
        transform: `translateY(${
          open
            ? currentTranslateY === 0
              ? "0%"
              : currentTranslateY + "px"
            : "100%"
        })`,
        borderRadius: "2rem 2rem 0 0",
        maxWidth: "100%",
        touchAction: "pan-y" as const,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
      };
    } else if (isTablet) {
      return {
        position: "fixed" as const,
        bottom: 0,
        left: "50%",
        transform: `translateX(-50%) ${
          open ? "translateY(0)" : "translateY(100%)"
        }`,
        height: "80vh",
        width: "min(95vw, 550px)",
        borderRadius: "2rem 2rem 0 0",
        maxWidth: "550px",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
      };
    } else {
      return {
        position: "fixed" as const,
        top: "2vh",
        right: "1.5vw",
        bottom: "2vh",
        width: "420px",
        height: "96vh",
        transform: open ? "translateX(0)" : "translateX(120%)",
        borderRadius: "2.5rem",
        maxWidth: "420px",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
      };
    }
  };

  const drawerStyles = getDrawerStyles();

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-comment {
          animation: slideIn 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99998] bg-black/40 transition-opacity duration-300"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Main Drawer Container */}
      <div
        ref={drawerRef}
        className="flex flex-col border transition-all duration-300"
        style={{
          ...drawerStyles,
          backgroundColor: bgColor,
          zIndex: 99999,
          borderColor: borderColor,
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Drag Handle */}
        {isMobile && (
          <div
            className="flex w-full items-center justify-center pt-4"
            onClick={onClose}
          >
            <div
              className={`h-1.5 w-12 rounded-full ${
                isDark ? "bg-white/10" : "bg-gray-200"
              }`}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-transparent px-8 py-6">
          <div className="flex items-center gap-3">
            <h3
              className="text-xl font-black tracking-tight"
              style={{ color: textColor }}
            >
              Comments
            </h3>
            <span className="flex h-6 items-center justify-center rounded-full bg-green-500/10 px-3 text-xs font-bold text-green-500">
              {commentCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
              isDark
                ? "bg-white/5 hover:bg-white/10"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <XIcon />
          </button>
        </div>

        {/* Comments List */}
        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-4">
          {console.log(
            `[CommentsDrawer] Rendering ${comments.length} comments for post ${postId}`
          )}
          {comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                  isDark ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <MessageIcon />
              </div>
              <h4 className="text-lg font-bold" style={{ color: textColor }}>
                No comments yet
              </h4>
              <p
                className="max-w-[200px] text-sm font-medium"
                style={{ color: secondaryTextColor }}
              >
                Start the conversation! Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="animate-comment group flex items-start gap-4 py-3"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Avatar
                      circle
                      src={comment.user.avatar || "/placeholder.svg"}
                      alt={comment.user.name}
                      className="h-full w-full shadow-sm ring-2 ring-white/5"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: textColor }}
                        >
                          {comment.user.name}
                        </span>
                        {comment.user.verified && (
                          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500">
                            <span className="text-[7px] font-bold text-white">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{
                          color: commentTextColor,
                          opacity: comment.id.startsWith("temp-") ? 0.6 : 1,
                        }}
                      >
                        {comment.text}
                      </p>
                      <div className="mt-1.5 flex items-center gap-5">
                        <span
                          className="text-[11px] font-semibold tracking-wider"
                          style={{ color: secondaryTextColor }}
                        >
                          {comment.timestamp}
                        </span>
                        <button
                          className="text-[11px] font-bold tracking-wider transition-colors hover:text-white"
                          style={{ color: secondaryTextColor }}
                        >
                          Reply
                        </button>
                        {comment.user_id === currentUserId && (
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-[11px] font-bold text-red-400 opacity-60 transition-all hover:opacity-100"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex min-w-[32px] flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => onToggleCommentLike(comment.id)}
                      className={`flex items-center justify-center transition-all active:scale-125 ${
                        comment.isLiked
                          ? "text-red-500"
                          : "text-gray-400 opacity-30 hover:opacity-100"
                      }`}
                    >
                      <HeartIcon filled={comment.isLiked} />
                    </button>
                    {comment.likes > 0 && (
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: secondaryTextColor }}
                      >
                        {comment.likes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className={`p-6 pb-8 sm:p-8 ${
            isDark ? "bg-black/20" : "bg-gray-50/50"
          }`}
        >
          <div
            className={`flex items-center gap-4 rounded-[1.75rem] border-2 p-1.5 transition-all focus-within:ring-4 focus-within:ring-green-500/10 ${
              isDark
                ? "border-white/5 bg-gray-800/50 focus-within:border-green-500/50"
                : "border-gray-100 bg-white focus-within:border-green-500/50"
            }`}
          >
            <div className="ml-2 h-10 w-10 flex-shrink-0">
              <Avatar
                circle
                src={session?.user?.image || "/placeholder.svg"}
                alt="You"
                className="h-full w-full"
              />
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a comment..."
              className="flex-1 border-none bg-transparent px-2 py-3 text-[15px] font-medium placeholder-gray-500 focus:outline-none focus:ring-0"
              style={{ color: textColor }}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90 ${
                newComment.trim()
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                  : "bg-gray-200 text-gray-400 dark:bg-white/5"
              }`}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const MessageIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
