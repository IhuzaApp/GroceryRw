"use client"

import { useState } from "react"
import Image from "next/image"
import { Avatar, Button, Badge, Panel, Drawer, Input } from "rsuite"
import React from "react"
import RootLayout from "@components/ui/layout"

// Inline SVGs for icons
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1" className="w-4 h-4" style={{ marginRight: 4 }} {...props}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)
const HeartIcon = ({ filled = false, ...props }: { filled?: boolean } & React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#e53e3e" : "none"}
    stroke="#e53e3e"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)
const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
)
const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
)
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
)
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const DollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
)

// Add more inline SVGs for icons used in getPostTypeIcon and renderBottomActions
const UtensilsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 3v7a4 4 0 0 0 8 0V3"/><path d="M8 21v-7"/><path d="M19 8h-2a2 2 0 0 0-2 2v7"/><path d="M15 21v-7"/><path d="M19 21v-7a2 2 0 0 0-2-2h-2"/></svg>
);
const PackageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
const ChefHatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 19v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M6 19a6 6 0 0 1 12 0"/><path d="M6 19H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2"/><path d="M18 19h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
);
const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.59H6.5"/></svg>
);
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="red" {...props}><path d="M21.8 8.001a2.752 2.752 0 0 0-1.94-1.95C18.2 6 12 6 12 6s-6.2 0-7.86.05a2.752 2.752 0 0 0-1.94 1.95A28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .2 3.999 2.752 2.752 0 0 0 1.94 1.95C5.8 18 12 18 12 18s6.2 0 7.86-.05a2.752 2.752 0 0 0 1.94-1.95A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.2-3.999zM10 15V9l5 3-5 3z"/></svg>
);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M2 7h20"/></svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

type PostType = "restaurant" | "supermarket" | "chef"

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

interface BasePost {
  id: string
  type: PostType
  creator: {
    name: string
    avatar: string
    verified: boolean
  }
  content: {
    title: string
    description: string
    image: string
    category: string
  }
  stats: {
    likes: number
    comments: number
    views?: number
  }
  isLiked: boolean
  commentsList: Comment[]
}

interface RestaurantPost extends BasePost {
  type: "restaurant"
  restaurant: {
    rating: number
    reviews: number
    location: string
    deliveryTime: string
    price: number
  }
}

interface SupermarketPost extends BasePost {
  type: "supermarket"
  product: {
    price: number
    originalPrice?: number
    store: string
    inStock: boolean
    discount?: number
  }
}

interface ChefPost extends BasePost {
  type: "chef"
  recipe: {
    difficulty: "Easy" | "Medium" | "Hard"
    cookTime: string
    servings: number
    youtubeChannel: string
    subscribers: string
  }
}

type FoodPost = RestaurantPost | SupermarketPost | ChefPost

