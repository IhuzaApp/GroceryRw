import React from "react";
import { Box, ShoppingCart, Printer } from "lucide-react";

interface DashboardGridProps {
  onAddStock: () => void;
  onCheckout: () => void;
  onPrintInvoices?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  onAddStock, 
  onCheckout, 
  onPrintInvoices 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 1. Add to Stock */}
      <button
        onClick={onAddStock}
        className="group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
          border-gray-100 bg-white hover:border-gray-200 
          dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
          <Box className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Add Stock</h3>
          <p className="mt-1 text-xs font-medium text-gray-500">Scan Inventory</p>
        </div>
      </button>

      {/* 2. Customer Checkout */}
      <button
        onClick={onCheckout}
        className="group flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
          border-gray-100 bg-white hover:border-gray-200 
          dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Checkout</h3>
          <p className="mt-1 text-xs font-medium text-gray-500">Mobile Registers</p>
        </div>
      </button>

      {/* 3. Print Invoices */}
      <button
        onClick={onPrintInvoices}
        className="group col-span-2 flex flex-col items-center justify-center gap-4 rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] 
          border-gray-100 bg-white hover:border-gray-200 
          dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg shadow-green-500/30 transition-transform group-hover:scale-110">
          <Printer className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Print Invoices</h3>
          <p className="mt-1 text-xs font-medium text-gray-500">Generate PDF / EBM</p>
        </div>
      </button>
    </div>
  );
};
