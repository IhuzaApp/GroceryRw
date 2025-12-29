"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar, Input } from "rsuite";
import { useTheme } from "../../context/ThemeContext";

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
  onToggleCommentLike: (postId: string, commentId: string) => void;
  onAddComment: (postId: string, comment: string) => void;
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
  isRefreshing = false,
}: CommentsDrawerProps) {
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

  const handleAddComment = async () => {
    if (!newComment.trim() || isAddingComment) return;

    try {
      setIsAddingComment(true);
      await onAddComment(postId, newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsAddingComment(false);
    }
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
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const commentBgColor = isDark ? "#374151" : "#f3f4f6";
  const commentTextColor = isDark ? "#d1d5db" : "#374151";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";

  // Responsive styles based on screen size
  const getDrawerStyles = () => {
    if (isMobile) {
      // Mobile: Enhanced bottom sheet with drag support - expanded for better UX
      return {
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: "75vh", // Reduced height to not fill entire screen
        maxHeight: "600px", // Maximum height cap
        width: "100%",
        transform: `translateY(${open ? currentTranslateY : 100}%)`,
        borderRadius: "24px 24px 0 0",
        maxWidth: "100%",
        touchAction: "pan-y" as const,
      };
    } else if (isTablet) {
      // Tablet: Centered modal
      return {
        position: "fixed" as const,
        bottom: 0,
        left: "50%",
        transform: `translateX(-50%) ${
          open ? "translateY(0)" : "translateY(100%)"
        }`,
        height: "75vh",
        width: "min(90vw, 500px)",
        borderRadius: "20px 20px 0 0",
        maxWidth: "500px",
      };
    } else {
      // Desktop: Side panel
      return {
        position: "fixed" as const,
        top: 0,
        right: 0,
        bottom: 0,
        width: "400px",
        height: "100vh",
        transform: open ? "translateX(0)" : "translateX(100%)",
        borderRadius: "0",
        maxWidth: "400px",
      };
    }
  };

  const drawerStyles = getDrawerStyles();

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 99998,
          opacity: open ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
        onClick={onClose}
      />

      {/* Custom Modal */}
      <div
        ref={drawerRef}
        style={{
          ...drawerStyles,
          backgroundColor: bgColor,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow:
            isMobile || isTablet
              ? "0 -10px 25px -5px rgba(0, 0, 0, 0.1)"
              : "-10px 0 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Drag Handle */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "8px 0",
              borderBottom: "none",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: isDark ? "#6b7280" : "#d1d5db",
                borderRadius: "2px",
              }}
            />
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "14px 16px" : "16px 20px",
            borderBottom: "none",
            backgroundColor: bgColor,
            minHeight: isMobile ? "50px" : "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? "18px" : "18px",
                fontWeight: 600,
                margin: 0,
                color: textColor,
              }}
            >
              {commentCount} Comments
            </h3>
            {isRefreshing && (
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: `2px solid ${borderColor}`,
                  borderTop: `2px solid ${textColor}`,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: `calc(100% - ${isMobile ? "50px" : "60px"})`,
            backgroundColor: bgColor,
          }}
        >
          {/* Comments List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "12px" : "16px",
              scrollbarWidth: "thin",
              scrollbarColor: `${borderColor} transparent`,
              // Prevent scroll when dragging
              touchAction: isDragging ? "none" : "pan-y",
            }}
          >
            {comments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "30px 15px" : "40px 20px",
                  color: secondaryTextColor,
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    marginBottom: "8px",
                  }}
                >
                  No comments yet
                </div>
                <div style={{ fontSize: isMobile ? "12px" : "14px" }}>
                  Be the first to comment!
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "12px" : "16px",
                }}
              >
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{ display: "flex", gap: isMobile ? "8px" : "12px" }}
                  >
                    <Avatar
                      circle
                      size={isMobile ? "xs" : "sm"}
                      src={comment.user.avatar || "/placeholder.svg"}
                      alt={comment.user.name}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          backgroundColor: commentBgColor,
                          borderRadius: isMobile ? "12px" : "16px",
                          padding: isMobile ? "6px 10px" : "8px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: isMobile ? "12px" : "14px",
                              color: textColor,
                            }}
                          >
                            {comment.user.name}
                          </span>
                          {comment.user.verified && (
                            <div
                              style={{
                                width: isMobile ? 10 : 12,
                                height: isMobile ? 10 : 12,
                                backgroundColor: "#3b82f6",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: "#fff",
                                  fontSize: isMobile ? "8px" : "10px",
                                }}
                              >
                                ✓
                              </span>
                            </div>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: isMobile ? "12px" : "14px",
                            color: commentTextColor,
                            lineHeight: 1.4,
                            opacity: comment.id.startsWith("temp-") ? 0.7 : 1,
                          }}
                        >
                          {comment.text}
                          {comment.id.startsWith("temp-") && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: secondaryTextColor,
                                fontStyle: "italic",
                                marginLeft: "4px",
                              }}
                            >
                              (sending...)
                            </span>
                          )}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? "12px" : "16px",
                          marginTop: 4,
                          paddingLeft: isMobile ? "8px" : "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: isMobile ? "10px" : "12px",
                            color: secondaryTextColor,
                          }}
                        >
                          {comment.timestamp}
                        </span>
                        <button
                          style={{
                            fontSize: isMobile ? "10px" : "12px",
                            color: secondaryTextColor,
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            onToggleCommentLike(postId, comment.id)
                          }
                        >
                          {comment.likes > 0 && (
                            <span
                              style={{
                                color: comment.isLiked
                                  ? "#ef4444"
                                  : secondaryTextColor,
                                fontWeight: comment.isLiked ? 500 : 400,
                              }}
                            >
                              {comment.likes}{" "}
                              {comment.likes === 1 ? "like" : "likes"}
                            </span>
                          )}
                        </button>
                        <button
                          style={{
                            fontSize: isMobile ? "10px" : "12px",
                            color: secondaryTextColor,
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                          }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                    <Button
                      appearance="ghost"
                      size="sm"
                      style={{
                        width: isMobile ? 32 : 36,
                        height: isMobile ? 32 : 36,
                        flexShrink: 0,
                        background: "none",
                        border: "none",
                        color: comment.isLiked ? "#ef4444" : secondaryTextColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() => onToggleCommentLike(postId, comment.id)}
                    >
                      <HeartIcon filled={comment.isLiked} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Input - Enhanced for mobile */}
          <div
            style={{
              padding: isMobile ? "16px" : "16px",
              paddingBottom: isMobile ? "20px" : "16px",
              borderTop: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: isMobile ? "10px" : "12px",
              }}
            >
              <Avatar
                circle
                size={isMobile ? "sm" : "sm"}
                src="/placeholder.svg?height=32&width=32"
                alt="You"
                style={{
                  flexShrink: 0,
                  marginBottom: isMobile ? "2px" : "0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: isMobile ? "8px" : "8px",
                  minHeight: isMobile ? "48px" : "44px",
                }}
              >
                <Input
                  placeholder={
                    isAddingComment ? "Adding comment..." : "Add a comment..."
                  }
                  value={newComment}
                  onChange={setNewComment}
                  disabled={isAddingComment}
                  style={{
                    flex: 1,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: commentBgColor,
                    borderRadius: isMobile ? "24px" : "20px",
                    padding: isMobile ? "12px 18px" : "10px 16px",
                    color: textColor,
                    fontSize: isMobile ? "16px" : "14px",
                    minHeight: isMobile ? "48px" : "44px",
                    lineHeight: "1.5",
                    opacity: isAddingComment ? 0.7 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={(e) => {
                    if (isMobile) {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.backgroundColor = isDark
                        ? "#4b5563"
                        : "#ffffff";
                    }
                  }}
                  onBlur={(e) => {
                    if (isMobile) {
                      e.target.style.borderColor = borderColor;
                      e.target.style.backgroundColor = commentBgColor;
                    }
                  }}
                />
                <Button
                  size={isMobile ? "md" : "sm"}
                  appearance="primary"
                  color="blue"
                  style={{
                    width: isMobile ? 48 : 40,
                    height: isMobile ? 48 : 40,
                    borderRadius: "50%",
                    padding: 0,
                    backgroundColor: newComment.trim() ? "#3b82f6" : "#9ca3af",
                    border: "none",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                >
                  {isAddingComment ? (
                    <svg
                      width={isMobile ? "24" : "20"}
                      height={isMobile ? "24" : "20"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ) : (
                    <SendIcon />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
