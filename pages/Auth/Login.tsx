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
      <div className="flex min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
        {/* Left Side - Login Form */}
        <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-16">
          <div className="w-full max-w-md">
            {/* Logo */}
            <ThemeAwareLogo />

            {/* Heading */}
            <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
            <p className="mb-8 text-gray-500">
              Please enter your login details below
            </p>

            <UserLogin />

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/Auth/Register"
                  className="font-medium text-green-600 hover:text-green-800"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden bg-gray-100 lg:block lg:w-1/2">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
          <div className="absolute bottom-8 left-8 max-w-md rounded-lg bg-white bg-opacity-90 p-6 dark:bg-gray-800 dark:bg-opacity-90">
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              Fresh groceries delivered to your door
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Shop from a wide selection of fresh produce, pantry essentials,
              and household items with fast delivery.
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
