"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  ArrowLeft,
  Store,
  Plus,
  Package,
  MapPin,
  Clock,
  Image as ImageIcon,
  Camera,
  X,
  Check,
} from "lucide-react";
import RootLayout from "../../../src/components/ui/layout";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import toast from "react-hot-toast";
import CameraCapture from "../../../src/components/ui/CameraCapture";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";

export default function StoreDetailsPage() {
  const router = useRouter();
  const { storeId } = router.query;
  const { isLoggedIn, authReady } = useAuth();
  const { theme } = useTheme();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [queryId, setQueryId] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string>("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
  });

  useEffect(() => {
    if (authReady && !isLoggedIn) {
      router.push("/Auth/Login");
    }
  }, [authReady, isLoggedIn, router]);

  useEffect(() => {
    if (storeId && authReady && isLoggedIn) {
      fetchStoreDetails();
      fetchProducts();
    }
  }, [storeId, authReady, isLoggedIn]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`/api/queries/business-store?storeId=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setStore(data.store);
      } else {
        toast.error("Failed to load store details");
        router.push("/plasBusiness");
      }
    } catch (error) {
      toast.error("Failed to load store details");
      router.push("/plasBusiness");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/queries/business-products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      // Silently fail - products are optional
    }
  };

  const handleAddProduct = async () => {
    // First, generate a unique query ID
    try {
      const queryResponse = await fetch("/api/queries/generate-product-query-id", {
        method: "POST",
      });

      if (!queryResponse.ok) {
        toast.error("Failed to generate verification ID");
        return;
      }

      const queryData = await queryResponse.json();
      setQueryId(queryData.queryId);
      setShowAddProductModal(true);
    } catch (error) {
      toast.error("Failed to generate verification ID");
    }
  };

  const handleImageCapture = (imageDataUrl: string) => {
    setProductImage(imageDataUrl);
    setShowCamera(false);
  };

  const handleSubmitProduct = async () => {
    if (!queryId) {
      toast.error("Verification ID is missing. Please try again.");
      return;
    }

    if (!productImage) {
      toast.error("Please capture a product image");
      return;
    }

    if (!newProduct.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!newProduct.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!newProduct.price.trim()) {
      toast.error("Product price is required");
      return;
    }

    if (!newProduct.unit.trim()) {
      toast.error("Product unit is required");
      return;
    }

    setIsCreatingProduct(true);

    try {
      const response = await fetch("/api/mutations/create-business-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          image: productImage,
          price: newProduct.price,
          unit: newProduct.unit,
          status: "active",
          query_id: queryId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Product added successfully!");
        setShowAddProductModal(false);
        setNewProduct({ name: "", description: "", price: "", unit: "" });
        setProductImage("");
        setQueryId(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add product");
      }
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  if (!authReady || loading) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (!store) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Store not found</p>
        </div>
      </RootLayout>
    );
  }

  // Helper function to sanitize image src
  const sanitizeSrc = (src: string | null | undefined): string => {
    if (!src) return "/images/shop-placeholder.jpg";
    if (src.startsWith("http")) return src;
    return src;
  };

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
        {/* Mobile Header - Full width cover image with circular logo */}
        <div
          className="relative h-32 w-full sm:hidden"
          style={{
            marginTop: "-44px",
            marginLeft: "-16px",
            marginRight: "-16px",
            width: "calc(100% + 32px)",
          }}
        >
          {/* Store Cover Image */}
          {store.image ? (
            <Image
              src={sanitizeSrc(store.image)}
              alt={store.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-600" />
          )}

          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

          {/* Back Button */}
          <button
            onClick={() => router.push("/plasBusiness")}
            className="absolute left-4 top-7 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4 !text-white" />
          </button>

          {/* Store Status Badge */}
          <div className="absolute right-4 top-7 z-20">
            <div
              className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${
                store.is_active
                  ? "bg-green-500/90 !text-white"
                  : "bg-red-500/90 !text-white"
              }`}
            >
              {store.is_active ? "Active" : "Inactive"}
            </div>
          </div>

          {/* Store Logo - Circular at bottom left */}
          {store.image && (
            <div className="absolute -bottom-4 left-3 z-50">
              <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-green-500 shadow-lg">
                <Image
                  src={sanitizeSrc(store.image)}
                  alt={`${store.name} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Store Info Overlay - Center */}
          <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-center">
            {/* Store Name */}
            <h1 
              className="mb-1 text-xl font-bold drop-shadow-lg"
              style={{ color: "#ffffff" }}
            >
              {store.name}
            </h1>

            {/* Store Details */}
            {store.description && (
              <p 
                className="text-xs line-clamp-1"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                {store.description}
              </p>
            )}
          </div>
        </div>

        {/* Desktop Banner - Hidden on mobile */}
        <div className="relative hidden sm:block">
          {/* Hero Banner */}
          <div className="relative h-40 overflow-hidden sm:h-48 lg:h-56">
            {store.image ? (
              <Image
                src={sanitizeSrc(store.image)}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-600" />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80" />

            {/* Back Button */}
            <button
              onClick={() => router.push("/plasBusiness")}
              className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Store Info Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
                  {/* Store Logo */}
                  {store.image && (
                    <div className="mb-4 sm:mb-0 sm:mr-6">
                      <div className="relative">
                        <Image
                          src={sanitizeSrc(store.image)}
                          alt={`${store.name} logo`}
                          width={100}
                          height={100}
                          className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-2xl sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                        />
                        {/* Status Indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white shadow-lg ${
                            store.is_active ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Store Details */}
                  <div className="flex-1" style={{ color: "#ffffff" }}>
                    <h1 
                      className="text-2xl font-bold sm:text-3xl lg:text-4xl"
                      style={{ color: "#ffffff" }}
                    >
                      {store.name}
                    </h1>
                    {store.description && (
                      <p 
                        className="mt-2 text-sm sm:text-base"
                        style={{ color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        {store.description}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {store.latitude && store.longitude && (
                        <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                          <MapPin className="mr-1.5 h-4 w-4" style={{ color: "#ffffff" }} />
                          <span className="text-xs sm:text-sm" style={{ color: "#ffffff" }}>
                            {store.latitude}, {store.longitude}
                          </span>
                        </div>
                      )}

                      {store.operating_hours && (
                        <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                          <Clock className="mr-1.5 h-4 w-4" style={{ color: "#ffffff" }} />
                          <span className="text-xs sm:text-sm" style={{ color: "#ffffff" }}>Custom hours</span>
                        </div>
                      )}

                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <Store className="mr-1.5 h-4 w-4" style={{ color: "#ffffff" }} />
                        <span className="text-xs sm:text-sm" style={{ color: "#ffffff" }}>
                          {store.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing for mobile logo */}
        <div className="h-8 sm:hidden"></div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Products Section */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Products & Services
            </h2>
            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm md:text-base"
              style={{ color: "#ffffff" }}
            >
              <Plus 
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" 
                style={{ color: "#ffffff" }}
              />
              <span 
                className="hidden sm:inline" 
                style={{ color: "#ffffff" }}
              >
                Add Product
              </span>
              <span 
                className="sm:hidden" 
                style={{ color: "#ffffff" }}
              >
                Add
              </span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                No products yet. Add your first product to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                >
                  {product.Image && (
                    <div className="h-48 bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.Image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {product.Description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrencySync(parseFloat(product.price))}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        / {product.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Add New Product
              </h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setNewProduct({ name: "", description: "", price: "", unit: "" });
                  setProductImage("");
                  setQueryId(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              {queryId && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium mb-1">
                    Verification ID Generated
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 font-mono">
                    {queryId}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-2">
                    Use this ID when taking the product photo for verification.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    placeholder="e.g., kg, piece, box"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image *
                </label>
                {productImage ? (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setProductImage("")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors"
                  >
                    <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Capture Product Image
                    </span>
                    {queryId && (
                      <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Verification ID: {queryId.substring(0, 8)}...
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddProductModal(false);
                    setNewProduct({ name: "", description: "", price: "", unit: "" });
                    setProductImage("");
                    setQueryId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProduct}
                  disabled={isCreatingProduct}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {isCreatingProduct ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleImageCapture}
        cameraType="environment"
        title="Capture Product Image"
      />
    </RootLayout>
  );
}

