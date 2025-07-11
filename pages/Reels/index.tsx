"use client";

import React, { useState, useRef, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import BottomBar from "@components/ui/NavBar/bottomBar";
import { useTheme } from "../../src/context/ThemeContext";
import VideoReel from "../../src/components/Reels/VideoReel";
import CommentsDrawer from "../../src/components/Reels/CommentsDrawer";
import { useSession } from "next-auth/react";

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
  delivery_time: string | null;
  Price: string | null;
  Product: any;
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
  };
  Restaurant: {
    created_at: string;
    email: string;
    id: string;
    lat: number;
    location: string;
    long: number;
    name: string;
    phone: string;
    profile: string;
    verified: boolean;
  } | null;
  Reels_comments: Array<{
    user_id: string;
    text: string;
    reel_id: string;
    likes: string;
    isLiked: boolean;
    id: string;
    created_on: string;
    User: {
      gender: string;
      email: string;
      name: string;
      phone: string;
      role: string;
      profile_picture?: string;
    };
  }>;
  reel_likes: Array<{
    created_at: string;
    id: string;
    reel_id: string;
    user_id: string;
  }>;
}



// Format timestamp to relative time
const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

// Check if current user has liked a reel
const checkUserLikeStatus = (reelLikes: Array<{user_id: string}>, currentUserId: string): boolean => {
  return reelLikes.some(like => like.user_id === currentUserId);
};

