import RootLayout from "@components/ui/layout";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import UserProfile from "@components/userProfile/useProfile";
import { AuthGuard } from "../../src/components/AuthGuard";
import { useAuth } from "../../src/hooks/useAuth";

function MyProfilePage() {
  const router = useRouter();
  const { isGuest } = useAuth();

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

            {/* Guest User Upgrade Banner */}
            {isGuest && (
              <div className="mb-6 overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 shadow-sm dark:border-orange-900/30 dark:from-orange-900/10 dark:via-yellow-900/10 dark:to-orange-900/10">
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-500">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          You're Shopping as a Guest
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Create a full account to unlock all features, save your
                          preferences, and enjoy a personalized shopping experience.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg
                              className="h-4 w-4 text-green-600 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Order tracking</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg
                              className="h-4 w-4 text-green-600 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Saved addresses</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg
                              className="h-4 w-4 text-green-600 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Exclusive offers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-3">
                      <button
                        onClick={() => router.push("/Auth/Register")}
                        className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:from-green-700 hover:to-emerald-700"
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => router.push("/Auth/Login")}
                        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Content */}
            <UserProfile />
          </div>
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default MyProfilePage;
