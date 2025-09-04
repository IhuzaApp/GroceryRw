import React from "react";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ShopperRegistrationForm from "@components/shopper/ShopperRegistrationForm";
import { signOut } from "next-auth/react";
import { Button } from "rsuite";
import toast from "react-hot-toast";

export default function BecomeShopperPage() {
  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear any custom cookies that might interfere
      document.cookie = "role_changed=; Path=/; Max-Age=0; HttpOnly";
      document.cookie = "new_role=; Path=/; Max-Age=0; HttpOnly";
      document.cookie = "return_to=; Path=/; Max-Age=0; HttpOnly";
      
      // Show a toast notification
      toast.success("Signing out...", { duration: 2000 });
      
      // Use NextAuth signOut with redirect: false to handle redirect manually
      await signOut({ redirect: false });
      
      // Manual redirect to avoid the custom signout route
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
      // Fallback: force redirect even if signOut fails
      window.location.href = "/";
    }
  };

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Become a Plasa</h1>
              <p className="text-gray-600">
                Fill out the form below to apply as a delivery partner
              </p>
            </div>
            
            {/* Sign Out Button */}
            <Button
              appearance="subtle"
              color="red"
              className="!bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/20 dark:!text-red-400 dark:hover:!bg-red-900/30"
              onClick={handleSignOut}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </Button>
          </div>

          {/* Registration Form */}
          <ShopperRegistrationForm />
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
        destination: "/Auth/Login?callbackUrl=/Myprofile/become-shopper",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
