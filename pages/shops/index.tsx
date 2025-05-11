import React from "react";
import Link from "next/link";
import RootLayout from "@components/ui/layout";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

export default function ShopsList({
  shops,
}: {
  shops: { id: string; name: string }[];
}) {
  return (
    <RootLayout>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Shops</h1>
        <ul className="space-y-2">
          {shops.map((shop) => (
            <li key={shop.id}>
              <Link href={`/shops/${shop.id}`}>
                <a className="text-blue-600 hover:underline">{shop.name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </RootLayout>
  );
}

export async function getServerSideProps() {
  const SHOP_LIST_QUERY = gql`
    query GetShops {
      Shops(where: { is_active: { _eq: true } }) {
        id
        name
      }
    }
  `;

  if (!hasuraClient) {
    throw new Error("Hasura client is not initialized");
  }

  const data = await hasuraClient.request<{
    Shops: { id: string; name: string }[];
  }>(SHOP_LIST_QUERY);
  return {
    props: {
      shops: data.Shops || [],
    },
  };
}