export default function FoodReelsApp() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [visiblePostIndex, setVisiblePostIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Convert database reel to FoodPost format with current user's like status
  const convertDatabaseReelToFoodPost = (dbReel: DatabaseReel): FoodPost => {
    const currentUserId = session?.user?.id;
    const userHasLiked = currentUserId ? checkUserLikeStatus(dbReel.reel_likes, currentUserId) : false;
    
    // Convert comments
    const commentsList: Comment[] = dbReel.Reels_comments.map((comment) => ({
      id: comment.id,
      user: {
        name: comment.User.name,
        avatar: comment.User.profile_picture || "/placeholder.svg?height=32&width=32",
        verified: comment.User.role === "admin" || comment.User.role === "verified",
      },
      text: comment.text,
      timestamp: formatTimestamp(comment.created_on),
      likes: parseInt(comment.likes || "0"),
      isLiked: comment.isLiked,
    }));

    // Base post structure
    const basePost: BasePost = {
      id: dbReel.id,
      type: dbReel.type as PostType,
      creator: {
        name: dbReel.User.name,
        avatar: dbReel.User.profile_picture || "/placeholder.svg?height=40&width=40",
        verified: dbReel.User.role === "admin" || dbReel.User.role === "verified",
      },
      content: {
        title: dbReel.title,
        description: dbReel.description,
        video: dbReel.video_url,
        category: dbReel.category,
      },
      stats: {
        likes: dbReel.reel_likes.length, // Use actual likes count from reel_likes
        comments: dbReel.Reels_comments.length,
      },
      isLiked: userHasLiked, // Use actual user like status
      commentsList,
    };

    // Convert based on type
    switch (dbReel.type) {
      case "restaurant":
        return {
          ...basePost,
          type: "restaurant",
          restaurant: {
            rating: 4.5, // Default rating, could be fetched from restaurant data
            reviews: 100, // Default reviews
            location: dbReel.Restaurant?.location || "Location not available",
            deliveryTime: dbReel.delivery_time || "30-45 min",
            price: parseFloat(dbReel.Price || "0"),
          },
        } as RestaurantPost;

      case "supermarket":
        const product = dbReel.Product || {};
        return {
          ...basePost,
          type: "supermarket",
          product: {
            price: parseFloat(dbReel.Price || "0"),
            originalPrice: product.originalPrice || undefined,
            store: dbReel.Restaurant?.name || "Store not available",
            inStock: product.inStock !== false,
            discount: product.discount || undefined,
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

      default:
        return basePost as FoodPost;
    }
  };

  // Fetch reels from database
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/queries/reels');
        if (!response.ok) {
          throw new Error('Failed to fetch reels');
        }
        
        const data = await response.json();
        const convertedPosts = data.reels.map((reel: DatabaseReel) => 
          convertDatabaseReelToFoodPost(reel)
        );
        
        setPosts(convertedPosts);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [session?.user?.id]);

  // Check if mobile on mount and resize with debouncing
  useEffect(() => {
    const checkIfMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        console.log(
          `Screen size changed: ${newIsMobile ? "mobile" : "desktop"}`
        );
        setIsMobile(newIsMobile);
        // Reset visible post index when switching layouts
        setVisiblePostIndex(0);
      }
    };

    checkIfMobile();

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkIfMobile, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile]);

  // Intersection Observer to detect which post is visible
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!containerRef.current) return;

    console.log(
      `Setting up observer for ${isMobile ? "mobile" : "desktop"} layout`
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            console.log(
              `Post ${index} is now visible on ${
                isMobile ? "mobile" : "desktop"
              }`
            );
            setVisiblePostIndex(index);
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
    console.log(
      `Found ${posts.length} posts to observe on ${
        isMobile ? "mobile" : "desktop"
      }`
    );

    posts.forEach((post, index) => {
      console.log(
        `Observing post ${index} on ${isMobile ? "mobile" : "desktop"}`
      );
      observer.observe(post);
    });

    return () => {
      console.log(
        `Cleaning up observer for ${isMobile ? "mobile" : "desktop"}`
      );
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [posts.length, isMobile]); // Re-run when posts change or mobile state changes

  const toggleLike = async (postId: string) => {
    try {
      const currentPost = posts.find((post: FoodPost) => post.id === postId);
      if (!currentPost) return;

      const isCurrentlyLiked = currentPost.isLiked;
      
      // Immediately update UI for instant feedback
      setPosts(
        posts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !isCurrentlyLiked,
                stats: {
                  ...post.stats,
                  likes: isCurrentlyLiked 
                    ? Math.max(0, post.stats.likes - 1)
                    : post.stats.likes + 1,
                },
              }
            : post
        )
      );

      // Process backend request in background
      const method = isCurrentlyLiked ? 'DELETE' : 'POST';
      
      fetch('/api/queries/reel-likes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reel_id: postId
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Error toggling like:', response.status);
          // Optionally revert UI if backend fails
          // For now, we'll keep the optimistic update
        }
      }).catch(error => {
        console.error('Error toggling like:', error);
        // Optionally revert UI if backend fails
        // For now, we'll keep the optimistic update
      });
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    try {
      const response = await fetch('/api/queries/reel-comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: 'toggle_like'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPosts(
          posts.map((post: FoodPost) =>
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
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const openComments = (postId: string) => {
    console.log("Opening comments for post:", postId);
    setActivePostId(postId);
    setShowComments(true);
    console.log("Comments state after opening:", {
      postId,
      showComments: true,
    });
  };

  const closeComments = () => {
    console.log("Closing comments");
    setShowComments(false);
    setActivePostId(null);
  };

  const addComment = async (postId: string, commentText: string) => {
    try {
      const response = await fetch('/api/queries/reel-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reel_id: postId,
          text: commentText
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newComment: Comment = {
          id: result.comment.id,
          user: {
            name: session?.user?.name || "You",
            avatar: session?.user?.image || "/placeholder.svg?height=32&width=32",
            verified: false, // Will be determined by backend
          },
          text: commentText,
          timestamp: "now",
          likes: 0,
          isLiked: false,
        };

        setPosts(
          posts.map((post: FoodPost) =>
            post.id === postId
              ? {
                  ...post,
                  commentsList: [newComment, ...post.commentsList],
                  stats: {
                    ...post.stats,
                    comments: post.stats.comments + 1,
                  },
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = (postId: string) => {
    console.log("Sharing post:", postId);
  };

  const activePost = posts.find((post: FoodPost) => post.id === activePostId);

  // Loading state - show placeholder reels
  if (loading) {
    const placeholderPosts: FoodPost[] = [
      {
        id: "placeholder-1",
        type: "restaurant",
        creator: {
          name: "Loading...",
          avatar: "/placeholder.svg?height=40&width=40",
          verified: false,
        },
        content: {
          title: "Loading content...",
          description: "Please wait while we load the latest reels for you.",
          video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
          category: "Loading",
        },
        stats: {
          likes: 0,
          comments: 0,
        },
        restaurant: {
          rating: 0,
          reviews: 0,
          location: "Loading...",
          deliveryTime: "Loading...",
          price: 0,
        },
        isLiked: false,
        commentsList: [],
      },
      {
        id: "placeholder-2",
        type: "supermarket",
        creator: {
          name: "Loading...",
          avatar: "/placeholder.svg?height=40&width=40",
          verified: false,
        },
        content: {
          title: "Loading content...",
          description: "Please wait while we load the latest reels for you.",
          video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
          category: "Loading",
        },
        stats: {
          likes: 0,
          comments: 0,
        },
        product: {
          price: 0,
          store: "Loading...",
          inStock: false,
        },
        isLiked: false,
        commentsList: [],
      },
      {
        id: "placeholder-3",
        type: "chef",
        creator: {
          name: "Loading...",
          avatar: "/placeholder.svg?height=40&width=40",
          verified: false,
        },
        content: {
          title: "Loading content...",
          description: "Please wait while we load the latest reels for you.",
          video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
          category: "Loading",
        },
        stats: {
          likes: 0,
          comments: 0,
        },
        recipe: {
          difficulty: "Easy",
          cookTime: "Loading...",
          servings: 0,
          youtubeChannel: "Loading...",
          subscribers: "Loading...",
        },
        isLiked: false,
        commentsList: [],
      },
    ];

    // Use placeholder posts for loading state
    const loadingPosts = placeholderPosts;

    // Mobile layout with placeholder posts
    if (isMobile) {
      return (
        <div
          className={`min-h-screen bg-black transition-colors duration-200 ${
            theme === "dark" ? "bg-gray-900" : "bg-black"
          }`}
        >
          <div
            ref={containerRef}
            style={{ height: "calc(100vh - 80px)", overflowY: "auto" }}
          >
            <div style={{ scrollSnapType: "y mandatory" }}>
              {loadingPosts.map((post, index) => (
                <div
                  key={`${post.id}-${isMobile ? "mobile" : "desktop"}`}
                  data-index={index}
                >
                  <VideoReel
                    post={post}
                    isVisible={visiblePostIndex === index}
                    onLike={toggleLike}
                    onComment={openComments}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>
          </div>
          <BottomBar />
        </div>
      );
    }

    // Desktop layout with placeholder posts
    return (
      <RootLayout>
        <div
          className={`container mx-auto transition-colors duration-200 ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <div
            ref={containerRef}
            className="h-screen"
            style={{ overflowY: "auto" }}
          >
            <div style={{ scrollSnapType: "y mandatory" }}>
              {loadingPosts.map((post, index) => (
                <div
                  key={`${post.id}-${isMobile ? "mobile" : "desktop"}`}
                  data-index={index}
                >
                  <VideoReel
                    post={post}
                    isVisible={visiblePostIndex === index}
                    onLike={toggleLike}
                    onComment={openComments}
                    onShare={handleShare}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">No reels available</p>
          <p className="text-sm text-gray-400">Check back later for new content</p>
        </div>
      </div>
    );
  }

  // Mobile layout - full screen without navbar/sidebar but with bottom bar
  if (isMobile) {
    return (
      <div
        className={`min-h-screen bg-black transition-colors duration-200 ${
          theme === "dark" ? "bg-gray-900" : "bg-black"
        }`}
      >
        <div
          ref={containerRef}
          style={{ height: "calc(100vh - 80px)", overflowY: "auto" }} // Account for bottom bar height
        >
          <div style={{ scrollSnapType: "y mandatory" }}>
            {posts.map((post, index) => (
              <div
                key={`${post.id}-${isMobile ? "mobile" : "desktop"}`}
                data-index={index}
              >
                <VideoReel
                  post={post}
                  isVisible={visiblePostIndex === index}
                  onLike={toggleLike}
                  onComment={openComments}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        {activePost && (
          <CommentsDrawer
            open={showComments}
            onClose={closeComments}
            comments={activePost.commentsList}
            commentCount={activePost.stats.comments}
            postId={activePost.id}
            onToggleCommentLike={toggleCommentLike}
            onAddComment={addComment}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <BottomBar />
      </div>
    );
  }

  // Desktop layout - with normal page alignment matching main page
  return (
    <RootLayout>
      <div
        className={`container mx-auto transition-colors duration-200 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div
          ref={containerRef}
          className="h-screen"
          style={{ overflowY: "auto" }}
        >
          <div style={{ scrollSnapType: "y mandatory" }}>
            {posts.map((post, index) => (
              <div
                key={`${post.id}-${isMobile ? "mobile" : "desktop"}`}
                data-index={index}
              >
                <VideoReel
                  post={post}
                  isVisible={visiblePostIndex === index}
                  onLike={toggleLike}
                  onComment={openComments}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        {activePost && (
          <CommentsDrawer
            open={showComments}
            onClose={closeComments}
            comments={activePost.commentsList}
            commentCount={activePost.stats.comments}
            postId={activePost.id}
            onToggleCommentLike={toggleCommentLike}
            onAddComment={addComment}
          />
        )}
      </div>
    </RootLayout>
  );
}
