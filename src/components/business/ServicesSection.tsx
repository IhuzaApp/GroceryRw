"use client";

import { useState } from "react";
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

const mockServices = [
  {
    id: "1",
    name: "Professional Cleaning Services",
    description:
      "Complete commercial and residential cleaning services with trained staff and eco-friendly products",
    category: "Cleaning Services",
    provider: "CleanPro Solutions",
    location: "Kigali, Rwanda",
    rating: 4.8,
    reviews: 124,
    priceRange: `${formatCurrencySync(200)} - ${formatCurrencySync(500)}/month`,
    availability: "Available",
    specialties: ["Office Cleaning", "Residential", "Deep Cleaning"],
    contact: "+250 788 123 456",
    email: "info@cleanpro.rw",
    responseTime: "Within 24 hours",
  },
  {
    id: "2",
    name: "IT Support & Maintenance",
    description:
      "Comprehensive IT support, network setup, and maintenance services for small to medium businesses",
    category: "Technology Services",
    provider: "TechSupport Rwanda",
    location: "Kigali, Rwanda",
    rating: 4.9,
    reviews: 89,
    priceRange: `${formatCurrencySync(300)} - ${formatCurrencySync(800)}/month`,
    availability: "Available",
    specialties: ["Network Setup", "Hardware Support", "Software Installation"],
    contact: "+250 789 234 567",
    email: "support@techsupport.rw",
    responseTime: "Within 12 hours",
  },
  {
    id: "3",
    name: "Marketing & Branding Services",
    description:
      "Full-service marketing agency offering branding, digital marketing, and content creation",
    category: "Marketing Services",
    provider: "BrandWorks Agency",
    location: "Kigali, Rwanda",
    rating: 4.7,
    reviews: 156,
    priceRange: `${formatCurrencySync(500)} - ${formatCurrencySync(
      2000
    )}/month`,
    availability: "Available",
    specialties: ["Branding", "Social Media", "Content Creation"],
    contact: "+250 788 345 678",
    email: "hello@brandworks.rw",
    responseTime: "Within 48 hours",
  },
  {
    id: "4",
    name: "Accounting & Bookkeeping",
    description:
      "Professional accounting services including bookkeeping, tax preparation, and financial consulting",
    category: "Financial Services",
    provider: "FinancePro Consultants",
    location: "Kigali, Rwanda",
    rating: 4.6,
    reviews: 67,
    priceRange: `${formatCurrencySync(400)} - ${formatCurrencySync(
      1000
    )}/month`,
    availability: "Available",
    specialties: ["Bookkeeping", "Tax Preparation", "Financial Consulting"],
    contact: "+250 789 456 789",
    email: "contact@financepro.rw",
    responseTime: "Within 24 hours",
  },
];

interface ServicesSectionProps {
  onRequestQuotation?: (serviceId: string) => void;
}

export function ServicesSection({ onRequestQuotation }: ServicesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const categories = [
    "all",
    "Cleaning Services",
    "Technology Services",
    "Marketing Services",
    "Financial Services",
    "Security Services",
    "Legal Services",
  ];

  const filteredServices = mockServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-6"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
                  {service.category}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {service.rating}
                </span>
              </div>
            </div>

            <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {service.description}
            </p>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3.5 w-3.5" />
                <span>{service.provider}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{service.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{service.priceRange}</span>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {service.specialties.slice(0, 3).map((specialty, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {specialty}
                </span>
              ))}
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
                onClick={() => handleRequestQuotation(service.id)}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
              >
                Request Quote
              </button>
            </div>
          </div>
        ))}
      </div>

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
                  {selectedService.name}
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
                  {selectedService.provider}
                </p>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedService.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.category}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Price Range
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.priceRange}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.location}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Response Time
                  </h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedService.responseTime}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedService.specialties.map(
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

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span>{selectedService.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span>{selectedService.email}</span>
                  </div>
                </div>
              </div>

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
