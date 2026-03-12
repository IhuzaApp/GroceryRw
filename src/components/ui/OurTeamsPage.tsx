"use client";

import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import TeamSection from "./landing/TeamSection";
import AboutFooter from "./landing/AboutFooter";
import Head from "next/head";

export default function OurTeamsPage() {
  return (
    <>
      <Head>
        <title>Our Team - Plas Technologies</title>
        <meta
          name="description"
          content="Meet the people building the future of African commerce. Our diverse team of visionaries and experts is dedicated to making Plas the most trusted marketplace."
        />
      </Head>
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

        {/* Navigation Bar */}
        <AboutHeader activePage="teams" />

        {/* Hero Section for Teams */}
        <div className="relative overflow-hidden bg-[#2D5016] py-24 md:py-32">
          {/* Background Pattern - Subtle line-art style icons */}
          <div className="absolute inset-0 overflow-hidden opacity-5">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
              {/* SVG Icons Pattern */}
              {Array.from({ length: 20 }).map((_, index) => {
                const iconIndex = index % 5;
                const iconComponents = [
                  <svg
                    key={`1-${index}`}
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>,
                  <svg
                    key={`2-${index}`}
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>,
                  <svg
                    key={`3-${index}`}
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>,
                  <svg
                    key={`4-${index}`}
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>,
                  <svg
                    key={`5-${index}`}
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>,
                ];
                return (
                  <div
                    key={`pattern-${index}`}
                    className="text-white"
                    style={{
                      transform: `rotate(${(index * 15) % 360}deg) translate(${
                        Math.sin(index) * 15
                      }px, ${Math.cos(index) * 15}px)`,
                    }}
                  >
                    {iconComponents[iconIndex]}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-black text-white md:text-6xl">
              Our <span className="text-[#022C22]">Team</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/90">
              Meet the visionary leaders and talented individuals working
              together to build Africa's most trusted digital marketplace.
            </p>
          </div>

          {/* Curved Transition */}
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
                fill="#f9fafb"
              />
            </svg>
          </div>
        </div>

        {/* Team Section */}
        <TeamSection />

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}
