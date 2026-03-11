"use client";

import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutFooter from "./landing/AboutFooter";
import {
  PosHeroSection,
  PosFeaturesSection,
  PosPricingSection,
  PosCtaSection,
} from "./pos";
import Head from "next/head";

export default function PosPage() {
  return (
    <>
      <Head>
        <title>Plas POS - Smart Point of Sale System for Your Business</title>
        <meta
          name="description"
          content="Streamline your business with Plas POS. AI-powered tax management, automated payroll, inventory tracking, and integrated marketing with Plas Reels."
        />
        <meta property="og:title" content="Plas POS - Smart Point of Sale System" />
        <meta property="og:description" content="The ultimate POS system for Rwanda businesses. Take care of payroll, tax, and sales in one place." />
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
