"use client";

import AboutTopBar from "./landing/AboutTopBar";
import AboutHeader from "./landing/AboutHeader";
import AboutHeroSection from "./landing/AboutHeroSection";
import RideOfYourLifeSection from "./landing/RideOfYourLifeSection";
import GreenBookSection from "./landing/GreenBookSection";
import CompanyStatisticsSection from "./landing/CompanyStatisticsSection";
import CoreValuesSection from "./landing/CoreValuesSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import JobsCarouselSection from "./landing/JobsCarouselSection";
import FAQSection from "./landing/FAQSection";
import AboutFooter from "./landing/AboutFooter";

export default function AboutPage() {
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
        <AboutHeader activePage="about" />

        {/* Hero Section */}
        <AboutHeroSection />

        {/* Ride of your Life Section */}
        <RideOfYourLifeSection />

        {/* Green Book Section */}
        <GreenBookSection />

        {/* Company Statistics Section */}
        <CompanyStatisticsSection />

        {/* Core Values Section */}
        <CoreValuesSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Jobs Carousel Section */}
        <JobsCarouselSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}
