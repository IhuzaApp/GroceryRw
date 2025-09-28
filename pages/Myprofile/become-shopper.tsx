import React from "react";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ShopperRegistrationForm from "@components/shopper/ShopperRegistrationForm";
import { useTheme } from "../../src/context/ThemeContext";

export default function BecomeShopperPage() {
  const { theme } = useTheme();

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-4 md:ml-16">
          <div className="container mx-auto max-w6xl">
          {/* Page Header */}
            <div className="mb-8 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                    theme === "dark"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-green-100 text-green-600"
              }`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className={`text-4xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Become a Plasa
              </h1>
              <p className={`text-lg max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}>
                Join our community of delivery partners and start earning money by delivering orders to customers in your area.
              </p>
            </div>

            {/* Benefits Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl border ${
                theme === "dark" 
                  ? "border-gray-700 bg-gray-800/50" 
                  : "border-gray-200 bg-white shadow-sm"
              }`}>
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                  theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                }`}>
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Earn Money
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Get paid for each delivery you complete. The more you deliver, the more you earn.
                </p>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === "dark" 
                  ? "border-gray-700 bg-gray-800/50" 
                  : "border-gray-200 bg-white shadow-sm"
              }`}>
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                      theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                    }`}>
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Flexible Schedule
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Work when you want. Choose your own hours and accept deliveries that fit your schedule.
                </p>
              </div>

              <div className={`p-6 rounded-xl border ${
                theme === "dark" 
                  ? "border-gray-700 bg-gray-800/50" 
                  : "border-gray-200 bg-white shadow-sm"
              }`}>
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                  theme === "dark" ? "bg-purple-600/20" : "bg-purple-100"
                }`}>
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Easy Application
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Simple step-by-step application process. Get approved quickly and start delivering.
                </p>
              </div>
          </div>

          {/* Registration Form */}
            <div className={`rounded-2xl border ${
              theme === "dark" 
                ? "border-gray-700 bg-gray-800/50" 
                : "border-gray-200 bg-white shadow-lg"
            }`}>
          <ShopperRegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
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
