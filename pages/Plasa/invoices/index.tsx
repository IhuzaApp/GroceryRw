"use client";

import React, { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Loader, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../src/context/ThemeContext";
import { logger } from "../../../src/utils/logger";
import {
  InvoiceFilters,
  ProofUploadModal,
  InvoicePagination,
  InvoicesTable,
  Invoice,
  InvoicesPageProps,
} from "../../../src/components/invoices";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";

const InvoicesPage: React.FC<InvoicesPageProps> = ({
  initialInvoices = [],
  initialError = null,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [loading, setLoading] = useState(!initialInvoices.length);
  const [error, setError] = useState<string | null>(initialError);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
  const handleUploadProof = (invoiceId: string, proofImage: string) => {
    // Update the invoice in the list
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, Proof: proofImage } : inv
      )
    );
  };

  const openProofModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowProofModal(true);
  };

  const closeProofModal = () => {
    setShowProofModal(false);
    setSelectedInvoice(null);
  };

  const handleViewDetails = (invoiceId: string, orderType: string) => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL || "https://plas.rw"
        : window.location.origin;

    if (isMobile) {
      // For mobile, open PDF directly
      const pdfUrl = `${baseUrl}/api/invoices/${invoiceId}?pdf=true`;
      window.open(pdfUrl, "_blank");
    } else {
      // For desktop, open invoice page with hash
      const hash = orderType === "reel" ? "#reel" : "#regularOrder";
      const invoiceUrl = `${baseUrl}/Plasa/invoices/${invoiceId}${hash}`;
      window.open(invoiceUrl, "_blank");
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
        <div className="flex h-full items-center justify-center">
          <Loader size="lg" content="Loading invoices..." />
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
      <div className="container mx-auto h-full px-2 py-4 pb-24 sm:py-8 sm:pb-8">
        <div className="mx-auto h-full w-full">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              My Invoices
            </h1>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              View invoices and upload proof of delivery for your completed
              orders
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
            onUploadProof={openProofModal}
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

      {/* Proof Upload Modal */}
      <ProofUploadModal
        open={showProofModal}
        onClose={closeProofModal}
        invoice={selectedInvoice}
        onUploadSuccess={handleUploadProof}
      />
    </ShopperLayout>
  );
};

export default InvoicesPage;

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps = async (context: any) => {
  console.log('[SERVER-SIDE AUTH DISABLED] Skipping authentication check for Plasa/invoices');
  return { props: { initialInvoices: [], initialError: null } };
  
  try {
    // Original authentication code (disabled for testing)
    // const session = await getServerSession(
    //   context.req,
    //   context.res,
    //   authOptions
    // );
    // if (!session) {
    //   return {
    //     redirect: {
    //       destination: "/Auth/Login",
    //       permanent: false,
    //     },
    //   };
    // }

    // Fetch initial invoices data directly from the API handler

    // Import the API handler directly instead of making HTTP request
    const { default: invoicesHandler } = await import(
      "../../api/shopper/invoices"
    );

    // Create mock request and response objects
    const mockReq = {
      method: "GET",
      query: { page: "1" },
    } as any;

    let responseData: any = null;
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          responseData = data;
          return { statusCode: code, data };
        },
      }),
      setHeader: () => {},
      end: () => {},
    } as any;

    // Call the handler directly
    await invoicesHandler(mockReq, mockRes);
    const data = responseData;

    return {
      props: {
        initialInvoices: data.invoices || [],
        initialError: null,
      },
    };
  } catch (error) {
    logger.error("Error in getServerSideProps", "InvoicesPage", error);
    return {
      props: {
        initialInvoices: [],
        initialError: "Failed to load invoices",
      },
    };
  }
};
