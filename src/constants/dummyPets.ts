export interface Pet {
  id: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: string; // e.g., "4 months", "2 years"
  ageInMonths: number; // For conditional logic (e.g., parents' photo)
  gender: 'Male' | 'Female';
  color: string;
  weight: string; // e.g., "5kg"
  price: number; // 0 for donation
  isDonation: boolean;
  status: 'available' | 'sold';
  images: { url: string; label: string }[];
  videoUrl?: string;
  parentImages?: { url: string; label: string }[]; // Required if age < 6 months
  story: string;
  likes: number;
  location: string;
  isVaccinated: boolean;
  vaccinations: string[];
  vaccinationCertificateUrl?: string;
  healthInfo: string; // e.g., "Vaccinated", "Dewormed"
  owner: {
    id: string;
    name: string;
    image: string;
    isVerified: boolean;
  };
  reviews: {
    user: string;
    comment: string;
    rating: number;
    date: string;
  }[];
  rating: number;
}

export const DUMMY_PETS: Pet[] = [
  {
    id: 'p1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '4 months',
    ageInMonths: 4,
    gender: 'Male',
    color: 'Golden',
    weight: '12kg',
    price: 450,
    isDonation: false,
    status: 'available',
    images: [
      { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=2024&auto=format&fit=crop', label: 'Front View' },
      { url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1988&auto=format&fit=crop', label: 'Playing' }
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-golden-retriever-puppy-running-in-the-grass-42410-large.mp4',
    parentImages: [
      { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop', label: 'Father' },
      { url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964&auto=format&fit=crop', label: 'Mother' }
    ],
    story: 'Max is a playful and energetic puppy looking for a loving home. He loves playing fetch and is great with children.',
    likes: 24,
    location: 'Kigali, Nyarutarama',
    isVaccinated: true,
    vaccinations: ['Rabies', 'Parvovirus', 'Distemper'],
    vaccinationCertificateUrl: '#',
    healthInfo: 'Vaccinated • Dewormed',
    owner: {
      id: 'owner_pet_1',
      name: 'Pet Haven',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
      isVerified: true
    },
    reviews: [
      { user: 'Alice', comment: 'Such a cute puppy!', rating: 5, date: '2024-04-01' }
    ],
    rating: 4.8
  },
  {
    id: 'p2',
    name: 'Luna',
    type: 'Cat',
    breed: 'Persian',
    age: '2 years',
    ageInMonths: 24,
    gender: 'Female',
    color: 'White',
    weight: '4.5kg',
    price: 0,
    isDonation: true,
    status: 'available',
    images: [
      { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop', label: 'Resting' }
    ],
    story: 'Luna is a calm and affectionate cat. She was rescued from the street and is now healthy and ready for her forever home.',
    likes: 12,
    location: 'Musanze',
    isVaccinated: true,
    vaccinations: ['Feline Viral Rhinotracheitis', 'Calicivirus', 'Panleukopenia'],
    vaccinationCertificateUrl: '#',
    healthInfo: 'Spayed • Vaccinated',
    owner: {
      id: 'owner_pet_2',
      name: 'SaveAFriend',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
      isVerified: true
    },
    reviews: [],
    rating: 4.5
  },
  {
    id: 'p3',
    name: 'Charlie',
    type: 'Dog',
    breed: 'German Shepherd',
    age: '3 months',
    ageInMonths: 3,
    gender: 'Male',
    color: 'Black & Tan',
    weight: '15kg',
    price: 600,
    isDonation: false,
    status: 'sold',
    images: [
      { url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1974&auto=format&fit=crop', label: 'Standing' }
    ],
    parentImages: [
      { url: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?q=80&w=1974&auto=format&fit=crop', label: 'Parents' }
    ],
    story: 'Charlie is a smart and brave puppy. He is already showing great guard dog potential.',
    likes: 45,
    location: 'Rubavu',
    isVaccinated: true,
    vaccinations: ['Rabies', 'DHPP'],
    vaccinationCertificateUrl: '#',
    healthInfo: 'Vaccinated',
    owner: {
      id: 'owner_pet_3',
      name: 'Alpha Kennels',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
      isVerified: true
    },
    reviews: [
      { user: 'Bob', comment: 'Magnificent breed!', rating: 5, date: '2024-03-20' }
    ],
    rating: 5.0
  }
];
