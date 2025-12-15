"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Store, Plus, ExternalLink } from "lucide-react";
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
    <div className={`rounded-xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-6 ${className}`}>
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
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
        </div>
      ) : userStores.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userStores.map((store) => (
            <div
              key={store.id}
              className="group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              onClick={() => handleViewStore(store.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Store className="h-5 w-5 text-green-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {store.name}
                    </h5>
                  </div>
                  {store.description && (
                    <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {store.description}
                    </p>
                  )}
                  {store.latitude && store.longitude && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      📍 Location: {store.latitude}, {store.longitude}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        store.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {store.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
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

