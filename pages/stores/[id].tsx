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
  businessAccount?: {
    id: string;
    account_type: string;
    business_name: string | null;
    user_id: string;
    owner?: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
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
    business_id: string;
    business_account?: {
      id: string;
      account_type: string;
      business_name: string | null;
      user_id: string;
      Users?: {
        id: string;
        name: string | null;
        email: string | null;
      };
    };
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
  error,
  message,
}: {
  store: Store | null;
  products: any[];
  error?: string;
  message?: string;
}) {
  // Handle service unavailable error
  if (error === "service_unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Service Temporarily Unavailable
          </h1>
          <p className="mb-4 text-gray-600">
            {message || "The database service is temporarily unavailable. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Store Not Found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <StorePage store={store} products={products} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  // Fetch store details with business account info
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
        business_id
        business_account {
          id
          account_type
          business_name
          user_id
          Users {
            id
            name
            email
          }
        }
      }
    }
  `;

  // Fetch products for this store
  const productsQuery = gql`
    query GetProductsByStore($store_id: uuid!) {
      PlasBusinessProductsOrSerive(
        where: { store_id: { _eq: $store_id }, status: { _eq: "active" } }
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
      businessAccount: storeData.business_stores_by_pk.business_account
        ? {
            id: storeData.business_stores_by_pk.business_account.id,
            account_type:
              storeData.business_stores_by_pk.business_account.account_type,
            business_name:
              storeData.business_stores_by_pk.business_account.business_name,
            user_id: storeData.business_stores_by_pk.business_account.user_id,
            owner: storeData.business_stores_by_pk.business_account.Users
              ? {
                  id: storeData.business_stores_by_pk.business_account.Users.id,
                  name: storeData.business_stores_by_pk.business_account.Users
                    .name,
                  email:
                    storeData.business_stores_by_pk.business_account.Users
                      .email,
                }
              : undefined,
          }
        : undefined,
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
  } catch (error: any) {
    console.error("Error fetching store data:", error);
    
    // Check if it's a 502 Bad Gateway error (Hasura server down)
    const is502Error = error?.response?.status === 502 || 
                      error?.message?.includes("502") ||
                      error?.response?.statusCode === 502;
    
    if (is502Error) {
      // Return a more helpful error page instead of 404
      return {
        props: {
          error: "service_unavailable",
          message: "The database service is temporarily unavailable. Please try again later.",
          store: null,
          products: [],
        },
      };
    }
    
    // For other errors, return 404
    return {
      notFound: true,
    };
  }
};
