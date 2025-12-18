import React, { useState } from "react";
import { Button, Avatar, Input } from "rsuite";
import { useTheme } from "../../context/ThemeContext";

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#fff" : "#9ca3af"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="20"
    height="20"
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
}

interface DesktopCommentsSidebarProps {
  comments: Comment[];
  commentCount: number;
  postId: string;
  onToggleCommentLike: (postId: string, commentId: string) => void;
  onAddComment: (postId: string, comment: string) => void;
  isRefreshing?: boolean;
}

export default function DesktopCommentsSidebar({
  comments,
  commentCount,
  postId,
  onToggleCommentLike,
  onAddComment,
  isRefreshing = false,
}: DesktopCommentsSidebarProps) {
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const commentBgColor = isDark ? "#374151" : "#f3f4f6";
  const commentTextColor = isDark ? "#d1d5db" : "#374151";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";

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

  return (
    <div
      style={{
        width: "450px",
        minWidth: "450px",
        height: "95vh",
        minHeight: "95vh",
        maxHeight: "95vh",
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        borderRadius: "1rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 20px",
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
          minHeight: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3
            style={{
              fontSize: "18px",
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

      {/* Comments List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          scrollbarWidth: "thin",
          scrollbarColor: `${borderColor} transparent`,
        }}
      >
        {comments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: secondaryTextColor,
            }}
          >
            <div
              style={{
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              No comments yet
            </div>
            <div style={{ fontSize: "14px" }}>Be the first to comment!</div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{ display: "flex", gap: "12px" }}
              >
                <Avatar
                  circle
                  size="sm"
                  src={comment.user.avatar || "/placeholder.svg"}
                  alt={comment.user.name}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      backgroundColor: commentBgColor,
                      borderRadius: "16px",
                      padding: "8px 12px",
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
                          fontSize: "14px",
                          color: textColor,
                        }}
                      >
                        {comment.user.name}
                      </span>
                      {comment.user.verified && (
                        <div
                          style={{
                            width: 12,
                            height: 12,
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
                              fontSize: "10px",
                            }}
                          >
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: commentTextColor,
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {comment.text}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginTop: 4,
                      paddingLeft: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: secondaryTextColor,
                      }}
                    >
                      {comment.timestamp}
                    </span>
                    <button
                      style={{
                        fontSize: "12px",
                        color: secondaryTextColor,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() => onToggleCommentLike(postId, comment.id)}
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
                  </div>
                </div>
                <Button
                  appearance="ghost"
                  size="sm"
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    color: comment.isLiked ? "#ef4444" : secondaryTextColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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

      {/* Comment Input */}
      <div
        style={{
          padding: "16px",
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Avatar
            circle
            size="sm"
            src="/placeholder.svg?height=32&width=32"
            alt="You"
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
                border: "none",
                backgroundColor: commentBgColor,
                borderRadius: "20px",
                padding: "8px 16px",
                color: textColor,
                fontSize: "14px",
                opacity: isAddingComment ? 0.7 : 1,
              }}
              onKeyPress={handleKeyPress}
            />
            <Button
              size="sm"
              appearance="primary"
              color="blue"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                padding: 0,
                backgroundColor: "#3b82f6",
                border: "none",
              }}
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAddingComment}
            >
              {isAddingComment ? (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <SendIcon />
              )}
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
