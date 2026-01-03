"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Store, Plus, ExternalLink, MapPin, Eye } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface StoresSectionProps {
  businessAccount?: any;
  className?: string;
}

export function StoresSection({
  businessAccount,
  className = "",
}: StoresSectionProps) {
  const router = useRouter();
  const [userStores, setUserStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  useEffect(() => {
    if (businessAccount?.id) {
      fetchUserStores();
    }
  }, [businessAccount]);

  const fetchUserStores = async () => {
    if (!businessAccount?.id) {
      setUserStores([]);
      return;
    }

    setLoadingStores(true);
    try {
      const response = await fetch("/api/queries/business-stores");
      if (response.ok) {
        const data = await response.json();
        setUserStores(data.stores || []);
      } else {
        setUserStores([]);
      }
    } catch (error) {
      toast.error("Failed to load stores");
      setUserStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleCreateStore = () => {
    router.push("/plasBusiness/store/create");
  };

  const handleViewStore = (storeId: string) => {
    router.push(`/plasBusiness/store/${storeId}`);
  };

  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Stores
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your stores and view their performance
          </p>
        </div>
        <button
          onClick={handleCreateStore}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
          style={{ color: "#ffffff" }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Store</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {loadingStores ? (
        <div className="grid grid-cols-1 gap-6 animate-pulse sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-700 sm:h-40 md:h-48"></div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : userStores.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userStores.map((store) => (
            <div
              key={store.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
              onClick={() => handleViewStore(store.id)}
            >
              {/* Store Image Section */}
              <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 sm:h-40 md:h-48">
                {store.image ? (
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Store className="h-16 w-16 text-green-300 dark:text-green-600" />
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold shadow-lg backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs ${
                      store.is_active
                        ? "bg-green-500/90 text-white dark:bg-green-600/90"
                        : "bg-gray-500/90 text-white dark:bg-gray-600/90"
                    }`}
                  >
                    {store.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Store Icon Badge */}
                <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 sm:left-3 sm:top-3 sm:h-10 sm:w-10">
                  <Store className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
                </div>

                {/* View Button - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                  <div className="translate-y-4 rounded-full bg-white/90 px-3 py-1.5 opacity-0 shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800/90 sm:px-4 sm:py-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 sm:h-4 sm:w-4" />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                        View Store
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Info Section */}
              <div className="p-3 sm:p-4 md:p-5">
                <h5 className="mb-1.5 line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400 sm:mb-2 sm:text-lg">
                  {store.name}
                </h5>

                {store.description && (
                  <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:mb-3 sm:text-sm">
                    {store.description}
                  </p>
                )}

                {/* Location Info */}
                {store.latitude && store.longitude && (
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-500 sm:mb-3 sm:gap-2 sm:text-xs">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="line-clamp-1">
                      {store.latitude.substring(0, 8)},{" "}
                      {store.longitude.substring(0, 8)}
                    </span>
                  </div>
                )}

                {/* Action Footer */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700 sm:mt-4 sm:pt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 sm:gap-2 sm:text-xs">
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </div>
                  <div className="rounded-full bg-green-100 p-1 transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-900/50 sm:p-1.5">
                    <ExternalLink className="h-3 w-3 text-green-600 dark:text-green-400 sm:h-3.5 sm:w-3.5" />
                  </div>
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No stores yet
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create your first store to start selling
          </p>
          <button
            onClick={handleCreateStore}
            className="mt-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
            style={{ color: "#ffffff" }}
          >
            <span style={{ color: "#ffffff" }}>Create Your First Store</span>
          </button>
        </div>
      )}
    </div>
  );
}
