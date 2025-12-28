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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 py-4 pt-5 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search services, products, or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full bg-white dark:bg-gray-700 px-4 py-3.5 pl-4 pr-14 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 active:scale-95">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 shadow-sm ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg scale-105"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <Icon className={`h-4 w-4 ${selectedCategory === category.id ? "" : "text-gray-500 dark:text-gray-400"}`} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {/* RFQs Section (if business account) */}
            {hasBusinessAccount && rfqs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    RFQ Opportunities
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold">
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
                      className="group bg-white dark:bg-gray-700 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-lg hover:border-green-400 dark:hover:border-green-600 shadow-md"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex-shrink-0 flex items-center justify-center shadow-sm">
                          <FileText className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1.5 text-base">
                            {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold">
                              {rfq.category || "Category"}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              rfq.open 
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                                : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                            }`}>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Available Services
                  </h2>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold">
                    {filteredServices.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="group bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-600">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1.5 text-base">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold">
                              {service.category || "Service"}
                            </span>
                          </div>
                          {service.price && (
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                              {service.price}
                            </p>
                          )}
                          {service.location && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">{service.location}</span>
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
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg mb-1">
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
