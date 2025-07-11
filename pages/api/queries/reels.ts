import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";
import { logger } from "../../../src/utils/logger";

// Fetch all reels with user and restaurant details
const GET_ALL_REELS = gql`
  query GetAllReels {
    Reels(order_by: { created_on: desc }) {
      id
      category
      created_on
      description
      isLiked
      likes
      restaurant_id
      title
      type
      user_id
      video_url
      delivery_time
      Price
      Product
      User {
        email
        gender
        id
        is_active
        name
        created_at
        role
        phone
        profile_picture
      }
      Restaurant {
        created_at
        email
        id
        lat
        location
        long
        name
        phone
        profile
        verified
      }
      Reels_comments {
        user_id
        text
        reel_id
        likes
        isLiked
        id
        created_on
        User {
          gender
          email
          name
          phone
          role
        }
      }
      reel_likes {
        created_at
        id
        reel_id
        user_id
      }
    }
  }
`;

// Fetch reels by user ID
const GET_REELS_BY_USER = gql`
  query GetReelsByUser($user_id: uuid!) {
    Reels(where: { user_id: { _eq: $user_id } }, order_by: { created_on: desc }) {
      id
      category
      created_on
      description
      isLiked
      likes
      restaurant_id
      title
      type
      user_id
      video_url
      delivery_time
      Price
      Product
      User {
        email
        gender
        id
        is_active
        name
        created_at
        role
        phone
        profile_picture
      }
      Restaurant {
        created_at
        email
        id
        lat
        location
        long
        name
        phone
        profile
        verified
      }
      Reels_comments {
        user_id
        text
        reel_id
        likes
        isLiked
        id
        created_on
        User {
          gender
          email
          name
          phone
          role
        }
      }
      reel_likes {
        created_at
        id
        reel_id
        user_id
      }
    }
  }
`;

// Fetch reels by restaurant ID
const GET_REELS_BY_RESTAURANT = gql`
  query GetReelsByRestaurant($restaurant_id: uuid!) {
    Reels(where: { restaurant_id: { _eq: $restaurant_id } }, order_by: { created_on: desc }) {
      id
      category
      created_on
      description
      isLiked
      likes
      restaurant_id
      title
      type
      user_id
      video_url
      delivery_time
      Price
      Product
      User {
        email
        gender
        id
        is_active
        name
        created_at
        role
        phone
        profile_picture
      }
      Restaurant {
        created_at
        email
        id
        lat
        location
        long
        name
        phone
        profile
        verified
      }
      Reels_comments {
        user_id
        text
        reel_id
        likes
        isLiked
        id
        created_on
        User {
          gender
          email
          name
          phone
          role
        }
      }
      reel_likes {
        created_at
        id
        reel_id
        user_id
      }
    }
  }
`;

// Create new reel
const CREATE_REEL = gql`
  mutation AddReels(
    $category: String = ""
    $description: String = ""
    $likes: String = ""
    $restaurant_id: uuid = ""
    $title: String = ""
    $type: String = ""
    $video_url: String = ""
    $Product: jsonb = ""
    $delivery_time: String = ""
    $Price: String = ""
    $user_id: uuid = ""
  ) {
    insert_Reels(
      objects: {
        category: $category
        description: $description
        isLiked: false
        likes: $likes
        restaurant_id: $restaurant_id
        title: $title
        type: $type
        video_url: $video_url
        Product: $Product
        delivery_time: $delivery_time
        Price: $Price
        user_id: $user_id
      }
    ) {
      affected_rows
      returning {
        id
        category
        created_on
        description
        isLiked
        likes
        restaurant_id
        title
        type
        user_id
        video_url
        delivery_time
        Price
        Product
      }
    }
  }
`;

// Update reel like status
const UPDATE_REEL_LIKE = gql`
  mutation UpdateReelLike($id: uuid!, $isLiked: Boolean!, $likes: String!) {
    update_Reels_by_pk(
      pk_columns: { id: $id }
      _set: { isLiked: $isLiked, likes: $likes }
    ) {
      id
      isLiked
      likes
    }
  }
`;

// Add comment to reel
const ADD_REEL_COMMENT = gql`
  mutation AddReelComment($reel_id: uuid!, $user_id: uuid!, $text: String!) {
    insert_Reels_comments(
      objects: { reel_id: $reel_id, user_id: $user_id, text: $text, likes: "0", isLiked: false }
    ) {
      affected_rows
      returning {
        id
        text
        created_on
        user_id
        reel_id
        likes
        isLiked
        User {
          name
          profile_picture
        }
      }
    }
  }
`;

// Update comment like status
const UPDATE_COMMENT_LIKE = gql`
  mutation UpdateCommentLike($id: uuid!, $isLiked: Boolean!, $likes: String!) {
    update_Reels_comments_by_pk(
      pk_columns: { id: $id }
      _set: { isLiked: $isLiked, likes: $likes }
    ) {
      id
      isLiked
      likes
    }
  }
`;

