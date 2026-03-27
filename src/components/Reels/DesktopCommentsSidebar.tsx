import React, { useState } from "react";
import { Button, Avatar, Input } from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "next-auth/react";

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

import { isValidMediaUrl } from "./ReelTypes";

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
}

interface DesktopCommentsSidebarProps {
  comments: Comment[];
  commentCount: number;
  postId: string;
  onToggleCommentLike: (commentId: string) => void;
  onAddComment: (comment: string) => void;
  onDeleteComment: (commentId: string) => void;
  isRefreshing?: boolean;
}

export default function DesktopCommentsSidebar({
  comments,
  commentCount,
  postId,
  onToggleCommentLike,
  onAddComment,
  onDeleteComment,
  isRefreshing = false,
}: DesktopCommentsSidebarProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
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

  const handleAddComment = () => {
    if (!newComment.trim() || isAddingComment) return;

    const commentText = newComment;
    setNewComment(""); // Clear instantly
    
    // Trigger background submission without awaiting
    onAddComment(commentText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div
      className="scrollbar-hide"
      style={{
        width: "100%",
        height: "90vh",
        backgroundColor: bgColor,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "2.5rem",
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
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
          padding: "28px 32px",
          borderBottom: "1px solid transparent",
          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 900,
              margin: 0,
              color: textColor,
              letterSpacing: "-0.02em",
            }}
          >
            Comments
          </h3>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "rgb(34 197 94)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              padding: "2px 12px",
              borderRadius: "20px",
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
              borderTopColor: "rgb(34 197 94)",
              borderRadius: "50%",
            }}
          />
        )}
      </div>

      {/* Comments List */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
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
              gap: "16px",
              color: secondaryTextColor,
              opacity: 0.5,
            }}
          >
            <div style={{ transform: "scale(1.5)", marginBottom: "8px" }}>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
               </svg>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>No comments yet</div>
            <div style={{ fontSize: "14px", fontWeight: 500 }}>Join the conversation!</div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={{ display: "flex", gap: "16px" }}>
              <div style={{ position: "relative" }}>
                 <Avatar
                   circle
                   size="md"
                   src={
                     comment.user.avatar && isValidMediaUrl(comment.user.avatar)
                       ? comment.user.avatar
                       : "/placeholder.svg"
                   }
                   alt={comment.user.name}
                   style={{ border: `2px solid transparent`, boxShadow: `0 0 0 2px rgba(34, 197, 94, 0.2)` }}
                 />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: commentBgColor,
                    borderRadius: "1.5rem",
                    padding: "16px 20px",
                    boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.2)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
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
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <span style={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}>✓</span>
                      </div>
                    )}
                    {/* Delete button for own comments */}
                    {comment.user_id === currentUserId && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          padding: "4px",
                          color: "#f87171",
                          opacity: 0.5,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                        className="hover-opacity-100"
                        title="Delete comment"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      color: commentTextColor,
                      lineHeight: 1.6,
                      margin: 0,
                      fontWeight: 500,
                      opacity: comment.id.startsWith("temp-") ? 0.6 : 1,
                    }}
                  >
                    {comment.text}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: 10,
                    paddingLeft: "12px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, color: secondaryTextColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {comment.timestamp}
                  </span>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: comment.isLiked ? "#ef4444" : secondaryTextColor,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.2s",
                    }}
                    onClick={() => onToggleCommentLike(comment.id)}
                  >
                    <HeartIcon filled={comment.isLiked} />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                  <button
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: secondaryTextColor,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Reply
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
          padding: "32px",
          borderTopColor: "transparent",
          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
            borderRadius: "2rem",
            padding: "6px 6px 6px 20px",
            border: `2px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}`,
            boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
          }}
          className="focus-within-ring"
        >
          <Avatar
            circle
            size="md"
            src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
            alt="You"
          />
          <input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              backgroundColor: "transparent",
              color: textColor,
              fontSize: "15px",
              fontWeight: 600,
              padding: "12px 0",
              outline: "none",
            }}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              padding: 0,
              backgroundColor: newComment.trim() ? "rgb(34 197 94)" : "rgba(255,255,255,0.05)",
              color: newComment.trim() ? "#fff" : secondaryTextColor,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: newComment.trim() ? "0 8px 20px rgba(34, 197, 94, 0.3)" : "none",
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              cursor: newComment.trim() ? "pointer" : "not-allowed",
              transform: newComment.trim() ? "scale(1)" : "scale(0.95)",
            }}
            className={newComment.trim() ? "active-scale" : ""}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
        .active-scale:active {
          transform: scale(0.9) !important;
        }
        .focus-within-ring:focus-within {
          border-color: rgba(34, 197, 94, 0.5) !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
