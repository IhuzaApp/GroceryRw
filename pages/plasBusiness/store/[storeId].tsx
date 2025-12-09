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
  Edit,
  ShoppingCart,
  Truck,
  Tag,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RootLayout from "../../../src/components/ui/layout";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import toast from "react-hot-toast";
import CameraCapture from "../../../src/components/ui/CameraCapture";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import { RichTextEditor } from "../../../src/components/ui/RichTextEditor";

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
  const [isGeneratingQueryId, setIsGeneratingQueryId] = useState(false);
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 18;

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    minimumOrders: "0",
    maxOrders: "",
    deliveryArea: "",
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
      fetchBusinessAccount();
    }
  }, [storeId, authReady, isLoggedIn]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(
        `/api/queries/business-store?storeId=${storeId}`
      );
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

  const fetchBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        if (data.hasAccount && data.account) {
          setBusinessAccountId(data.account.id);
        }
      }
    } catch (error) {
      // Silently fail - business account ID is optional
    }
  };

  const fetchProducts = async () => {
    if (!storeId) return;
    try {
      const response = await fetch(
        `/api/queries/business-products?store_id=${storeId}`
      );
      if (response.ok) {
        const data = await response.json();
        const fetchedProducts = data.products || [];
        setAllProducts(fetchedProducts);
        setProducts(fetchedProducts);
      }
    } catch (error) {
      // Silently fail - products are optional
    }
  };

  // Filter products based on search query
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(allProducts);
      setCurrentPage(1); // Reset to first page when search is cleared
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const description = (product.Description || "").toLowerCase();
      const price = (product.price || "").toLowerCase();
      const unit = (product.unit || "").toLowerCase();
      const queryId = (product.query_id || "").toLowerCase();
      const deliveryArea = (product.delveryArea || "").toLowerCase();
      const speciality = (product.speciality || "").toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        price.includes(query) ||
        unit.includes(query) ||
        queryId.includes(query) ||
        deliveryArea.includes(query) ||
        speciality.includes(query)
      );
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, allProducts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Update displayed products based on pagination
  useEffect(() => {
    setProducts(currentProducts);
  }, [currentPage, filteredProducts]);

  const handleAddProduct = async () => {
    setEditingProduct(null);
    // First, generate a unique query ID
    setIsGeneratingQueryId(true);
    try {
      const queryResponse = await fetch(
        "/api/queries/generate-product-query-id",
        {
          method: "POST",
        }
      );

      if (!queryResponse.ok) {
        toast.error("Failed to generate verification ID");
        setIsGeneratingQueryId(false);
        return;
      }

      const queryData = await queryResponse.json();
      setQueryId(queryData.queryId);
      setShowAddProductModal(true);
      setIsGeneratingQueryId(false);
    } catch (error) {
      toast.error("Failed to generate verification ID");
      setIsGeneratingQueryId(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setQueryId(null); // No query ID needed for editing
    setNewProduct({
      name: product.name || "",
      description: product.Description || "",
      price: product.price || "",
      unit: product.unit || "",
      minimumOrders: product.minimumOrders || "0",
      maxOrders: product.maxOrders || "",
      deliveryArea: product.delveryArea || "",
    });
    setProductImage(product.Image || "");
    setShowAddProductModal(true);
  };

  const handleImageCapture = (imageDataUrl: string) => {
    setProductImage(imageDataUrl);
    setShowCamera(false);
  };

  const handleSubmitProduct = async () => {
    if (!editingProduct) {
      // Creating new product - query ID required
      if (!queryId) {
        toast.error("Verification ID is missing. Please try again.");
        return;
      }
    }

    if (!productImage) {
      toast.error("Please capture a product image");
      return;
    }

    if (!newProduct.name.trim()) {
      toast.error("Product name is required");
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

    if (!newProduct.minimumOrders || newProduct.minimumOrders.trim() === "") {
      toast.error("Minimum orders is required");
      return;
    }

    setIsCreatingProduct(true);

    try {
      const url = editingProduct
        ? "/api/mutations/update-business-product"
        : "/api/mutations/create-business-product";

      const method = editingProduct ? "PUT" : "POST";

      const body: any = {
        name: newProduct.name,
        description: newProduct.description,
        image: productImage,
        price: newProduct.price,
        unit: newProduct.unit,
        status: "active",
        minimumOrders: newProduct.minimumOrders || "0",
        maxOrders: newProduct.maxOrders || "",
        delveryArea: newProduct.deliveryArea || "",
        store_id: storeId as string,
        Plasbusiness_id: businessAccountId || "",
      };

      if (editingProduct) {
        body.product_id = editingProduct.id;
      } else {
        body.query_id = queryId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          editingProduct
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        setShowAddProductModal(false);
        setEditingProduct(null);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          unit: "",
          minimumOrders: "0",
          maxOrders: "",
          deliveryArea: "",
        });
        setProductImage("");
        setQueryId(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message ||
            (editingProduct
              ? "Failed to update product"
              : "Failed to add product")
        );
      }
    } catch (error) {
      toast.error(
        editingProduct ? "Failed to update product" : "Failed to add product"
      );
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
                className="line-clamp-1 text-xs"
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
                          <MapPin
                            className="mr-1.5 h-4 w-4"
                            style={{ color: "#ffffff" }}
                          />
                          <span
                            className="text-xs sm:text-sm"
                            style={{ color: "#ffffff" }}
                          >
                            {store.latitude}, {store.longitude}
                          </span>
                        </div>
                      )}

                      {store.operating_hours && (
                        <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                          <Clock
                            className="mr-1.5 h-4 w-4"
                            style={{ color: "#ffffff" }}
                          />
                          <span
                            className="text-xs sm:text-sm"
                            style={{ color: "#ffffff" }}
                          >
                            Custom hours
                          </span>
                        </div>
                      )}

                      <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <Store
                          className="mr-1.5 h-4 w-4"
                          style={{ color: "#ffffff" }}
                        />
                        <span
                          className="text-xs sm:text-sm"
                          style={{ color: "#ffffff" }}
                        >
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

        <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
          {/* Products Section */}
          <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
                Products & Services
              </h2>
              <button
                onClick={handleAddProduct}
                disabled={isGeneratingQueryId}
                className="flex items-center space-x-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm md:text-base"
                style={{ color: "#ffffff" }}
              >
                {isGeneratingQueryId ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    <span
                      className="hidden sm:inline"
                      style={{ color: "#ffffff" }}
                    >
                      Loading...
                    </span>
                    <span className="sm:hidden" style={{ color: "#ffffff" }}>
                      Loading...
                    </span>
                  </>
                ) : (
                  <>
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
                    <span className="sm:hidden" style={{ color: "#ffffff" }}>
                      Add
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search products by name, description, price, or verification ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:py-2.5 sm:pl-12 sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center sm:py-10 md:py-12">
              <Package className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12 md:h-16 md:w-16" />
              <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm md:text-base">
                {searchQuery
                  ? `No products found matching "${searchQuery}"`
                  : "No products yet. Add your first product to get started."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    {product.Image && (
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        <img
                          src={product.Image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="absolute right-2 top-2 rounded-full bg-green-600 p-2 text-white opacity-0 shadow-lg transition-opacity hover:bg-green-700 group-hover:opacity-100"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {!product.Image && (
                      <div className="relative flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <Package className="h-12 w-12 text-gray-400" />
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="absolute right-2 top-2 rounded-full bg-green-600 p-2 text-white opacity-0 shadow-lg transition-opacity hover:bg-green-700 group-hover:opacity-100"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                      {/* Product Name and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 flex-1 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm md:text-base">
                          {product.name}
                        </h3>
                        {product.status && (
                          <span
                            className={`flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs ${
                              product.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : product.status === "inactive"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }`}
                          >
                            {product.status === "active" ? (
                              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            ) : (
                              <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            )}
                            <span className="hidden capitalize sm:inline">
                              {product.status}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {product.Description && (
                        <div 
                          className="line-clamp-2 text-[10px] text-gray-600 dark:text-gray-400 sm:text-xs"
                          dangerouslySetInnerHTML={{ __html: product.Description }}
                        />
                      )}

                      {/* Price and Unit */}
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-green-600 sm:text-lg">
                          {formatCurrencySync(parseFloat(product.price))}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                          / {product.unit}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="space-y-1.5 border-t border-gray-200 pt-2 dark:border-gray-700 sm:space-y-2 sm:pt-3">
                        {/* Verification ID */}
                        {product.query_id && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Tag className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                                Verification ID
                              </p>
                              <p className="truncate font-mono text-[10px] font-semibold text-gray-700 dark:text-gray-300 sm:text-xs">
                                {product.query_id}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Minimum Orders */}
                        {product.minimumOrders &&
                          parseFloat(product.minimumOrders) > 0 && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <ShoppingCart className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                                  Min. Order
                                </p>
                                <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 sm:text-xs">
                                  {product.minimumOrders} {product.unit}
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Maximum Orders */}
                        {product.maxOrders &&
                          product.maxOrders.trim() !== "" &&
                          parseFloat(product.maxOrders) > 0 && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <ShoppingCart className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                                  Max. Order
                                </p>
                                <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 sm:text-xs">
                                  {product.maxOrders} {product.unit}
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Delivery Area */}
                        {product.delveryArea &&
                          product.delveryArea.trim() !== "" && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Truck className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                                  Delivery Area
                                </p>
                                <p className="line-clamp-1 text-[10px] font-medium text-gray-700 dark:text-gray-300 sm:text-xs">
                                  {product.delveryArea}
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Speciality */}
                        {product.speciality &&
                          product.speciality.trim() !== "" && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Tag className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                                  Speciality
                                </p>
                                <p className="line-clamp-1 text-[10px] font-medium text-gray-700 dark:text-gray-300 sm:text-xs">
                                  {product.speciality}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:mt-8 sm:flex-row">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-2 sm:px-4 sm:text-base"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                                  currentPage === page
                                    ? "bg-green-600 text-white"
                                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-2 text-gray-500 dark:text-gray-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-2 sm:px-4 sm:text-base"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800 sm:max-h-[90vh] sm:rounded-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-4 sm:py-4 md:px-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg md:text-xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: "",
                    description: "",
                    price: "",
                    unit: "",
                    minimumOrders: "0",
                    maxOrders: "",
                    deliveryArea: "",
                  });
                  setProductImage("");
                  setQueryId(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:space-y-6 md:p-6">
              {queryId && !editingProduct && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20 sm:p-5 md:p-6">
                  <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200 sm:mb-3 sm:text-base">
                    Verification ID Generated
                  </p>
                  <p className="mb-2 text-center font-mono text-2xl font-bold tracking-wider text-green-600 dark:text-green-300 sm:mb-3 sm:text-3xl md:text-4xl">
                    {queryId}
                  </p>
                  <p className="mt-2 text-center text-xs text-green-600 dark:text-green-300 sm:text-sm">
                    Use this ID when taking the product photo for verification.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <RichTextEditor
                  value={newProduct.description}
                  onChange={(value) =>
                    setNewProduct({
                      ...newProduct,
                      description: value,
                    })
                  }
                  rows={8}
                  placeholder="Provide a detailed description of your product. You can use:\n- Bullet points\n- Sub headers\n- Line breaks\n- Bold, italic, underline\n- Any formatting you need"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unit *
                  </label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, unit: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                  >
                    <option value="">Select unit</option>
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="lb">lb (Pound)</option>
                    <option value="oz">oz (Ounce)</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="bundle">Bundle</option>
                    <option value="dozen">Dozen</option>
                    <option value="liter">Liter (L)</option>
                    <option value="ml">Milliliter (mL)</option>
                    <option value="gallon">Gallon</option>
                    <option value="meter">Meter (m)</option>
                    <option value="cm">Centimeter (cm)</option>
                    <option value="ft">Foot (ft)</option>
                    <option value="yard">Yard</option>
                    <option value="sqft">Square Foot (sq ft)</option>
                    <option value="sqm">Square Meter (sq m)</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Orders *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.minimumOrders}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        minimumOrders: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum quantity required for order
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Orders
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.maxOrders}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        maxOrders: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                    placeholder="Optional"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximum quantity per order (optional)
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery Area
                </label>
                <input
                  type="text"
                  value={newProduct.deliveryArea}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      deliveryArea: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
                  placeholder="e.g., Kigali, Rwanda or specific areas"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Areas where you can deliver this product (optional)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Image *
                </label>
                {productImage ? (
                  <div className="relative">
                    <img
                      src={productImage}
                      alt="Product preview"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => setProductImage("")}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-green-500 dark:border-gray-600"
                  >
                    <Camera className="mb-2 h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                      Capture Product Image
                    </span>
                    {queryId && (
                      <span className="mt-1 font-mono text-xs text-green-600 dark:text-green-400">
                        Verification ID: {queryId}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: "",
                      description: "",
                      price: "",
                      unit: "",
                      minimumOrders: "0",
                      maxOrders: "",
                      deliveryArea: "",
                    });
                    setProductImage("");
                    setQueryId(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProduct}
                  disabled={isCreatingProduct}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                >
                  {isCreatingProduct
                    ? editingProduct
                      ? "Updating..."
                      : "Adding..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
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
