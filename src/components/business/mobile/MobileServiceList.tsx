"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Package,
  MapPin,
  Grid,
  FileText,
  DollarSign,
  Store,
  Briefcase,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  location: string;
  image?: string;
  provider?: string;
  status?: string;
}

interface MobileServiceListProps {
  onServiceClick?: (serviceId: string) => void;
  hasBusinessAccount?: boolean;
}

export function MobileServiceList({
  onServiceClick,
  hasBusinessAccount = false,
}: MobileServiceListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<Service[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "All Services", icon: Grid },
    { id: "cleaning", label: "Cleaning", icon: Package },
    { id: "technology", label: "Technology", icon: Briefcase },
    { id: "marketing", label: "Marketing", icon: Package },
    { id: "financial", label: "Financial", icon: DollarSign },
  ];

  useEffect(() => {
    fetchServices();
    if (hasBusinessAccount) {
      fetchRFQs();
    }
  }, [hasBusinessAccount]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Fetch business services from API
      const response = await fetch("/api/queries/business-services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        // Fallback to empty array
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRFQs = async () => {
    try {
      const response = await fetch("/api/queries/rfq-opportunities");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      service.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (serviceId: string) => {
    if (onServiceClick) {
      onServiceClick(serviceId);
    } else {
      router.push(`/plasBusiness/services/${serviceId}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-800">
      {/* Search Bar */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4 py-4 pt-5 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="relative">
          <input
            type="text"
            placeholder="Search services, products, or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white px-4 py-3.5 pl-4 pr-14 text-sm text-gray-900 placeholder-gray-500 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-offset-gray-800"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "scale-105 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-600"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    selectedCategory === category.id
                      ? ""
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading services...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {/* RFQs Section (if business account) */}
            {hasBusinessAccount && rfqs.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    RFQ Opportunities
                  </h2>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    {rfqs.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {rfqs.slice(0, 5).map((rfq) => (
                    <div
                      key={rfq.id}
                      onClick={() => {
                        // RFQ details should be shown in modal, not navigate
                        // This will be handled by the parent component
                        console.log("RFQ clicked:", rfq.id);
                      }}
                      className="group cursor-pointer rounded-xl border-2 border-green-200 bg-white p-4 shadow-md transition-all duration-200 hover:border-green-400 hover:shadow-lg active:scale-[0.98] dark:border-green-800 dark:bg-gray-700 dark:hover:border-green-600"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-sm dark:from-green-900/40 dark:to-emerald-900/40">
                          <FileText className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1.5 truncate text-base font-bold text-gray-900 dark:text-white">
                            {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
                          </h3>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-md bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                              {rfq.category || "Category"}
                            </span>
                            <span
                              className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                                rfq.open
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {rfq.open ? "Open" : "Closed"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {rfq.location || "Location not available"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Section */}
            {filteredServices.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Available Services
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {filteredServices.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-lg active:scale-[0.98] dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-600"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm ring-1 ring-gray-200 dark:from-gray-600 dark:to-gray-700 dark:ring-gray-600">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <Package className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1.5 truncate text-base font-bold text-gray-900 dark:text-white">
                            {service.name}
                          </h3>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-md bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                              {service.category || "Service"}
                            </span>
                          </div>
                          {service.price && (
                            <p className="mb-1.5 text-sm font-bold text-gray-900 dark:text-white">
                              {service.price}
                            </p>
                          )}
                          {service.location && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">
                                {service.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredServices.length === 0 && rfqs.length === 0 && !loading && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="mb-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                  No services found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
