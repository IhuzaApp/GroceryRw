"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Loader, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../src/context/ThemeContext";
import { logger } from "../../../src/utils/logger";
import {
  InvoiceFilters,
  InvoicePagination,
  InvoicesTable,
  Invoice,
  InvoicesPageProps,
} from "../../../src/components/invoices";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import { AuthGuard } from "../../../src/components/AuthGuard";

const InvoicesPage: React.FC<InvoicesPageProps> = ({
  initialInvoices = [],
  initialError = null,
}) => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [loading, setLoading] = useState(!initialInvoices.length);
  const [error, setError] = useState<string | null>(initialError);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { theme } = useTheme();

  // Fetch invoices
  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/shopper/invoices?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();

      setInvoices(data.invoices || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      logger.error("Error fetching invoices", "InvoicesPage", err);
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInvoices.length) {
      fetchInvoices();
    }
  }, []);

  // Event handlers
  const handleViewDetails = (invoiceId: string, orderType: string) => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // For mobile, navigate to PDF in same tab
      const pdfUrl = `/api/invoices/${invoiceId}?pdf=true`;
      router.push(pdfUrl);
    } else {
      // For desktop, navigate to invoice page with hash in same tab
      const hash = orderType === "reel" ? "reel" : "regularOrder";
      router.push({
        pathname: `/Plasa/invoices/${invoiceId}`,
        hash: hash,
      });
    }
  };

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.shop_name &&
        invoice.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.reel_title &&
        invoice.reel_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesType = !typeFilter || invoice.order_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchInvoices(page);
  };

  if (loading) {
    return (
      <ShopperLayout>
        <div className="relative min-h-screen transition-colors duration-300">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5"></div>
          </div>
          <div className="container relative z-10 mx-auto h-full max-w-7xl px-4 py-6 pb-24 sm:py-10 sm:pb-12">
            <div className="animate-pulse">
              <div className="mb-8">
                <div className="h-10 w-48 rounded-xl bg-gray-300/50 dark:bg-gray-700/50"></div>
                <div className="mt-2 h-4 w-64 rounded-lg bg-gray-300/30 dark:bg-gray-700/30"></div>
              </div>

              {/* Filters Skeleton */}
              <div className="mb-8 h-20 w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md dark:bg-gray-800/20"></div>

              {/* Table Skeleton Placeholder */}
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md dark:bg-gray-800/10"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  if (error) {
    return (
      <ShopperLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Error Loading Invoices
            </h3>
            <p className="text-gray-500">{error}</p>
            <button
              className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onClick={() => fetchInvoices()}
            >
              Retry
            </button>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className="relative min-h-screen transition-colors duration-300">
        {/* Background Decorative Gradients */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-emerald-500/10 mix-blend-multiply blur-[100px] dark:bg-emerald-500/5 dark:mix-blend-lighten"></div>
          <div
            className="absolute -right-[10%] top-[30%] h-[35%] w-[35%] animate-pulse rounded-full bg-blue-500/10 mix-blend-multiply blur-[100px] dark:bg-blue-500/5 dark:mix-blend-lighten"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute -bottom-[10%] left-[20%] h-[50%] w-[50%] animate-pulse rounded-full bg-teal-500/10 mix-blend-multiply blur-[120px] dark:bg-teal-500/5 dark:mix-blend-lighten"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto h-full max-w-7xl px-4 py-6 pb-24 sm:py-10 sm:pb-12">
          <div className="mx-auto h-full w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-200">
                My Invoices
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Manage, track, and download your billing documentation.
              </p>
            </div>

            {/* Filters */}
            <InvoiceFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />

            {/* Invoices Table */}
            <InvoicesTable
              invoices={filteredInvoices}
              onViewDetails={handleViewDetails}
              loading={loading}
            />

            {/* Pagination */}
            <InvoicePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </ShopperLayout>
  );
};

export default InvoicesPage;
