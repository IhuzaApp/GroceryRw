import React from "react";
import CarListing from "../../src/components/cars/CarListing";
import RootLayout from "../../src/components/ui/layout";

export default function CarsPage() {
  return (
    <RootLayout>
      <CarListing />
    </RootLayout>
  );
}
