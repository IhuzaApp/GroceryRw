"use client";

import React, { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Panel, Button, Loader, Input, InputGroup, SelectPicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../src/context/ThemeContext";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import { logger } from "../../../src/utils/logger";

interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  order_type: "regular" | "reel";
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount?: number;
  created_at: string;
  status: "paid" | "pending" | "overdue";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items_count: number;
  shop_name?: string;
  shop_address?: string;
  reel_title?: string;
  reel_description?: string;
  reel_price?: string;
  delivery_time?: string;
  delivery_notes?: string;
  delivery_note?: string;
  found?: boolean;
  order_status: string;
}

interface InvoicesPageProps {
  initialInvoices?: Invoice[];
  initialError?: string | null;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({
  initialInvoices = [],
  initialError = null,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [loading, setLoading] = useState(!initialInvoices.length);
  const [error, setError] = useState<string | null>(initialError);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
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

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = searchTerm === "" || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.shop_name && invoice.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.reel_title && invoice.reel_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesType = !typeFilter || invoice.order_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchInvoices(page);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Failed to download invoice");
      }
    } catch (error) {
      logger.error("Error downloading invoice", "InvoicesPage", error);
      // You could show a toast notification here
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", text: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      overdue: { color: "bg-red-100 text-red-800", text: "Overdue" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <h3 className="text-lg font-medium text-gray-900">Error Loading Invoices</h3>
            <p className="text-gray-500">{error}</p>
            <Button
              appearance="primary"
              className="mt-4"
              onClick={() => fetchInvoices()}
            >
              Retry
            </Button>
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
            <h1 className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              My Invoices
            </h1>
            <p className={`mt-2 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              View and download invoices for all your completed orders
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputGroup>
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={setSearchTerm}
                className={theme === "dark" ? "!text-white" : ""}
              />
            </InputGroup>
            
            <SelectPicker
              data={[
                { label: "All Status", value: null },
                { label: "Paid", value: "paid" },
                { label: "Pending", value: "pending" },
                { label: "Overdue", value: "overdue" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by status"
              cleanable={false}
              className={theme === "dark" ? "rs-picker-dark" : ""}
            />

            <SelectPicker
              data={[
                { label: "All Types", value: null },
                { label: "Regular Orders", value: "regular" },
                { label: "Reel Orders", value: "reel" },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter by type"
              cleanable={false}
              className={theme === "dark" ? "rs-picker-dark" : ""}
            />
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <Panel
                shaded
                bordered
                className={`text-center py-8 ${
                  theme === "dark" ? "rs-panel-dark" : ""
                }`}
              >
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter || typeFilter
                      ? "Try adjusting your filters"
                      : "You haven't completed any orders yet"}
                  </p>
                </div>
              </Panel>
            ) : (
              filteredInvoices.map((invoice) => (
                <Panel
                  key={invoice.id}
                  shaded
                  bordered
                  className={`${
                    theme === "dark" ? "rs-panel-dark" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}>
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <p className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {invoice.order_type === "regular" 
                              ? invoice.shop_name || "Shop"
                              : invoice.reel_title || "Reel Order"
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}>
                            {formatCurrencySync(invoice.total_amount)}
                          </div>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Customer:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {invoice.customer_name}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Items:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {invoice.items_count}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Date:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {formatDate(invoice.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Type:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {invoice.order_type === "regular" ? "Regular Order" : "Reel Order"}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Subtotal:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {formatCurrencySync(invoice.subtotal)}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Tax:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {formatCurrencySync(invoice.tax)}
                          </span>
                        </div>
                        {invoice.discount && invoice.discount > 0 && (
                          <div>
                            <span className={`font-medium ${
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                              Discount:
                            </span>
                            <span className={`ml-2 text-green-600`}>
                              -{formatCurrencySync(invoice.discount)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Delivery Fee:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {formatCurrencySync(invoice.delivery_fee)}
                          </span>
                        </div>
                        <div>
                          <span className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Service Fee:
                          </span>
                          <span className={`ml-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {formatCurrencySync(invoice.service_fee)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        size="sm"
                        appearance="primary"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        appearance="ghost"
                        onClick={() => window.open(`/Plasa/invoices/${invoice.id}`, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className={`flex items-center px-3 ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                }`}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShopperLayout>
  );
};

export default InvoicesPage; 