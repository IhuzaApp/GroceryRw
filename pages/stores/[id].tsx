import StorePage from "../../src/components/items/StorePage";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

interface Store {
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

interface StoreResponse {
  business_stores_by_pk: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    category_id: string | null;
    latitude: string | null;
    longitude: string | null;
    operating_hours: any;
    is_active: boolean;
    created_at: string;
  } | null;
}

interface ProductsResponse {
  PlasBusinessProductsOrSerive: Array<{
    id: string;
    name: string;
    Description: string;
    Image: string;
    price: string;
    unit: string;
    status: string;
    created_at: string;
    minimumOrders: string;
    maxOrders: string;
    delveryArea: string;
    query_id: string;
    speciality: string;
  }>;
}

export default function StoreByIdPage({
  store,
  products,
}: {
  store: Store;
  products: any[];
}) {
  return <StorePage store={store} products={products} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  // Fetch store details
  const storeQuery = gql`
    query GetStoreById($id: uuid!) {
      business_stores_by_pk(id: $id) {
        id
        name
        description
        image
        category_id
        latitude
        longitude
        operating_hours
        is_active
        created_at
      }
    }
  `;

  // Fetch products for this store
  const productsQuery = gql`
    query GetProductsByStore($store_id: uuid!) {
      PlasBusinessProductsOrSerive(
        where: { 
          store_id: { _eq: $store_id }
          status: { _eq: "active" }
        }
      ) {
        id
        name
        Description
        Image
        price
        unit
        status
        created_at
        minimumOrders
        maxOrders
        delveryArea
        query_id
        speciality
      }
    }
  `;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const [storeData, productsData] = await Promise.all([
      hasuraClient.request<StoreResponse>(storeQuery, { id }),
      hasuraClient.request<ProductsResponse>(productsQuery, { store_id: id }),
    ]);

    if (!storeData.business_stores_by_pk) {
      return {
        notFound: true,
      };
    }

    // Transform store to match Store format
    const store: Store = {
      id: storeData.business_stores_by_pk.id,
      name: storeData.business_stores_by_pk.name,
      description: storeData.business_stores_by_pk.description || "",
      image: storeData.business_stores_by_pk.image || "",
      logo: storeData.business_stores_by_pk.image || "",
      address: "",
      latitude: storeData.business_stores_by_pk.latitude || "",
      longitude: storeData.business_stores_by_pk.longitude || "",
      operating_hours: storeData.business_stores_by_pk.operating_hours,
      is_active: storeData.business_stores_by_pk.is_active,
    };

    // Transform products
    const products = productsData.PlasBusinessProductsOrSerive.map(
      (product) => ({
        id: product.id,
        name: product.name,
        description: product.Description || "",
        image: product.Image || "",
        price: product.price,
        unit: product.unit || "",
        measurement_unit: product.unit || "",
        category: product.speciality || "General",
        minimumOrders: product.minimumOrders,
        maxOrders: product.maxOrders,
        delveryArea: product.delveryArea,
      })
    );

    return {
      props: {
        store,
        products,
      },
    };
  } catch (error) {
    console.error("Error fetching store data:", error);
    return {
      notFound: true,
    };
  }
};
