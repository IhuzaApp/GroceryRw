export interface Car {
  id: string;
  name: string;
  type: 'Sedan' | 'SUV' | 'Truck' | 'Hatchback' | 'Van' | 'Luxury';
  fuelType: 'Fuel' | 'Electric' | 'Hybrid' | 'Diesel';
  location: string;
  price: number;
  image: string;
  images: { url: string; label: string }[];
  status: 'active' | 'inactive';
  rating: number;
  year: number;
  passengers: number;
  transmission: 'Automatic' | 'Manual';
  licenseInfo: string;
  description: string;
  reviews: { user: string; comment: string; rating: number; date: string }[];
  owner: { name: string; id: string; image: string };
  securityDeposit: number;
  driverOption: 'none' | 'offered';
}

export const DUMMY_CARS: Car[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    type: 'Sedan',
    fuelType: 'Electric',
    location: 'Kigali',
    price: 100, // Price includes driver
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop', label: 'Exterior Front' },
      { url: 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?q=80&w=2070&auto=format&fit=crop', label: 'Interior Dashboard' },
      { url: 'https://images.unsplash.com/photo-1553260168-69b0418ad328?q=80&w=2070&auto=format&fit=crop', label: 'Rear Seats' },
    ],
    status: 'active',
    rating: 4.9,
    year: 2023,
    passengers: 5,
    transmission: 'Automatic',
    licenseInfo: 'Fully Insured • RURA Certified',
    description: 'Experience the future with this premium Tesla Model 3. Long range battery, autopilot features, and a glass roof for a stunning driving experience. Includes a professional chauffeur.',
    reviews: [
      { user: 'Alex K.', comment: 'Amazing car, so smooth!', rating: 5, date: '2024-03-15' },
      { user: 'Sarah M.', comment: 'Loved the interior quality.', rating: 4, date: '2024-03-10' }
    ],
    owner: { name: 'Elon Rental', id: 'owner_1', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop' },
    securityDeposit: 200,
    driverOption: 'offered'
  },
  {
    id: '2',
    name: 'Toyota RAV4',
    type: 'SUV',
    fuelType: 'Hybrid',
    location: 'Musanze',
    price: 65,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop', label: 'Exterior' },
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop', label: 'Interior' }
    ],
    status: 'active',
    rating: 4.7,
    year: 2022,
    passengers: 5,
    transmission: 'Automatic',
    licenseInfo: 'Fully Insured • GPS Tracker Installed',
    description: 'Reliable and spacious SUV, perfect for family trips or city driving. Great fuel economy thanks to the hybrid engine. Self-drive only.',
    reviews: [
      { user: 'David G.', comment: 'Perfect for our weekend trip.', rating: 5, date: '2024-02-20' }
    ],
    owner: { name: 'Toyota City', id: 'owner_2', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop' },
    securityDeposit: 150,
    driverOption: 'none'
  },
  {
    id: '3',
    name: 'Range Rover Sport',
    type: 'Luxury',
    fuelType: 'Fuel',
    location: 'Kigali',
    price: 180, // Price includes driver
    image: 'https://images.unsplash.com/photo-1606148632349-5382973ff3dd?q=80&w=2070&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1606148632349-5382973ff3dd?q=80&w=2070&auto=format&fit=crop', label: 'Exterior' },
      { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop', label: 'Interior' }
    ],
    status: 'active',
    rating: 5.0,
    year: 2024,
    passengers: 5,
    transmission: 'Automatic',
    licenseInfo: 'VIP Insurance • Personal Guard Available',
    description: 'The pinnacle of luxury and performance. This Range Rover Sport comes with top-of-the-line features and unparalleled comfort. Included with a private driver for safety.',
    reviews: [],
    owner: { name: 'VIP Rentals', id: 'owner_vip', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop' },
    securityDeposit: 500,
    driverOption: 'offered'
  }
];
