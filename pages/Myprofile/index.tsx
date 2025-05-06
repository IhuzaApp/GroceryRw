import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import UserProfile from "@components/userProfile/useProfile";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

export default function MyProfilePage() {
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Profile Header */}
          <div className="mb-6 flex items-center">
            <Link href="/" className="flex items-center text-gray-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-2 h-5 w-5"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="hover:underline">Back</span>
            </Link>
            <h1 className="ml-4 text-2xl font-bold">My Profile</h1>
          </div>

          {/* Profile Content */}
          <UserProfile />
        </div>
      </div>
    </RootLayout>
  );
}

// Protect this page: redirect to login if not authenticated
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions as any
  );
  if (!session) {
    return {
      redirect: {
        destination: "/Auth/Login",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
