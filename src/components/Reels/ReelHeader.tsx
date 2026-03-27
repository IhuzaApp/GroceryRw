import React from "react";
import { Avatar, Badge } from "rsuite";
import { FoodPost, getPostTypeColor, getCategoryColor, isValidMediaUrl } from "./ReelTypes";

interface ReelHeaderProps {
  post: FoodPost;
}

const ReelHeader: React.FC<ReelHeaderProps> = ({ post }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "48px 16px 16px 16px", // Extra top padding for mobile status bar clearance
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.3)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span style={{ textTransform: "capitalize" }}>{post.type}</span>
        </div>
        <div
          style={{
            backgroundColor: `${getCategoryColor(post.content.category)}99`, // slightly opaque category color
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            fontWeight: "600",
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span style={{ textTransform: "capitalize" }}>{post.content.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ReelHeader;
