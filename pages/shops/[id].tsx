import FreshMarkPage from "../../src/components/items/FreshMarkPage";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { ProductsResponse } from "../../src/types";

interface Shop {
  id: string;
  name: string;
  description: string;
  image: string;
  logo: string;
  address: string;
  latitude: string;
  longitude: string;
  operating_hours: any;
  is_active: boolean;
}

interface ShopResponse {
  Shops_by_pk: Shop;
}

interface Rating {
  packaging_quality?: number;
  rating?: number;
  updated_at: string;
  created_at: string;
  customer_id: string;
}

interface RatingsResponse {
  Ratings: Rating[];
}

export default function ShopByIdPage({
  shop,
  products,
  ratings,
}: {
  shop: Shop;
  products: any[];
  ratings: { averageRating: number; totalReviews: number };
}) {
  return <FreshMarkPage shop={shop} products={products} ratings={ratings} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  // Fetch shop details
  const shopQuery = gql`
    query GetShopById($id: uuid!) {
      Shops_by_pk(id: $id) {
        id
        name
        description
        image
        logo
        address
        latitude
        longitude
        operating_hours
        is_active
      }
    }
  `;

  // Fetch products for this shop
  const productsQuery = gql`
    query GetProductsByShop($shop_id: uuid!) {
      Products(where: { shop_id: { _eq: $shop_id } }) {
        id
        ProductName {
          id
          name
          description
          barcode
          sku
          image
          create_at
        }
        price
        final_price
        quantity
        measurement_unit
        image
        category
        created_at
        updated_at
        is_active
        shop_id
      }
    }
  `;

  // Fetch ratings for this shop
  const ratingsQuery = gql`
    query GetShopRatings($shop_id: uuid!) {
      Ratings(where: { Order: { shop_id: { _eq: $shop_id } } }) {
        packaging_quality
        rating
        updated_at
        created_at
        customer_id
      }
    }
  `;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const [shopData, productsData, ratingsData] = await Promise.all([
      hasuraClient.request<ShopResponse>(shopQuery, { id }),
      hasuraClient.request<ProductsResponse>(productsQuery, { shop_id: id }),
      hasuraClient.request<RatingsResponse>(ratingsQuery, { shop_id: id }),
    ]);

    // Calculate average rating and total reviews
    const ratings = ratingsData.Ratings || [];
    const ratingsWithValues = ratings.filter(
      (r) => r.rating !== null && r.rating !== undefined
    );
    const averageRating =
      ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, r) => sum + (r.rating || 0), 0) /
          ratingsWithValues.length
        : 0;
    const totalReviews = ratingsWithValues.length;

    return {
      props: {
        shop: shopData.Shops_by_pk || null,
        products: productsData.Products || [],
        ratings: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          totalReviews,
        },
      },
    };
  } catch (error) {
    return {
      props: {
        shop: null,
        products: [],
        ratings: {
          averageRating: 0,
          totalReviews: 0,
        },
      },
    };
  }
};
