"use client";

import AboutTopBar from "@components/ui/landing/AboutTopBar";
import AboutHeader from "@components/ui/landing/AboutHeader";
import AboutFooter from "@components/ui/landing/AboutFooter";
import PlasBusinessHero from "@components/ui/plasBusiness/PlasBusinessHero";
import PlasBusinessFeatures from "@components/ui/plasBusiness/PlasBusinessFeatures";
import IndividualSellersSection from "@components/ui/plasBusiness/IndividualSellersSection";
import FreeNoticeSection from "@components/ui/plasBusiness/FreeNoticeSection";
import RegistrationSection from "@components/ui/plasBusiness/RegistrationSection";

export default function PlasBusinessPage() {
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
                <AboutTopBar />
                <AboutHeader activePage="plasBusiness" />

                <main>
                    <PlasBusinessHero />
                    <PlasBusinessFeatures />
                    <IndividualSellersSection />
                    <FreeNoticeSection />
                    <RegistrationSection />
                </main>

                <AboutFooter />
            </div>
        </>
    );
}
