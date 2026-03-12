"use client";

import { useState, useEffect } from "react";
import { X, Search, Store, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface SampleStoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessStore {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

const dummyStores: BusinessStore[] = [
  { id: "au-1", name: "Sydney Harbour Boutique", description: "Premium fashion from the heart of Australia.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8" },
  { id: "au-2", name: "Melbourne Tech Hub", description: "Latest gadgets and electronics in Oz.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { id: "et-1", name: "Addis Coffee Roasters", description: "Authentic Ethiopian Yirgacheffe and Sidamo beans.", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" },
  { id: "et-2", name: "Lalibela Artisan Crafts", description: "Handmade traditional Ethiopian pottery and textiles.", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38" },
  { id: "et-3", name: "Abyssinian Spices", description: "Organic Berbere and exotic spices from Ethiopia.", image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11" },
  { id: "uk-1", name: "London Organic Market", description: "Fresh farm-to-table produce in the UK capital.", image: "https://images.unsplash.com/photo-1488459711635-de86a6c9b63d" },
  { id: "uk-2", name: "Manchester Vintage Gear", description: "Curated vintage clothing and accessories.", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f" },
  { id: "uk-3", name: "Edinburgh Woolen Mills", description: "Quality Scottish wool and cashmere products.", image: "https://images.unsplash.com/photo-1444491741275-3747c03c996a" },
  { id: "gb-1", name: "British Tea Emporium", description: "Fine English breakfast and herbal blends.", image: "https://images.unsplash.com/photo-1544787210-22bbd4838383" },
  { id: "au-3", name: "Outback Adventure Gear", description: "Durable camping and hiking equipment from Sydney.", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4" },
];

export default function SampleStoreDrawer({ isOpen, onClose }: SampleStoreDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<BusinessStore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
    }
  }, [isOpen]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/queries/all-stores");
      if (response.ok) {
        const data = await response.json();
        setStores([...dummyStores, ...(data.stores || [])]);
      } else {
        setStores(dummyStores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores(dummyStores);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        className={`fixed inset-y-0 right-0 z-[1000001] w-full max-w-md transform bg-white shadow-2xl transition-transform duration-500 ease-out sm:w-1/2 md:w-[450px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-100 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A]">Sample Stores</h2>
                <p className="text-sm text-gray-500">Explore businesses already on Plas</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search business stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm focus:border-[#00A67E] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00A67E]/5"
              />
            </div>
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex h-40 flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#00A67E]" />
                <p className="text-sm font-medium text-gray-400">Loading live stores...</p>
              </div>
            ) : filteredStores.length > 0 ? (
              <div className="grid gap-4">
                {filteredStores.map((store) => (
                  <div
                    key={store.id}
                    className="group relative flex items-center gap-4 rounded-2xl border border-gray-50 bg-white p-4 transition-all hover:border-[#00A67E]/20 hover:shadow-xl hover:shadow-[#00A67E]/5"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-emerald-50">
                      {store.image ? (
                        <Image
                          src={store.image}
                          alt={store.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Store className="h-8 w-8 text-[#00A67E]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#00A67E]">
                        {store.name}
                      </h3>
                      <p className="line-clamp-1 text-xs text-gray-500">
                        {store.description || "Verified Business on Plas"}
                      </p>
                    </div>
                    <button className="rounded-full bg-gray-50 p-2 text-gray-400 transition-colors group-hover:bg-[#00A67E]/10 group-hover:text-[#00A67E]">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-gray-400">
                <Store className="h-12 w-12 opacity-20" />
                <p className="text-sm">No stores found matching your search.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6 bg-gray-50/50">
            <button
              onClick={() => (window.location.href = "/Auth/Login?redirect=/plasBusiness")}
              className="w-full rounded-2xl bg-[#022C23] py-5 font-black text-white shadow-xl shadow-emerald-900/20 transition-transform active:scale-95"
            >
              Start Your Own Store
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
