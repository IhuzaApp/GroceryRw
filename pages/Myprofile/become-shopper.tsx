import React from "react";
import RootLayout from "@components/ui/layout";
import { GetServerSideProps } from "next";
import { MobileBecomeShopper } from "../../src/components/shopper/MobileBecomeShopper";
import { DesktopBecomeShopper } from "../../src/components/shopper/DesktopBecomeShopper";

export default function BecomeShopperPage() {
  return (
    <RootLayout>
      {/* Mobile View */}
      <div className="block md:hidden min-h-screen bg-white dark:bg-black">
        <MobileBecomeShopper />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen">
        <DesktopBecomeShopper />
      </div>
    </RootLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Authentication can be re-enabled here if needed
  return { props: {} };
};
