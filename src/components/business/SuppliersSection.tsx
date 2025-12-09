"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  minOrder: string;
  deliveryTime: string;
  verified: boolean;
  specialties: string[];
  image: string;
}

interface SuppliersSectionProps {
  className?: string;
}

export function SuppliersSection({ className = "" }: SuppliersSectionProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/all-businesses");
      if (response.ok) {
        const data = await response.json();
        // Transform business accounts to supplier format
        const transformedSuppliers: Supplier[] = (data.businesses || []).map(
          (business: any) => {
            // Handle image - could be base64 or URL
            let imageUrl = "/images/shop-placeholder.jpg";
            if (business.face_image) {
              if (
                business.face_image.startsWith("data:") ||
                business.face_image.startsWith("http")
              ) {
                imageUrl = business.face_image;
              } else {
                imageUrl = business.face_image;
              }
            }

            return {
              id: business.id,
              name: business.business_name || "Unknown Business",
              category: business.account_type || "General",
              rating: 4.5, // Default rating - can be enhanced later with actual ratings
              location: business.business_location || "Not specified",
              minOrder: formatCurrencySync(0), // Default - can be enhanced with actual min order data
              deliveryTime: "Contact for details", // Default - can be enhanced with actual delivery data
              verified:
                business.status === "approved" ||
                business.status === "active" ||
                business.status === "pending_review",
              specialties: business.account_type
                ? [
                    business.account_type.charAt(0).toUpperCase() +
                      business.account_type.slice(1),
                  ]
                : [],
              image: imageUrl,
            };
          }
        );
        setSuppliers(transformedSuppliers);
      } else {
        const errorData = await response.json();
        toast.error("Failed to load suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

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
    <div className={`space-y-4 sm:space-y-6 md:space-y-8 ${className}`}>
      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-500 sm:left-4 sm:h-5 sm:w-5" />
              <input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:rounded-2xl sm:py-3 sm:pl-12 sm:pr-4 sm:text-base sm:focus:ring-4 md:py-4"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pr-7 text-sm text-gray-900 transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:min-w-[140px] sm:rounded-2xl sm:px-4 sm:py-3 sm:pr-8 sm:text-base sm:focus:ring-4 md:py-4"
              >
                <option value="">All Categories</option>
                <option value="business">Business</option>
                <option value="supplier">Supplier</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <svg
                  className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4"
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
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pr-7 text-sm text-gray-900 transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:min-w-[120px] sm:rounded-2xl sm:px-4 sm:py-3 sm:pr-8 sm:text-base sm:focus:ring-4 md:py-4"
              >
                <option value="">Location</option>
                <option value="local">Local</option>
                <option value="regional">Regional</option>
                <option value="national">National</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <svg
                  className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4"
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
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base md:py-4">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">More Filters</span>
              <span className="sm:hidden">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading suppliers...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="group rounded-xl border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-6 sm:hover:-translate-y-2 sm:hover:shadow-2xl md:p-8"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={supplier.image || "/images/shop-placeholder.jpg"}
                    alt={supplier.name}
                    className="h-16 w-16 rounded-xl object-cover shadow-md transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20 sm:rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/shop-placeholder.jpg";
                    }}
                  />
                  {supplier.verified && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5 sm:-right-2 sm:-top-2 sm:p-1">
                      <CheckCircle className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>
                <div className="w-full flex-1 space-y-3 sm:space-y-4">
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white sm:text-xl">
                        {supplier.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                        {supplier.category}
                      </p>
                    </div>
                    {supplier.verified && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-0.5 text-xs font-bold text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200 sm:px-3 sm:py-1">
                        <CheckCircle className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm md:gap-6">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {supplier.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-green-500 sm:h-4 sm:w-4" />
                      <span className="truncate text-gray-600 dark:text-gray-400">
                        {supplier.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 sm:h-4 sm:w-4" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {supplier.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {supplier.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:text-green-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 sm:px-3 sm:py-1"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700 sm:flex-row sm:items-center sm:gap-0 sm:pt-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-green-500 sm:h-4 sm:w-4" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 sm:text-sm">
                        Min Order:{" "}
                        <span className="font-bold text-green-600">
                          {supplier.minOrder}
                        </span>
                      </span>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
                      <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex-none sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>View</span>
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl sm:flex-none sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm" style={{ color: "#ffffff" }}>
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#ffffff" }} />
                        <span style={{ color: "#ffffff" }}>Contact</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredSuppliers.length === 0 && (
        <div className="py-8 text-center sm:py-12">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
            <Search className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white sm:mb-2 sm:text-lg">
            No suppliers found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
}
