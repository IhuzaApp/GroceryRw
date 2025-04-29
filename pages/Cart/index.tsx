import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { GraphQLClient, gql } from "graphql-request";
import Link from "next/link";
import RootLayout from "@components/ui/layout";
import ItemCartTable, { CartItemType } from "@components/UserCarts/cartsTable";

interface CartPageProps {
  items: CartItemType[];
  count: number;
  total: string;
  shopName: string;
}

const CartPage: React.FC<CartPageProps> = ({ items, count, total, shopName }) => (
  <RootLayout>
    <div className="p-4 md:ml-16">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-gray-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mr-2 h-5 w-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <span className="ml-2 text-gray-500">{count} items</span>
          <span className="ml-4 px-2 py-1 text-sm bg-gray-200 rounded">{shopName}</span>
        </div>
        <ItemCartTable initialItems={items} />
        <div className="mt-6 text-right text-xl font-bold">Total: ${total}</div>
      </div>
    </div>
  </RootLayout>
);

export default CartPage;

export const getServerSideProps: GetServerSideProps<CartPageProps> = async ({ req, res }) => {
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session?.user?.id) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } };
  }
  const user_id = session.user.id;
  const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
  const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
  const client = new GraphQLClient(HASURA_URL, { headers: { 'x-hasura-admin-secret': HASURA_SECRET } });

  // 1. Get active cart and its items
  const GET_CART = gql`
    query GetActiveCart($user_id: uuid!) {
      Carts(
        where: { user_id: { _eq: $user_id }, is_active: { _eq: true } }
        limit: 1
      ) {
        id
        shop_id
        Cart_Items {
          id
          product_id
          price
          quantity
        }
      }
    }
  `;
  const cartRes = await client.request<{ Carts: Array<{ id: string; shop_id: string; Cart_Items: Array<{ id: string; product_id: string; price: string; quantity: number }> }> }>(GET_CART, { user_id });
  const cart = cartRes.Carts[0];
  if (!cart) {
    return { props: { items: [], count: 0, total: '0', shopName: '' } };
  }

  // 2. Fetch shop name
  const GET_SHOP = gql`
    query GetShopName($id: uuid!) {
      Shops_by_pk(id: $id) {
        name
      }
    }
  `;
  const shopRes = await client.request<{ Shops_by_pk?: { name: string } }>(GET_SHOP, { id: cart.shop_id });
  const shopName = shopRes.Shops_by_pk?.name || '';

  // 3. Fetch product details
  const productIds: string[] = cart.Cart_Items.map(ci => ci.product_id);
  let items: CartItemType[] = [];
  if (productIds.length) {
    const GET_PRODUCTS = gql`
      query GetProducts($ids: [uuid!]!) {
        Products(where: { id: { _in: $ids } }) {
          id
          name
          image
          measurement_unit
        }
      }
    `;
    const prodRes = await client.request<{ Products: Array<{ id: string; name: string; image: string | null; measurement_unit: string | null }> }>(GET_PRODUCTS, { ids: productIds });
    const prodMap = new Map(prodRes.Products.map(p => [p.id, p]));
    items = cart.Cart_Items.map(ci => ({
      id: ci.id,
      checked: false,
      image: prodMap.get(ci.product_id)?.image || '/placeholder.svg',
      name: prodMap.get(ci.product_id)?.name || '',
      size: prodMap.get(ci.product_id)?.measurement_unit || '',
      price: parseFloat(ci.price),
      quantity: ci.quantity,
    }));
  }

  // 4. Compute count and total
  const count = items.reduce((sum: number, it: CartItemType) => sum + it.quantity, 0);
  const totalValue = items.reduce((sum: number, it: CartItemType) => sum + it.price * it.quantity, 0).toFixed(2);

  return { props: { items, count, total: totalValue, shopName } };
};
