import React, { useState, useRef, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { getReelsData } from "../api/queries/reels";
import RootLayout from "@components/ui/layout";
import { useTheme } from "../../src/context/ThemeContext";
import { useSession } from "next-auth/react";
import ReelPlaceholder from "@components/Reels/ReelPlaceholder";
import DesktopReelPlaceholder from "../../src/components/Reels/DesktopReelPlaceholder";
import MobileReelsView from "../../src/components/Reels/MobileReelsView";
import DesktopReelsView from "../../src/components/Reels/DesktopReelsView";
import GuestAuthModal from "../../src/components/ui/GuestAuthModal";
import GuestUpgradeModal from "../../src/components/ui/GuestUpgradeModal";
import { Message, toaster } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useMediaQuery } from "react-responsive";
import {
  PostType,
  Comment,
  BasePost,
  RestaurantPost,
  SupermarketPost,
  ChefPost,
  BusinessPost,
  FoodPost,
  isValidMediaUrl,
} from "../../src/components/Reels/ReelTypes";

// Inline SVGs for icons
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "currentColor"}
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

const DollarSignIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

const XIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

// Database interface for API response
interface DatabaseReel {
  id: string;
  category: string;
  created_on: string;
  description: string;
  isLiked: boolean;
  likes: string;
  restaurant_id: string | null;
  title: string;
  type: string;
  user_id: string;
  video_url: string;
  shop_id?: string;
  delivery_time: string | null;
  Price: string | null;
  Product: any;
  Shops: {
    name: string;
    address?: string;
    id: string;
    image?: string;
    description?: string;
    latitude?: string;
    longitude?: string;
  } | null;
  User: {
    email: string;
    gender: string;
    id: string;
    is_active: boolean;
    name: string;
    created_at: string;
    role: string;
    phone: string;
    profile_picture: string;
  } | null;
  Restaurant: {
    id: string;
    lat: number;
    location: string;
    long: number;
    name: string;
    profile: string;
    verified: boolean;
  } | null;
  reel_likes_aggregate: {
    aggregate: {
      count: number;
    };
  };
  Reels_comments: Array<{
    user_id: string;
    text: string;
    reel_id: string;
    likes: string;
    isLiked: boolean;
    id: string;
    created_on: string;
    User: {
      id: string;
      name: string;
      role: string;
      profile_picture?: string;
    } | null;
  }>;
  business_id?: string | null;
  business_account?: {
    account_type: string;
    business_email: string;
    business_location: string;
    business_name: string;
    business_phone: string;
    created_at: string;
    face_image: string;
    id: string;
    id_image: string;
    rdb_certificate?: string;
  } | null;
}

// --- HELPERS (Top-Level) ---

// Format timestamp to relative time
const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return "Just now";
  try {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  } catch (e) {
    return "Just now";
  }
};

