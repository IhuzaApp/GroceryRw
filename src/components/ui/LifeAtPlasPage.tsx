"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Linkedin, Youtube, Facebook, Instagram, ChevronLeft, ChevronRight } from "lucide-react";

export default function LifeAtPlasPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const benefits = [
    "Competitive Pay and Enticing Equity Plan",
    "Top-notch Private Health Insurance",
    "Monthly Plas credit to spend on our restaurant products",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        {/* Header */}
        <header
          className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-white shadow-md"
              : "bg-transparent"
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
                <Link
                  href="/about"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  About us
                </Link>
                <Link
                  href="/life-at-plas"
                  className={`border-b-2 pb-1 font-medium transition-colors ${
                    isScrolled
                      ? "border-[#00D9A5] text-[#00D9A5]"
                      : "border-[#00D9A5] text-white"
                  }`}
                >
                  Life at Plas
                </Link>
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
                <Link
                  href="/careers"
                  className={`font-medium transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Careers at Plas
                </Link>
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
              Life at Plas
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
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Side - Water Drop Shaped Image */}
              <div className="flex items-center justify-center">
                <div 
                  className="relative overflow-hidden shadow-2xl"
                  style={{
                    width: "450px",
                    height: "550px",
                    clipPath: "path('M 225 0 C 300 0 375 50 400 150 C 425 250 400 350 350 450 C 300 500 225 550 225 550 C 225 550 150 500 100 450 C 50 350 25 250 50 150 C 75 50 150 0 225 0 Z')",
                  }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1000&fit=crop"
                      alt="Life at Plas team"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Text Content */}
              <div className="flex flex-col justify-center space-y-6">
                <h2 className="text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
                  We deliver good vibes to our people
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-gray-800">
                  <p>
                    Our platform connects people with possibilities. Our mission is to give everyone easy access to anything in their city.
                  </p>
                  <p>
                    Our global team works together by leveraging the latest technology to connect to possibilities. We believe in paving the way together. Do you?
                  </p>
                </div>
                <button
                  onClick={() => router.push("/careers")}
                  className="mt-6 w-fit rounded-lg bg-[#00D9A5] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#00C896]"
                >
                  Join our ride
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Perks & Benefits Section */}
        <div className="bg-gray-100 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center mb-16">
              {/* Left Side - Text Content with Decorative Elements */}
              <div className="relative flex flex-col space-y-6">
                {/* Decorative Yellow Circles */}
                <div className="absolute -left-8 top-0 hidden lg:block">
                  <div className="relative">
                    <div className="absolute w-16 h-16 border-2 border-yellow-400 rounded-full"></div>
                    <div className="absolute left-4 top-4 w-16 h-16 border-2 border-yellow-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl mb-4">
                    Perks & benefits
                    <span className="block w-24 h-1 bg-yellow-400 mt-2"></span>
                  </h2>
                  <div className="space-y-4 text-lg leading-relaxed text-gray-800">
                    <p>
                      From helping you experience each day to the fullest, sharing memorable moments along the way, to investing in your future... <strong>We&apos;ve got you covered!</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      *The perks and benefits can change depending on the location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Upside Down Avocado Shaped Image */}
              <div className="flex items-center justify-center">
                <div 
                  className="relative overflow-hidden shadow-2xl bg-gray-200"
                  style={{
                    width: "500px",
                    height: "600px",
                    clipPath: "path('M 250 0 C 350 0 420 50 450 150 C 480 250 490 350 480 450 C 470 520 420 570 350 590 C 300 600 200 600 150 590 C 80 570 30 520 20 450 C 10 350 20 250 50 150 C 80 50 150 0 250 0 Z')",
                  }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=1000&fit=crop"
                      alt="Perks and benefits"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Subtle background pattern overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-12 p-8">
                      {Array.from({ length: 20 }).map((_, index) => {
                        const iconIndex = index % 5;
                        const iconComponents = [
                          <svg key={`icon-${index}`} className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>,
                          <svg key={`icon-${index}`} className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>,
                          <svg key={`icon-${index}`} className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>,
                          <svg key={`icon-${index}`} className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>,
                          <svg key={`icon-${index}`} className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>,
                        ];
                        return (
                          <div
                            key={`pattern-${index}`}
                            className="text-gray-600"
                            style={{
                              transform: `rotate(${(index * 18) % 360}deg)`,
                            }}
                          >
                            {iconComponents[iconIndex]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Carousel */}
            <div className="relative">
              <div className="flex items-center justify-center gap-4">
                {/* Left Arrow - Only show on mobile */}
                <button
                  onClick={() => setCurrentBenefit((prev) => (prev === 0 ? benefits.length - 1 : prev - 1))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-700 transition-colors hover:bg-gray-400 ${isMobile ? "block" : "hidden"}`}
                  aria-label="Previous benefit"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                {/* Carousel Cards - Show all 3 on desktop, one at a time on mobile */}
                <div className="flex-1 overflow-hidden max-w-5xl">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: !isMobile 
                        ? "translateX(0%)" 
                        : `translateX(-${currentBenefit * 100}%)`,
                    }}
                  >
                    {benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="min-w-full md:min-w-[33.333%] px-4"
                      >
                        <div className="mx-auto rounded-lg bg-[#00D9A5] px-6 py-10 md:px-8 md:py-12 text-center shadow-lg">
                          <p className="text-lg md:text-xl font-semibold text-white">
                            {benefit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow - Only show on mobile */}
                <button
                  onClick={() => setCurrentBenefit((prev) => (prev === benefits.length - 1 ? 0 : prev + 1))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-700 transition-colors hover:bg-gray-400 ${isMobile ? "block" : "hidden"}`}
                  aria-label="Next benefit"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* Carousel Indicators - Only show on mobile */}
              <div className={`mt-6 flex justify-center gap-2 ${isMobile ? "block" : "hidden"}`}>
                {benefits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBenefit(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentBenefit ? "bg-black" : "bg-gray-400"
                    }`}
                    aria-label={`Go to benefit ${index + 1}`}
                  />
                ))}
              </div>
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
                    <Link
                      href="/life-at-plas"
                      className="text-gray-300 transition-colors hover:text-white"
                    >
                      Life at Plas
                    </Link>
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
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

