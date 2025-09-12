import React from "react";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ShopperRegistrationForm from "@components/shopper/ShopperRegistrationForm";

export default function BecomeShopperPage() {
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Become a Plasa</h1>
            <p className="text-gray-600">
              Fill out the form below to apply as a delivery partner
            </p>
          </div>

          {/* Registration Form */}
          <ShopperRegistrationForm />
        </div>
      </div>
    </RootLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('[SERVER-SIDE AUTH DISABLED] Skipping authentication check for Myprofile/become-shopper');
  return { props: {} };
  
  // Original authentication code (disabled for testing)
  // const session = await getServerSession(
  //   context.req,
  //   context.res,
  //   authOptions as any
  // );
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: "/Auth/Login?callbackUrl=/Myprofile/become-shopper",
  //       permanent: false,
  //     },
  //   };
  // }
  // return { props: {} };
};
