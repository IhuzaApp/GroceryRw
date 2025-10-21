import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import UserProfile from "@components/userProfile/useProfile";
import { AuthGuard } from "../../src/components/AuthGuard";

function MyProfilePage() {
  // Add page debugging - DISABLED FOR PERFORMANCE
  // const { debugInfo, logCustomEvent, logError, logSuccess } = usePageDebug({
  //   pageName: 'MyProfile',
  //   requireAuth: true,
  //   allowedRoles: ['user', 'shopper'],
  //   debugLevel: 'verbose'
  // });

  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="pb-4 pt-0 md:ml-16 md:px-4 md:pb-4 md:pt-4">
          {/* Adjust ml-* to match your sidebar width */}
          <div className="md:container md:mx-auto">
            {/* Profile Header - Hidden on mobile */}
            <div className="mb-6 hidden items-center md:flex">
              <Link
                href="/"
                className="flex items-center text-inherit transition-colors duration-200"
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
                <span className="hover:underline">Back</span>
              </Link>
              <h1 className="ml-4 text-2xl font-bold text-inherit">
                My Profile
              </h1>
            </div>

            {/* Profile Content */}
            <UserProfile />
          </div>
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default MyProfilePage;
