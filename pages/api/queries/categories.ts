import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_CATEGORIES = gql`
  query GetCategories {
    Categories {
      id
      name
      description
      created_at
      image
      is_active
    }
  }
`;

interface CategoriesResponse {
  Categories: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(
      "Making request to Hasura with URL:",
      process.env.HASURA_GRAPHQL_URL
    );
    const data = await hasuraClient.request<CategoriesResponse>(GET_CATEGORIES);
    console.log("Received data:", JSON.stringify(data, null, 2));

    if (!data || !data.Categories) {
      console.log("No data received from Hasura");
      return res.status(200).json({ categories: [] });
    }

    res.status(200).json({ categories: data.Categories });
  } catch (error: any) {
    console.error("Error details:", error);
    console.error("Error response:", error?.response);
    console.error("Error request:", error?.request);
    res.status(500).json({
      error: "Failed to fetch categories",
      details: error?.message,
      response: error?.response,
      request: error?.request,
    });
  }
}
