export interface Car {
  id: string;
  name: string;
  type: "Sedan" | "SUV" | "Truck" | "Hatchback" | "Van" | "Luxury";
  fuelType: "Fuel" | "Electric" | "Hybrid" | "Diesel";
  location: string;
  price: number;
  image: string;
  images: { url: string; label: string }[];
  status: "active" | "inactive";
  rating: number;
  year: number;
  passengers: number;
  transmission: "Automatic" | "Manual";
  licenseInfo: string;
  description: string;
  reviews: { user: string; comment: string; rating: number; date: string }[];
  owner: { name: string; id: string; image: string };
  securityDeposit: number;
  driverOption: "none" | "offered";
}


