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
        <div className="bg-[#2D5016] py-24 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-black text-white md:text-6xl">
              Our <span className="text-[#00D9A5]">Team</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/80">
              Meet the visionary leaders and talented individuals working
              together to build Africa's most trusted digital marketplace.
            </p>
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
