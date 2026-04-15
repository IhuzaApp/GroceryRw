import React from "react";
import RootLayout from "@components/ui/layout";
import { GetServerSideProps } from "next";
import { MobileBecomeShopper } from "../../src/components/shopper/MobileBecomeShopper";
import { DesktopBecomeShopper } from "../../src/components/shopper/DesktopBecomeShopper";

export default function BecomeShopperPage() {
  return (
    <RootLayout>
      {/* Mobile View */}
      <div className="block min-h-screen bg-white dark:bg-black md:hidden">
        <MobileBecomeShopper />
      </div>

      {/* Desktop View */}
      <div className="hidden min-h-screen md:block">
        <DesktopBecomeShopper />
      </div>
    </RootLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Authentication can be re-enabled here if needed
  return { props: {} };
};
