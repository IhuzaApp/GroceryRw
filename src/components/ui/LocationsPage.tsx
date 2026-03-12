"use client";

import dynamic from "next/dynamic";
import AboutTopBar from "@components/ui/landing/AboutTopBar";
import AboutHeader from "@components/ui/landing/AboutHeader";
import LocationsHeroSection from "@components/ui/landing/LocationsHeroSection";
import AboutFooter from "@components/ui/landing/AboutFooter";
import "leaflet/dist/leaflet.css";

const LocationsMapSection = dynamic(
  () => import("@components/ui/landing/LocationsMapSection"),
  { ssr: false }
);

export default function LocationsPage() {
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
        <AboutTopBar />

        {/* Main Navigation Bar */}
        <AboutHeader activePage="locations" />

        {/* Hero Section */}
        <LocationsHeroSection />

        {/* Map Section */}
        <LocationsMapSection />

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}
