"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Search, User, Linkedin, Youtube, Facebook, Instagram, Globe, Briefcase, Store, Package } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 50);
    });
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
      `,
        }}
      />
      <div className="min-h-screen bg-white">
        {/* Top Bar with Social Icons */}
        <div className="bg-[#2D5016] py-2">
          <div className="container mx-auto flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-white/80 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-white/80 transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-white/80 transition-colors hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-white/80 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <span className="text-sm text-white/80">Corporate Site</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled ? "bg-white shadow-lg" : "bg-[#2D5016]"
          }`}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
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
              </div>

              {/* Navigation Links */}
              <nav className="hidden items-center gap-6 md:flex">
                <a
                  href="/about"
                  className={`border-b-2 pb-1 font-medium transition-colors ${
                    isScrolled
                      ? "border-[#00D9A5] text-[#00D9A5]"
                      : "border-[#00D9A5] text-white"
                  }`}
                >
                  About us
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Life at Plas
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Diversity & Inclusion
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Our teams
                </a>
                <a
                  href="/careers"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Careers at Plas
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Stories
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Our locations
                </a>
                <a
                  href="#"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Contact us
                </a>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  className={`hidden items-center gap-2 rounded-lg border-2 px-4 py-2 font-medium transition-colors md:flex ${
                    isScrolled
                      ? "border-gray-300 bg-white text-gray-900 hover:border-[#00D9A5]"
                      : "border-white bg-transparent text-white hover:bg-white/10"
                  }`}
                  onClick={() => router.push("/Auth/Login")}
                >
                  Sign in
                </button>
                <button
                  className={`rounded-lg p-2 transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  }`}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Upper Section - Dark Olive Green with Pattern */}
        <div className="relative bg-[#2D5016] py-24 md:py-32">
          {/* Background Pattern - Subtle line-art style icons */}
          <div className="absolute inset-0 overflow-hidden opacity-5">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
              {/* SVG Icons Pattern - Food and delivery related */}
              {Array.from({ length: 30 }).map((_, index) => {
                const iconIndex = index % 5;
                const iconComponents = [
                  // Burger
                  <svg key={`burger-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>,
                  // Shopping bag
                  <svg key={`bag-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>,
                  // Scooter
                  <svg key={`scooter-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>,
                  // Phone
                  <svg key={`phone-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>,
                  // Package
                  <svg key={`package-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>,
                ];
                return (
                  <div
                    key={`pattern-${index}`}
                    className="text-white"
                    style={{
                      transform: `rotate(${(index * 12) % 360}deg) translate(${Math.sin(index) * 20}px, ${Math.cos(index) * 20}px)`,
                    }}
                  >
                    {iconComponents[iconIndex]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Title */}
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
              About us
            </h1>
          </div>

          {/* Curved Transition to White Section */}
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

        {/* Lower Section - White with Content */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Side - Circular Video */}
              <div className="flex items-center justify-center">
                <div className="relative h-96 w-96 overflow-hidden rounded-full shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#00D9A5] to-[#00A67E]">
                    {/* Video Placeholder - You can replace this with an actual video */}
                    <div className="relative h-full w-full">
                      <Image
                        src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=800&fit=crop"
                        alt="Plas team member"
                        fill
                        className="object-cover"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <button
                          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-transform hover:scale-110"
                          aria-label="Play video"
                        >
                          <svg
                            className="ml-1 h-10 w-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Text Content */}
              <div className="flex flex-col justify-center space-y-6">
                <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
                  Plas will be the Ride of your Life!
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-gray-800">
                  <p>
                    If you&apos;re here, it&apos;s because you&apos;re looking for an{" "}
                    <span className="font-bold">exciting ride.</span>
                  </p>
                  <p>
                    A ride that will fuel up your ambitions to take on a{" "}
                    <span className="font-bold">new challenge</span> and{" "}
                    <span className="font-bold">
                      stretch yourself beyond your comfort zone.
                    </span>
                  </p>
                  <p>
                    We&apos;ll deliver a{" "}
                    <span className="font-bold">
                      non-vanilla culture built on talent, where we work to
                      amplify the impact on millions of people,
                    </span>{" "}
                    paving the way forward together.
                  </p>
                  <p>
                    So, ready to take the wheel and make this The Ride of your
                    Life?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Yellow Book Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Side - Text Content */}
              <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold text-gray-800 md:text-5xl">
                    Our Yellow Book
                  </h2>
                  <svg
                    className="h-8 w-8 text-[#00D9A5]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="text-lg leading-relaxed text-gray-700">
                  Curious about <span className="font-bold">our story</span>,{" "}
                  <span className="font-bold">our values</span>, the{" "}
                  <span className="font-bold">kind of people</span> who thrive at
                  Plas, or what <span className="font-bold">day-to-day life</span>{" "}
                  is like? This handy booklet has it all!
                </p>
                <button
                  onClick={() => {
                    // Add link to Yellow Book PDF or page
                    window.open("#", "_blank");
                  }}
                  className="self-start rounded-lg bg-[#00D9A5] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00C896]"
                >
                  Read our Yellow Book here
                </button>
              </div>

              {/* Right Side - Yellow Book Graphic */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Main Book */}
                  <div className="relative h-96 w-72 transform rotate-[-8deg] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D9A5] to-[#00A67E] rounded-lg"></div>
                    <div className="absolute inset-0 flex flex-col p-8">
                      {/* Title */}
                      <div className="mb-6">
                        <h3 className="text-4xl font-bold text-gray-800 leading-tight">
                          YELLOW BO
                          <span className="relative inline-block mx-1">
                            <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center">
                              <svg
                                className="h-4 w-4 text-gray-800"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                            </span>
                            <span className="relative z-10 opacity-0">O</span>
                          </span>
                          K
                        </h3>
                      </div>
                      {/* Colored Icons */}
                      <div className="mb-4 flex gap-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                        <div className="h-4 w-4 rounded-full bg-pink-500"></div>
                        <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                      </div>
                      {/* Welcome Text */}
                      <p className="mb-6 text-base font-medium text-white">
                        Welcome to the ride of your life!
                      </p>
                      {/* Bottom Shapes */}
                      <div className="mt-auto space-y-3">
                        <div className="h-10 rounded border-2 border-gray-800 bg-transparent"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#00D9A5]"></div>
                          <div className="h-8 flex-1 rounded border-2 border-gray-800 bg-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Second Book (Behind) */}
                  <div className="absolute -right-6 top-6 h-96 w-72 transform rotate-[8deg] opacity-50 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D9A5] to-[#00A67E] rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Statistics Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* 23 Countries */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="relative">
                    <Globe className="h-10 w-10 text-gray-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-[#00D9A5] opacity-30"></div>
                    </div>
                  </div>
                </div>
                <div className="mb-2 text-5xl font-bold text-gray-800">23</div>
                <div className="text-lg text-gray-700">Countries</div>
              </div>

              {/* 120K Active Couriers */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="relative">
                    <Package className="h-10 w-10 text-gray-800" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#00D9A5]"></div>
                  </div>
                </div>
                <div className="mb-2 text-5xl font-bold text-gray-800">120K</div>
                <div className="text-lg text-gray-700">Active Couriers</div>
              </div>

              {/* 150K Shops & Restaurants */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="relative">
                    <Store className="h-10 w-10 text-gray-800" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-4 w-8 rounded-t-full bg-[#00D9A5]"></div>
                  </div>
                </div>
                <div className="mb-2 text-5xl font-bold text-gray-800">150K</div>
                <div className="text-lg text-gray-700">Shops & Restaurants</div>
              </div>

              {/* 3K Employees */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                  <div className="relative">
                    <Briefcase className="h-10 w-10 text-gray-800" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#00D9A5]"></div>
                  </div>
                </div>
                <div className="mb-2 text-5xl font-bold text-gray-800">3K</div>
                <div className="text-lg text-gray-700">Employees</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="bg-[#282828] py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Main Heading */}
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Our core values are the north star that guide our behaviors,
                processes and mindset
              </h2>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Side - Rocket Illustration */}
              <div className="flex items-center justify-center">
                <div className="relative h-96 w-96 flex items-center justify-center">
                  {/* Circular White Background with Green Border */}
                  <div className="absolute inset-0 rounded-full bg-white border-8 border-[#00D9A5] shadow-2xl"></div>
                  
                  {/* Rocket Illustration */}
                  <div className="relative z-10 flex flex-col items-center">
                    {/* Green Starbursts around rocket */}
                    <div className="absolute -top-6 left-8">
                      <svg className="h-6 w-6 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                      </svg>
                    </div>
                    <div className="absolute top-12 -right-4">
                      <svg className="h-4 w-4 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-20 -left-2">
                      <svg className="h-5 w-5 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                      </svg>
                    </div>
                    
                    {/* Rocket Body */}
                    <div className="relative">
                      {/* Rocket Main Body */}
                      <div className="relative h-56 w-32 mx-auto">
                        {/* White Rocket Body */}
                        <div className="absolute inset-x-0 top-8 bottom-0 bg-white rounded-t-full"></div>
                        
                        {/* Orange Nose Cone */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                          <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-b-[32px] border-l-transparent border-r-transparent border-b-[#FF6B35]"></div>
                        </div>
                        
                        {/* Orange Fins */}
                        <div className="absolute bottom-0 left-0">
                          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF6B35]"></div>
                        </div>
                        <div className="absolute bottom-0 right-0">
                          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF6B35]"></div>
                        </div>
                        
                        {/* Blue Window with Green Border */}
                        <div className="absolute top-20 left-1/2 -translate-x-1/2">
                          <div className="h-14 w-14 rounded-full border-4 border-[#00D9A5] bg-blue-500 flex items-center justify-center">
                            <div className="h-7 w-7 rounded-full bg-blue-600"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Exhaust Trails */}
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                        {/* Green Cloud */}
                        <div className="relative">
                          <div className="absolute left-1/2 -translate-x-1/2 h-20 w-24 rounded-full bg-[#00D9A5] opacity-50 blur-lg"></div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-3 h-16 w-20 rounded-full bg-[#00D9A5] opacity-40 blur-lg"></div>
                        </div>
                        {/* Light Blue Cloud */}
                        <div className="relative mt-3">
                          <div className="absolute left-1/2 -translate-x-1/2 h-14 w-18 rounded-full bg-blue-300 opacity-40 blur-lg"></div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-10 w-14 rounded-full bg-blue-200 opacity-30 blur-lg"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Gas Core Value */}
              <div className="flex flex-col justify-center space-y-6">
                <h3 className="text-5xl font-bold text-white md:text-6xl">Gas</h3>
                <ul className="space-y-4 text-lg leading-relaxed text-white">
                  <li>
                    We prioritize and focus on{" "}
                    <span className="font-bold">what moves the needle.</span>
                  </li>
                  <li>
                    • We work hard and <span className="font-bold">execute fast.</span>
                  </li>
                  <li>
                    • We <span className="font-bold">adapt quickly</span> to uncertainty
                    and unexpected challenges.
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Values List */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-sm font-medium uppercase text-white md:text-base">
              <span>GAS</span>
              <span>GOOD VIBES</span>
              <span>STAY HUMBLE</span>
              <span>DEEP DIVE</span>
              <span>GLOWNERSHIP</span>
              <span>HIGH BAR</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

