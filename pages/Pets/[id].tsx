import React from "react";
import { useRouter } from "next/router";
import { DUMMY_PETS } from "../../src/constants/dummyPets";
import PetDetailsPage from "../../src/components/pets/PetDetailsPage";

export default function PetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const pet = DUMMY_PETS.find((p) => p.id === id);

  if (!router.isReady) return null;
  if (!pet)
    return (
      <div className="flex min-h-screen items-center justify-center font-outfit text-2xl font-black">
        Pet not found
      </div>
    );

  return <PetDetailsPage pet={pet} />;
}
