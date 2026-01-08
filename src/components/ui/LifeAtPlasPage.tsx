"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutFooter from "./landing/AboutFooter";

export default function LifeAtPlasPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<'talent-house' | 'office-life'>('talent-house');
  const [currentSlide, setCurrentSlide] = useState(0);

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
        {/* Top Bar */}
        <AboutTopBar />

        {/* Header */}
        <AboutHeader activePage="life-at-plas" />

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
                {/* Decorative Green Circles */}
                <div className="absolute -left-8 top-0 hidden lg:block">
                  <div className="relative">
                    <div className="absolute w-16 h-16 border-2 border-[#00D9A5] rounded-full"></div>
                    <div className="absolute left-4 top-4 w-16 h-16 border-2 border-[#00D9A5] rounded-full"></div>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl mb-4">
                    Perks & benefits
                    <span className="block w-24 h-1 bg-[#00D9A5] mt-2"></span>
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

        {/* Talent House / Office Life Section with Toggle */}
        <div className="relative bg-[#2C2C2C] py-16 md:py-24 overflow-hidden">
          {/* Decorative circular line graphics */}
          <div className="absolute top-8 right-8 opacity-20">
            <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
              <circle cx="75" cy="75" r="70" stroke="#00D9A5" strokeWidth="1" />
              <circle cx="75" cy="75" r="50" stroke="#00D9A5" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute bottom-8 left-8 opacity-20">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="#00D9A5" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" stroke="#00D9A5" strokeWidth="1" />
            </svg>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Side - Image (changes based on active section) */}
              <div className="flex items-center justify-center">
                {activeSection === 'office-life' ? (
                  <div 
                    className="relative h-[550px] w-[450px] overflow-hidden shadow-2xl"
                    style={{
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                    }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop"
                      alt="Plas Office Life"
                      fill
                      className="object-cover"
                    />
                    {/* Green accent strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#00D9A5]"></div>
                  </div>
                ) : (
                  <div 
                    className="relative h-[550px] w-[450px] overflow-hidden shadow-2xl"
                    style={{
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                    }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop"
                      alt="Plas Talent House"
                      fill
                      className="object-cover"
                    />
                    {/* Green accent strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#00D9A5]"></div>
                  </div>
                )}
              </div>

              {/* Right Side - Text Content (changes based on active section) */}
              <div className="flex flex-col space-y-6 text-white">
                {activeSection === 'office-life' ? (
                  <>
                    <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                      Office Life
                    </h2>
                    <p className="text-lg leading-relaxed md:text-xl">
                      We have an <strong>office-first culture</strong> where
                      collaboration and relationships are placed at the center. We
                      believe <strong>our culture comes alive and thrives when we get
                      together and collaborate!</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                      The Talent House
                    </h2>
                    <p className="text-lg leading-relaxed md:text-xl">
                      At Plas we are building a talent house of high performing teams and future leaders. We believe that talent is our biggest asset, and being surrounded by top talent will help us raise the bar and create high performing teams, shaping the leaders of tomorrow.
                    </p>
                  </>
                )}
                
                {/* Bottom Navigation - Toggle Buttons */}
                <div className="flex items-center gap-4 text-sm uppercase">
                  <button
                    onClick={() => setActiveSection('talent-house')}
                    className={`transition-colors ${
                      activeSection === 'talent-house' 
                        ? 'font-bold text-[#00D9A5]' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    THE TALENT HOUSE
                  </button>
                  <button
                    onClick={() => setActiveSection('office-life')}
                    className={`transition-colors ${
                      activeSection === 'office-life' 
                        ? 'font-bold text-[#00D9A5]' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    OFFICE LIFE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empowering Communities Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="mb-12 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="text-[#00D9A5]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl">
                  Empowering communities in the digital world
                </h2>
              </div>
              <p className="mx-auto max-w-3xl text-lg text-gray-700">
                Find out how Plas is committed to making a positive impact on society, by shaping a social-responsible and eco-friendly growth model!
              </p>
            </div>

            {/* Carousel */}
            <div className="relative max-w-7xl mx-auto">
              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1))}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={() => setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Slides Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Slide 1 - Couriers */}
                  <div className="min-w-full flex-shrink-0 px-20 py-16">
                    <div className="flex items-center justify-center gap-16">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full shadow-xl">
                          <Image
                            src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=800&fit=crop"
                            alt="Plas Plasers"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      {/* Text */}
                      <div className="flex flex-1 flex-col justify-center space-y-6 max-w-md">
                        <h3 className="text-4xl font-bold text-gray-800 lg:text-5xl">
                          Plasers
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          Plas is leading the way in improving Plasers' experience by adding extra benefits. By connecting to the platform, Plasers are able to access numerous upskilling and learning opportunities.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2 - Local Commerce */}
                  <div className="min-w-full flex-shrink-0 px-20 py-16">
                    <div className="flex items-center justify-center gap-16">
                      {/* Text */}
                      <div className="flex flex-1 flex-col justify-center space-y-6 max-w-md">
                        <h3 className="text-4xl font-bold text-gray-800 lg:text-5xl">
                          Local Commerce
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          Small businesses should be able to thrive through our platform. That's why we're safeguarding the city's local commerce and being an enabler for small businesses to grow.
                        </p>
                      </div>
                      {/* Image - Blob Shape */}
                      <div className="flex-shrink-0">
                        <div 
                          className="relative h-[400px] w-[400px] overflow-hidden shadow-xl"
                          style={{
                            borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%'
                          }}
                        >
                          <Image
                            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=800&fit=crop"
                            alt="Plas Local Commerce"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3 - Social Logistics */}
                  <div className="min-w-full flex-shrink-0 px-20 py-16">
                    <div className="flex items-center justify-center gap-16">
                      {/* Text */}
                      <div className="flex flex-1 flex-col justify-center space-y-6 max-w-md">
                        <h3 className="text-4xl font-bold text-gray-800 lg:text-5xl">
                          Social Logistics
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          At Plas, we aim to use our technologies to contribute to society. With the goal of reducing hunger in the communities around us, we support NGOs by means of our technological tools, by helping the food surplus produced by our partners, and by delivering essential goods and social meals.
                        </p>
                      </div>
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full shadow-xl">
                          <Image
                            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop"
                            alt="Plas Social Logistics"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 4 - Environment */}
                  <div className="min-w-full flex-shrink-0 px-20 py-16">
                    <div className="flex items-center justify-center gap-16">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full shadow-xl">
                          <Image
                            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop"
                            alt="Plas Environment"
                            fill
                            className="object-cover"
                          />
                          {/* Overlay logo */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                            <div className="text-center">
                              <div className="text-6xl font-bold text-[#00D9A5] drop-shadow-lg">
                                Plas
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Text */}
                      <div className="flex flex-1 flex-col justify-center space-y-6 max-w-md">
                        <h3 className="text-4xl font-bold text-gray-800 lg:text-5xl">
                          Environment
                        </h3>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          Plas has been carbon neutral since 2024. Yet, we keep accelerating the transition towards environmental sustainability, by boosting sustainable packaging, reducing CO2 emissions from vehicles, and eradicating food waste.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 w-3 rounded-full transition-colors ${
                      index === currentSlide ? "bg-[#00D9A5]" : "bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Culture Section */}
        <div className="relative bg-gray-100 py-16 md:py-24 overflow-hidden">
          {/* Decorative circles - top right */}
          <div className="absolute top-8 right-8 opacity-30">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path d="M60 10 Q100 30 110 60" stroke="#00D9A5" strokeWidth="2" fill="none"/>
              <path d="M60 20 Q90 35 100 60" stroke="#00D9A5" strokeWidth="2" fill="none"/>
              <path d="M60 30 Q80 40 90 60" stroke="#00D9A5" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          <div className="container mx-auto px-4">
            {/* First Row - Diverse Team */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-16 md:text-4xl lg:text-5xl">
                We are a diverse, creative group of people who<br />collaborate in an inclusive environment
              </h2>
              
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center max-w-6xl mx-auto">
                {/* Left - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop"
                      alt="Diverse Plas Team"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                {/* Right - Text */}
                <div className="flex flex-col space-y-6">
                  <h4 className="text-xl font-bold text-gray-800 md:text-2xl">
                    We want to make a meaningful impact through technology and engineering
                  </h4>
                  <p className="text-base text-gray-700 leading-relaxed">
                    By using our experience and maximizing the use of technology and automation to <strong>solve complex problems,</strong> we aim to provide anyone easy access to anything in their city.
                  </p>
                </div>
              </div>
            </div>

            {/* Second Row - Vision */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left - Text */}
              <div className="flex flex-col space-y-6">
                <h4 className="text-xl font-bold text-gray-800 md:text-2xl">
                  Our vision is to be a world-class engineering organization
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  As of now, our tech team consists of around <strong>500 top talented engineers</strong>, with the plan of continuing scaling it in the next upcoming years. We believe that <strong>diversity adds incredible value to our teams</strong>, products and culture and we support and empower women in tech, making it one of the priorities when accessing talents.
                </p>
              </div>
              
              {/* Right - Image */}
              <div className="flex items-center justify-center">
                <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop"
                    alt="Plas Engineering Team"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative circles - bottom left */}
          <div className="absolute bottom-8 left-8 opacity-30">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" stroke="#00D9A5" strokeWidth="2" fill="none"/>
              <circle cx="60" cy="60" r="35" stroke="#00D9A5" strokeWidth="2" fill="none"/>
              <circle cx="60" cy="60" r="20" stroke="#00D9A5" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Technology Stack Section */}
        <div className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Technology Stack */}
              <div className="mb-20">
                <h4 className="text-2xl font-bold text-gray-800 text-center mb-8 md:text-3xl">
                  We want to build the fastest and most easy-to-use app
                </h4>
                <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
                  <p className="text-base text-gray-700">
                    Leveraging our modern technology stack including Next.js, React, and TypeScript, powered by Firebase and GraphQL.
                  </p>
                  <p className="text-base text-gray-700">
                    Our platform is built with cutting-edge technologies to deliver the best user experience:
                  </p>
                </div>

                {/* Technology Stack Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto items-center justify-items-center">
                  {/* Next.js */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 180 180" fill="none">
                      <mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                        <circle cx="90" cy="90" r="90" fill="black"/>
                      </mask>
                      <g mask="url(#mask0)">
                        <circle cx="90" cy="90" r="90" fill="black"/>
                        <path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="url(#paint0_linear)"/>
                        <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear)"/>
                      </g>
                      <defs>
                        <linearGradient id="paint0_linear" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                          <stop stopColor="white"/>
                          <stop offset="1" stopColor="white" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="121" y1="54" x2="121" y2="106.5" gradientUnits="userSpaceOnUse">
                          <stop stopColor="white"/>
                          <stop offset="1" stopColor="white" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Next.js</span>
                  </div>

                  {/* React */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 228" fill="none">
                      <path d="M210.483 73.824C206.39 69.79 200.162 68.95 191.912 71.304C187.671 64.984 182.648 59.211 176.844 54.097C158.521 39.088 136.965 31 128 31C119.038 31 97.482 39.088 79.158 54.097C73.356 59.21 68.334 64.982 64.093 71.301C55.842 68.947 49.614 69.787 45.521 73.821C37.328 81.888 36.879 95.843 43.142 110.834C45.925 117.242 50.059 123.738 55.328 130.019C50.059 136.3 45.925 142.796 43.142 149.204C36.879 164.195 37.328 178.15 45.521 186.217C49.614 190.251 55.843 191.091 64.093 188.737C68.334 195.056 73.357 200.828 79.159 205.941C97.482 220.95 119.038 229.038 128 229.038C136.962 229.038 158.518 220.95 176.841 205.941C182.643 200.828 187.666 195.056 191.907 188.737C200.157 191.091 206.386 190.251 210.479 186.217C218.672 178.15 219.121 164.195 212.858 149.204C210.075 142.796 205.941 136.3 200.672 130.019C205.941 123.738 210.075 117.242 212.858 110.834C219.121 95.843 218.672 81.888 210.483 73.824Z" fill="#61DAFB"/>
                      <path d="M128 147C138.493 147 147 138.493 147 128C147 117.507 138.493 109 128 109C117.507 109 109 117.507 109 128C109 138.493 117.507 147 128 147Z" fill="#61DAFB"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">React</span>
                  </div>

                  {/* TypeScript */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 256" fill="none">
                      <rect width="256" height="256" fill="#3178C6"/>
                      <path d="M20 20h216v216H20V20z" fill="#3178C6"/>
                      <path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 00-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 017.558 2.719 41.7 41.7 0 016.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.317 291.317 0 0110.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.391 1.611 4.276 3.366 5.655 5.265 1.379 1.899 2.068 4.057 2.068 6.474 0 2.073-.549 3.94-1.647 5.6-1.099 1.66-2.621 3.077-4.567 4.251-1.946 1.174-4.273 2.087-6.982 2.739-2.71.652-5.64.978-8.79.978-4.519 0-9.224-.604-14.114-1.812a58.863 58.863 0 01-14.113-5.265z" fill="#FFF"/>
                      <path d="M70 199v-70h35V74H0v55h35v70h35z" fill="#FFF"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">TypeScript</span>
                  </div>

                  {/* Firebase */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 351" fill="none">
                      <path d="M1.253 280.732l1.605-3.131 99.353-188.518-44.15-83.475C54.392-1.283 45.074.474 43.87 8.188L1.253 280.732z" fill="#FFC24A"/>
                      <path d="M134.417 148.974l32.039-32.812-32.039-61.007c-3.042-5.791-10.433-6.398-13.443-.59l-17.705 34.109-.53 1.744 31.678 58.556z" fill="#FFA712"/>
                      <path d="M134.417 148.974L134.417 148.974 102.739 90.418 1.253 280.732l133.164 69.083 133.155-69.083-133.155-131.758z" fill="#F4BD62"/>
                      <path d="M134.417 148.974l133.155 131.758-133.155 69.083V148.974z" fill="#FFA50E"/>
                      <path d="M103.739 91.418L1.253 280.732l99.353-188.518 3.133-1.796z" fill="#F6820C"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Firebase</span>
                  </div>

                  {/* GraphQL */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 288" fill="none">
                      <path d="M152.576 32.964l59.146 34.15a25.819 25.819 0 0116.729 24.296v68.3a25.819 25.819 0 01-16.729 24.296l-59.146 34.15a25.819 25.819 0 01-25.152 0l-59.146-34.15a25.819 25.819 0 01-16.729-24.296v-68.3a25.819 25.819 0 0116.729-24.296l59.146-34.15a25.819 25.819 0 0125.152 0z" fill="#E10098"/>
                      <path d="M152.576 32.964l59.146 34.15a25.819 25.819 0 0116.729 24.296v68.3" stroke="#E10098" strokeWidth="8"/>
                      <path d="M75 144.5l-32-18.5" stroke="#E10098" strokeWidth="8"/>
                      <path d="M213 144.5l32-18.5" stroke="#E10098" strokeWidth="8"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">GraphQL</span>
                  </div>

                  {/* Tailwind CSS */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 154" fill="none">
                      <path d="M128 0C93.867 0 72.533 17.067 64 51.2 76.8 34.133 91.733 27.733 108.8 32c9.737 2.434 16.697 9.499 24.401 17.318C145.751 62.057 160.275 76.8 192 76.8c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C174.249 14.743 159.725 0 128 0zM64 76.8C29.867 76.8 8.533 93.867 0 128c12.8-17.067 27.733-23.467 44.8-19.2 9.737 2.434 16.697 9.499 24.401 17.318C81.751 138.857 96.275 153.6 128 153.6c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C110.249 91.543 95.725 76.8 64 76.8z" fill="#06B6D4"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Tailwind CSS</span>
                  </div>

                  {/* Socket.io */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 256" fill="none">
                      <circle cx="128" cy="128" r="100" fill="#010101"/>
                      <circle cx="128" cy="128" r="70" fill="white"/>
                      <circle cx="128" cy="128" r="40" fill="#010101"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Socket.io</span>
                  </div>

                  {/* Node.js */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 289" fill="none">
                      <path d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.915-2.65-3.975-1.06-4.505 7.155-2.385 8.48-2.915 15.9-7.156.796-.53 1.856-.265 2.65.265l27.032 16.166c1.06.53 2.385.53 3.18 0l105.74-61.217c1.06-.53 1.59-1.591 1.59-2.916V83.08c0-1.325-.53-2.385-1.59-2.915l-105.74-60.953c-1.06-.53-2.385-.53-3.18 0L20.405 80.166c-1.06.53-1.59 1.855-1.59 2.915v122.17c0 1.06.53 2.385 1.59 2.915l28.887 16.696c15.636 7.95 25.44-1.325 25.44-10.6V93.68c0-1.59 1.326-3.18 3.181-3.18h13.516c1.59 0 3.18 1.325 3.18 3.18v120.58c0 20.936-11.396 33.126-31.272 33.126-6.095 0-10.865 0-24.38-6.625L10.3 223.995c-6.89-3.975-11.13-11.395-11.13-19.35V82.55c0-7.95 4.24-15.371 11.13-19.35L115.04 2.185c6.625-3.71 15.635-3.71 22.26 0L242.038 63.2c6.89 3.975 11.13 11.136 11.13 19.084v122.17c0 7.95-4.24 15.371-11.13 19.35L137.294 285.02c-3.445 1.856-7.42 2.915-11.395 2.915zm33.126-84.285c-46.396 0-55.937-21.466-55.937-39.353 0-1.59 1.325-3.18 3.18-3.18h13.78c1.59 0 2.916 1.06 2.916 2.65 2.12 14.045 8.215 20.936 36.326 20.936 22.26 0 31.802-5.035 31.802-16.96 0-6.891-2.65-11.926-37.386-15.371-28.887-2.915-46.925-9.275-46.925-32.33 0-21.202 17.773-33.922 47.72-33.922 33.657 0 50.107 11.66 52.227 37.386 0 .795-.265 1.59-.795 2.385-.53.53-1.325 1.06-2.12 1.06h-13.78c-1.326 0-2.65-1.06-2.916-2.385-3.18-14.575-11.395-19.35-32.33-19.35-23.85 0-26.5 8.48-26.5 14.84 0 7.686 3.18 10.07 36.326 14.31 32.86 4.24 47.985 10.336 47.985 33.127-.265 22.795-19.084 35.78-52.476 35.78z" fill="#83CD29"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Node.js</span>
                  </div>

                  {/* Vercel */}
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 256 222" fill="none">
                      <path d="M128 0l128 221.705H0z" fill="#000"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Vercel</span>
                  </div>
                </div>
              </div>

              {/* Engineering Call to Action */}
              <div className="text-center space-y-6 py-12">
                <h3 className="text-3xl font-bold text-gray-800 md:text-4xl">
                  Complex problems, exceptional people.
                </h3>
                <h4 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  This is Engineering at Plas.
                </h4>
                <p className="text-xl text-gray-700 italic">
                  We're the magic behind our app.
                </p>
                <button
                  onClick={() => router.push("/careers")}
                  className="mt-8 rounded-lg bg-[#00D9A5] px-10 py-4 text-lg font-medium text-white transition-colors hover:bg-[#00C896]"
                >
                  Join our ride
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}

