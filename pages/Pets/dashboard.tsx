import React from 'react';
import PetBusinessDashboard from '../../src/components/pets/PetBusinessDashboard';
import RootLayout from '../../src/components/ui/layout';

export default function PetDashboardPage() {
  return (
    <RootLayout>
      <PetBusinessDashboard />
    </RootLayout>
  );
}
