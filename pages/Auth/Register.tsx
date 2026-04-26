"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import UserRegistration from "@components/ui/Auth/userAuth/UserRegistration";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

// Logo component that changes color based on theme
function ThemeAwareLogo() {
  const { theme } = useTheme();

  return (
    <div className="mb-8 flex justify-center">
      <Image
        src="/assets/logos/PlasLogoPNG.png"
        alt="Plas Logo"
        width={200}
        height={90}
        className={`h-24 w-auto object-contain transition-all duration-200 ${
          theme === "dark" ? "brightness-0 invert" : ""
        }`}
        priority
      />
    </div>
  );
}

export default function RegisterPage() {
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/auth/register_bg.png"
            alt="Plas Premium Shopping Background"
            fill
            className="object-cover"
            quality={100}
            priority
          />
          {/* Gradients to ensure readability and depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black/40 to-blue-900/40"></div>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-6 lg:max-w-lg">
          {!isSuccess && (
            <div className="mb-6 text-center">
              <ThemeAwareLogo />
              <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-md lg:text-4xl">
                {isOtpSent ? "Verify your phone" : "Create an account"}
              </h1>
              <p className="text-sm font-medium text-gray-200 drop-shadow-sm lg:text-base">
                {isOtpSent
                  ? "Enter the code sent to your mobile device"
                  : "Sign up to start shopping for groceries"}
              </p>
            </div>
          )}

          <div
            className={
              !isSuccess
                ? "rounded-3xl border border-white/20 bg-white/90 p-6 text-black shadow-2xl backdrop-blur-xl dark:bg-[#111111]/90 dark:text-white sm:p-8"
                : ""
            }
          >
            <UserRegistration
              isOtpSent={isOtpSent}
              setIsOtpSent={setIsOtpSent}
              onSuccess={() => setIsSuccess(true)}
            />
          </div>

          {!isSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-gray-200 drop-shadow-sm">
                Already have an account?{" "}
                <Link
                  href="/Auth/Login"
                  className="font-bold text-green-400 transition-colors duration-200 hover:text-green-300 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