// Helper function to extract string value from complex DB fields
const extractStringValue = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "object" && value !== null) {
    if (value.value && typeof value.value === "string") {
      const trimmed = value.value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (value.text && typeof value.text === "string") {
      const trimmed = value.text.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (value.name && typeof value.name === "string") {
      const trimmed = value.name.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    try {
      const str = value.toString();
      if (str && str !== "[object Object]" && typeof str === "string") {
        const trimmed = str.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
    } catch (e) {}
    const keys = Object.keys(value);
    for (const key of keys) {
      if (typeof value[key] === "string") {
        const trimmed = value[key].trim();
        if (trimmed.length > 0) return trimmed;
      }
    }
  }
  return null;
};

// Helper to convert DB comment to UI Comment
const convertDBCommentToComment = (comment: any): Comment => ({
  id: comment.id,
  user: {
    name: comment.User?.name || "Plas Reel Agent",
    avatar:
      comment.User?.profile_picture &&
      isValidMediaUrl(comment.User.profile_picture)
        ? comment.User.profile_picture
        : "/placeholder.svg?height=32&width=32",
    verified:
      comment.User?.role === "admin" ||
      comment.User?.role === "verified" ||
      false,
  },
  text: comment.text,
  timestamp: formatTimestamp(comment.created_on),
  likes: parseInt(comment.likes || "0"),
  isLiked: comment.isLiked || false,
});

// Convert database reel to FoodPost format
const convertDatabaseReelToFoodPost = (dbReel: DatabaseReel): FoodPost => {
  // console.log(`[Reels Sync] Converting DB Reel ${dbReel.id} | isLiked: ${dbReel.isLiked}`);
  const userHasLiked = dbReel.isLiked || false;

  const commentsList: Comment[] = (dbReel.Reels_comments || []).map((comment) =>
    convertDBCommentToComment(comment)
  );

  let shopLat = 0,
    shopLng = 0,
    shopAlt = 0;
  if (dbReel.Restaurant) {
    shopLat = dbReel.Restaurant.lat || 0;
    shopLng = dbReel.Restaurant.long || 0;
  } else if (dbReel.Shops) {
    shopLat = dbReel.Shops.latitude ? parseFloat(dbReel.Shops.latitude) : 0;
    shopLng = dbReel.Shops.longitude ? parseFloat(dbReel.Shops.longitude) : 0;
  }

  const creatorName =
    dbReel.User?.name ||
    dbReel.business_account?.business_name ||
    dbReel.Restaurant?.name ||
    dbReel.Shops?.name ||
    "Plas Reel Agent";

  const basePost: BasePost = {
    id: dbReel.id,
    type: dbReel.type as PostType,
    creator: {
      name: creatorName,
      avatar:
        dbReel.User?.profile_picture &&
        isValidMediaUrl(dbReel.User.profile_picture)
          ? dbReel.User.profile_picture
          : dbReel.business_account?.face_image &&
            isValidMediaUrl(dbReel.business_account.face_image)
          ? dbReel.business_account.face_image
          : dbReel.Restaurant?.profile &&
            isValidMediaUrl(dbReel.Restaurant.profile)
          ? dbReel.Restaurant.profile
          : dbReel.Shops?.image && isValidMediaUrl(dbReel.Shops.image)
          ? dbReel.Shops.image
          : "/placeholder.svg?height=40&width=40",
      verified:
        dbReel.User?.role === "admin" ||
        dbReel.User?.role === "verified" ||
        dbReel.Restaurant?.verified ||
        false,
    },
    content: {
      title: dbReel.title,
      description: dbReel.description,
      video: dbReel.video_url,
      thumbnail:
        dbReel.Product?.image ||
        dbReel.Product?.thumbnail ||
        dbReel.Product?.img ||
        null,
      category: dbReel.category,
    },
    stats: {
      likes:
        dbReel.reel_likes_aggregate?.aggregate?.count ||
        parseInt(dbReel.likes || "0"),
      comments: (dbReel.Reels_comments || []).length,
    },
    isLiked: userHasLiked,
    commentsList,
    shop_id: dbReel.shop_id || null,
    restaurant_id: dbReel.restaurant_id || null,
    created_on: dbReel.created_on,
    shopLat,
    shopLng,
    shopAlt,
  };

  switch (dbReel.type) {
    case "restaurant":
      let restaurantLocation = extractStringValue(dbReel.Restaurant?.location);
      if (!restaurantLocation && dbReel.Shops) {
        restaurantLocation =
          extractStringValue(dbReel.Shops.address) ||
          extractStringValue(dbReel.Shops.name);
      }
      return {
        ...basePost,
        type: "restaurant",
        restaurant: {
          rating: 4.5,
          reviews: 100,
          location: restaurantLocation || "Location unavailable",
          deliveryTime: dbReel.delivery_time || "30-45 min",
          price: parseFloat(dbReel.Price || "0"),
        },
      } as RestaurantPost;

    case "supermarket":
    case "shop":
    case "store":
      const product = dbReel.Product || {};
      let storeName = dbReel.Shops
        ? extractStringValue(dbReel.Shops.name) ||
          extractStringValue(dbReel.Shops.address)
        : null;
      if (!storeName && product) {
        storeName =
          extractStringValue(product.store) ||
          extractStringValue(product.storeName);
      }
      return {
        ...basePost,
        type: "supermarket",
        product: {
          price: parseFloat(dbReel.Price || "0"),
          originalPrice: product.originalPrice,
          store: storeName || "Store information unavailable",
          inStock: product.inStock !== false,
          discount: product.discount,
          image: product.image || product.thumbnail || product.img,
        },
      } as SupermarketPost;

    case "chef":
      const recipe = dbReel.Product || {};
      return {
        ...basePost,
        type: "chef",
        recipe: {
          difficulty: recipe.difficulty || "Medium",
          cookTime: recipe.cookTime || "1 hour",
          servings: recipe.servings || 4,
          youtubeChannel: recipe.youtubeChannel || "@ChefChannel",
          subscribers: recipe.subscribers || "1M",
        },
      } as ChefPost;

    case "business":
      return {
        ...basePost,
        type: "business",
        business: {
          name: dbReel.business_account?.business_name || "Business",
          location:
            dbReel.business_account?.business_location ||
            "Location unavailable",
          email: dbReel.business_account?.business_email || "",
          phone: dbReel.business_account?.business_phone || "",
        },
      } as BusinessPost;

    default:
      return basePost as FoodPost;
  }
};

// Calculate user's preferred reel types based on their likes
const calculateUserPreferences = (reels: FoodPost[]): Map<string, number> => {
  const typeCounts = new Map<string, number>();
  let totalLikes = 0;

  // Count likes per type
  reels.forEach((reel) => {
    if (reel.isLiked) {
      const type = reel.type;
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      totalLikes++;
    }
  });

  // Calculate preference scores (percentage of likes per type)
  const preferences = new Map<string, number>();
  if (totalLikes > 0) {
    typeCounts.forEach((count, type) => {
      preferences.set(type, count / totalLikes);
    });
  }

  return preferences;
};

// Randomize reels while prioritizing recent ones and user preferences
const randomizeReelsWithPriority = (
  reels: FoodPost[],
  userPreferences?: Map<string, number>
): FoodPost[] => {
  const now = Date.now();

  // Group reels by recency based on created_on timestamp
  const recentReels: FoodPost[] = []; // Last 24 hours
  const weekReels: FoodPost[] = []; // Last week
  const olderReels: FoodPost[] = []; // Older than a week

  reels.forEach((reel) => {
    const createdOn = reel.created_on ? new Date(reel.created_on).getTime() : 0;
    const age = now - createdOn;

    if (age <= 24 * 60 * 60 * 1000) {
      // Last 24 hours - highest priority
      recentReels.push(reel);
    } else if (age <= 7 * 24 * 60 * 60 * 1000) {
      // Last week - medium priority
      weekReels.push(reel);
    } else {
      // Older than a week - lower priority
      olderReels.push(reel);
    }
  });

  // Weighted shuffle function that considers user preferences
  const weightedShuffle = <T extends FoodPost>(
    array: T[],
    preferences?: Map<string, number>
  ): T[] => {
    if (!preferences || preferences.size === 0) {
      // No preferences, use regular shuffle
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    // Create weighted array with preference scores
    const weighted = array.map((reel) => {
      const preferenceScore = preferences.get(reel.type) || 0;
      // Base weight of 1, add preference score (0-1) multiplied by 2 for stronger influence
      const weight = 1 + preferenceScore * 2;
      return { reel, weight, random: Math.random() * weight };
    });

    // Sort by random weighted value (higher preference = higher chance of being first)
    weighted.sort((a, b) => b.random - a.random);

    return weighted.map((item) => item.reel);
  };

  // Randomize within each group with preference weighting (recent first)
  return [
    ...weightedShuffle(recentReels, userPreferences),
    ...weightedShuffle(weekReels, userPreferences),
    ...weightedShuffle(olderReels, userPreferences),
  ];
};

// Cache configuration
const CACHE_KEY = "reels_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_AGE = 30 * 60 * 1000; // 30 minutes maximum cache age

interface CachedReels {
  data: FoodPost[];
  timestamp: number;
  lastFetch: number;
  version: string;
}

export default function FoodReelsApp({
  initialReels = [],
  initialUserPreferences = {},
}: {
  initialReels?: any[];
  initialUserPreferences?: any;
}) {
  const { theme } = useTheme();
  const { data: session, status: sessionStatus } = useSession();
  const [posts, setPosts] = useState<FoodPost[]>(() => {
    if (initialReels && initialReels.length > 0) {
      return initialReels.map((reel: any) =>
        convertDatabaseReelToFoodPost(reel)
      );
    }
    return [];
  });

  const [loading, setLoading] = useState(initialReels.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isRefreshingComments, setIsRefreshingComments] = useState(false);
  const [visiblePostIndex, setVisiblePostIndex] = useState(0);

  // Use robust hook for mobile detection
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [optimisticComments, setOptimisticComments] = useState<{
    [postId: string]: Comment[];
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({
    isPulling: false,
    startY: 0,
    currentY: 0,
  });
  const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
  const [showGuestUpgradeModal, setShowGuestUpgradeModal] = useState(false);
  const [renderTick, setRenderTick] = useState(0); // Force re-render helper
  const mountedRef = useRef(true); // To track if component is mounted
  const processingLikesRef = useRef<Set<string>>(new Set());
  const lastLikedTargetRef = useRef<Map<string, boolean>>(new Map());

  // Function to refetch ALL data for a specific reel (Stats + Comments)
  const refetchReelData = async (postId: string) => {
    try {
      // Use timestamp for cache-busting to ensure we always get fresh data from server
      const response = await fetch(
        `/api/queries/reels?id=${postId}&_t=${Date.now()}`
      );
      if (!response.ok) throw new Error("Failed to fetch reel data");

      const data = await response.json();
      if (!data.reels || data.reels.length === 0) return;

      const updatedReel = convertDatabaseReelToFoodPost(data.reels[0]);

      if (mountedRef.current) {
        setPosts((prevPosts: FoodPost[]) => {
          const matchingPost = prevPosts.find((p) => p.id === postId);
          if (!matchingPost) {
          }

          const newPosts = prevPosts.map((post: FoodPost) => {
            if (post.id === postId) {
              const isProcessing = processingLikesRef.current.has(postId);
              const lastTarget = lastLikedTargetRef.current.get(postId);

              const finalIsLiked =
                lastTarget !== undefined ? lastTarget : updatedReel.isLiked;
              const finalLikes =
                lastTarget !== undefined
                  ? lastTarget
                    ? Math.max(post.stats.likes, updatedReel.stats.likes)
                    : Math.min(post.stats.likes, updatedReel.stats.likes)
                  : updatedReel.stats.likes;

              return {
                ...updatedReel,
                isLiked: finalIsLiked,
                isProcessingLike: isProcessing || post.isProcessingLike,
                stats: {
                  ...updatedReel.stats,
                  likes: finalLikes,
                },
              };
            }
            return post;
          });
          return newPosts;
        });
        // Force a re-render tick just in case React's reconciliation is stuck
        setRenderTick((t) => t + 1);
      }
    } catch (error) {
      console.error(`Error refetching reel data for ${postId}:`, error);
    }
  };

  // Function to refetch comments for a specific post (kept for backwards compatibility)
  const refetchComments = async (postId: string) => {
    return refetchReelData(postId);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // State reconciliation: merged server data with local optimistic state
  const reconcileReelWithLocalState = (
    newPost: FoodPost,
    prevPosts: FoodPost[]
  ): FoodPost => {
    const existingPost = prevPosts.find((p) => p.id === newPost.id);
    if (!existingPost) return newPost;

    const isProcessing = processingLikesRef.current.has(newPost.id);
    const lastTarget = lastLikedTargetRef.current.get(newPost.id);

    // PRIORITY:
    // 1. lastTarget (Active interaction on this specific client)
    // 2. newPost (Fresh server state)
    // 3. existingPost (Only as fallback for fields not in newPost)

    return {
      ...newPost,
      isLiked: lastTarget !== undefined ? lastTarget : newPost.isLiked,
      isProcessingLike: isProcessing || false,
      stats: {
        ...newPost.stats,
        // If we have an active click, use our predicted count until server definitely syncs
        likes:
          lastTarget !== undefined
            ? lastTarget
              ? Math.max(existingPost.stats.likes, newPost.stats.likes)
              : Math.min(existingPost.stats.likes, newPost.stats.likes)
            : newPost.stats.likes,
        comments: Math.max(newPost.stats.comments, existingPost.stats.comments),
      },
    };
  };

  // Fetch reels from database
  const fetchReelsFromAPI = async (isBackgroundRefresh: boolean = false) => {
    try {
      if (!isBackgroundRefresh && mountedRef.current) {
        setLoading(true);
        setError(null);

        // Safety timeout to prevent stuck loading
        setTimeout(() => {
          if (mountedRef.current) {
            setLoading((prev) => {
              return false;
            });
          }
        }, 7000);
      }

      // Use timestamp for cache-busting
      const response = await fetch(`/api/queries/reels?_t=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to fetch reels");

      const data = await response.json();
      const convertedPosts = data.reels.map((reel: DatabaseReel) =>
        convertDatabaseReelToFoodPost(reel)
      );

      let userPreferences: Map<string, number> | undefined;
      if (
        data.userPreferences &&
        Object.keys(data.userPreferences).length > 0
      ) {
        userPreferences = new Map(Object.entries(data.userPreferences));
      } else {
        userPreferences = calculateUserPreferences(convertedPosts);
      }

      const randomizedPosts = randomizeReelsWithPriority(
        convertedPosts,
        userPreferences.size > 0 ? userPreferences : undefined
      );

      if (mountedRef.current) {
        setPosts((prevPosts: FoodPost[]) => {
          return randomizedPosts.map((newPost: FoodPost) =>
            reconcileReelWithLocalState(newPost, prevPosts)
          );
        });
      }
    } catch (err) {
      console.error("Error fetching reels from API:", err);
      if (!isBackgroundRefresh && mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to fetch reels");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  // Initial fetch (if not already loaded via SSR)
  useEffect(() => {
    // If we have posts from SSR, we might still want to re-run
    // to get personalized likes if the session just loaded
    if (
      mountedRef.current &&
      (posts.length === 0 || sessionStatus === "authenticated")
    ) {
      fetchReelsFromAPI(posts.length > 0); // isBackground if we already have posts
    }
  }, [session?.user?.id, sessionStatus]);

  // Manual refresh function
  const refreshReels = async () => {
    if (isRefreshing) return;

    const fallbackTimeout = setTimeout(() => {
      if (mountedRef.current) setIsRefreshing(false);
    }, 10000);

    try {
      if (mountedRef.current) {
        setIsRefreshing(true);
        setError(null);
      }
      await fetchReelsFromAPI(true);
    } catch (err) {
      console.error("Error refreshing reels:", err);
    } finally {
      clearTimeout(fallbackTimeout);
    }
  };

  // Enhanced scroll handling for TikTok-style navigation
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return;

    const container = containerRef.current;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTime = 0;

    const scrollToVideo = (index: number, smooth: boolean = true) => {
      if (index < 0 || index >= posts.length) return;

      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        if (smooth) {
          // Smooth scrolling for desktop
          targetElement.scrollIntoView({ behavior: "smooth" });
        } else {
          // Instant snap for mobile
          container.style.scrollBehavior = "auto";
          targetElement.scrollIntoView({ behavior: "auto" });
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
          }, 100);
        }
        if (mountedRef.current) {
          setVisiblePostIndex(index);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Different behavior for mobile vs desktop
      if (isMobile) {
        // Mobile: TikTok-style behavior
        e.preventDefault();

        const now = Date.now();
        if (isScrolling || now - lastScrollTime < 150) return;

        isScrolling = true;
        lastScrollTime = now;

        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        if (e.deltaY > 0 && currentIndex < posts.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (e.deltaY < 0 && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex !== currentIndex) {
          scrollToVideo(nextIndex, false); // Instant snap for mobile
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 200);
      } else {
        // Desktop: More natural scrolling with scroll-snap
        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        // Only handle large scroll deltas to prevent over-sensitivity
        if (Math.abs(e.deltaY) > 50) {
          if (e.deltaY > 0 && currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (e.deltaY < 0 && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }

          if (nextIndex !== currentIndex) {
            scrollToVideo(nextIndex, true); // Smooth scrolling for desktop
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Desktop keyboard navigation
      if (isMobile) return;

      // Don't handle navigation if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true" ||
          activeElement.closest("input") ||
          activeElement.closest("textarea") ||
          activeElement.closest("[contenteditable='true']"));

      // For space key, only handle navigation if not typing
      if (e.key === " " && isTyping) {
        return;
      }

      const currentIndex = visiblePostIndex;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ": // Spacebar
          e.preventDefault();
          if (currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
          }
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = posts.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        scrollToVideo(nextIndex, true);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      container.dataset.touchStartY = touch.clientY.toString();
      container.dataset.touchStartTime = Date.now().toString();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (
        !isMobile ||
        !container.dataset.touchStartY ||
        !container.dataset.touchStartTime
      )
        return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchStartY = parseInt(container.dataset.touchStartY);
      const touchStartTime = parseInt(container.dataset.touchStartTime);
      const touchDuration = Date.now() - touchStartTime;
      const deltaY = touchStartY - touchEndY;
      const threshold = 30;

      // Check for pull-to-refresh (swipe down from top)
      if (deltaY < -80 && visiblePostIndex === 0 && touchDuration > 200) {
        // Pull to refresh triggered
        refreshReels();
        if (mountedRef.current) {
          setPullToRefresh({ isPulling: false, startY: 0, currentY: 0 });
        }
        return;
      }

      if (Math.abs(deltaY) > threshold && touchDuration < 500) {
        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        if (deltaY > 0 && currentIndex < posts.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (deltaY < 0 && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex !== currentIndex) {
          scrollToVideo(nextIndex, false);
        }
      }

      delete container.dataset.touchStartY;
      delete container.dataset.touchStartTime;
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Desktop keyboard navigation
    if (!isMobile) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabindex", "0"); // Make container focusable for keyboard events
    }

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("keydown", handleKeyDown);
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, visiblePostIndex, isMobile]);

  // Handle component mount status (already managed by separate useEffect)

  // Intersection Observer to detect which post is visible
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            if (mountedRef.current) {
              setVisiblePostIndex(index);
            }
          }
        });
      },
      {
        threshold: isMobile ? 0.3 : 0.5, // Different thresholds for mobile vs desktop
        rootMargin: isMobile ? "-10% 0px -10% 0px" : "-20% 0px -20% 0px",
      }
    );

    observerRef.current = observer;

    const posts = containerRef.current.querySelectorAll("[data-index]");

    posts.forEach((post) => {
      observer.observe(post);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [posts.length, isMobile]); // Re-run when posts change or mobile state changes

  const handleAuthRequired = () => {
    // Check if user is logged in
    if (!session?.user) {
      setShowGuestAuthModal(true);
      return true; // Auth required
    }

    // Check if user is a guest (this is an assumption based on common patterns in this app)
    // If the user wants to upgrade their guest account
    const isGuest = session?.user?.email
      ?.toLowerCase()
      .includes("@guest.local");
    if (isGuest) {
      // Optional: you might want to show upgrade modal for guests on some actions
      // For now, let's just allow guests to perform actions unless explicitly asked otherwise
      // showGuestUpgradeModal(true);
    }

    return false; // Already authenticated
  };

  const toggleLike = async (postId: string) => {
    const currentPost = posts.find((post: FoodPost) => post.id === postId);
    if (!currentPost) return;

    const isCurrentlyLiked = currentPost.isLiked;
    const targetLikedState = !isCurrentlyLiked;

    try {
      // 1. Check strict processing lock
      if (processingLikesRef.current.has(postId)) {
        return;
      }

      // 2. Check if we just sent this exact target state (deduplication)
      if (lastLikedTargetRef.current.get(postId) === targetLikedState) {
        return;
      }

      processingLikesRef.current.add(postId);
      lastLikedTargetRef.current.set(postId, targetLikedState);

      // Immediately update UI for instant feedback
      setPosts((prevPosts: FoodPost[]) => {
        const newPosts = prevPosts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                isLiked: targetLikedState,
                isProcessingLike: true,
                stats: {
                  ...post.stats,
                  likes: targetLikedState
                    ? (post.stats.likes || 0) + 1
                    : Math.max(0, (post.stats.likes || 0) - 1),
                },
              }
            : post
        );
        return newPosts;
      });
      setRenderTick((t) => t + 1);

      // Process backend request
      const method = targetLikedState ? "POST" : "DELETE";

      const response = await fetch("/api/queries/reel-likes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reel_id: postId,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle specific "already in sync" errors quietly
        if (
          (response.status === 400 &&
            result.error?.includes("already liked")) ||
          (response.status === 404 && result.error?.includes("Like not found"))
        ) {
          if (mountedRef.current) {
            setPosts((prevPosts: FoodPost[]) =>
              prevPosts.map((post: FoodPost) =>
                post.id === postId
                  ? {
                      ...post,
                      isProcessingLike: false,
                      isLiked: targetLikedState,
                    }
                  : post
              )
            );
            toaster.push(
              <Message type="info" closable>
                Already in sync: {targetLikedState ? "Liked" : "Unliked"}
              </Message>,
              { placement: "topEnd" }
            );
          }
        } else {
          // Revert on other errors
          console.error(
            `[Reels UI] Backend returned ${response.status} for ${postId}:`,
            result
          );
          if (mountedRef.current) {
            setPosts((prevPosts: FoodPost[]) =>
              prevPosts.map((post: FoodPost) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: isCurrentlyLiked,
                      isProcessingLike: false,
                      stats: {
                        ...post.stats,
                        likes: isCurrentlyLiked
                          ? post.stats.likes
                          : Math.max(0, post.stats.likes - 1),
                      },
                    }
                  : post
              )
            );
            toaster.push(
              <Message type="error" closable>
                Error: {result.error || "Failed to update like"}
              </Message>,
              { placement: "topEnd" }
            );
          }
        }
      } else {
        // Success - ensure UI is in target state and clear processing flag
        if (mountedRef.current) {
          setPosts((prevPosts: FoodPost[]) =>
            prevPosts.map((post: FoodPost) =>
              post.id === postId
                ? {
                    ...post,
                    isProcessingLike: false,
                    isLiked: targetLikedState,
                    // Re-calculate stats conservatively until refetch completes
                    stats: {
                      ...post.stats,
                      likes: targetLikedState
                        ? Math.max(
                            post.stats.likes,
                            (post.stats.likes || 0) + 1
                          )
                        : Math.max(0, post.stats.likes - 1),
                    },
                  }
                : post
            )
          );

          toaster.push(
            <Message type="success" closable>
              Successfully {targetLikedState ? "liked" : "unliked"}!
            </Message>,
            { placement: "topEnd" }
          );
        }

        // REFETCH REAL-TIME DATA
        refetchReelData(postId);
      }
    } catch (error) {
      console.error(`[Reels UI] Exception in toggleLike for ${postId}:`, error);
    } finally {
      // Keep the lock for a short duration to prevent pile-up
      setTimeout(() => {
        processingLikesRef.current.delete(postId);
      }, 800);
    }
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    // Check if user is logged in
    if (handleAuthRequired()) {
      return;
    }

    // Storage for original state to revert on error
    let originalPosts: FoodPost[] = [];
    let originalOptimistic: Record<string, Comment[]> = {};

    try {
      // 1. OPTIMISTIC UPDATE
      // We don't guard the VERY FIRST state update with mountedRef.current
      // because if the user just clicked a button in the UI, the component MUST be mounted.
      // Guards are mainly for async callbacks (after fetch/setTimeout).

      // Backup current state for potential revert
      originalPosts = [...posts];
      originalOptimistic = { ...optimisticComments };

      // Update posts state (server-side comments)
      setPosts((prevPosts: FoodPost[]) => {
        const updated = prevPosts.map((post: FoodPost) => {
          if (post.id === postId) {
            return {
              ...post,
              commentsList: post.commentsList.map((comment: Comment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked
                      ? Math.max(0, comment.likes - 1)
                      : comment.likes + 1,
                  };
                }
                return comment;
              }),
            };
          }
          return post;
        });
        return updated;
      });

      // Update optimisticComments state (unsynced local comments)
      setOptimisticComments((prev) => {
        const postOptimistic = prev[postId] || [];
        if (!postOptimistic.some((c) => c.id === commentId)) {
          return prev;
        }

        return {
          ...prev,
          [postId]: postOptimistic.map((comment: Comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked
                    ? Math.max(0, comment.likes - 1)
                    : comment.likes + 1,
                }
              : comment
          ),
        };
      });

      // Trigger a render tick to ensure UI update
      setRenderTick((t) => t + 1);

      // 2. API CALL IN BACKGROUND
      // No need to set refreshing true/false here to avoid flickering overlays
      const response = await fetch("/api/queries/reel-comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: "toggle_like",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // 3. LOGICAL SYNC WITH SERVER RESULT
        if (mountedRef.current) {
          setPosts((prevPosts: FoodPost[]) =>
            prevPosts.map((post: FoodPost) =>
              post.id === postId
                ? {
                    ...post,
                    commentsList: post.commentsList.map((comment: Comment) =>
                      comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: result.isLiked,
                            likes: parseInt(result.likes),
                          }
                        : comment
                    ),
                  }
                : post
            )
          );
        }
      } else {
        throw new Error("Failed to toggle comment like on server");
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // 4. REVERT ON ERROR
      if (mountedRef.current) {
        setPosts(originalPosts);
        setOptimisticComments(originalOptimistic);
        setRenderTick((t) => t + 1);
      }
    } finally {
      setIsRefreshingComments(false);
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    try {
      // Create optimistic comment for immediate UI update
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        user: {
          name: session?.user?.name || "You",
          avatar: session?.user?.image || "/placeholder.svg?height=32&width=32",
          verified: false,
        },
        text: commentText,
        timestamp: "now",
        likes: 0,
        isLiked: false,
      };

      // Add to optimisticComments state
      setOptimisticComments((prev) => {
        return {
          ...prev,
          [postId]: [...(prev[postId] || []), optimisticComment],
        };
      });

      // Optimistic update - increment count immediately to UI
      setPosts((prevPosts: FoodPost[]) => {
        return prevPosts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: post.stats.comments + 1,
                },
              }
            : post
        );
      });
      setRenderTick((t) => t + 1);

      // Make API call to add comment
      setIsRefreshingComments(true);
      const response = await fetch("/api/queries/reel-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reel_id: postId,
          text: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const result = await response.json();

      if (result.success && result.comment) {
        // Success - update posts state with REAL server comment directly
        const serverComment = convertDBCommentToComment(result.comment);

        if (mountedRef.current) {
          setPosts((prevPosts: FoodPost[]) =>
            prevPosts.map((post: FoodPost) =>
              post.id === postId
                ? {
                    ...post,
                    commentsList: [...(post.commentsList || []), serverComment],
                    stats: {
                      ...post.stats,
                      comments: Math.max(
                        post.stats.comments,
                        (post.commentsList || []).length + 1
                      ),
                    },
                  }
                : post
            )
          );

          setOptimisticComments((prev) => {
            const newList = (prev[postId] || []).filter(
              (c) => c.id !== optimisticComment.id
            );
            return {
              ...prev,
              [postId]: newList,
            };
          });

          setRenderTick((t) => t + 1);
        }

        // Trigger background sync but don't await it
        refetchReelData(postId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Remove optimistic comment and revert count on error
      if (mountedRef.current) {
        setOptimisticComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(
            (c) => !c.id.startsWith("temp-")
          ),
        }));
        setPosts((prevPosts: FoodPost[]) =>
          prevPosts.map((post: FoodPost) =>
            post.id === postId
              ? {
                  ...post,
                  stats: {
                    ...post.stats,
                    comments: Math.max(0, post.stats.comments - 1),
                  },
                }
              : post
          )
        );
        setRenderTick((t) => t + 1);
      }
    } finally {
      setIsRefreshingComments(false);
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    // Check if user is logged in
    if (handleAuthRequired()) return;

    try {
      // Find the comment to revert if needed
      const post = posts.find((p) => p.id === postId);
      const commentToDelete = post?.commentsList.find(
        (c) => c.id === commentId
      );

      // Optimistic update - remove comment immediately from UI
      if (mountedRef.current) {
        setPosts((prevPosts: FoodPost[]) =>
          prevPosts.map((post: FoodPost) =>
            post.id === postId
              ? {
                  ...post,
                  stats: {
                    ...post.stats,
                    comments: Math.max(0, post.stats.comments - 1),
                  },
                  commentsList: post.commentsList.filter(
                    (comment: Comment) => comment.id !== commentId
                  ),
                }
              : post
          )
        );

        // Also remove from optimisticComments if it's there
        setOptimisticComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
        }));
      }

      // Make API call to delete comment
      setIsRefreshingComments(true);
      const response = await fetch("/api/queries/reel-comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // REFETCH REAL-TIME DATA
      await refetchReelData(postId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      // Revert optimistic update (simplified - just refetch everything for this post)
      await refetchReelData(postId);
    } finally {
      setIsRefreshingComments(false);
    }
  };

  // Enhanced openComments function with comment refetching
  const openComments = async (postId: string) => {
    // console.log("Opening comments for post:", postId);
    if (mountedRef.current) {
      setActivePostId(postId);
      setShowComments(true);
    }

    // Refetch comments when opening to ensure we have the latest data
    await refetchComments(postId);

    // console.log("Comments state after opening:", {
    //   postId,
    //   showComments: true,
    // });
  };

  // Set up periodic comment refresh when comments are open
  useEffect(() => {
    if (!showComments || !activePostId) return;

    const refreshInterval = setInterval(() => {
      refetchComments(activePostId);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [showComments, activePostId]);

  // Automatically set active post and load comments for desktop view
  useEffect(() => {
    if (isMobile) return; // Only for desktop

    if (
      posts.length > 0 &&
      visiblePostIndex >= 0 &&
      visiblePostIndex < posts.length
    ) {
      const currentPost = posts[visiblePostIndex];
      if (currentPost && currentPost.id) {
        // Always update activePostId for desktop to show comments sidebar
        if (mountedRef.current) {
          setActivePostId(currentPost.id);
        }
        // Auto-fetch comments for the visible post on desktop to ensure they are always visible
        refetchComments(currentPost.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePostIndex, posts.length, isMobile, session?.user?.id]);

  const closeComments = () => {
    // console.log("Closing comments");
    if (mountedRef.current) {
      setShowComments(false);
      setActivePostId(null);
    }
  };

  const handleShare = async (post: FoodPost) => {
    try {
      // Create share link - link to the reel page with the post ID
      const shareUrl = `${window.location.origin}/Reels?reel=${post.id}`;
      const shareText = `Check out this ${post.type}: ${post.content.title}\n${post.content.description}`;
      const shareTitle = post.content.title;

      // Use Web Share API if available (mobile browsers)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch (shareError: any) {
          // User cancelled or share failed, fallback to copy
          if (shareError.name !== "AbortError") {
            throw shareError;
          }
          return; // User cancelled, don't show error
        }
      }

      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show success message (you might want to use a toast/notification library)
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          alert("Link copied to clipboard!");
        } catch (fallbackError) {
          alert(`Share this link: ${shareUrl}`);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share. Please try again.");
    }
  };

  // On desktop, always use visible post for comments; on mobile, use activePostId (from clicking comment icon)
  const activePostForComments = isMobile
    ? posts.find((post: FoodPost) => post.id === activePostId)
    : posts.length > 0 &&
      visiblePostIndex >= 0 &&
      visiblePostIndex < posts.length
    ? posts[visiblePostIndex]
    : null;

  const activePost = activePostForComments;

  // AGGRESSIVE DEBUGGING: Log state on every render
  // console.log("[Reels UI] Render Debug:", {
  //   activePostId,
  //   postsCount: posts.length,
  //   activePostFound: !!activePost,
  //   optimisticKeys: Object.keys(optimisticComments)
  // });

  const mergedActiveComments = React.useMemo(() => {
    // If we have an activePostId, we should at least try to show optimistic comments for it
    const targetId = activePostId || (activePost ? activePost.id : null);
    if (!targetId) return [];

    const serverComments = activePost ? activePost.commentsList || [] : [];
    const localOptimistic = optimisticComments[targetId] || [];

    // Log merging process
    if (localOptimistic.length > 0) {
      // console.log(`[Reels UI] MERGE for ${targetId}:`, {
      //   localCount: localOptimistic.length,
      //   serverCount: serverComments.length
      // });
    }

    const merged = [
      ...serverComments.filter(
        (sc) =>
          !localOptimistic.some(
            (oc) =>
              oc.id === sc.id ||
              (oc.text === sc.text && oc.user.name === sc.user.name)
          )
      ),
      ...localOptimistic,
    ];

    return merged;
  }, [activePost, activePostId, optimisticComments]);

  if (loading) {
    return isMobile ? (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center  md:p-4">
          <div className="relative h-full w-full overflow-hidden md:max-w-sm md:rounded-2xl md:shadow-2xl">
            <ReelPlaceholder />
            <ReelPlaceholder />
            <ReelPlaceholder />
          </div>
        </div>
      </RootLayout>
    ) : (
      <DesktopReelPlaceholder />
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="text-center">
          <p className="mb-4 text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <RootLayout>
        <div
          className={`flex min-h-screen items-center justify-center ${
            theme === "dark"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          <div className="text-center">
            <p className="mb-4 text-gray-500">No reels available</p>
            <p className="text-sm text-gray-400">
              Check back later for new content
            </p>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render mobile or desktop view
  return (
    <>
      {isMobile ? (
        <MobileReelsView
          posts={posts}
          visiblePostIndex={visiblePostIndex}
          setVisiblePostIndex={setVisiblePostIndex}
          containerRef={containerRef}
          isAuthenticated={!!session?.user}
          onAuthRequired={handleAuthRequired}
          activePost={activePost}
          showComments={showComments}
          openComments={openComments}
          closeComments={closeComments}
          mergedActiveComments={mergedActiveComments}
          toggleCommentLike={(commentId) =>
            activePost && toggleCommentLike(activePost.id, commentId)
          }
          addComment={(text) => activePost && addComment(activePost.id, text)}
          deleteComment={(commentId) =>
            activePost && deleteComment(activePost.id, commentId)
          }
          isRefreshingComments={isRefreshingComments}
          toggleLike={toggleLike}
          handleShare={(post) => handleShare(post)}
          isRefreshing={isRefreshing}
        />
      ) : (
        <DesktopReelsView
          posts={posts}
          visiblePostIndex={visiblePostIndex}
          setVisiblePostIndex={setVisiblePostIndex}
          containerRef={containerRef}
          isAuthenticated={!!session?.user}
          onAuthRequired={handleAuthRequired}
          mergedActiveComments={mergedActiveComments}
          toggleCommentLike={(commentId) =>
            activePost && toggleCommentLike(activePost.id, commentId)
          }
          addComment={(text) => activePost && addComment(activePost.id, text)}
          deleteComment={(commentId) =>
            activePost && deleteComment(activePost.id, commentId)
          }
          isRefreshingComments={isRefreshingComments}
          toggleLike={toggleLike}
          handleShare={(post) => handleShare(post)}
          isRefreshing={isRefreshing}
          theme={theme}
        />
      )}

      <GuestAuthModal
        isOpen={showGuestAuthModal}
        onClose={() => setShowGuestAuthModal(false)}
        onGuestContinue={() => {
          setShowGuestAuthModal(false);
          // router.reload() is handled inside GuestAuthModal
        }}
      />

      <GuestUpgradeModal
        open={showGuestUpgradeModal}
        onClose={() => setShowGuestUpgradeModal(false)}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, query } = context;

  console.log("[Reels SSR] Start getServerSideProps");

  try {
    const session = await getServerSession(req, res, authOptions as any);
    const currentUserId = session?.user ? (session.user as any).id : null;

    console.log("[Reels SSR] Session Status:", {
      hasSession: !!session,
      currentUserId,
    });

    const result = await getReelsData({
      ...(query as any),
      currentUserId,
    });

    if (!result) {
      console.log("[Reels SSR] No result from getReelsData");
      return {
        props: {
          initialReels: [],
          initialUserPreferences: {},
        },
      };
    }

    console.log("[Reels SSR] Success. Reels fetched:", result.reels.length);

    return {
      props: {
        initialReels: JSON.parse(JSON.stringify(result.reels)),
        initialUserPreferences: result.userPreferences || {},
      },
    };
  } catch (error) {
    console.error("[Reels SSR] Error:", error);
    return {
      props: {
        initialReels: [],
        initialUserPreferences: {},
      },
    };
  }
};
