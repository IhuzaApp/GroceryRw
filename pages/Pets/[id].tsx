import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PetDetailsPage from "../../src/components/pets/PetDetailsPage";
import { Pet } from "../../src/constants/dummyPets";
import LoadingScreen from "../../src/components/ui/LoadingScreen";

export default function PetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/queries/get-pet?id=${id}`);
        const data = await response.json();
        if (data.pet) {
          const p = data.pet;
          const mappedPet = {
            ...p,
            type: p.pet_type,
            price: p.amount,
            isDonation: p.free,
            isVaccinated: p.vaccinated,
            ageInMonths: p.months,
            healthInfo: p.vaccinated ? "Up to date" : "Needs attention",
            images: p.image
              ? [{ url: p.image, label: "Main" }, ...(p.parent_images || [])]
              : p.parent_images || [],
            videoUrl: p.video,
            vaccinationCertificateUrl: p.vaccination_cert,
            owner: {
              id: p.vendor_id,
              name:
                p.pet_vendors?.organisationName ||
                p.pet_vendors?.fullname ||
                "Verified Vendor",
              image:
                p.pet_vendors?.user?.image ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop",
              isVerified: true,
            },
            reviews: [],
            rating: 5.0,
            parentImages: p.parent_images || [],
            status: parseInt(p.quantity || "0") <= parseInt(p.quantity_sold || "0") ? "sold" : "available",
          };
          setPet(mappedPet);
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  if (!router.isReady || isLoading) return <LoadingScreen />;

  if (!pet)
    return (
      <div className="flex min-h-screen items-center justify-center font-outfit text-2xl font-black">
        Pet not found
      </div>
    );

  return <PetDetailsPage pet={pet} />;
}
