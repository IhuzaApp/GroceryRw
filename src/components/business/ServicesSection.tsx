"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Star,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface ServicesSectionProps {
  onRequestQuotation?: (serviceId: string) => void;
}

export function ServicesSection({ onRequestQuotation }: ServicesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/business-services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories from services
  const categories = [
    "all",
    ...Array.from(
      new Set(services.map((s) => s.category || s.service_category).filter(Boolean))
    ),
  ];

  const filteredServices = services.filter((service) => {
    const serviceName = service.name || service.service_name || "";
    const serviceDescription = service.description || service.service_description || "";
    const providerName = service.provider_name || service.business_name || "";
    const serviceCategory = service.category || service.service_category || "";

    const matchesSearch =
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleRequestQuotation = (serviceId: string) => {
    if (onRequestQuotation) {
      onRequestQuotation(serviceId);
    } else {
      toast.success(
        "Quotation request sent! The service provider will contact you soon."
      );
      setIsServiceModalOpen(false);
    }
  };

  const handleContactProvider = (service: any) => {
    // Open contact options
    toast.success(`Contacting ${service.provider}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Available Services
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Browse and request quotations from service providers
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              style={
                selectedCategory === category ? { color: "#ffffff" } : undefined
              }
            >
              {category === "all" ? "All Categories" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6"
            >
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 space-y-2">
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Services Grid */
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const serviceName = service.name || service.service_name || "Unnamed Service";
            const serviceDescription = service.description || service.service_description || "";
            const providerName = service.provider_name || service.business_name || "Unknown Provider";
            const serviceCategory = service.category || service.service_category || "Uncategorized";
            const location = service.location || service.service_location || "Not specified";
            const priceRange = service.price_range || service.priceRange || "Contact for pricing";
            const rating = service.rating || service.average_rating || 0;
            const serviceId = service.id || service.service_id;

            return (
              <div
                key={serviceId}
                className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {serviceName}
                    </h3>
                    <p className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
                      {serviceCategory}
                    </p>
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {serviceDescription}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    <span>{providerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{priceRange}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewService(service)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Eye className="mr-1 inline h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleRequestQuotation(serviceId)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredServices.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No services found
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Service Details Modal */}
      {isServiceModalOpen && selectedService && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="sticky top-0 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {selectedService.name || selectedService.service_name || "Service Details"}
                </h3>
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  className="rounded-full p-1 text-white transition-colors hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Service Provider
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedService.provider_name || selectedService.business_name || "Unknown Provider"}
                </p>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedService.description || selectedService.service_description || "No description available"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.category || selectedService.service_category || "Uncategorized"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Price Range
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.price_range || selectedService.priceRange || "Contact for pricing"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.location || selectedService.service_location || "Not specified"}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Response Time
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.response_time || selectedService.responseTime || "Contact provider"}
                  </p>
                </div>
              </div>

              {(selectedService.specialties || selectedService.skills) && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedService.specialties || selectedService.skills || []).map(
                      (specialty: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {specialty}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {(selectedService.contact || selectedService.email || selectedService.phone) && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {selectedService.contact && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4" />
                        <span>{selectedService.contact}</span>
                      </div>
                    )}
                    {selectedService.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4" />
                        <span>{selectedService.phone}</span>
                      </div>
                    )}
                    {selectedService.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span>{selectedService.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => handleContactProvider(selectedService)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <MessageSquare className="mr-1 inline h-4 w-4" />
                  Contact Provider
                </button>
                <button
                  onClick={() => handleRequestQuotation(selectedService.id)}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600"
                  style={{ color: "#ffffff" }}
                >
                  <span style={{ color: "#ffffff" }}>Request Quotation</span>
                  <ArrowRight
                    className="ml-1 inline h-4 w-4"
                    style={{ color: "#ffffff" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
