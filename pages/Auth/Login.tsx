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
      <div
        className="h-screen overflow-hidden"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="flex h-full lg:h-screen">
          {/* Left Side - Login Form */}
          <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-16 lg:py-8">
            <div className="w-full max-w-md">
              {/* Logo - visible only on mobile */}
              <div className="lg:hidden">
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
              <div className="rounded-2xl bg-white/80 p-4 shadow-xl backdrop-blur-sm dark:bg-black/80 lg:p-8">
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
            {/* Multiple Gradient Overlays for Depth - Darkened for better readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 via-green-500/50 to-blue-600/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/60 to-black/80"></div>

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
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {/* Logo moved to the side for desktop */}
              <div className="mb-12">
                <Image
                  src="/assets/logos/PlasLogo.svg"
                  alt="Plas Logo"
                  width={240}
                  height={110}
                  className="h-24 w-auto brightness-0 invert"
                />
              </div>

              <div className="max-w-md text-center text-white">
                <div className="mb-8">
                  <h2 className="mb-4 text-3xl font-bold drop-shadow-2xl">
                    Experience the Future of Grocery Shopping
                  </h2>
                  <p className="text-lg font-medium text-white/95 drop-shadow-lg">
                    From fresh produce to powerful business tools, Plas brings
                    convenience to your doorstep and efficiency to your store.
                  </p>
                </div>

                {/* Feature List */}
                <div className="mx-auto grid max-w-sm grid-cols-1 gap-4 text-left">
                  <div className="flex items-center space-x-3 rounded-xl bg-white/20 p-4 shadow-lg backdrop-blur-md">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/30">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <span className="font-semibold text-white">
                      Smart Shopping & Lightning Fast Delivery
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 rounded-xl bg-white/20 p-4 shadow-lg backdrop-blur-md">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/30">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <span className="font-semibold text-white">
                      Curated Freshness & Quality Guaranteed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 rounded-xl bg-white/20 p-4 shadow-lg backdrop-blur-md">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/30">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <span className="font-semibold text-white">
                      Integrated POS & Business Management
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
