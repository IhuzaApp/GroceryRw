"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Button, Avatar, Badge, toaster } from "rsuite";
import Image from "next/image";
import OrderModal from "./OrderModal";
import { formatCurrencySync } from "../../utils/formatCurrency";

// Inline SVGs for icons
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MessageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16,6 12,2 8,6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);



const StoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
  </svg>
);

const BookOpenIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChefHatIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="16.5" y1="9.4" x2="7.55" y2="4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const UtensilsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
  </svg>
);

type PostType = "restaurant" | "supermarket" | "chef";

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
  replies?: Comment[];
}

interface BasePost {
  id: string;
  type: PostType;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    title: string;
    description: string;
    video: string;
    category: string;
  };
  stats: {
    likes: number;
    comments: number;
    views?: number;
  };
  isLiked: boolean;
  commentsList: Comment[];
}

interface RestaurantPost extends BasePost {
  type: "restaurant";
  restaurant: {
    rating: number;
    reviews: number;
    location: string;
    deliveryTime: string;
    price: number;
  };
}

interface SupermarketPost extends BasePost {
  type: "supermarket";
  product: {
    price: number;
    originalPrice?: number;
    store: string;
    inStock: boolean;
    discount?: number;
  };
}

interface ChefPost extends BasePost {
  type: "chef";
  recipe: {
    difficulty: "Easy" | "Medium" | "Hard";
    cookTime: string;
    servings: number;
    youtubeChannel: string;
    subscribers: string;
  };
}

type FoodPost = RestaurantPost | SupermarketPost | ChefPost;

