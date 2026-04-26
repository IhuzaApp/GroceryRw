import { useRouter } from "next/router";
import { DUMMY_CARS } from "../../src/constants/dummyCars";
import CarDetailsPage from "../../src/components/cars/CarDetailsPage";
import RootLayout from "../../src/components/ui/layout";

export default function CarDetail() {
  const router = useRouter();
  const { id } = router.query;

  const car = DUMMY_CARS.find((c) => c.id === id);

  if (!car) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Car not found</h1>
            <button 
              onClick={() => router.back()}
              className="mt-4 text-green-500 font-bold"
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
