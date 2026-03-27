import React from "react";
import { Badge, Avatar } from "rsuite";
import { useRouter } from "next/router";
import {
  FoodPost,
  RestaurantPost,
  SupermarketPost,
  ChefPost,
  BusinessPost,
  isValidMediaUrl,
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
  onAuthRequired: () => void;
  setShowOrderModal: (show: boolean) => void;
}

const ReelBottomContent: React.FC<ReelBottomContentProps> = ({
  post,
  isAuthenticated,
  onAuthRequired,
  setShowOrderModal,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

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
                fontWeight: "700",
                fontSize: "15px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease, transform 0.1s ease",
                opacity: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                isAuthenticated ? setShowOrderModal(true) : onAuthRequired();
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              disabled={false}
            >
              <UtensilsIcon />
              <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                Order Now
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
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: post.shop_id ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                  opacity: post.shop_id ? 1 : 0.6,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) return onAuthRequired();
                  if (post.shop_id) {
                    router.push(`/shops/${post.shop_id}`);
                  }
                }}
                onMouseDown={(e) => { if (post.shop_id) e.currentTarget.style.transform = "scale(0.97)" }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                disabled={!post.shop_id}
              >
                <StoreIcon />
                <span style={{ marginLeft: 6, whiteSpace: "nowrap", fontSize: "14px" }}>
                  Visit Store
                </span>
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: supermarketPost.product.inStock
                    ? "pointer"
                    : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                  opacity: supermarketPost.product.inStock ? 1 : 0.6,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  isAuthenticated ? setShowOrderModal(true) : onAuthRequired();
                }}
                onMouseDown={(e) => { if (supermarketPost.product.inStock) e.currentTarget.style.transform = "scale(0.97)" }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                disabled={!supermarketPost.product.inStock}
              >
                <ShoppingCartIcon />
                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                  Order Now
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
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  backgroundColor: "rgba(220, 38, 38, 0.4)",
                  color: "#fff",
                  border: "1px solid rgba(220, 38, 38, 0.5)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                  opacity: 1,
                }}
                onClick={(e) => { e.stopPropagation(); isAuthenticated ? undefined : onAuthRequired(); }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                disabled={false}
              >
                <YoutubeIcon />
                <span style={{ marginLeft: 6, whiteSpace: "nowrap", fontSize: "14px" }}>
                  YouTube
                </span>
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  backgroundColor: "rgba(124, 58, 237, 0.4)",
                  color: "#fff",
                  border: "1px solid rgba(124, 58, 237, 0.5)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                  opacity: 1,
                }}
                onClick={(e) => { e.stopPropagation(); isAuthenticated ? undefined : onAuthRequired(); }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                disabled={false}
              >
                <BookOpenIcon />
                <span style={{ marginLeft: 6, whiteSpace: "nowrap", fontSize: "14px" }}>
                  Get Recipe
                </span>
              </button>
            </div>
          </div>
        );

      case "business":
        const businessPost = post as BusinessPost;
        return (
          <div style={{ marginTop: 16 }}>
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
                <span>
                  {businessPost.business?.location || "Location unavailable"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                  opacity: 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) return onAuthRequired();
                  if (businessPost.business?.phone) {
                    window.location.href = `tel:${businessPost.business.phone}`;
                  }
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                disabled={false}
              >
                <span style={{ whiteSpace: "nowrap" }}>Contact Business</span>
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
        paddingRight: "72px", // Give space for right side buttons
        zIndex: 10,
        pointerEvents: "auto",
        transition: "all 0.3s ease",
      }}
    >
      {/* Creator Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Avatar
          circle
          size="sm"
          src={
            post.creator.avatar && isValidMediaUrl(post.creator.avatar)
              ? post.creator.avatar
              : "/placeholder.svg"
          }
          alt={post.creator.name}
          style={{ border: "1.5px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
            {post.creator.name}
          </span>
          {post.creator.verified && (
            <div
              style={{
                width: 14,
                height: 14,
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
              }}
            >
              <span style={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}>✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            marginBottom: 6,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {post.content.title}
        </h2>
        <div style={{ position: "relative" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "14px",
              marginBottom: 16,
              display: isExpanded ? "block" : "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              transition: "all 0.3s ease",
              maxHeight: isExpanded ? "200px" : "40px",
              overflowY: isExpanded ? "auto" : "hidden",
            }}
          >
            {post.content.description}
          </p>
          {post.content.description && post.content.description.length > 60 && (
            <button
              onClick={toggleExpand}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                padding: 0,
                marginTop: -12,
                marginBottom: 12,
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "block",
              }}
            >
              {isExpanded ? "Show less" : "See more"}
            </button>
          )}
        </div>
      </div>

      {/* Specific Actions */}
      {renderSpecificActions()}
    </div>
  );
};

export default ReelBottomContent;
