import React, { useState } from "react";
import { Button, Avatar, Input } from "rsuite";
import { useTheme } from "../../context/ThemeContext";

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "currentColor"}
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
  const bgColor = isDark ? "rgba(31, 41, 55, 0.4)" : "rgba(255, 255, 255, 0.4)";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const borderColor = isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.3)";
  const commentBgColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(243, 244, 246, 0.5)";
  const commentTextColor = isDark ? "#e5e7eb" : "#374151";
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
        width: "100%",
        height: "90vh",
        backgroundColor: bgColor,
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "2rem",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 28px",
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
              color: textColor,
              letterSpacing: "-0.01em",
            }}
          >
            Comments
          </h3>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: secondaryTextColor,
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              padding: "2px 10px",
              borderRadius: "12px",
            }}
          >
            {commentCount}
          </span>
        </div>
        {isRefreshing && (
          <div
            className="animate-spin"
            style={{
              width: "18px",
              height: "18px",
              border: `2px solid ${borderColor}`,
              borderTopColor: textColor,
              borderRadius: "50%",
            }}
          />
        )}
      </div>

      {/* Comments List */}
      <div
        className="scrollbar-custom"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {comments.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: secondaryTextColor,
              opacity: 0.6,
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 600 }}>No comments yet</div>
            <div style={{ fontSize: "14px" }}>Start the conversation!</div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={{ display: "flex", gap: "16px" }}>
              <Avatar
                circle
                size="md"
                src={comment.user.avatar || "/placeholder.svg"}
                alt={comment.user.name}
                style={{ border: `2px solid ${borderColor}` }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: commentBgColor,
                    borderRadius: "18px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: textColor,
                      }}
                    >
                      {comment.user.name}
                    </span>
                    {comment.user.verified && (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          backgroundColor: "#3b82f6",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}>✓</span>
                      </div>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      color: commentTextColor,
                      lineHeight: 1.5,
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
                    gap: "20px",
                    marginTop: 8,
                    paddingLeft: "8px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: secondaryTextColor }}>
                    {comment.timestamp}
                  </span>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: comment.isLiked ? "#ef4444" : secondaryTextColor,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: comment.isLiked ? 600 : 400,
                      transition: "all 0.2s",
                    }}
                    onClick={() => onToggleCommentLike(postId, comment.id)}
                  >
                    <HeartIcon filled={comment.isLiked} />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div
        style={{
          padding: "24px 28px",
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Avatar
            circle
            size="md"
            src="/placeholder.svg?height=40&width=40"
            alt="You"
            style={{ border: `2px solid ${borderColor}` }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              position: "relative",
            }}
          >
            <Input
              placeholder={isAddingComment ? "Posting..." : "Add a comment..."}
              value={newComment}
              onChange={setNewComment}
              disabled={isAddingComment}
              style={{
                flex: 1,
                border: `1px solid ${borderColor}`,
                backgroundColor: commentBgColor,
                borderRadius: "24px",
                padding: "10px 48px 10px 20px",
                color: textColor,
                fontSize: "15px",
                transition: "all 0.2s",
              }}
              onKeyPress={handleKeyPress}
            />
            <Button
              size="sm"
              appearance="primary"
              style={{
                position: "absolute",
                right: "6px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                padding: 0,
                backgroundColor: isDark ? "#3b82f6" : "#2563eb",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                transition: "all 0.2s",
              }}
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAddingComment}
            >
              {isAddingComment ? (
                <div
                  className="animate-spin"
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
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
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: ${borderColor};
          border-radius: 10px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
