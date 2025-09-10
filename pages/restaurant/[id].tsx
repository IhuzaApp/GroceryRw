import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  lat: string;
  long: string;
  profile: string;
  verified: boolean;
  created_at: string;
}

interface RestaurantPageProps {
  restaurant: Restaurant;
}

export default function RestaurantPage({ restaurant }: RestaurantPageProps) {
  const router = useRouter();
  const { id } = router.query;

  if (!restaurant) {
    return (
      <RootLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Restaurant not found
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The restaurant you're looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Restaurant Banner */}
          <div className="relative h-56 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-48">
            <Image
              src={restaurant.profile || "/images/shop-placeholder.jpg"}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/50 to-transparent text-center sm:items-end sm:justify-start sm:text-left">
              <div className="w-full p-4 text-white sm:p-6">
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {restaurant.name}
                </h1>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {restaurant.verified && (
                    <div className="flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      <svg
                        className="-ml-1 mr-1.5 h-4 w-4 text-blue-300"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verified</span>
                    </div>
                  )}
                  <div className="flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <svg
                      className="-ml-1 mr-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{restaurant.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 p-1 backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          {/* Restaurant Details */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Restaurant Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {restaurant.phone || "Phone not available"}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {restaurant.email || "Email not available"}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {restaurant.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Location
              </h2>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Coordinates: {restaurant.lat}, {restaurant.long}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Latitude: {restaurant.lat}</p>
                  <p>Longitude: {restaurant.long}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="mt-8 rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Menu Coming Soon
            </h3>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              We're working on bringing you the full menu and ordering
              experience for {restaurant.name}.
            </p>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const { id } = params as { id: string };

    const response = await hasuraClient.request<{ Restaurants: Restaurant[] }>(
      gql`
        query GetRestaurant($id: String!) {
          Restaurants(where: { id: { _eq: $id } }) {
            id
            name
            email
            phone
            location
            lat
            long
            profile
            verified
            created_at
          }
        }
      `,
      { id }
    );

    const restaurant = response?.Restaurants?.[0] || null;

    return {
      props: {
        restaurant,
      },
    };
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return {
      props: {
        restaurant: null,
      },
    };
  }
};
