"use client";

import React, { useState } from "react";
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
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
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
}

export default function CommentsDrawer({
  open,
  onClose,
  comments,
  commentCount,
  postId,
  onToggleCommentLike,
  onAddComment,
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState("");
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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

  console.log("CommentsDrawer render:", {
    open,
    commentCount,
    postId,
    commentsLength: comments.length,
    comments,
    isMobile,
    isTablet,
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(postId, newComment);
    setNewComment("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddComment();
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
      // Mobile: Bottom sheet
      return {
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        height: "75vh",
        width: "100%",
        transform: open ? "translateY(0)" : "translateY(100%)",
        borderRadius: "20px 20px 0 0",
        maxWidth: "100%",
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
        height: "70vh",
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
        style={{
          ...drawerStyles,
          backgroundColor: bgColor,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s ease-out",
          boxShadow:
            isMobile || isTablet
              ? "0 -10px 25px -5px rgba(0, 0, 0, 0.1)"
              : "-10px 0 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            minHeight: "60px",
          }}
        >
          <h3
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 600,
              margin: 0,
              color: textColor,
            }}
          >
            {commentCount} Comments
          </h3>
          <Button
            appearance="ghost"
            size="sm"
            onClick={onClose}
            style={{ color: textColor }}
          >
            <XIcon />
          </Button>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 60px)",
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
                          }}
                        >
                          {comment.text}
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
                        width: isMobile ? 20 : 24,
                        height: isMobile ? 20 : 24,
                        flexShrink: 0,
                        color: comment.isLiked ? "#ef4444" : secondaryTextColor,
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

          {/* Comment Input */}
          <div
            style={{
              padding: isMobile ? "12px" : "16px",
              borderTop: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "8px" : "12px",
              }}
            >
              <Avatar
                circle
                size={isMobile ? "xs" : "sm"}
                src="/placeholder.svg?height=32&width=32"
                alt="You"
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "6px" : "8px",
                }}
              >
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={setNewComment}
                  style={{
                    flex: 1,
                    border: "none",
                    backgroundColor: commentBgColor,
                    borderRadius: isMobile ? "16px" : "20px",
                    padding: isMobile ? "6px 12px" : "8px 16px",
                    color: textColor,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  size="sm"
                  appearance="primary"
                  color="blue"
                  style={{
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32,
                    borderRadius: "50%",
                    padding: 0,
                    backgroundColor: "#3b82f6",
                    border: "none",
                  }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <SendIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
