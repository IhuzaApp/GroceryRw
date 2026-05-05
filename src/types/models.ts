import { ReactNode } from "react";

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
  platNumber?: string;
}

export interface Pet {
  ageInMonths: number;
  healthInfo: ReactNode;
  reviews: any;
  rating: ReactNode;
  owner: any;
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: "Male" | "Female";
  color: string;
  weight: string;
  story: string;
  price: number;
  location: string;
  months?: string | number;
  quantity?: string | number;
  updated_at?: string;
  image: string;
  images: { url: string; label: string }[];
  isVaccinated: boolean;
  isDonation?: boolean;
  vaccinations: string[];
  vaccination_cert?: string;
  vaccinationCertificateUrl?: string;
  video?: string;
  videoUrl?: string;
  parentImages?: { url: string; label: string }[];
  parent_images?: { url: string; label: string }[];
  status: "available" | "sold";
  vendor: { name: string; id: string; image: string };
}
