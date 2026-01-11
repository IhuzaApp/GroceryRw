import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  clearRoleSwitchFlag,
  isRoleSwitchInProgress,
} from "../../src/lib/sessionRefresh";

import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import UserLogin from "@components/ui/Auth/userAuth/UserLogin";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

// Logo component that changes color based on theme
function ThemeAwareLogo() {
  const { theme } = useTheme();

  return (
    <div className="mb-8 flex justify-center">
      <Image
        src="/assets/logos/PlasLogo.svg"
        alt="Plas Logo"
        width={200}
        height={90}
        className={`h-20 w-auto transition-all duration-200 ${
          theme === "dark" ? "brightness-0 invert" : ""
        }`}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  // Check if we're returning from a role switch
  useEffect(() => {
    const isSwitchingRole = isRoleSwitchInProgress();
    const callbackUrl = router.query.callbackUrl as string;

    if (isSwitchingRole) {
      // Clear the role switch flag
      clearRoleSwitchFlag();

      // If we have a callback URL, redirect to it
      if (callbackUrl) {
        router.push(callbackUrl);
      }
    }
  }, [router]);

  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex h-full lg:h-screen">
          {/* Left Side - Login Form */}
          <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-16 lg:py-8">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div>
                <ThemeAwareLogo />
              </div>

              {/* Heading */}
              <div className="mb-4 text-center lg:mb-8 lg:text-left">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white lg:text-4xl">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 lg:text-base">
                  Sign in to your account to continue shopping
                </p>
              </div>

              {/* Login Form */}
              <div className="rounded-2xl bg-white/80 p-4 shadow-xl backdrop-blur-sm dark:bg-gray-800/80 lg:p-8">
                <UserLogin />
              </div>

              {/* Footer Links */}
              <div className="mt-4 text-center lg:mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/Auth/Register"
                    className="font-semibold text-green-600 transition-colors duration-200 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Image with Gradient Overlay */}
          <div className="relative hidden bg-gray-100 lg:block lg:w-1/2">
            {/* Multiple Gradient Overlays for Depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 via-green-500/50 to-blue-600/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-black/70"></div>

            {/* Background Image */}
            <Image
              src="/assets/images/shopping.jpg"
              alt="Grocery shopping"
              fill
              className="object-cover"
              quality={75}
              sizes="(max-width: 768px) 0vw, 50vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="max-w-md text-center text-white">
                <div className="mb-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg
                      className="h-10 w-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                  </div>
                  <h2 className="mb-4 text-3xl font-bold drop-shadow-lg">
                    Fresh groceries delivered to your door
                  </h2>
                  <p className="text-lg text-white/90 drop-shadow-md">
                    Shop from a wide selection of fresh produce, pantry
                    essentials, and household items with fast delivery.
                  </p>
                </div>

                {/* Feature List */}
                <div className="mx-auto grid max-w-sm grid-cols-1 gap-4 text-left">
                  <div className="flex items-center space-x-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg
                        className="h-4 w-4 text-white"
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
                    </div>
                    <span className="font-medium text-white/90">
                      Fast delivery in 30 minutes
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg
                        className="h-4 w-4 text-white"
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
                    </div>
                    <span className="font-medium text-white/90">
                      Fresh quality guaranteed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg
                        className="h-4 w-4 text-white"
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
                    </div>
                    <span className="font-medium text-white/90">
                      24/7 customer support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
