import React from "react";
import { Badge } from "rsuite";
import { useRouter } from "next/router";
import {
    FoodPost,
    RestaurantPost,
    SupermarketPost,
    ChefPost,
} from "./ReelTypes";
import {
    UtensilsIcon,
    StarIcon,
    MapPinIcon,
    ClockIcon,
    StoreIcon,
    ShoppingCartIcon,
    BookOpenIcon,
    YoutubeIcon,
    ChefHatIcon,
} from "./ReelIcons";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface ReelBottomContentProps {
    post: FoodPost;
    isAuthenticated: boolean;
    setShowOrderModal: (show: boolean) => void;
}

const ReelBottomContent: React.FC<ReelBottomContentProps> = ({
    post,
    isAuthenticated,
    setShowOrderModal,
}) => {
    const router = useRouter();

    const renderSpecificActions = () => {
        switch (post.type) {
            case "restaurant":
                const restaurantPost = post as RestaurantPost;
                return (
                    <div style={{ marginTop: 16 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginBottom: 12,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <StarIcon />
                                <span style={{ color: "#fff", fontWeight: "bold" }}>
                                    {restaurantPost.restaurant.rating}
                                </span>
                                <span style={{ color: "#fff", opacity: 0.7, fontSize: "14px" }}>
                                    ({restaurantPost.restaurant.reviews} reviews)
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                    }}
                                >
                                    {formatCurrencySync(restaurantPost.restaurant.price)}
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginBottom: 12,
                                color: "#fff",
                                opacity: 0.8,
                                fontSize: "14px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <MapPinIcon />
                                <span>{restaurantPost.restaurant.location}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <ClockIcon />
                                <span>{restaurantPost.restaurant.deliveryTime}</span>
                            </div>
                        </div>
                        <button
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "25px",
                                fontWeight: "bold",
                                fontSize: "16px",
                                backgroundColor: "#166534",
                                borderColor: "#166534",
                                color: "white",
                                border: "none",
                                cursor: isAuthenticated ? "pointer" : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: isAuthenticated ? 1 : 0.5,
                            }}
                            onClick={
                                isAuthenticated ? () => setShowOrderModal(true) : undefined
                            }
                            disabled={!isAuthenticated}
                        >
                            <UtensilsIcon />
                            <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                {isAuthenticated ? "Order Now" : "Login to Order"}
                            </span>
                        </button>
                    </div>
                );

            case "supermarket":
                const supermarketPost = post as SupermarketPost;
                return (
                    <div style={{ marginTop: 16, width: "50%" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 12,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                    }}
                                >
                                    {formatCurrencySync(supermarketPost.product.price)}
                                </span>
                                {supermarketPost.product.originalPrice && (
                                    <span
                                        style={{
                                            color: "#fff",
                                            opacity: 0.7,
                                            textDecoration: "line-through",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {formatCurrencySync(supermarketPost.product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {supermarketPost.product.discount && (
                                <Badge
                                    color="red"
                                    style={{ fontSize: "12px", fontWeight: "bold" }}
                                >
                                    -{supermarketPost.product.discount}%
                                </Badge>
                            )}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                                color: "#fff",
                                opacity: 0.8,
                                fontSize: "14px",
                            }}
                        >
                            <StoreIcon />
                            <span>{supermarketPost.product.store}</span>
                            <Badge
                                color={supermarketPost.product.inStock ? "green" : "red"}
                                style={{ fontSize: "12px" }}
                            >
                                {supermarketPost.product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "25px",
                                    fontWeight: "bold",
                                    backgroundColor: "#2563eb",
                                    borderColor: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    cursor:
                                        isAuthenticated && post.shop_id ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: isAuthenticated && post.shop_id ? 1 : 0.5,
                                }}
                                onClick={() => {
                                    if (isAuthenticated && post.shop_id) {
                                        router.push(`/shops/${post.shop_id}`);
                                    }
                                }}
                                disabled={!isAuthenticated || !post.shop_id}
                            >
                                <StoreIcon />
                                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                    {isAuthenticated ? "Visit Store" : "Login to Visit"}
                                </span>
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "25px",
                                    fontWeight: "bold",
                                    backgroundColor: "#166534",
                                    borderColor: "#166534",
                                    color: "white",
                                    border: "none",
                                    cursor:
                                        isAuthenticated && supermarketPost.product.inStock
                                            ? "pointer"
                                            : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity:
                                        isAuthenticated && supermarketPost.product.inStock
                                            ? 1
                                            : 0.5,
                                }}
                                onClick={
                                    isAuthenticated ? () => setShowOrderModal(true) : undefined
                                }
                                disabled={!isAuthenticated || !supermarketPost.product.inStock}
                            >
                                <ShoppingCartIcon />
                                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                    {isAuthenticated ? "Order Now" : "Login to Order"}
                                </span>
                            </button>
                        </div>
                    </div>
                );

            case "chef":
                const chefPost = post as ChefPost;
                return (
                    <div style={{ marginTop: 16, width: "50%" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginBottom: 12,
                                color: "#fff",
                                opacity: 0.8,
                                fontSize: "14px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <BookOpenIcon />
                                <span>{chefPost.recipe.difficulty}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <ClockIcon />
                                <span>{chefPost.recipe.cookTime}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <ChefHatIcon />
                                <span>{chefPost.recipe.servings} servings</span>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                                color: "#fff",
                                opacity: 0.8,
                                fontSize: "14px",
                            }}
                        >
                            <YoutubeIcon />
                            <span>{chefPost.recipe.youtubeChannel}</span>
                            <span style={{ opacity: 0.6 }}>
                                ({chefPost.recipe.subscribers})
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "25px",
                                    fontWeight: "bold",
                                    backgroundColor: "#dc2626",
                                    borderColor: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: isAuthenticated ? 1 : 0.5,
                                }}
                                onClick={isAuthenticated ? undefined : undefined}
                                disabled={!isAuthenticated}
                            >
                                <YoutubeIcon />
                                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                    {isAuthenticated ? "YouTube" : "Login to Watch"}
                                </span>
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "25px",
                                    fontWeight: "bold",
                                    backgroundColor: "#7c3aed",
                                    borderColor: "#7c3aed",
                                    color: "white",
                                    border: "none",
                                    cursor: isAuthenticated ? "pointer" : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: isAuthenticated ? 1 : 0.5,
                                }}
                                onClick={isAuthenticated ? undefined : undefined}
                                disabled={!isAuthenticated}
                            >
                                <BookOpenIcon />
                                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                    {isAuthenticated ? "Get Recipe" : "Login to View"}
                                </span>
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 16px 20px 16px",
                paddingRight: "80px", // Space for right side buttons
                zIndex: 10,
                background:
                    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
            }}
        >
            {/* Title and Description */}
            <div style={{ marginBottom: 16 }}>
                <h2
                    style={{
                        color: "#fff",
                        fontSize: "20px",
                        fontWeight: "bold",
                        marginBottom: 8,
                    }}
                >
                    {post.content.title}
                </h2>
                <p
                    style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "14px",
                        marginBottom: 16,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {post.content.description}
                </p>
            </div>

            {/* Specific Actions */}
            {renderSpecificActions()}
        </div>
    );
};

export default ReelBottomContent;
