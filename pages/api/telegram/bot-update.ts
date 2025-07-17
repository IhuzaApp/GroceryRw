import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const UPDATE_SHOPPER_TELEGRAM_ID = gql`
  mutation UpdateShopperTelegramId($shopper_id: uuid!, $telegram_id: String!) {
    update_shoppers_by_pk(
      pk_columns: { id: $shopper_id }
      _set: { telegram_id: $telegram_id }
    ) {
      id
      telegram_id
      full_name
      status
      active
    }
  }
`;



const GET_SHOPPER_BY_TELEGRAM_ID = gql`
  query GetShopperByTelegramId($telegram_id: String!) {
    shoppers(where: { telegram_id: { _eq: $telegram_id } }) {
      id
      full_name
      status
      active
      telegram_id
      user_id
      phone_number
      address
      transport_mode
      created_at
      updated_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, shopperId, telegramId, status } = req.body;

    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    switch (action) {
      case "update_telegram_id":
        if (!shopperId || !telegramId) {
          return res.status(400).json({ 
            error: "Missing required fields: shopperId and telegramId" 
          });
        }

        // Update Telegram ID
        const updateResult = await hasuraClient.request<{
          update_shoppers_by_pk: {
            id: string;
            telegram_id: string;
            full_name: string;
            status: string;
            active: boolean;
          };
        }>(
          UPDATE_SHOPPER_TELEGRAM_ID,
          { shopper_id: shopperId, telegram_id: telegramId }
        );

        console.log(`✅ Telegram ID updated for shopper ${shopperId}: ${telegramId}`);

        return res.status(200).json({ 
          success: true, 
          shopper: updateResult.update_shoppers_by_pk 
        });



      case "get_by_telegram_id":
        if (!telegramId) {
          return res.status(400).json({ 
            error: "Missing required field: telegramId" 
          });
        }

        // Get shopper by Telegram ID
        const shopperResult = await hasuraClient.request<{
          shoppers: Array<{
            id: string;
            full_name: string;
            status: string;
            active: boolean;
            telegram_id: string;
            user_id: string;
            phone_number: string;
            address: string;
            transport_mode: string;
            created_at: string;
            updated_at: string;
          }>;
        }>(
          GET_SHOPPER_BY_TELEGRAM_ID,
          { telegram_id: telegramId }
        );

        return res.status(200).json({ 
          success: true, 
          shopper: shopperResult.shoppers[0] || null 
        });

      default:
        return res.status(400).json({ 
          error: "Invalid action. Use: update_telegram_id or get_by_telegram_id" 
        });
    }

  } catch (error) {
    console.error("Error updating shopper:", error);
    return res.status(500).json({ 
      error: "Failed to update shopper" 
    });
  }
} 