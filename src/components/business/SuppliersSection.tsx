"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  DollarSign,
} from "lucide-react";

const suppliers = [
  {
    id: "SUP-001",
    name: "Fresh Farm Distributors",
    category: "Vegetables & Fruits",
    rating: 4.8,
    location: "California, USA",
    minOrder: "$500",
    deliveryTime: "2-3 days",
    verified: true,
    specialties: ["Organic", "Local", "Seasonal"],
    image: "/idyllic-farm.png",
  },
  {
    id: "SUP-002",
    name: "Premium Meat Co.",
    category: "Meat & Poultry",
    rating: 4.9,
    location: "Texas, USA",
    minOrder: "$1,000",
    deliveryTime: "1-2 days",
    verified: true,
    specialties: ["Premium", "Grass-fed", "Halal"],
    image: "/meat.jpg",
  },
  {
    id: "SUP-003",
    name: "Ocean Fresh Seafood",
    category: "Seafood",
    rating: 4.7,
    location: "Maine, USA",
    minOrder: "$750",
    deliveryTime: "1 day",
    verified: true,
    specialties: ["Fresh", "Sustainable", "Wild-caught"],
    image: "/assorted-seafood-display.png",
  },
];

interface SuppliersSectionProps {
  className?: string;
}

export function SuppliersSection({ className = "" }: SuppliersSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      supplier.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesLocation =
      !selectedLocation ||
      supplier.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="group relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-500" />
              <input
                placeholder="Search suppliers by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-w-[140px] appearance-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-4 pr-8 text-gray-900 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Category</option>
                <option value="vegetables">Vegetables</option>
                <option value="meat">Meat & Poultry</option>
                <option value="seafood">Seafood</option>
                <option value="dairy">Dairy</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="min-w-[120px] appearance-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-4 pr-8 text-gray-900 transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Location</option>
                <option value="local">Local</option>
                <option value="regional">Regional</option>
                <option value="national">National</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-6 py-4 font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Listings */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={supplier.image || "/placeholder.svg"}
                  alt={supplier.name}
                  className="h-20 w-20 rounded-2xl object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                />
                {supplier.verified && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                      {supplier.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {supplier.category}
                    </p>
                  </div>
                  {supplier.verified && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 text-xs font-bold text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {supplier.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {supplier.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {supplier.deliveryTime}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {supplier.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:text-green-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Min Order:{" "}
                      <span className="font-bold text-green-600">
                        {supplier.minOrder}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl">
                      <MessageSquare className="h-4 w-4" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No suppliers found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
}
