import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ShopperProfileComponent from "@components/shopper/profile/ShopperProfileComponent";

// Define a type for the session user with role
interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export default function ShopperProfilePage() {
  return (
    <ShopperLayout>
      <div className="container mx-auto px-4 py-4 pb-24 sm:py-8 sm:pb-8">
        {/* Profile Header */}
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-0">
          <Link
            href="/Plasa/active-batches"
            className="flex items-center text-gray-700 transition-colors hover:text-gray-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="mr-2 h-5 w-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hover:underline">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold sm:ml-4 sm:text-2xl">
            Plasa Profile
          </h1>
        </div>

        {/* Profile Content */}
        <div className="w-full overflow-x-hidden">
          <ShopperProfileComponent />
        </div>
      </div>
    </ShopperLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };

  // Original authentication code (disabled for testing)
  // const session = (await getServerSession(
  //   context.req,
  //   context.res,
  //   authOptions as any
  // )) as Session | null;
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: "/Auth/Login",
  //       permanent: false,
  //     },
  //   };
  // }
  // const userRole = session.user?.role;
  // if (userRole !== "shopper") {
  //   return {
  //     redirect: {
  //       destination: "/",
  //       permanent: false,
  //     },
  //   };
  // }
  // return { props: {} };
};