interface VideoReelProps {
  post: FoodPost;
  isVisible: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export default function VideoReel({
  post,
  isVisible,
  onLike,
  onComment,
  onShare,
}: VideoReelProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const mountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();

    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        // Force video to reload when switching layouts
        if (videoRef.current && mountedRef.current) {
          videoRef.current.load();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (videoRef.current) {
      if (isVisible) {
        // Add a small delay to ensure the video is ready
        const playVideo = async () => {
          try {
            // Check if component is still mounted and video exists
            if (!mountedRef.current || !videoRef.current) {
        
              return;
            }

            await videoRef.current.play();

            // Check again if component is still mounted
            if (mountedRef.current) {
              setIsPlaying(true);
            }
          } catch (error) {
            // Only log error if component is still mounted and it's not an AbortError
            if (mountedRef.current && (error as Error).name !== "AbortError") {
              setVideoError(true);
            }
          }
        };
        playVideo();
      } else {

        if (videoRef.current && mountedRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [isVisible, post.id, isMobile]);

  const handleVideoLoad = () => {
    if (!mountedRef.current) return;
    setVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = (error: any) => {
    if (!mountedRef.current) return;
    toaster.push({
      message: `Video error: ${(error as Error).message || 'Unknown error occurred'}`,
      type: 'error',
      duration: 4000
    });
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoCanPlay = () => {
    if (!mountedRef.current) return;
    if (isVisible && videoRef.current && mountedRef.current) {
      const playVideo = async () => {
        try {
          if (!mountedRef.current || !videoRef.current) return;
          await videoRef.current.play();
        } catch (error) {
          if (mountedRef.current && (error as Error).name !== "AbortError") {
            toaster.push({
              message: `Failed to play video: ${(error as Error).message || 'Unknown error occurred'}`,
              type: 'error',
              duration: 4000
            });
          }
        }
      };
      playVideo();
    }
  };

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return <UtensilsIcon />;
      case "supermarket":
        return <PackageIcon />;
      case "chef":
        return <ChefHatIcon />;
    }
  };

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return "#ff6b35"; // Vibrant orange
      case "supermarket":
        return "#4ade80"; // Bright green
      case "chef":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280"; // Gray fallback
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
      case "shopping":
        return "#8b5cf6"; // Purple
      case "organic":
        return "#10b981"; // Emerald
      case "tutorial":
        return "#f59e0b"; // Amber
      case "recipe":
        return "#ef4444"; // Red
      case "food":
        return "#f97316"; // Orange
      case "cooking":
        return "#dc2626"; // Red
      case "delivery":
        return "#06b6d4"; // Cyan
      case "loading":
        return "#6b7280"; // Gray
      default:
        return "#6b7280"; // Gray fallback
    }
  };

  const renderBottomActions = (post: FoodPost) => {
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
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setShowOrderModal(true)}
            >
              <UtensilsIcon />
              <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>Order Now</span>
            </button>
          </div>
        );

      case "supermarket":
        const supermarketPost = post as SupermarketPost;
        return (
          <div style={{ marginTop: 16, width: "50%" }}>
            {" "}
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StoreIcon />
                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>Visit Store</span>
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: supermarketPost.product.inStock ? 1 : 0.5,
                }}
                onClick={() => setShowOrderModal(true)}
                disabled={!supermarketPost.product.inStock}
              >
                <ShoppingCartIcon />
                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>Order Now</span>
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <YoutubeIcon />
                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>YouTube</span>
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
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpenIcon />
                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>Get Recipe</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        className={`relative h-screen w-full overflow-hidden border-t-4 border-gray-800`}
        style={{ scrollSnapAlign: "start" }}
      >
        {/* Background Video */}
        <div style={{ position: "absolute", inset: 0 }}>
          <video
            ref={videoRef}
            src={post.content.video}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "#000",
            }}
            loop
            muted
            playsInline
            preload="metadata"
            poster={post.creator.avatar || "/placeholder.svg"}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onLoadStart={() => setVideoLoading(true)}
            onCanPlay={handleVideoCanPlay}
          />

          {/* Loading overlay */}
          {videoLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.8)",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "4px solid rgba(255,255,255,0.3)",
                  borderTop: "4px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}

          {/* Error overlay */}
          {videoError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.9)",
                zIndex: 5,
              }}
            >
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                  Video unavailable
                </div>
                <div style={{ fontSize: "14px", opacity: 0.7 }}>
                  Please try again later
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), transparent, rgba(0,0,0,0.3))",
            }}
          />
        </div>

        {/* Top Header */}
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
                <span
                  style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}
                >
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

        {/* Right Side Actions */}
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: 240, // Increased from 160 to be above bottom navbar
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
            <Button
              appearance="ghost"
              size="lg"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: post.isLiked
                  ? "#ef4444"
                  : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
                border: post.isLiked ? "2px solid #ef4444" : "none",
                color: "#fff",
                transition: "all 0.2s ease",
              }}
              onClick={() => onLike(post.id)}
            >
              <HeartIcon filled={post.isLiked} />
            </Button>
            <span
              style={{
                color: "#fff",
                fontSize: "12px",
                marginTop: 4,
                fontWeight: 500,
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
            <Button
              appearance="ghost"
              size="lg"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "#fff",
              }}
              onClick={() => onComment(post.id)}
            >
              <MessageIcon />
            </Button>
            <span
              style={{
                color: "#fff",
                fontSize: "12px",
                marginTop: 4,
                fontWeight: 500,
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
            <Button
              appearance="ghost"
              size="lg"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "#fff",
              }}
              onClick={() => onShare(post.id)}
            >
              <ShareIcon />
            </Button>
          </div>
        </div>

        {/* Bottom Content */}
        <div
          style={{
            position: "absolute",
            bottom: 80, // Account for bottom navbar height
            left: 0,
            right: 0,
            padding: 16,
            zIndex: 10,
          }}
        >
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

          {renderBottomActions(post)}
        </div>

        {/* CSS for loading animation */}
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

      {/* Order Modal */}
      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        post={post}
        shopLat={post.type === "restaurant" ? 0 : 0} // You'll need to pass actual coordinates
        shopLng={post.type === "restaurant" ? 0 : 0}
        shopAlt={post.type === "restaurant" ? 0 : 0}
        shopId={post.id}
      />
    </>
  );
}
