"use client";

import {
  Store,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface StoreDetailContentProps {
  selectedItem: any;
  storeProducts: any[];
  loadingProducts: boolean;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
}

export function StoreDetailContent({
  selectedItem,
  storeProducts,
  loadingProducts,
  onEditProduct,
  onDeleteProduct,
}: StoreDetailContentProps) {
  return (
    <>
      {/* Store Header - Minimal */}
      <div className="mb-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-3">
          {selectedItem.image && (
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-gray-700">
              <img
                src={selectedItem.image}
                alt={selectedItem.name || "Store"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <Store className="hidden h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {selectedItem.name || "Store"}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {storeProducts.length}{" "}
              {storeProducts.length === 1 ? "product" : "products"}
            </p>
          </div>
          {selectedItem.is_active !== undefined && (
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                selectedItem.is_active
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {selectedItem.is_active ? "Active" : "Inactive"}
            </span>
          )}
        </div>
      </div>

      {/* Products Grid - Main Focus */}
      {loadingProducts ? (
        <div className="grid animate-pulse grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-1 flex-col space-y-2 p-3">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 flex items-baseline gap-1">
                  <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-auto flex justify-center gap-2 pt-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : storeProducts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            No products found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This store doesn&apos;t have any products yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {storeProducts.map((product: any) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                {product.Image || product.image ? (
                  <img
                    src={product.Image || product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <Package className="h-10 w-10 text-gray-300" />
                  </div>
                )}

                {product.status && (
                  <span
                    className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow-sm ${
                      product.status === "active"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                    style={{ color: "#ffffff" }}
                  >
                    {product.status === "active" ? (
                      <CheckCircle
                        className="h-2 w-2"
                        style={{ color: "#ffffff" }}
                      />
                    ) : (
                      <XCircle
                        className="h-2 w-2"
                        style={{ color: "#ffffff" }}
                      />
                    )}
                    <span style={{ color: "#ffffff" }}>
                      {product.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProduct(product);
                  }}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-green-600 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white hover:text-green-700 dark:bg-gray-800/90 dark:text-green-400 dark:hover:bg-gray-800"
                  title="Edit product"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-3">
                <h3 className="mb-1.5 line-clamp-2 flex-1 text-xs font-semibold leading-tight text-gray-900 dark:text-white">
                  {product.name}
                </h3>

                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-green-600 dark:text-green-500">
                    {product.price}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    / {product.unit || "unit"}
                  </span>
                </div>

                <div className="mt-auto flex justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95"
                    style={{ color: "#ffffff" }}
                    title="Edit"
                  >
                    <Edit
                      className="h-4 w-4"
                      style={{ color: "#ffffff", stroke: "#ffffff" }}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-sm transition-all hover:bg-red-600 hover:shadow-md active:scale-95"
                    style={{ color: "#ffffff" }}
                    title="Delete"
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{ color: "#ffffff", stroke: "#ffffff" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
