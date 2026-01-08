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

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}

