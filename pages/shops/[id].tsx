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
  address: string;
  latitude: string;
  longitude: string;
  operating_hours: any;
  is_active: boolean;
}

interface ShopResponse {
  Shops_by_pk: Shop;
}

export default function ShopByIdPage({ shop, products }: { shop: Shop, products: any[] }) {
  return <FreshMarkPage shop={shop} products={products} />;
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
        name
        description
        price
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

  try {
    const [shopData, productsData] = await Promise.all([
      hasuraClient.request<ShopResponse>(shopQuery, { id }),
      hasuraClient.request<ProductsResponse>(productsQuery, { shop_id: id })
    ]);

    return {
      props: {
        shop: shopData.Shops_by_pk || null,
        products: productsData.Products || [],
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        shop: null,
        products: [],
      },
    };
  }
};
