import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CarDetailsPage from "../../src/components/cars/CarDetailsPage";
import RootLayout from "../../src/components/ui/layout";
import LoadingScreen from "../../src/components/ui/LoadingScreen";

export default function CarDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/queries/get-car?id=${id}`);
        const data = await response.json();
        if (data.car) {
          const v = data.car;
          const mappedCar = {
            ...v,
            type: v.category,
            fuelType: v.fuel_type,
            image: v.main_photo,
            passengers: parseInt(v.passenger || "5"),
            securityDeposit: v.refundable_amount,
            driverOption: v.drive_provided ? "offered" : "none",
            owner: {
              id: v.logisticAccount_id,
              name:
                v.logisticsAccounts?.businessName ||
                v.logisticsAccounts?.fullname ||
                "Verified Host",
              image:
                v.logisticsAccounts?.Users?.profile_picture ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop",
              isVerified: true,
            },
            images: [
              { url: v.main_photo, label: "Main" },
              { url: v.exterior, label: "Exterior" },
              { url: v.interior, label: "Interior" },
              { url: v.seats, label: "Seats" },
            ].filter((img: any) => img.url),
            reviews: [],
            rating: 5.0,
            description: `Premium ${v.category} vehicle for rent in ${v.location}.`,
            licenseInfo: "Verified License & Insurance",
          };
          setCar(mappedCar);
        }
      } catch (error) {
        console.error("Error fetching car:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (!router.isReady || isLoading) return <LoadingScreen />;

  if (!car) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Car not found</h1>
            <button
              onClick={() => router.back()}
              className="mt-4 font-bold text-green-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </RootLayout>
    );
  }

  return <CarDetailsPage car={car} />;
}
