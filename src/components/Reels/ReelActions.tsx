import React from "react";
import { FoodPost } from "./ReelTypes";
import { HeartIcon, MessageIcon, ShareIcon } from "./ReelIcons";

interface ReelActionsProps {
  post: FoodPost;
  isAuthenticated: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (post: FoodPost) => void;
  onAuthRequired: () => void;
}

const ReelActions: React.FC<ReelActionsProps> = ({
  post,
  isAuthenticated,
  onLike,
  onComment,
  onShare,
  onAuthRequired,
}) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 90,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 20,
        }}
      >
        {/* Like Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            className="reel-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              isAuthenticated ? onLike(post.id) : onAuthRequired();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              color: post.isLiked ? "#ef4444" : "#fff",
            }}
          >
            <div
              key={post.isLiked ? "liked" : "unliked"}
              className={`reel-action-icon ${
                post.isLiked ? "heart-liked" : "heart-unliked"
              }`}
            >
              <HeartIcon filled={post.isLiked} />
            </div>
          </button>
          <span className="reel-action-text">
            {post.stats.likes > 999
              ? `${(post.stats.likes / 1000).toFixed(1)}k`
              : post.stats.likes}
          </span>
        </div>

        {/* Comment Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            className="reel-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onComment(post.id);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              color: "#fff",
            }}
          >
            <div className="reel-action-icon">
              <MessageIcon />
            </div>
          </button>
          <span className="reel-action-text">
            {post.stats.comments > 999
              ? `${(post.stats.comments / 1000).toFixed(1)}k`
              : post.stats.comments}
          </span>
        </div>

        {/* Share Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            className="reel-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onShare(post);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              color: "#fff",
            }}
          >
            <div className="reel-action-icon">
              <ShareIcon />
            </div>
          </button>
          <span className="reel-action-text">Share</span>
        </div>
      </div>

      <style jsx>{`
        .reel-action-btn {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
            opacity 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .reel-action-btn:active {
          transform: scale(0.8);
          opacity: 0.8;
        }
        .reel-action-icon {
          filter: drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.6));
          transform: scale(1.15); /* Make standard SVGs slightly larger */
        }
        .reel-action-text {
          color: #fff;
          font-size: 13px;
          margin-top: 2px;
          font-weight: 600;
          text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.8);
        }
        @keyframes heartPulse {
          0% {
            transform: scale(1.15);
          }
          15% {
            transform: scale(1.8);
          }
          30% {
            transform: scale(0.8);
          }
          45% {
            transform: scale(1.5);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1.15);
          }
        }
        @keyframes heartShrink {
          0% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(0.7);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes heartGlow {
          0% {
            filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4));
          }
        }
        .heart-liked {
          animation: heartPulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: #ef4444 !important;
        }
        .heart-unliked {
          animation: heartShrink 0.35s ease-out;
        }
        .heart-liked svg {
          animation: heartGlow 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ReelActions;