interface ReelsResponse {
  Reels: Array<{
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
      };
    }>;
    reel_likes: Array<{
      created_at: string;
      id: string;
      reel_id: string;
      user_id: string;
    }>;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const { method } = req;

    switch (method) {
      case "GET":
        await handleGetReels(req, res);
        break;
      case "POST":
        await handleCreateReel(req, res);
        break;
      case "PUT":
        await handleUpdateReel(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    logger.error("Error in reels API", "ReelsAPI", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetReels(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, restaurant_id, type } = req.query;

  try {
    let data: ReelsResponse;

    if (user_id) {
      // Get reels by specific user
      data = await hasuraClient.request<ReelsResponse>(GET_REELS_BY_USER, {
        user_id: user_id as string,
      });
    } else if (restaurant_id) {
      // Get reels by specific restaurant
      data = await hasuraClient.request<ReelsResponse>(GET_REELS_BY_RESTAURANT, {
        restaurant_id: restaurant_id as string,
      });
    } else {
      // Get all reels
      data = await hasuraClient.request<ReelsResponse>(GET_ALL_REELS);
    }

    // Filter by type if specified
    let reels = data.Reels;
    if (type) {
      reels = reels.filter((reel) => reel.type === type);
    }

    logger.info(`Found ${reels.length} reels`, "ReelsAPI");
    res.status(200).json({ reels });
  } catch (error) {
    logger.error("Error fetching reels", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to fetch reels" });
  }
}

async function handleCreateReel(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the user ID from the session
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID in session" });
    }

    const {
      category,
      description,
      restaurant_id,
      title,
      type,
      video_url,
      Product,
      delivery_time,
      Price,
    } = req.body;

    if (!title || !video_url || !type) {
      return res.status(400).json({
        error: "Missing required fields: title, video_url, and type are required",
      });
    }

    const result = await hasuraClient.request(CREATE_REEL, {
      category: category || "",
      description: description || "",
      likes: "0",
      restaurant_id: restaurant_id || null,
      title,
      type,
      video_url,
      Product: Product || null,
      delivery_time: delivery_time || null,
      Price: Price || null,
      user_id: userId,
    });

    logger.info("Created new reel", "ReelsAPI", { reelId: result.insert_Reels.returning[0]?.id });
    res.status(201).json({ 
      success: true, 
      reel: result.insert_Reels.returning[0] 
    });
  } catch (error) {
    logger.error("Error creating reel", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to create reel" });
  }
}

async function handleUpdateReel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, action, comment_id, comment_text } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing reel ID" });
    }

    switch (action) {
      case "toggle_like":
        await handleToggleLike(req, res, id);
        break;
      case "add_comment":
        await handleAddComment(req, res, id, comment_text);
        break;
      case "toggle_comment_like":
        await handleToggleCommentLike(req, res, comment_id);
        break;
      default:
        res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    logger.error("Error updating reel", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to update reel" });
  }
}

async function handleToggleLike(req: NextApiRequest, res: NextApiResponse, reelId: string) {
  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current reel data
    const reelData = await hasuraClient.request<ReelsResponse>(
      gql`
        query GetReel($id: uuid!) {
          Reels(where: { id: { _eq: $id } }) {
            id
            isLiked
            likes
          }
        }
      `,
      { id: reelId }
    );

    if (!reelData.Reels.length) {
      return res.status(404).json({ error: "Reel not found" });
    }

    const reel = reelData.Reels[0];
    const currentLikes = parseInt(reel.likes || "0");
    const newIsLiked = !reel.isLiked;
    const newLikes = newIsLiked ? (currentLikes + 1).toString() : (currentLikes - 1).toString();

    const result = await hasuraClient.request(UPDATE_REEL_LIKE, {
      id: reelId,
      isLiked: newIsLiked,
      likes: newLikes,
    });

    res.status(200).json({ 
      success: true, 
      isLiked: newIsLiked, 
      likes: newLikes 
    });
  } catch (error) {
    logger.error("Error toggling reel like", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
}

async function handleAddComment(req: NextApiRequest, res: NextApiResponse, reelId: string, commentText: string) {
  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (session.user as any).id;

    if (!commentText?.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const result = await hasuraClient.request(ADD_REEL_COMMENT, {
      reel_id: reelId,
      user_id: userId,
      text: commentText.trim(),
    });

    res.status(200).json({ 
      success: true, 
      comment: result.insert_Reels_comments.returning[0] 
    });
  } catch (error) {
    logger.error("Error adding comment", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
}

async function handleToggleCommentLike(req: NextApiRequest, res: NextApiResponse, commentId: string) {
  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current comment data
    const commentData = await hasuraClient.request(
      gql`
        query GetComment($id: uuid!) {
          Reels_comments(where: { id: { _eq: $id } }) {
            id
            isLiked
            likes
          }
        }
      `,
      { id: commentId }
    );

    if (!commentData.Reels_comments.length) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = commentData.Reels_comments[0];
    const currentLikes = parseInt(comment.likes || "0");
    const newIsLiked = !comment.isLiked;
    const newLikes = newIsLiked ? (currentLikes + 1).toString() : (currentLikes - 1).toString();

    const result = await hasuraClient.request(UPDATE_COMMENT_LIKE, {
      id: commentId,
      isLiked: newIsLiked,
      likes: newLikes,
    });

    res.status(200).json({ 
      success: true, 
      isLiked: newIsLiked, 
      likes: newLikes 
    });
  } catch (error) {
    logger.error("Error toggling comment like", "ReelsAPI", error);
    res.status(500).json({ error: "Failed to toggle comment like" });
  }
} 