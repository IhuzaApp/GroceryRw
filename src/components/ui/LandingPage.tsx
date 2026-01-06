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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span
                className={`text-2xl font-bold transition-colors ${
                  isScrolled ? "text-[#00D9A5]" : "text-white"
                }`}
              >
                Plas
              </span>
              <span
                className={`text-2xl font-bold transition-colors ${
                  isScrolled ? "text-[#00D9A5]" : "text-white"
                }`}
              >
                ?
              </span>
            </div>

            {/* Address Input - Only shown when scrolled */}
            {isScrolled && (
              <div className="flex-1 max-w-xl mx-4 hidden md:flex">
                <form onSubmit={handleAddressSubmit} className="w-full">
                  <div className="relative rounded-2xl bg-white shadow-sm border-2 border-[#00D9A5]">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="What's your address?"
                      className="w-full rounded-2xl border-0 bg-transparent pl-10 pr-36 py-2 text-sm text-gray-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-[#A8E6CF] px-3 py-1.5 text-xs font-bold text-[#00A67E] transition-colors hover:bg-[#90D9B8] whitespace-nowrap"
                    >
                      Use current location
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={() => router.push("/Auth/Login")}
              className="flex items-center gap-2 rounded-full bg-[#00D9A5] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#00C896] flex-shrink-0"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top Green Section */}
      <div className="relative bg-[#00D9A5] pb-20 md:pb-32 pt-20 md:pt-24">
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

        {/* Main Content */}
        <div className="container mx-auto px-4">
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
              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Food delivery and more
              </h1>
              <p className="mb-8 text-lg text-white md:text-xl">
                Groceries, shops, pharmacies, anything!
              </p>

              {/* Address Input - Button Inside */}
              <form onSubmit={handleAddressSubmit} className="w-full max-w-2xl">
                <div className="relative rounded-2xl bg-white shadow-lg">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="What's your address?"
                    className="w-full rounded-2xl border-0 bg-transparent pl-12 pr-40 py-4 text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[#A8E6CF] px-4 py-2.5 text-sm font-bold text-[#00A67E] transition-colors hover:bg-[#90D9B8] whitespace-nowrap"
                  >
                    Use current location
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom White Section - Brand Logos */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-black md:text-4xl">
            Top restaurants and more in Plas
          </h2>

          {/* Brand Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* PizzaHut */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl">🍕</div>
                </div>
              </div>
              <div className="rounded-lg bg-[#00D9A5] px-4 py-2">
                <span className="text-sm font-bold text-black md:text-base">PizzaHut</span>
              </div>
            </div>

            {/* Papa John's */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl">🍕</div>
                </div>
              </div>
              <div className="rounded-lg bg-[#00D9A5] px-4 py-2">
                <span className="text-sm font-bold text-black md:text-base">Papa John&apos;s</span>
              </div>
            </div>

            {/* Subway */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl">🥪</div>
                </div>
              </div>
              <div className="rounded-lg bg-[#00D9A5] px-4 py-2">
                <span className="text-sm font-bold text-black md:text-base">Subway</span>
              </div>
            </div>

            {/* TacoBell */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 md:h-32 md:w-32">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl">🌮</div>
                </div>
              </div>
              <div className="rounded-lg bg-[#00D9A5] px-4 py-2">
                <span className="text-sm font-bold text-black md:text-base">TacoBell</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Anything delivered" Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-5xl font-bold text-black md:text-6xl lg:text-7xl">
            Anything delivered
          </h2>
        </div>
      </div>

      {/* Service Offerings Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {/* Your city's top restaurants */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#00D9A5]">
                <svg
                  className="h-20 w-20 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-black">
                Your city&apos;s top restaurants
              </h3>
              <p className="text-gray-700">
                With a great variety of restaurants you can order your favourite food or{" "}
                <span className="bg-[#00D9A5] font-bold">explore new restaurants nearby!</span>
              </p>
            </div>

            {/* Fast delivery */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#00D9A5]">
                <svg
                  className="h-20 w-20 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-black">Fast delivery</h3>
              <p className="text-gray-700">
                Like a flash! Order or send anything in your city and{" "}
                <span className="bg-[#00D9A5] font-bold">receive it in minutes</span>
              </p>
            </div>

            {/* Groceries delivery & more */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#00D9A5]">
                <svg
                  className="h-20 w-20 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-black">Groceries delivery & more</h3>
              <p className="text-gray-700">
                Find anything you need! From{" "}
                <span className="bg-[#00D9A5] font-bold">
                  supermarkets to shops, pharmacies to florists
                </span>{" "}
                — if it&apos;s in your city order it and receive it.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-[#00D9A5] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#00C896]"
            >
              Explore stores around you
            </button>
          </div>
        </div>
      </div>

      {/* Cities we deliver in Section */}
      <div className="relative bg-[#00D9A5] py-20 md:py-24">
        {/* Wave separator at top */}
        <div className="absolute top-0 left-0 right-0 -translate-y-px">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 55C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {/* Globe Illustration */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white md:mb-8 md:h-28 md:w-28">
              <svg
                className="h-14 w-14 text-black md:h-16 md:w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-8 text-3xl font-bold text-black md:mb-10 md:text-4xl lg:text-5xl">
              Cities we deliver in
            </h2>

            {/* Cities List */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[
                "Kigali",
                "Butare",
                "Gitarama",
                "Ruhengeri",
                "Gisenyi",
                "Byumba",
                "Cyangugu",
                "Kibungo",
                "Kibuye",
                "Rwamagana",
                "Nyagatare",
                "Musanze",
                "Huye",
                "Muhanga",
                "Rubavu",
                "Karongi",
                "Nyamagabe",
                "Nyanza",
                "Ngoma",
                "Kayonza",
                "Rulindo",
                "Gatsibo",
                "Nyabihu",
                "Ngororero",
                "Nyamasheke",
                "Rusizi",
                "Burera",
                "Gicumbi",
                "Kamonyi",
                "Nyarugenge",
                "Gasabo",
                "Kicukiro",
              ].map((city) => (
                <div
                  key={city}
                  className="rounded-xl bg-white px-4 py-1.5 text-xs font-medium text-black shadow-sm transition-transform hover:scale-105 md:px-5 md:py-2 md:text-sm"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator at bottom */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-px">
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
      </div>
    </div>
    </>
  );
}

