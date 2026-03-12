"use client";

import { useState, useEffect } from "react";
import { X, Search, Store, ArrowRight, Loader2, Briefcase, ChevronLeft, MapPin, Calendar, DollarSign, Package, Clock, Info, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";

interface BusinessOpportunitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RFQOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  min_budget: string;
  max_budget: string;
  location: string;
  response_date: string;
  urgency_level: string;
  estimated_quantity: string;
  business_account: {
    business_name: string | null;
  } | null;
}

interface BusinessService {
  id: string;
  name: string;
  Description: string | null;
  Image: string | null;
  price: string;
  unit: string;
  speciality: string | null;
  delveryArea: string | null;
}

type TabType = "rfqs" | "services";

export default function BusinessOpportunitiesDrawer({ isOpen, onClose }: BusinessOpportunitiesDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("rfqs");
  const [searchTerm, setSearchTerm] = useState("");
  const [rfqs, setRfqs] = useState<RFQOpportunity[]>([]);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: TabType; data: any } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "rfqs" && rfqs.length === 0) fetchRfqs();
      if (activeTab === "services" && services.length === 0) fetchServices();
    }
  }, [isOpen, activeTab]);

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/queries/rfq-opportunities");
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      }
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/queries/business-services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else if (response.status === 401) {
        // Handle unauthorized - maybe show a message or redirect later
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeTab === "rfqs" 
    ? rfqs.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.Description && s.Description.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleApply = (type: TabType, id: string) => {
    const redirectPath = `/plasBusiness?action=apply&type=${type}&id=${id}`;
    router.push(`/Auth/Login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const renderList = () => (
    <div className="flex-1 overflow-y-auto p-6">
      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00A67E]" />
          <p className="text-sm font-medium text-gray-400">Loading {activeTab === "rfqs" ? "opportunities" : "services"}...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem({ type: activeTab, data: item })}
              className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#00A67E]/20 hover:shadow-xl hover:shadow-[#00A67E]/5 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeTab === "rfqs" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-[#00A67E]"}`}>
                    {activeTab === "rfqs" ? <Briefcase className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#00A67E] transition-colors">
                      {activeTab === "rfqs" ? (item as RFQOpportunity).title : (item as BusinessService).name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeTab === "rfqs" 
                        ? (item as RFQOpportunity).business_account?.business_name || "Enterprise User" 
                        : (item as BusinessService).speciality || "General Service"}
                    </p>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${activeTab === "rfqs" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-[#00A67E]"}`}>
                  {activeTab === "rfqs" ? (item as RFQOpportunity).urgency_level : "Active"}
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-gray-600 leading-relaxed">
                {activeTab === "rfqs" ? (item as RFQOpportunity).description : (item as BusinessService).Description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeTab === "rfqs" ? (item as RFQOpportunity).location : (item as BusinessService).delveryArea || "Global"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign className="h-3.5 w-3.5" />
                    {activeTab === "rfqs" ? `${(item as RFQOpportunity).min_budget} - ${(item as RFQOpportunity).max_budget}` : (item as BusinessService).price}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#00A67E] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center gap-3 text-center text-gray-400">
          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
             {activeTab === "rfqs" ? <Briefcase className="h-8 w-8 opacity-20" /> : <Store className="h-8 w-8 opacity-20" />}
          </div>
          <p className="text-sm font-medium">No {activeTab} found matching your search.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="text-xs text-[#00A67E] font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedItem) return null;
    const { type, data } = selectedItem;

    return (
      <div className="flex h-full flex-col overflow-y-auto bg-white">
        {/* Detail Header */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white/80 p-6 backdrop-blur-md">
          <button
            onClick={() => setSelectedItem(null)}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-[#00A67E] hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-black text-[#1A1A1A]">Details</h2>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${type === "rfqs" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-[#00A67E]"}`}>
              {type === "rfqs" ? "RFQ Opportunity" : "Business Service"}
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight mb-4">
              {type === "rfqs" ? (data as RFQOpportunity).title : (data as BusinessService).name}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {type === "rfqs" ? (data as RFQOpportunity).description : (data as BusinessService).Description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Info</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#00A67E]" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Location</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{type === "rfqs" ? (data as RFQOpportunity).location : (data as BusinessService).delveryArea || "Available Nationwide"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-[#00A67E]" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{type === "rfqs" ? "Budget Range" : "Pricing"}</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{type === "rfqs" ? `${(data as RFQOpportunity).min_budget} - ${(data as RFQOpportunity).max_budget}` : `${(data as BusinessService).price} per ${(data as BusinessService).unit}`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{type === "rfqs" ? "Execution" : "Provider"}</h4>
               <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#00A67E]" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{type === "rfqs" ? "Deadline" : "Speciality"}</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{type === "rfqs" ? (data as RFQOpportunity).response_date : (data as BusinessService).speciality || "Standard Service"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#00A67E]" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">Available for response</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#022C23] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Interested in this?</h3>
              <p className="text-emerald-100/80 mb-6 max-w-md">Join over 5,000 businesses on Plas and start growing your revenue today. It takes less than 2 minutes to get started.</p>
              <button
                onClick={() => handleApply(type, data.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-black text-[#022C23] transition-transform hover:scale-105 active:scale-95"
              >
                Apply Correct Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
              <Briefcase className="h-64 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1000000] bg-black/70 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[1000001] w-full max-w-2xl transform bg-white shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {selectedItem ? (
            renderDetail()
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-gray-100 p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Business Opportunities</h2>
                    <p className="text-gray-500 mt-1">Discover live RFQs and expert business services</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl mb-8">
                  <button
                    onClick={() => setActiveTab("rfqs")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                      activeTab === "rfqs" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Briefcase className={`h-5 w-5 ${activeTab === "rfqs" ? "text-blue-500" : "text-gray-400"}`} />
                    RFQ Opportunities
                  </button>
                  <button
                    onClick={() => setActiveTab("services")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                      activeTab === "services" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Package className={`h-5 w-5 ${activeTab === "services" ? "text-emerald-500" : "text-gray-400"}`} />
                    Business Services
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === "rfqs" ? "RFQ opportunities" : "business services"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-5 pl-14 pr-6 text-base font-medium focus:border-[#00A67E] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00A67E]/5 transition-all"
                  />
                </div>
              </div>

              {/* List */}
              {renderList()}

              {/* Footer */}
              <div className="border-t border-gray-100 p-8 bg-gray-50/30">
                <div className="flex items-center justify-between gap-6">
                   <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Merchant" width={40} height={40} />
                      </div>
                    ))}
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-[#022C23] flex items-center justify-center text-[10px] font-bold text-white">
                      +5k
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/Auth/Login?redirect=/plasBusiness")}
                    className="group relative flex items-center gap-2 rounded-2xl bg-[#022C23] px-8 py-4 font-black text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Post Your Own
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