const mockComments: Comment[] = [
  {
    id: "1",
    user: {
      name: "foodie_sarah",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: true,
    },
    text: "This looks absolutely amazing! 😍 Can't wait to try it!",
    timestamp: "2h",
    likes: 24,
    isLiked: false,
  },
  {
    id: "2",
    user: {
      name: "mike_eats",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "Just ordered this yesterday and it was incredible! Highly recommend 👌",
    timestamp: "4h",
    likes: 12,
    isLiked: true,
  },
  {
    id: "3",
    user: {
      name: "chef_anna",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: true,
    },
    text: "The technique shown here is perfect! Great job on the presentation 🔥",
    timestamp: "6h",
    likes: 45,
    isLiked: false,
  },
  {
    id: "4",
    user: {
      name: "hungry_student",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "Is this available for delivery in downtown area?",
    timestamp: "8h",
    likes: 3,
    isLiked: false,
  },
  {
    id: "5",
    user: {
      name: "taste_tester",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "The price is so reasonable for the quality! Will definitely visit this place soon 💯",
    timestamp: "12h",
    likes: 18,
    isLiked: false,
  },
]

const foodPosts: FoodPost[] = [
  {
    id: "1",
    type: "restaurant",
    creator: {
      name: "Bella Italia",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Truffle Pasta Carbonara",
      description: "Creamy carbonara with black truffle, pancetta, and fresh parmesan. A classic Italian comfort dish.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Italian",
    },
    stats: {
      likes: 1247,
      comments: 89,
    },
    restaurant: {
      rating: 4.8,
      reviews: 156,
      location: "0.8 miles away",
      deliveryTime: "25-35 min",
      price: 24.99,
    },
    isLiked: false,
    commentsList: mockComments,
  },
  {
    id: "2",
    type: "supermarket",
    creator: {
      name: "Fresh Market",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Organic Avocados",
      description:
        "Premium organic Hass avocados, perfectly ripe and ready to eat. Great for toast, salads, and smoothies.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Organic",
    },
    stats: {
      likes: 892,
      comments: 45,
    },
    product: {
      price: 3.99,
      originalPrice: 5.99,
      store: "Fresh Market Downtown",
      inStock: true,
      discount: 33,
    },
    isLiked: true,
    commentsList: mockComments.slice(0, 3),
  },
  {
    id: "3",
    type: "chef",
    creator: {
      name: "Chef Marco",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Perfect Homemade Pizza Dough",
      description:
        "Learn the secret to making restaurant-quality pizza dough at home. Simple ingredients, amazing results!",
      image: "/placeholder.svg?height=600&width=400",
      category: "Tutorial",
    },
    stats: {
      likes: 3421,
      comments: 234,
      views: 45600,
    },
    recipe: {
      difficulty: "Medium",
      cookTime: "2 hours",
      servings: 4,
      youtubeChannel: "@ChefMarcoKitchen",
      subscribers: "2.3M",
    },
    isLiked: false,
    commentsList: mockComments,
  },
  {
    id: "4",
    type: "supermarket",
    creator: {
      name: "GreenGrocer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    content: {
      title: "Wild Salmon Fillets",
      description:
        "Fresh wild-caught salmon fillets, sustainably sourced. Perfect for grilling, baking, or pan-searing.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Seafood",
    },
    stats: {
      likes: 567,
      comments: 23,
    },
    product: {
      price: 18.99,
      store: "GreenGrocer Market",
      inStock: true,
    },
    isLiked: false,
    commentsList: mockComments.slice(1, 4),
  },
  {
    id: "5",
    type: "chef",
    creator: {
      name: "Chef Sarah",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "5-Minute Chocolate Mug Cake",
      description:
        "Craving chocolate cake but don't want to bake a whole cake? This microwave mug cake is your answer!",
      image: "/placeholder.svg?height=600&width=400",
      category: "Dessert",
    },
    stats: {
      likes: 8934,
      comments: 456,
      views: 123400,
    },
    recipe: {
      difficulty: "Easy",
      cookTime: "5 min",
      servings: 1,
      youtubeChannel: "@SarahsBaking",
      subscribers: "1.8M",
    },
    isLiked: true,
    commentsList: mockComments,
  },
]

export default function FoodReelsApp() {
  const [posts, setPosts] = useState(foodPosts)
  const [showComments, setShowComments] = useState(false)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post,
      ),
    )
  }

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsList: post.commentsList.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    }
                  : comment,
              ),
            }
          : post,
      ),
    )
  }

  const openComments = (postId: string) => {
    setActivePostId(postId)
    setShowComments(true)
  }

  const closeComments = () => {
    setShowComments(false)
    setActivePostId(null)
    setNewComment("")
  }

  const addComment = () => {
    if (!newComment.trim() || !activePostId) return

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: {
        name: "you",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      text: newComment,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    setPosts(
      posts.map((post) =>
        post.id === activePostId
          ? {
              ...post,
              commentsList: [newCommentObj, ...post.commentsList],
              stats: {
                ...post.stats,
                comments: post.stats.comments + 1,
              },
            }
          : post,
      ),
    )

    setNewComment("")
  }

  const activePost = posts.find((post) => post.id === activePostId)

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return <UtensilsIcon />
      case "supermarket":
        return <PackageIcon />
      case "chef":
        return <ChefHatIcon />
    }
  }

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "supermarket":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "chef":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
    }
  }

  const renderBottomActions = (post: FoodPost) => {
    switch (post.type) {
      case "restaurant":
        const restaurantPost = post as RestaurantPost
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="text-white font-semibold">{restaurantPost.restaurant.rating}</span>
                <span className="text-white/70 text-sm">({restaurantPost.restaurant.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarIcon />
                <span className="text-white font-bold text-lg">${restaurantPost.restaurant.price}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <MapPinIcon />
                <span>{restaurantPost.restaurant.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon />
                <span>{restaurantPost.restaurant.deliveryTime}</span>
              </div>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full">
              <ShoppingCartIcon />
              Order Now
            </Button>
          </div>
        )

      case "supermarket":
        const supermarketPost = post as SupermarketPost
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl">${supermarketPost.product.price}</span>
                {supermarketPost.product.originalPrice && (
                  <>
                    <span className="text-white/60 line-through text-sm">${supermarketPost.product.originalPrice}</span>
                    <Badge className="bg-red-500 text-white text-xs">{supermarketPost.product.discount}% OFF</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <PackageIcon />
              <span>{supermarketPost.product.store}</span>
              <Badge className={supermarketPost.product.inStock ? "bg-green-500 text-white text-xs" : "bg-red-500 text-white text-xs"}>
                {supermarketPost.product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full">
                <PackageIcon />
                Visit Store
              </Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full">
                <ShoppingCartIcon />
                Add to Cart
              </Button>
            </div>
          </div>
        )

      case "chef":
        const chefPost = post as ChefPost
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <ClockIcon />
                <span>{chefPost.recipe.cookTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👥 {chefPost.recipe.servings} servings</span>
              </div>
              <Badge className="text-white border-white/30">
                {chefPost.recipe.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <YoutubeIcon />
              <span>{chefPost.recipe.youtubeChannel}</span>
              <span>• {chefPost.recipe.subscribers} subscribers</span>
            </div>
            {chefPost.stats.views && (
              <div className="text-white/70 text-sm">{chefPost.stats.views.toLocaleString()} views</div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full">
                <YoutubeIcon />
                Watch on YouTube
              </Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full">
                <BookOpenIcon />
                Get Recipe
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
   <RootLayout>
    <div style={{ height: "100vh", background: "#000" }}>
      <div style={{ height: "100%", overflowY: "auto" }}>
        {posts.map((post) => (
          <Panel shaded bordered style={{ margin: 24, background: "#222" }} key={post.id}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar circle src={post.creator.avatar || "/placeholder.svg"} alt={post.creator.name} />
              <span style={{ color: "#fff", marginLeft: 8 }}>{post.creator.name}</span>
              {post.creator.verified && (
                <Badge content="✓" style={{ background: "#38a169", marginLeft: 8 }} />
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <Image src={post.content.image || "/placeholder.svg"} alt={post.content.title} width={400} height={300} />
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
              <Button appearance="ghost" color={post.isLiked ? "red" : "ghost"} onClick={() => toggleLike(post.id)}>
                <HeartIcon filled={post.isLiked} /> Like
              </Button>
              <Button appearance="ghost" color="blue" onClick={() => openComments(post.id)}>
                <MessageIcon /> Comment
              </Button>
              <Button appearance="ghost">
                <ShareIcon /> Share
              </Button>
            </div>
            <div style={{ marginTop: 16 }}>
              <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "bold", marginBottom: 8 }}>{post.content.title}</h2>
              <p style={{ color: "#fff", fontSize: "1rem", marginBottom: 16 }}>{post.content.description}</p>
              {renderBottomActions(post)}
            </div>
          </Panel>
        ))}
      </div>
      {/* Use Drawer for comments if needed */}
      {/* <Drawer open={showComments} onClose={() => setShowComments(false)} placement="bottom"> ... </Drawer> */}
    </div>
   </RootLayout>
  )
}
