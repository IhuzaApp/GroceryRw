import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";

const UPDATE_PROFILE_PICTURE = gql`
  mutation UpdateProfilePicture($id: uuid!, $profile_picture: String!) {
    update_Users_by_pk(
      pk_columns: { id: $id }
      _set: { profile_picture: $profile_picture, updated_at: "now()" }
    ) {
      id
      profile_picture
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = (session.user as any).id as string;
    const { avatar_url } = req.body;

    if (!avatar_url || typeof avatar_url !== "string") {
      return res.status(400).json({ error: "avatar_url is required" });
    }

    // Only allow DiceBear URLs or safe external avatar URLs
    const allowedPatterns = [
      /^https:\/\/api\.dicebear\.com\//,
      /^https:\/\/avatars\.githubusercontent\.com\//,
      /^\/images\//,
    ];

    const isAllowed = allowedPatterns.some((pattern) =>
      pattern.test(avatar_url)
    );
    if (!isAllowed) {
      return res.status(400).json({ error: "Invalid avatar URL" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    await hasuraClient.request(UPDATE_PROFILE_PICTURE, {
      id: user_id,
      profile_picture: avatar_url,
    });

    return res.status(200).json({
      message: "Avatar updated successfully",
      profile_picture: avatar_url,
    });
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return res.status(500).json({
      error: "Failed to update avatar",
      message: error.message,
    });
  }
}
