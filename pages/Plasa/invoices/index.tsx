"use client";

import React, { useState, useEffect, useRef } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Panel, Button, Loader, Input, InputGroup, SelectPicker, Modal } from "rsuite";
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
  Proof?: string;
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
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);

      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as base64
        const imageData = canvas.toDataURL("image/jpeg");
        setProofImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedInvoice || !proofImage) return;

    setUploadingProof(true);
    try {
      const response = await fetch('/api/invoices/upload-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          proof_image: proofImage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload proof');
      }

      const result = await response.json();
      
      // Update the invoice in the list
      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, Proof: proofImage }
          : inv
      ));

      setShowProofModal(false);
      setSelectedInvoice(null);
      setProofImage(null);
      alert('Proof uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof. Please try again.');
    } finally {
      setUploadingProof(false);
    }
  };

  const openProofModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowProofModal(true);
    setProofImage(null);
    setCameraActive(false);
  };

  const closeProofModal = () => {
    setShowProofModal(false);
    setSelectedInvoice(null);
    setProofImage(null);
    stopCamera();
  };

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
              View invoices and upload proof of delivery for your completed orders
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
                { label: "All Status", value: "" },
                { label: "Paid", value: "paid" },
                { label: "Pending", value: "pending" },
                { label: "Overdue", value: "overdue" },
              ]}
              value={statusFilter || ""}
              onChange={(value) => setStatusFilter(value === "" ? null : value)}
              placeholder="Filter by status"
              cleanable={false}
              className={theme === "dark" ? "rs-picker-dark" : ""}
            />

            <SelectPicker
              data={[
                { label: "All Types", value: "" },
                { label: "Regular Orders", value: "regular" },
                { label: "Reel Orders", value: "reel" },
              ]}
              value={typeFilter || ""}
              onChange={(value) => setTypeFilter(value === "" ? null : value)}
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
                        {invoice.Proof && (
                          <div className="col-span-2">
                            <span className={`font-medium ${
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                              Proof Status:
                            </span>
                            <span className="ml-2 text-green-600 font-medium">
                              ✓ Proof Uploaded
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        size="sm"
                        appearance="primary"
                        onClick={() => openProofModal(invoice)}
                        disabled={!!invoice.Proof}
                      >
                        {invoice.Proof ? "Proof Uploaded" : "Upload Proof"}
                      </Button>
                      <Button
                        size="sm"
                        appearance="ghost"
                        onClick={() => window.open(`/Plasa/invoices/${invoice.id}`, '_blank')}
                      >
                        View Details
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

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      
      {/* Proof Upload Modal */}
      <Modal
        open={showProofModal}
        onClose={closeProofModal}
        size="lg"
        className={theme === "dark" ? "rs-modal-dark" : ""}
      >
        <Modal.Header>
          <Modal.Title>Upload Proof of Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
                         <p className="text-sm text-gray-600 mb-4">
               Please upload a photo showing the delivered goods for invoice #{selectedInvoice?.invoice_number}
             </p>
             
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
               <p className="text-sm text-blue-800">
                 💡 <strong>Tip:</strong> Make sure the photo clearly shows the delivered items and any relevant details like packaging or receipts.
               </p>
             </div>
            
            {!proofImage ? (
              <div className="space-y-4">
                {/* Camera Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Take Photo</h4>
                    {!cameraActive ? (
                      <Button
                        appearance="primary"
                        onClick={startCamera}
                        className="mb-2"
                      >
                        📷 Open Camera
                      </Button>
                                         ) : (
                       <div className="space-y-2">
                         <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg">
                           <video
                             ref={videoRef}
                             autoPlay
                             playsInline
                             muted
                             className="h-full w-full object-cover"
                             style={{ transform: 'scaleX(-1)' }} // Mirror the camera
                           />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                               📷 Camera Active
                             </div>
                           </div>
                         </div>
                         <div className="flex justify-center space-x-2">
                           <Button
                             appearance="primary"
                             onClick={capturePhoto}
                             size="lg"
                           >
                             📸 Capture Photo
                           </Button>
                           <Button
                             appearance="ghost"
                             onClick={stopCamera}
                           >
                             ❌ Cancel
                           </Button>
                         </div>
                       </div>
                     )}
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Or Upload from Gallery</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <img
                    src={proofImage}
                    alt="Proof of delivery"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    appearance="ghost"
                    onClick={() => setProofImage(null)}
                  >
                    📷 Take New Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="ghost"
            onClick={closeProofModal}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={handleUploadProof}
            disabled={!proofImage || uploadingProof}
            loading={uploadingProof}
          >
            {uploadingProof ? "Uploading..." : "Upload Proof"}
          </Button>
        </Modal.Footer>
      </Modal>
    </ShopperLayout>
  );
};

export default InvoicesPage; 