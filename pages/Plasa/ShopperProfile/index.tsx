import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import Link from "next/link";
import ShopperProfileComponent from "@components/shopper/profile/ShopperProfileComponent";
import { AuthGuard } from "../../../src/components/AuthGuard";

function ShopperProfilePage() {
  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
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
    </AuthGuard>
  );
}

export default ShopperProfilePage;
