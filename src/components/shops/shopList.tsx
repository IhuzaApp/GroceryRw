import React, { useState, useEffect } from "react";
import { hasuraClient } from "../../lib/hasuraClient";
import { gql } from "graphql-request";

interface Shop {
  id: string;
  name: string;
  image: string;
  logo?: string;
  category_id: string;
  description?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  operating_hours?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ShopsResponse {
  Shops: Shop[];
}

const GET_SHOPS = gql`
  query GetShops {
    Shops {
      id
      name
      description
      category_id
      image
      logo
      address
      latitude
      longitude
      operating_hours
      created_at
      updated_at
      is_active
    }
  }
`;

export default function ShopList({
  category,
  onSelectShop,
}: {
  category: string;
  onSelectShop: (shop: Shop) => void;
}) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        const data = await hasuraClient.request<ShopsResponse>(GET_SHOPS);
        console.log("Fetched shops data:", data.Shops);
        setShops(data.Shops || []);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Filter shops by category if category is specified
  const filteredShops =
    category && category !== "all"
      ? shops.filter((shop) => shop.category_id === category)
      : shops;

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-green-500 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading shops...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="py-12 text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h3 className="mb-4 text-xl font-semibold text-gray-700">
        {category && category !== "all"
          ? `Select a shop in ${category} to start shopping`
          : "Select a shop to start shopping"}
      </h3>

      {filteredShops.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          {category && category !== "all"
            ? `No shops found in ${category} category.`
            : "No shops available at the moment."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop)}
              className="flex cursor-pointer flex-col items-center rounded-xl border bg-white p-4 text-center shadow-md transition hover:border-green-500 hover:shadow-lg"
            >
              <div className="relative mb-4 h-24 w-full">
                <img
                  src={shop.image || "/images/shop-placeholder.jpg"}
                  alt={shop.name}
                  className="h-full w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/shop-placeholder.jpg";
                  }}
                />
                {shop.logo && shop.logo.trim() !== "" && (
                  <div className="absolute -bottom-2 -right-2 h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
                    <img
                      src={shop.logo}
                      alt={`${shop.name} logo`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error(
                          `Failed to load logo for shop ${shop.name}:`,
                          shop.logo
                        );
                        e.currentTarget.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(
                          `Successfully loaded logo for shop ${shop.name}`
                        );
                      }}
                    />
                  </div>
                )}
              </div>
              <h4 className="text-lg font-medium text-gray-800">{shop.name}</h4>
              <p className="text-sm text-gray-500">{shop.description}</p>
              {shop.address && (
                <p className="mt-1 text-xs text-gray-400">{shop.address}</p>
              )}
              <p className="mt-2 text-sm font-semibold text-green-500">
                Start Shopping →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
