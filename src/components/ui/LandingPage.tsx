"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { MapPin, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [address, setAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Store location in cookies or state
          document.cookie = `user_latitude=${position.coords.latitude}; path=/`;
          document.cookie = `user_longitude=${position.coords.longitude}; path=/`;
          setAddress("Current Location");
          // Redirect to main page after setting location
          router.push("/");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter your address manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      // Store address and redirect
      router.push("/");
    }
  };

  // Don't show landing page if user is logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% {
            transform: translateX(-50%) translateY(0px);
          }
          50% {
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `}} />
      <div className="min-h-screen bg-white">
      {/* Top Yellow Section */}
      <div className="relative bg-[#FFC107] pb-20 md:pb-32">
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-[#00D9A5]">Plas</span>
              <span className="text-2xl font-bold text-[#00D9A5]">?</span>
            </div>

            {/* Login Button */}
            <button
              onClick={() => router.push("/Auth/Login")}
              className="flex items-center gap-2 rounded-full bg-[#00D9A5] px-6 py-2.5 text-white transition-colors hover:bg-[#00C896]"
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Login</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="mt-12 flex flex-col items-center justify-between gap-8 md:mt-20 md:flex-row md:gap-12">
            {/* Left: Burger Image */}
            <div className="flex-1">
              <div className="relative h-64 w-full md:h-96">
                {/* Deconstructed Burger - Using CSS to create floating effect */}
                <div className="relative h-full w-full">
                  {/* Bun Top */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 transform" style={{ animation: "float 3s ease-in-out infinite" }}>
                    <div className="h-16 w-32 rounded-t-full bg-amber-200 shadow-lg"></div>
                    <div className="mx-auto mt-1 flex gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="h-1 w-1 rounded-full bg-amber-400"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Patty 1 */}
                  <div className="absolute left-1/2 top-20 -translate-x-1/2 transform" style={{ animation: "float 3.2s ease-in-out infinite 0.2s" }}>
                    <div className="h-8 w-28 rounded-full bg-amber-800 shadow-lg"></div>
                  </div>
                  
                  {/* Cheese */}
                  <div className="absolute left-1/2 top-32 -translate-x-1/2 transform" style={{ animation: "float 3.1s ease-in-out infinite 0.1s" }}>
                    <div className="h-4 w-32 rounded bg-yellow-300 shadow-md"></div>
                  </div>
                  
                  {/* Patty 2 */}
                  <div className="absolute left-1/2 top-40 -translate-x-1/2 transform" style={{ animation: "float 3.3s ease-in-out infinite 0.3s" }}>
                    <div className="h-8 w-28 rounded-full bg-amber-800 shadow-lg"></div>
                  </div>
                  
                  {/* Onion */}
                  <div className="absolute left-1/2 top-52 -translate-x-1/2 transform" style={{ animation: "float 3s ease-in-out infinite 0.4s" }}>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-purple-200 bg-purple-100"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arugula */}
                  <div className="absolute left-1/2 top-60 -translate-x-1/2 transform" style={{ animation: "float 2.9s ease-in-out infinite 0.5s" }}>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3 w-8 rounded-full bg-green-400"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tomato */}
                  <div className="absolute left-1/2 top-68 -translate-x-1/2 transform" style={{ animation: "float 3.1s ease-in-out infinite 0.6s" }}>
                    <div className="h-6 w-20 rounded-full bg-red-400 shadow-md"></div>
                  </div>
                  
                  {/* Cucumber */}
                  <div className="absolute left-1/2 top-76 -translate-x-1/2 transform" style={{ animation: "float 3.2s ease-in-out infinite 0.7s" }}>
                    <div className="h-4 w-16 rounded-full bg-green-300"></div>
                  </div>
                  
                  {/* Bun Bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform" style={{ animation: "float 3s ease-in-out infinite 0.8s" }}>
                    <div className="h-12 w-32 rounded-b-full bg-amber-200 shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text and Input */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-4 text-4xl font-bold text-black md:text-5xl lg:text-6xl">
                Food delivery and more
              </h1>
              <p className="mb-8 text-lg text-black md:text-xl">
                Groceries, shops, pharmacies, anything!
              </p>

              {/* Address Input */}
              <form onSubmit={handleAddressSubmit} className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="What's your address?"
                    className="w-full rounded-lg border-0 bg-white px-12 py-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00D9A5]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="rounded-lg bg-[#00D9A5] px-6 py-4 font-medium text-white transition-colors hover:bg-[#00C896] md:whitespace-nowrap"
                >
                  Use current location
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-black md:text-4xl">
            Top restaurants and more in Plas
          </h2>

          {/* Brand Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* McDonald's */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl">🍟</div>
                  <div className="text-2xl md:text-3xl">🥤</div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 md:text-base">McDonald&apos;s</span>
            </div>

            {/* KFC */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl">🍗</div>
                  <div className="text-2xl md:text-3xl">🥤</div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 md:text-base">KFC</span>
            </div>

            {/* Burger King */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl">🍔</div>
                  <div className="text-2xl md:text-3xl">🍟</div>
                  <div className="text-2xl md:text-3xl">🥤</div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 md:text-base">Burger King</span>
            </div>

            {/* Carrefour */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="flex gap-1">
                    <span className="text-2xl md:text-3xl">🍎</span>
                    <span className="text-2xl md:text-3xl">🍊</span>
                    <span className="text-2xl md:text-3xl">🥝</span>
                  </div>
                  <div className="text-2xl md:text-3xl">☕</div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 md:text-base">Carrefour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

