import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const EDIT_PET_MUTATION = gql`
  mutation EditPet(
    $id: uuid!
    $age: String = ""
    $amount: String = ""
    $breed: String = ""
    $color: String = ""
    $free: Boolean = false
    $gender: String = ""
    $months: String = ""
    $name: String = ""
    $pet_type: String = ""
    $quantity: String = ""
    $quantity_sold: String = ""
    $story: String = ""
    $updated_at: timestamptz = "now()"
    $vaccination_cert: String = ""
    $vaccinated: Boolean = false
    $vaccinations: jsonb = "[]"
    $weight: String = ""
    $image: String = ""
    $parent_images: jsonb = "[]"
    $video: String = ""
  ) {
    update_pets_by_pk(
      pk_columns: { id: $id }
      _set: {
        age: $age
        amount: $amount
        breed: $breed
        color: $color
        free: $free
        gender: $gender
        months: $months
        name: $name
        pet_type: $pet_type
        quantity: $quantity
        quantity_sold: $quantity_sold
        story: $story
        updated_at: $updated_at
        vaccinated: $vaccinated
        vaccination_cert: $vaccination_cert
        vaccinations: $vaccinations
        weight: $weight
        image: $image
        parent_images: $parent_images
        video: $video
      }
    ) {
      id
      name
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      id,
      age,
      amount,
      breed,
      color,
      free,
      gender,
      months,
      name,
      pet_type,
      quantity,
      quantity_sold,
      story,
      vaccinated,
      vaccination_cert,
      vaccinations,
      weight,
      images,
      videoUrl,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing pet ID" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Map images: first is main 'image', rest are 'parent_images'
    const mainImage = images && images.length > 0 ? images[0].url : "";
    const parentImages = images && images.length > 1 ? images.slice(1) : [];

    interface EditPetResponse {
      update_pets_by_pk: {
        id: string;
        name: string;
      };
    }

    const result = await hasuraClient.request<EditPetResponse>(EDIT_PET_MUTATION, {
      id,
      age,
      amount,
      breed,
      color,
      free: free || false,
      gender,
      months,
      name,
      pet_type,
      quantity,
      quantity_sold: quantity_sold || "0",
      story,
      vaccinated: vaccinated || false,
      vaccination_cert,
      vaccinations: vaccinations || [],
      weight,
      image: mainImage,
      parent_images: parentImages,
      video: videoUrl || "",
    });

    return res.status(200).json({
      success: true,
      pet: result.update_pets_by_pk,
    });
  } catch (error: any) {
    console.error("Error editing pet:", error);
    return res.status(500).json({ error: error.message });
  }
}
