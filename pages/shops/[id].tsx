import FreshMarkPage from "../../src/components/items/FreshMarkPage";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { ProductsResponse } from "../../src/types";

export default function ShopByIdPage({ products }: { products: any[] }) {
  // Pass products as a prop to FreshMarkPage
  return <FreshMarkPage products={products} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  // Fetch products for this shop
  const query = gql`
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
  const variables = { shop_id: id };
  const data = await hasuraClient.request<ProductsResponse>(query, variables);
  return {
    props: {
      products: data.Products || [],
    },
  };
};
