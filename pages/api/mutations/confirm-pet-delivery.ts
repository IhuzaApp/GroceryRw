import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";
import { sendNotificationToUser } from "../../../src/services/fcmService";

const GET_ADOPTION_FOR_CONFIRMATION = gql`
  query GetAdoptionForConfirmation($id: uuid!) {
    petAdoption_by_pk(id: $id) {
      id
      status
      amount
      pet_id
      customer_id
      pets {
        id
        name
        quantity_sold
        vendor_id
        pet_vendors {
          id
          fullname
          organisationName
        }
      }
      User {
        id
        name
        phone
      }
    }
  }
`;

const UPDATE_BUSINESS_WALLET = gql`
  mutation CreditVendorWallet($id: uuid!, $new_amount: String!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $id }
      _set: { amount: $new_amount }
    ) {
      id
      amount
    }
  }
`;

const GET_VENDOR_WALLET = gql`
  query GetVendorWallet($vendor_id: uuid!) {
    business_wallet(
      where: { pet_vendor: { id: { _eq: $vendor_id } } }
    ) {
      id
      amount
    }
  }
`;

const UPDATE_PET_QUANTITY_SOLD = gql`
  mutation UpdatePetQuantitySold($id: uuid!, $quantity_sold: String!) {
    update_pets_by_pk(
      pk_columns: { id: $id }
      _set: { quantity_sold: $quantity_sold }
    ) {
      id
    }
  }
`;

const UPDATE_ADOPTION_STATUS = gql`
  mutation UpdateAdoptionStatus($id: uuid!, $status: String!) {
    update_petAdoption_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
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

  if (!hasuraClient) {
    return res.status(500).json({ error: "Database client not initialized" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { adoptionId } = req.body;
    if (!adoptionId) {
      return res.status(400).json({ error: "Missing adoptionId" });
    }

    // 1. Get adoption details
    const adoptionData = await hasuraClient.request<any>(GET_ADOPTION_FOR_CONFIRMATION, {
      id: adoptionId,
    });
    const adoption = adoptionData.petAdoption_by_pk;

    if (!adoption) {
      return res.status(404).json({ error: "Adoption record not found" });
    }

    if (adoption.status !== "ACCEPTED") {
      return res.status(400).json({ error: "Adoption must be accepted by the vendor first" });
    }

    // Authorization check
    const vendorId = adoption.pets?.vendor_id;
    if (!vendorId) {
       return res.status(400).json({ error: "Adoption record is missing vendor info" });
    }

    // 2. Credit the Vendor's Wallet
    const amountToCredit = parseFloat(adoption.amount || "0");
    if (amountToCredit > 0) {
      const walletData = await hasuraClient.request<any>(GET_VENDOR_WALLET, {
        vendor_id: vendorId,
      });

      const wallet = walletData.business_wallet?.[0];
      if (wallet) {
        const currentBalance = parseFloat(wallet.amount || "0");
        const newBalance = currentBalance + amountToCredit;

        await hasuraClient.request(UPDATE_BUSINESS_WALLET, {
          id: wallet.id,
          new_amount: newBalance.toFixed(0).toString(),
        });
      } else {
         console.warn(`No wallet found for vendor ${vendorId}, skipping credit.`);
      }
    }

    // 3. Increment Quantity Sold
    try {
      const currentSold = parseInt(adoption.pets?.quantity_sold || "0", 10);
      const newSold = (currentSold + 1).toString();
      await hasuraClient.request(UPDATE_PET_QUANTITY_SOLD, {
        id: adoption.pets?.id,
        quantity_sold: newSold,
      });
    } catch (incErr) {
      console.error("Failed to increment quantity_sold:", incErr);
    }

    // 4. Mark adoption as DELIVERED
    await hasuraClient.request(UPDATE_ADOPTION_STATUS, {
      id: adoptionId,
      status: "DELIVERED",
    });

    // 5. Notify Customer
    try {
      const customerPhone = adoption.User?.phone;
      const petName = adoption.pets?.name || "Pet";
      const vendorName = adoption.pets?.pet_vendors?.organisationName || adoption.pets?.pet_vendors?.fullname || "Vendor";

      if (customerPhone) {
        const message = `Hello ${adoption.User.name}, your adoption of "${petName}" from ${vendorName} has been CONFIRMED as delivered! Thank you for using our platform. 🐾`;
        await sendSMS(customerPhone, message);
      }

      if (adoption.User?.id) {
         await sendNotificationToUser(adoption.User.id, {
            title: "Pet Delivered! 🐾",
            body: `Your adoption of "${petName}" has been confirmed as delivered.`,
            data: {
              type: "pet_adoption_status",
              status: "DELIVERED",
              adoptionId,
            }
         });
      }
    } catch (notifErr) {
      console.error("Failed to send customer notification:", notifErr);
    }

    return res.status(200).json({
      success: true,
      status: "DELIVERED",
      amountCredited: amountToCredit,
    });
  } catch (error: any) {
    console.error("Error confirming pet delivery:", error);
    return res.status(500).json({ error: error.message || "Failed to confirm delivery" });
  }
}
