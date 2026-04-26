import React from 'react';
import PetListing from '../../src/components/pets/PetListing';
import RootLayout from '../../src/components/ui/layout';

export default function PetsPage() {
  return (
    <RootLayout>
      <PetListing />
    </RootLayout>
  );
}
