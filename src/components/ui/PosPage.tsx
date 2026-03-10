"use client";

import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutFooter from "./landing/AboutFooter";
import PosHeroSection from "./pos/PosHeroSection";
import PosFeaturesSection from "./pos/PosFeaturesSection";
import PosPricingSection from "./pos/PosPricingSection";
import PosCtaSection from "./pos/PosCtaSection";

export default function PosPage() {
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
        <AboutHeader activePage="pos" />

        {/* Hero Section */}
        <PosHeroSection />

        {/* Features Section (AI Tax, Payroll, Reels, Plas Integration) */}
        <PosFeaturesSection />

        {/* Subscription Plans Section */}
        <PosPricingSection />

        <PosCtaSection />

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}
