"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Search, User, Linkedin, Youtube, Facebook, Instagram, Globe, Briefcase, Store, Package, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentJob, setCurrentJob] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const jobs = [
    { title: "Delivery Rider - Kenya", location: "Nairobi, Kenya", pronouns: "(They/She/He)" },
    { title: "Account Manager - Uganda", location: "Kampala, Uganda", pronouns: "(She/He/They)" },
    { title: "Junior Developer - Rwanda", location: "Kigali, Rwanda", pronouns: "(They/She/He)" },
    { title: "Operations Manager - Rwanda", location: "Gasabo, Rwanda", pronouns: "(She/He/They)" },
    { title: "Marketing Specialist - Rwanda", location: "Nyarugenge, Rwanda", pronouns: "(They/She/He)" },
    { title: "Customer Support - Kenya", location: "Nairobi, Kenya", pronouns: "(She/He/They)" },
  ];

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

        {/* Our Green Book Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Side - Text Content */}
              <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold text-gray-800 md:text-5xl">
                    Our Green Book
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
                    // Add link to Green Book PDF or page
                    window.open("#", "_blank");
                  }}
                  className="self-start rounded-lg bg-[#00D9A5] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00C896]"
                >
                  Read our Green Book here
                </button>
              </div>

              {/* Right Side - Green Book Graphic */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Main Book */}
                  <div className="relative h-96 w-72 transform rotate-[-8deg] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D9A5] to-[#00A67E] rounded-lg"></div>
                    <div className="absolute inset-0 flex flex-col p-8">
                      {/* Title */}
                      <div className="mb-6">
                        <h3 className="text-4xl font-bold text-gray-800 leading-tight">
                          GREEN BO
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
              <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                Our core values are the north star that guide our
                <br />
                behaviors, processes and mindset
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

        {/* What our people say Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Section Title */}
            <h2 className="mb-12 text-center text-4xl font-bold text-gray-800 md:text-5xl">
              What our people say
            </h2>

            {/* Testimonials Carousel */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentTestimonial * 100}%)`,
                  }}
                >
                  {/* Testimonial 1 */}
                  <div className="min-w-full px-4">
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <svg
                          className="h-12 w-12 text-gray-800"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      {/* Testimonial Text */}
                      <p className="mb-6 text-lg italic leading-relaxed text-gray-700">
                        I&apos;ve been giving my 110% on projects that have helped me
                        develop my skills and grow day after day. From three fundraising
                        processes to several M&A opportunities across different verticals
                        and geographies, I certainly feel that being part of such
                        transformational work at Plas has been a unique lifetime
                        opportunity and I&apos;m very excited about what&apos;s to come!
                      </p>
                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                            alt="Laura Martín"
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Laura Martín</p>
                          <p className="text-sm text-gray-600">
                            Head of International Strategy
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="min-w-full px-4">
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <svg
                          className="h-12 w-12 text-gray-800"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      {/* Testimonial Text */}
                      <p className="mb-6 text-lg italic leading-relaxed text-gray-700">
                        I feel very grateful because they have become more than some
                        colleagues. The trust they place in me is making me grow every
                        day, I have learned to work as a team and I have more and more
                        responsibilities.
                      </p>
                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                          <Image
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                            alt="Jordi Sevillano"
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Jordi Sevillano</p>
                          <p className="text-sm text-gray-600">
                            People Experience Team
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="min-w-full px-4">
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <svg
                          className="h-12 w-12 text-gray-800"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      {/* Testimonial Text */}
                      <p className="mb-6 text-lg italic leading-relaxed text-gray-700">
                        I joined Plas at a very early stage of the company. My biggest
                        challenge during these 4 years has been adapting to the growth
                        and changes and giving my best during this adventure. We started
                        building tripods with cereal boxes for shootings, and now we
                        launch TVC campaigns almost every quarter around the world! This
                        amazing journey has been so intense that now I have green blood
                        inside my veins.
                      </p>
                      {/* Author Info */}
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                          <Image
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                            alt="María Herraiz Sabate"
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            María Herraiz Sabate
                          </p>
                          <p className="text-sm text-gray-600">Sr. Designer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 w-3 rounded-full transition-colors ${
                      currentTestimonial === index
                        ? "bg-[#00D9A5]"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Your next job is on the way Section */}
        <div className="bg-[#F0FDF4] py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Section Title */}
            <h2 className="mb-12 text-center text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
              Your next job is on the way
            </h2>

            {/* Job Cards Carousel */}
            <div className="relative">
              {/* Navigation Arrow Left */}
              <button
                onClick={() =>
                  setCurrentJob((prev) => {
                    const newIndex = prev - 3;
                    return newIndex < 0 ? Math.max(0, jobs.length - 3) : newIndex;
                  })
                }
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-white p-3 shadow-lg transition-colors hover:bg-gray-50 md:left-4"
                aria-label="Previous jobs"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>

              {/* Navigation Arrow Right */}
              <button
                onClick={() =>
                  setCurrentJob((prev) => {
                    const newIndex = prev + 3;
                    return newIndex >= jobs.length ? 0 : newIndex;
                  })
                }
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-white p-3 shadow-lg transition-colors hover:bg-gray-50 md:right-4"
                aria-label="Next jobs"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>

              {/* Job Cards Container */}
              <div className="overflow-hidden px-12">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${Math.floor(currentJob / 3) * 100}%)`,
                  }}
                >
                  {jobs.map((job, index) => (
                    <div key={index} className="min-w-[33.333%] px-4">
                      <div className="rounded-2xl bg-[#D1FAE5] p-6 shadow-md transition-transform hover:scale-105">
                        <h3 className="mb-2 text-xl font-bold text-gray-800">
                          {job.title} {job.pronouns}
                        </h3>
                        <p className="text-gray-600">{job.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: Math.ceil(jobs.length / 3) }).map((_, index) => {
                  const pageStart = index * 3;
                  const isActive = Math.floor(currentJob / 3) === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentJob(pageStart)}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        isActive ? "bg-gray-800" : "bg-gray-300"
                      }`}
                      aria-label={`Go to page ${index + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ask Plas FAQ Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Section Title */}
            <h2 className="mb-4 text-center text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
              Ask Plas
            </h2>
            
            {/* Description */}
            <p className="mb-12 text-center text-lg text-gray-700 md:text-xl">
              Our vision is to give everyone easy access to anything in their city.
              We also want to give you all the answers about Plas.
            </p>

            {/* FAQ Items */}
            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  question: "When will I receive the information for my onboarding?",
                  answer: "You will receive all onboarding information via email within 24-48 hours after accepting your offer. This includes your start date, required documents, and access credentials.",
                },
                {
                  question: "What are Plas's values?",
                  answer: "Our core values are Gas, Good Vibes, Stay Humble, Deep Dive, Glownership, and High Bar. These values guide our behaviors, processes, and mindset every day.",
                },
                {
                  question: "What does a typical day look like at Plas?",
                  answer: "A typical day at Plas is dynamic and fast-paced. You'll collaborate with talented colleagues, work on impactful projects, and have opportunities to learn and grow. We value work-life balance and provide flexibility to help you perform at your best.",
                },
                {
                  question: "Do you offer health insurance?",
                  answer: "Yes, we offer comprehensive health insurance coverage for all full-time employees, including medical, dental, and vision benefits. Coverage begins on your first day of employment.",
                },
                {
                  question: "Is the onboarding process done remotely?",
                  answer: "The onboarding process can be done both remotely and in-person, depending on your role and location. We provide comprehensive virtual onboarding resources and support for all new team members.",
                },
                {
                  question: "Where can I get more information about working at Plas?",
                  answer: "You can find more information about working at Plas on our careers page, read our Green Book, or reach out to our People Experience team. We also encourage you to check out our social media channels for insights into our culture.",
                },
                {
                  question: "What's it like to work at Plas?",
                  answer: "Working at Plas is an exciting journey! We're a fast-growing company with a non-vanilla culture built on talent. You'll work with passionate people, tackle challenging projects, and make a real impact on millions of people's lives. It's truly the ride of your life!",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-[#00D9A5]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="flex-1 text-lg font-medium text-gray-800">
                      {faq.question}
                    </span>
                    <div
                      className={`ml-4 flex-shrink-0 transition-transform ${
                        openFaq === index ? "rotate-45" : ""
                      }`}
                    >
                      <Plus className="h-6 w-6 text-[#00D9A5]" />
                    </div>
                  </button>
                  {openFaq === index && (
                    <div className="border-t border-gray-200 px-6 pb-6 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Ask Plas Button */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  // Add link to contact or support page
                  router.push("#contact");
                }}
                className="rounded-lg bg-[#00D9A5] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#00C896]"
              >
                Ask Plas
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-[#282828] text-white">
          {/* Curved white transition at top */}
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

          <div className="container mx-auto px-4 pt-20 pb-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
              {/* Plas Logo */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <Image
                    src="/assets/logos/PlasIcon.png"
                    alt="Plas Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <span className="text-2xl font-bold text-white">Plas</span>
                </div>
              </div>

              {/* About us Column */}
              <div className="space-y-3">
                <h3 className="font-bold text-white">About us</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Life at Plas
                    </a>
                  </li>
                  <li className="ml-4">
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white text-sm"
                    >
                      Plas Cares
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Diversity & Inclusion
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Our teams
                    </a>
                  </li>
                </ul>
              </div>

              {/* Careers at Plas Column */}
              <div className="space-y-3">
                <h3 className="font-bold text-white">Careers at Plas</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Find your ride
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Students
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Woman in tech
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Business Process
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Tech Process
                    </a>
                  </li>
                </ul>
              </div>

              {/* Our Stories & Locations Column */}
              <div className="space-y-3">
                <h3 className="font-bold text-white">Our Stories</h3>
                <h3 className="font-bold text-white mt-6">Our Locations</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Kigali
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Gasabo
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Nyarugenge
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Kampala
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Nairobi
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Social Media Column */}
              <div className="space-y-3">
                <h3 className="font-bold text-white">Contact us</h3>
                <h3 className="font-bold text-white mt-6">Sign In</h3>
                <div className="flex gap-3 mt-2">
                  <a
                    href="#"
                    className="text-gray-300 transition-colors hover:text-white"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 transition-colors hover:text-white"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 transition-colors hover:text-white"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 transition-colors hover:text-white"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* App Downloads & Glassdoor Column */}
              <div className="space-y-4">
                {/* App Store Button */}
                <button className="flex w-full items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-90">
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

                {/* Google Play Button */}
                <button className="flex w-full items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-90">
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

                {/* Glassdoor Rating */}
                <div className="mt-6">
                  <div className="mb-2 text-sm font-medium text-[#00D9A5]">
                    glassdoor®
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-white">4.0</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="h-5 w-5"
                          fill={star <= 4 ? "#00D9A5" : "none"}
                          stroke={star <= 4 ? "#00D9A5" : "#00D9A5"}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="mt-8 border-t border-gray-700 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  Plas © {new Date().getFullYear()}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Cookie Settings
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Corporate Site
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Couriers
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Sitemap
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Cookies
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="transition-colors hover:text-white"
                  >
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

