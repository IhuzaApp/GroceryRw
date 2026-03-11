import React from "react";
import { FoodPost } from "./ReelTypes";
import { HeartIcon, MessageIcon, ShareIcon } from "./ReelIcons";

interface ReelActionsProps {
    post: FoodPost;
    isAuthenticated: boolean;
    onLike: (postId: string) => void;
    onComment: (postId: string) => void;
    onShare: (post: FoodPost) => void;
}

const ReelActions: React.FC<ReelActionsProps> = ({
    post,
    isAuthenticated,
    onLike,
    onComment,
    onShare,
}) => {
    return (
        <div
            style={{
                position: "absolute",
                right: 16,
                bottom: 80,
                display: "flex",
                flexDirection: "column",
                gap: 24,
                zIndex: 20,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    onClick={isAuthenticated ? () => onLike(post.id) : undefined}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        opacity: isAuthenticated ? 1 : 0.5,
                        transition: "opacity 0.2s ease",
                        color: post.isLiked ? "#ef4444" : "#fff",
                    }}
                >
                    <HeartIcon filled={post.isLiked} />
                </div>
                <span
                    style={{
                        color: "#fff",
                        fontSize: "12px",
                        marginTop: 4,
                        fontWeight: 500,
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                >
                    {post.stats.likes > 999
                        ? `${(post.stats.likes / 1000).toFixed(1)}k`
                        : post.stats.likes}
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    onClick={isAuthenticated ? () => onComment(post.id) : undefined}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        opacity: isAuthenticated ? 1 : 0.5,
                        transition: "opacity 0.2s ease",
                    }}
                >
                    <MessageIcon />
                </div>
                <span
                    style={{
                        color: "#fff",
                        fontSize: "12px",
                        marginTop: 4,
                        fontWeight: 500,
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                >
                    {post.stats.comments}
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    onClick={isAuthenticated ? () => onShare(post) : undefined}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                        opacity: isAuthenticated ? 1 : 0.5,
                        transition: "opacity 0.2s ease",
                    }}
                >
                    <ShareIcon />
                </div>
            </div>
        </div>
    );
};

export default ReelActions;
