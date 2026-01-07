"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import LandingPageHeader from "./landing/LandingPageHeader";
import HeroSection from "./landing/HeroSection";
import HeroSectionSkeleton from "./landing/HeroSectionSkeleton";
import CategoriesSection from "./landing/CategoriesSection";
import CategoriesSectionSkeleton from "./landing/CategoriesSectionSkeleton";

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [address, setAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [stickyAutocomplete, setStickyAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const stickyAddressInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; description: string; image: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [displayAddress, setDisplayAddress] = useState("");

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/queries/categories");
      const data = await response.json();
      if (data.categories) {
        // Filter only active categories
        const activeCategories = data.categories.filter(
          (cat: any) => cat.is_active
        );
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

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

  // Load address from cookies on mount and fetch categories if address exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for address in cookies
      const cookies = document.cookie.split(";");
      const tempAddress = cookies.find((c) =>
        c.trim().startsWith("temp_address=")
      );
      if (tempAddress) {
        const addressValue = tempAddress.split("=")[1];
        if (addressValue && addressValue !== "undefined") {
          setAddress(decodeURIComponent(addressValue));
          const shortAddress =
            decodeURIComponent(addressValue).split(",")[0] ||
            decodeURIComponent(addressValue);
          setDisplayAddress(shortAddress);
          fetchCategories();
        }
      }
    }
  }, []);

  // Initialize Google Places Autocomplete for main input
  useEffect(() => {
    const initializeAutocomplete = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        addressInputRef.current
      ) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "rw" }, // Restrict to Rwanda
          }
        );

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
            // Extract short address for display (street name or first part)
            const shortAddress =
              place.formatted_address.split(",")[0] || place.formatted_address;
            setDisplayAddress(shortAddress);
            // Store address in cookie
            document.cookie = `temp_address=${encodeURIComponent(
              place.formatted_address
            )}; path=/`;
            // Store coordinates if available
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              document.cookie = `user_latitude=${lat}; path=/`;
              document.cookie = `user_longitude=${lng}; path=/`;
            }
            // Fetch categories after location is set
            fetchCategories();
          }
        });

        setAutocomplete(autocompleteInstance);
      }
    };

    // Load Google Maps API if not already loaded
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_MAP_API
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      if (autocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  // Initialize Google Places Autocomplete for sticky header input
  useEffect(() => {
    const initializeStickyAutocomplete = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        stickyAddressInputRef.current
      ) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(
          stickyAddressInputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "rw" },
          }
        );

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
            // Extract short address for display
            const shortAddress =
              place.formatted_address.split(",")[0] || place.formatted_address;
            setDisplayAddress(shortAddress);
            // Store address in cookie
            document.cookie = `temp_address=${encodeURIComponent(
              place.formatted_address
            )}; path=/`;
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              document.cookie = `user_latitude=${lat}; path=/`;
              document.cookie = `user_longitude=${lng}; path=/`;
            }
            // Fetch categories after location is set
            fetchCategories();
          }
        });

        setStickyAutocomplete(autocompleteInstance);
      }
    };

    if (typeof window !== "undefined" && window.google) {
      initializeStickyAutocomplete();
    }

    return () => {
      if (stickyAutocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(stickyAutocomplete);
      }
    };
  }, [isScrolled]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Store location in cookies
          document.cookie = `user_latitude=${lat}; path=/`;
          document.cookie = `user_longitude=${lng}; path=/`;

          // Reverse geocode to get address
          if (typeof window !== "undefined" && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
              (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
              ) => {
                if (status === "OK" && results && results[0]) {
                  const formattedAddress = results[0].formatted_address;
                  setAddress(formattedAddress);
                  const shortAddress =
                    formattedAddress.split(",")[0] || formattedAddress;
                  setDisplayAddress(shortAddress);
                  // Store address in cookie
                  document.cookie = `temp_address=${encodeURIComponent(
                    formattedAddress
                  )}; path=/`;
                  // Fetch categories after location is set
                  fetchCategories();
                  // Small delay before redirect to show the address
                  setTimeout(() => {
                    router.push("/");
                  }, 500);
                } else {
                  setAddress("Current Location");
                  setDisplayAddress("Current Location");
                  document.cookie = `temp_address=Current Location; path=/`;
                  router.push("/");
                }
              }
            );
          } else {
            setAddress("Current Location");
            router.push("/");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please enter your address manually."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleAddressSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * {
          font-family: 'Nunito', sans-serif;
        }
        h1, h2, h3, h4, h5, h6, .font-cartoon {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes fadeInZoom {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.15));
          }
          50% {
            filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.2));
          }
        }
        /* Google Places Autocomplete Dropdown Styling */
        .pac-container {
          background-color: white !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1) !important;
          border: 2px solid #00D9A5 !important;
          margin-top: 8px !important;
          padding: 8px 0 !important;
          font-family: 'Nunito', sans-serif !important;
          overflow: hidden !important;
        }
        .pac-item {
          padding: 12px 16px !important;
          cursor: pointer !important;
          border: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
          transition: all 0.2s ease !important;
          font-size: 14px !important;
          color: #333 !important;
        }
        .pac-item:last-child {
          border-bottom: none !important;
        }
        .pac-item:hover {
          background-color: #f0fdf4 !important;
          padding-left: 20px !important;
        }
        .pac-item-selected {
          background-color: #A8E6CF !important;
          color: #00A67E !important;
          font-weight: 600 !important;
        }
        .pac-item-selected:hover {
          background-color: #90D9B8 !important;
        }
        .pac-icon {
          margin-right: 12px !important;
          width: 20px !important;
          height: 20px !important;
        }
        .pac-matched {
          font-weight: 600 !important;
          color: #00D9A5 !important;
        }
        .pac-item-query {
          color: #333 !important;
          font-size: 14px !important;
        }
        .pac-item-query .pac-matched {
          color: #00D9A5 !important;
          font-weight: 700 !important;
        }
      `,
        }}
      />
      <div className="min-h-screen bg-white">
        {/* Sticky Header */}
        <LandingPageHeader
          isScrolled={isScrolled}
          address={address}
          displayAddress={displayAddress}
          addressInputRef={addressInputRef}
          stickyAddressInputRef={stickyAddressInputRef}
          onAddressChange={setAddress}
          onAddressSubmit={handleAddressSubmit}
          onUseCurrentLocation={handleUseCurrentLocation}
          isMobile={isMobile}
        />

        {/* Top Green Section */}
        <div className="relative bg-[#00D9A5] pb-20 pt-20 md:pb-32 md:pt-24">
          {/* Wave separator */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ transform: "translateY(1px)" }}
          >
            <svg
              viewBox="0 0 1440 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
              style={{ display: "block" }}
            >
              <path
                d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90L1440 121L0 121Z"
                fill="white"
                stroke="none"
              />
            </svg>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4">
            {loadingCategories && displayAddress ? (
              /* Loading Skeleton for Categories */
              <CategoriesSectionSkeleton />
            ) : displayAddress && categories.length > 0 ? (
              /* Categories Grid - Replace hero content when location is selected */
              <CategoriesSection categories={categories} loading={false} />
            ) : loadingCategories ? (
              /* Loading Skeleton for Hero */
              <HeroSectionSkeleton />
            ) : (
              /* Hero Content - Show when no location is selected */
              <HeroSection
                address={address}
                addressInputRef={addressInputRef}
                onAddressChange={setAddress}
                onAddressSubmit={handleAddressSubmit}
                onUseCurrentLocation={handleUseCurrentLocation}
              />
            )}
          </div>
        </div>

        {/* Bottom White Section - Brand Logos */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-black md:text-4xl">
              Top shops and more in Plas
            </h2>

            {/* Brand Logos - 2 rows of 4 */}
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {/* McDonald's */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="McDonald's"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      McDonald&apos;s
                    </span>
                  </div>
                </div>
              </div>

              {/* KFC */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="KFC"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      KFC
                    </span>
                  </div>
                </div>
              </div>

              {/* Burger King */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="Burger King"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      BurgerKing
                    </span>
                  </div>
                </div>
              </div>

              {/* Carrefour */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="Carrefour"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      Carrefour
                    </span>
                  </div>
                </div>
              </div>

              {/* PizzaHut */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="PizzaHut"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      PizzaHut
                    </span>
                  </div>
                </div>
              </div>

              {/* Papa John's */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="Papa John's"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      Papa John&apos;s
                    </span>
                  </div>
                </div>
              </div>

              {/* Subway */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="Subway"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      Subway
                    </span>
                  </div>
                </div>
              </div>

              {/* TacoBell */}
              <div className="flex flex-col items-center">
                <div
                  className="relative mb-0 flex h-28 w-24 items-center justify-center overflow-visible bg-white shadow-lg transition-transform hover:scale-110 md:h-36 md:w-32"
                  style={{ borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%" }}
                >
                  <Image
                    src="https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=700,636"
                    alt="TacoBell"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "45% 45% 60% 45% / 40% 40% 70% 50%",
                    }}
                  />
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
                    style={{
                      clipPath:
                        "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
                      backgroundColor: "#00D9A5",
                      padding: "4px 12px 4px 8px",
                    }}
                  >
                    <span className="text-[10px] font-bold text-white md:text-xs">
                      TacoBell
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* "Anything delivered" Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold text-black md:text-4xl lg:text-5xl">
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
                <div
                  className="relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    clipPath: "ellipse(45% 55% at 50% 50%)",
                  }}
                >
                  {/* Watercolor splattered background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                    radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.5) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.4) 0%, transparent 60%),
                    radial-gradient(circle at 10% 80%, rgba(139, 92, 246, 0.5) 0%, transparent 45%),
                    radial-gradient(circle at 90% 20%, rgba(167, 139, 250, 0.4) 0%, transparent 55%),
                    radial-gradient(circle at 60% 10%, rgba(196, 181, 253, 0.3) 0%, transparent 50%)
                  `,
                      filter: "blur(8px)",
                      transform: "scale(1.2)",
                    }}
                  ></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                    radial-gradient(ellipse at 30% 40%, rgba(147, 51, 234, 0.4) 0%, transparent 40%),
                    radial-gradient(ellipse at 70% 60%, rgba(168, 85, 247, 0.3) 0%, transparent 45%)
                  `,
                      filter: "blur(4px)",
                    }}
                  ></div>
                  <Image
                    src="/images/mainPageIcons/restaurant.png"
                    alt="Restaurant"
                    width={80}
                    height={80}
                    className="relative z-10 h-20 w-20 object-contain"
                  />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-black">
                  Your city&apos;s top restaurants, supermarkets, stores & more
                </h3>
                <p className="text-gray-700">
                  With a great variety of restaurants, supermarkets, stores, and
                  more you can order your favourite food or{" "}
                  <span className="relative inline-block font-bold">
                    <span
                      className="absolute inset-0 -rotate-1 rounded-sm bg-[#00D9A5] opacity-60"
                      style={{
                        transform: "skew(-2deg, 1deg)",
                        filter: "blur(2px)",
                      }}
                    ></span>
                    <span
                      className="absolute inset-0 rotate-1 rounded-sm bg-[#A8E6CF] opacity-40"
                      style={{
                        transform: "skew(1deg, -1deg)",
                        filter: "blur(1px)",
                      }}
                    ></span>
                    <span className="relative">explore new places nearby!</span>
                  </span>
                </p>
              </div>

              {/* Fast delivery */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    clipPath: "ellipse(45% 55% at 50% 50%)",
                  }}
                >
                  {/* Watercolor splattered background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                      radial-gradient(circle at 25% 35%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
                      radial-gradient(circle at 75% 65%, rgba(168, 85, 247, 0.5) 0%, transparent 50%),
                      radial-gradient(circle at 45% 55%, rgba(192, 132, 252, 0.4) 0%, transparent 60%),
                      radial-gradient(circle at 15% 75%, rgba(139, 92, 246, 0.5) 0%, transparent 45%),
                      radial-gradient(circle at 85% 25%, rgba(167, 139, 250, 0.4) 0%, transparent 55%),
                      radial-gradient(circle at 55% 15%, rgba(196, 181, 253, 0.3) 0%, transparent 50%)
                    `,
                      filter: "blur(8px)",
                      transform: "scale(1.2)",
                    }}
                  ></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                      radial-gradient(ellipse at 35% 45%, rgba(147, 51, 234, 0.4) 0%, transparent 40%),
                      radial-gradient(ellipse at 65% 55%, rgba(168, 85, 247, 0.3) 0%, transparent 45%)
                    `,
                      filter: "blur(4px)",
                    }}
                  ></div>
                  <Image
                    src="/images/mainPageIcons/fast-shipping.png"
                    alt="Fast Delivery"
                    width={80}
                    height={80}
                    className="relative z-10 h-20 w-20 object-contain"
                  />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-black">
                  Fast delivery
                </h3>
                <p className="text-gray-700">
                  Like a flash! Order or send anything in your city and{" "}
                  <span className="relative inline-block font-bold">
                    <span
                      className="absolute inset-0 -rotate-1 rounded-sm bg-[#00D9A5] opacity-60"
                      style={{
                        transform: "skew(-2deg, 1deg)",
                        filter: "blur(2px)",
                      }}
                    ></span>
                    <span
                      className="absolute inset-0 rotate-1 rounded-sm bg-[#A8E6CF] opacity-40"
                      style={{
                        transform: "skew(1deg, -1deg)",
                        filter: "blur(1px)",
                      }}
                    ></span>
                    <span className="relative">receive it in minutes</span>
                  </span>
                </p>
              </div>

              {/* Groceries delivery & more */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    clipPath: "ellipse(45% 55% at 50% 50%)",
                  }}
                >
                  {/* Watercolor splattered background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                    radial-gradient(circle at 22% 32%, rgba(147, 51, 234, 0.6) 0%, transparent 50%),
                    radial-gradient(circle at 78% 68%, rgba(168, 85, 247, 0.5) 0%, transparent 50%),
                    radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.4) 0%, transparent 60%),
                    radial-gradient(circle at 12% 78%, rgba(139, 92, 246, 0.5) 0%, transparent 45%),
                    radial-gradient(circle at 88% 22%, rgba(167, 139, 250, 0.4) 0%, transparent 55%),
                    radial-gradient(circle at 58% 12%, rgba(196, 181, 253, 0.3) 0%, transparent 50%)
                  `,
                      filter: "blur(8px)",
                      transform: "scale(1.2)",
                    }}
                  ></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      background: `
                    radial-gradient(ellipse at 32% 42%, rgba(147, 51, 234, 0.4) 0%, transparent 40%),
                    radial-gradient(ellipse at 68% 58%, rgba(168, 85, 247, 0.3) 0%, transparent 45%)
                  `,
                      filter: "blur(4px)",
                    }}
                  ></div>
                  <Image
                    src="/images/mainPageIcons/groceries.png"
                    alt="Groceries"
                    width={80}
                    height={80}
                    className="relative z-10 h-20 w-20 object-contain"
                  />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-black">
                  Groceries delivery & more
                </h3>
                <p className="text-gray-700">
                  Find anything you need! From{" "}
                  <span className="relative inline-block font-bold">
                    <span
                      className="absolute inset-0 -rotate-1 rounded-sm bg-[#00D9A5] opacity-60"
                      style={{
                        transform: "skew(-2deg, 1deg)",
                        filter: "blur(2px)",
                      }}
                    ></span>
                    <span
                      className="absolute inset-0 rotate-1 rounded-sm bg-[#A8E6CF] opacity-40"
                      style={{
                        transform: "skew(1deg, -1deg)",
                        filter: "blur(1px)",
                      }}
                    ></span>
                    <span className="relative">
                      supermarkets to shops, pharmacies to florists
                    </span>
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
          <div className="absolute left-0 right-0 top-0 -translate-y-px">
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
              <h2 className="mb-8 text-3xl font-bold text-white md:mb-10 md:text-4xl lg:text-5xl">
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

        {/* Let's do it together Section */}
        <div className="bg-[#E8F5E9] py-16">
          <div className="container mx-auto px-4">
            {/* Header with Icon */}
            <div className="mb-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A67E]">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.5 2.5c-1.5 0-2.8.6-3.8 1.6l-1.2 1.2c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l1.2-1.2c.6-.6 1.4-.9 2.2-.9.8 0 1.6.3 2.2.9.6.6.9 1.4.9 2.2 0 .8-.3 1.6-.9 2.2l-1.2 1.2c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l1.2-1.2c1-1 1.6-2.3 1.6-3.8 0-1.5-.6-2.8-1.6-3.8-1-1-2.3-1.6-3.8-1.6zm-17 0c-1.5 0-2.8.6-3.8 1.6-1 1-1.6 2.3-1.6 3.8 0 1.5.6 2.8 1.6 3.8l1.2 1.2c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-1.2-1.2c-.6-.6-1.4-.9-2.2-.9-.8 0-1.6.3-2.2.9-.6.6-.9 1.4-.9 2.2 0 .8.3 1.6.9 2.2l1.2 1.2c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-1.2-1.2c-1-1-1.6-2.3-1.6-3.8 0-1.5.6-2.8 1.6-3.8 1-1 2.3-1.6 3.8-1.6zm16.5 5.5c-.6 0-1 .4-1 1v2h-2v-2c0-.6-.4-1-1-1s-1 .4-1 1v2h-2v-2c0-.6-.4-1-1-1s-1 .4-1 1v6c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-6c0-.6-.4-1-1-1z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] md:text-4xl">
                Let&apos;s do it together
              </h2>
            </div>

            {/* Three Columns */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Become a Partner */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden bg-white shadow-lg"
                  style={{
                    borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    clipPath: "ellipse(55% 45% at 50% 50%)",
                  }}
                >
                  <Image
                    src="/assets/images/becomePatern.jpg"
                    alt="Become a Partner"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    }}
                  />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#1A1A1A]">
                  Become a partner
                </h3>
                <p className="mb-6 text-gray-700">
                  Grow with Plas! Our technology and user base can help you
                  boost sales and unlock new opportunities!
                </p>
                <button
                  onClick={() => router.push("/plasBusiness")}
                  className="rounded-lg bg-[#00A67E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#008B6B]"
                >
                  Register here
                </button>
              </div>

              {/* Careers */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="relative mb-6 flex h-48 w-48 items-center justify-center overflow-hidden bg-white shadow-lg"
                  style={{
                    borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    clipPath: "ellipse(55% 45% at 50% 50%)",
                  }}
                >
                  <Image
                    src="/assets/images/carreer.jpg"
                    alt="Careers"
                    fill
                    className="object-cover"
                    style={{
                      borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                    }}
                  />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#1A1A1A]">
                  Careers
                </h3>
                <p className="mb-6 text-gray-700">
                  Ready for an exciting new challenge? If you&apos;re ambitious,
                  humble, and love working with others, then we want to hear
                  from you!
                </p>
                <button
                  onClick={() => router.push("/careers")}
                  className="rounded-lg bg-[#00A67E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#008B6B]"
                >
                  Register here
                </button>
              </div>

              {/* Get POS System */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                    <svg
                      className="h-24 w-24 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#1A1A1A]">
                  Get POS System
                </h3>
                <p className="mb-6 text-gray-700">
                  Streamline your business operations with our advanced Point of
                  Sale system. Manage sales, inventory, and customers all in one
                  place!
                </p>
                <button
                  onClick={() => router.push("/pos")}
                  className="rounded-lg bg-[#00A67E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#008B6B]"
                >
                  Register here
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-[#1A1A1A] text-white">
          {/* Curved white line at top */}
          <div className="absolute left-0 right-0 top-0 -translate-y-px">
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

          <div className="container mx-auto px-4 py-12 pt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {/* Left Section - Plas Branding and Partner Links */}
              <div className="space-y-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <Image
                    src="/assets/logos/PlasIcon.png"
                    alt="Plas Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <span className="text-2xl font-bold text-[#00D9A5]">
                    Plas
                  </span>
                </div>
                {/* Slogan */}
                <p className="font-bold text-white">
                  Let&apos;s do it together
                </p>
                {/* Links */}
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Plas for Partners
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Couriers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Plas Business
                    </a>
                  </li>
                </ul>
              </div>

              {/* Middle Section - Links of Interest */}
              <div className="space-y-4">
                <h3 className="font-bold text-white">Links of interest</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      About us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Contact us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Security
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Auth/Login"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Log in
                    </a>
                  </li>
                </ul>
              </div>

              {/* Right Section - App Downloads and Legal Links */}
              <div className="space-y-4 md:col-span-2 lg:col-span-1">
                {/* App Download Buttons */}
                <div className="space-y-3">
                  <button className="flex w-full items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-90 md:w-auto">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    <span className="text-sm font-medium">
                      Download on the App Store
                    </span>
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-90 md:w-auto">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L6.05,21.34L14.54,12.85L20.16,10.81M6.05,2.66L14.54,11.15L16.81,8.88L6.05,2.66Z" />
                    </svg>
                    <span className="text-sm font-medium">
                      GET IT ON Google Play
                    </span>
                  </button>
                </div>

                {/* Legal and Policy Links */}
                <ul className="mt-6 space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Cookies Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Compliance
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Configure the cookies
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      Digital Services Act
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-gray-300 transition-colors hover:text-white"
                    >
                      European Accessibility Act
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section - Language Selector */}
            <div className="mt-8 border-t border-gray-700 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative">
                  <select className="cursor-pointer appearance-none rounded-lg bg-gray-800 px-4 py-2 pr-8 text-white transition-colors hover:bg-gray-700">
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">Français</option>
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
