import React from "react";
import { Avatar, Badge } from "rsuite";
import { FoodPost, getPostTypeColor, getCategoryColor } from "./ReelTypes";

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
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 10,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                    circle
                    size="md"
                    src={post.creator.avatar || "/placeholder.svg"}
                    alt={post.creator.name}
                    style={{ border: "2px solid white" }}
                />
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                            {post.creator.name}
                        </span>
                        {post.creator.verified && (
                            <div
                                style={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: "#3b82f6",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge
                    style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        backgroundColor: `${getPostTypeColor(post.type)}20`,
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <span style={{ textTransform: "capitalize" }}>{post.type}</span>
                </Badge>
                <Badge
                    style={{
                        backgroundColor: `${getCategoryColor(post.content.category)}20`,
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.3)",
                        fontWeight: "500",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    {post.content.category}
                </Badge>
            </div>
        </div>
    );
};

export default ReelHeader;
