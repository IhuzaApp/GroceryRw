import React from "react";
import RootLayout from "@components/ui/layout";

import ItemsSection from "@components/items/itemsSection";
import MainBanners from "@components/ui/banners";

export default function Home() {
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {" "}
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          {/* Banner */}
          <MainBanners />
          <ItemsSection />
        </div>
      </div>
    </RootLayout>
  );
}
