"use client"

import React, { useState } from "react"
import { Drawer, Button, Avatar, Input } from "rsuite"

// Inline SVGs for icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
)

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    verified?: boolean
  }
  text: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface CommentsDrawerProps {
  open: boolean
  onClose: () => void
  comments: Comment[]
  commentCount: number
  postId: string
  onToggleCommentLike: (postId: string, commentId: string) => void
  onAddComment: (postId: string, comment: string) => void
}

export default function CommentsDrawer({
  open,
  onClose,
  comments,
  commentCount,
  postId,
  onToggleCommentLike,
  onAddComment
}: CommentsDrawerProps) {
  const [newComment, setNewComment] = useState("")

  console.log('CommentsDrawer render:', { open, commentCount, postId })

  const handleAddComment = () => {
    if (!newComment.trim()) return
    onAddComment(postId, newComment)
    setNewComment("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddComment()
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      size="80%"
      backdrop={true}
      style={{ 
        borderRadius: "24px 24px 0 0",
        zIndex: 9999
      }}
    >
      <Drawer.Header>
        <Drawer.Title style={{ fontSize: "18px", fontWeight: 600 }}>
          {commentCount} Comments
        </Drawer.Title>
        <Button appearance="ghost" size="sm" onClick={onClose}>
          <XIcon />
        </Button>
      </Drawer.Header>

      <Drawer.Body style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Comments List */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ display: "flex", gap: 12 }}>
                <Avatar circle size="sm" src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ backgroundColor: "#f3f4f6", borderRadius: "16px", padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{comment.user.name}</span>
                      {comment.user.verified && (
                        <div style={{ width: 12, height: 12, backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: "14px", color: "#374151" }}>{comment.text}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4, paddingLeft: 12 }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{comment.timestamp}</span>
                    <button
                      style={{ fontSize: "12px", color: "#6b7280", border: "none", background: "none", cursor: "pointer" }}
                      onClick={() => onToggleCommentLike(postId, comment.id)}
                    >
                      {comment.likes > 0 && (
                        <span style={{ color: comment.isLiked ? "#ef4444" : "#6b7280", fontWeight: comment.isLiked ? 500 : 400 }}>
                          {comment.likes} {comment.likes === 1 ? "like" : "likes"}
                        </span>
                      )}
                    </button>
                    <button style={{ fontSize: "12px", color: "#6b7280", border: "none", background: "none", cursor: "pointer" }}>Reply</button>
                  </div>
                </div>
                <Button
                  appearance="ghost"
                  size="sm"
                  style={{ width: 24, height: 24, flexShrink: 0 }}
                  onClick={() => onToggleCommentLike(postId, comment.id)}
                >
                  <HeartIcon filled={comment.isLiked} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar circle size="sm" src="/placeholder.svg?height=32&width=32" alt="You" />
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={setNewComment}
                style={{ flex: 1, border: "none", backgroundColor: "#f3f4f6", borderRadius: "20px", padding: "8px 16px" }}
                onKeyPress={handleKeyPress}
              />
              <Button
                size="sm"
                appearance="primary"
                color="blue"
                style={{ width: 32, height: 32, borderRadius: "50%", padding: 0 }}
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <SendIcon />
              </Button>
            </div>
          </div>
        </div>
      </Drawer.Body>
    </Drawer>
  )
} 