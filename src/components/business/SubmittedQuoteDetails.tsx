"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Calendar,
} from "lucide-react";

interface SubmittedQuoteDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  quote: {
    id: string;
    businessRfq_id?: string;
    qouteAmount: string;
    currency: string;
    delivery_time: string;
    quote_validity: string;
    message: string;
    PaymentTerms: string;
    DeliveryTerms: string;
    warrantly: string;
    cancellatioinTerms: string;
    attachement: string;
    attachment_1: string;
    attachment_2: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  rfqTitle: string;
  rfqId?: string;
}

interface SupplierInfo {
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_location: string | null;
}

interface ClientInfo {
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_location: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
}

export function SubmittedQuoteDetails({
  isOpen,
  onClose,
  quote,
  rfqTitle,
  rfqId,
}: SubmittedQuoteDetailsProps) {
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rfqIdToUse = rfqId || quote.businessRfq_id;
    if (isOpen && rfqIdToUse) {
      fetchQuoteDetails(rfqIdToUse);
    }
  }, [isOpen, rfqId, quote.businessRfq_id]);

  const fetchQuoteDetails = async (rfqIdToUse: string) => {
    if (!rfqIdToUse) return;
    
    try {
      setLoading(true);
      // Fetch RFQ details to get client info
      const rfqResponse = await fetch(
        `/api/queries/rfq-details-and-responses?rfq_id=${rfqIdToUse}`
      );
      const rfqData = await rfqResponse.json();

      if (rfqData.success && rfqData.rfq) {
        // Client is the one who created the RFQ
        const client = rfqData.rfq.business_account;
        setClientInfo({
          business_name: client?.business_name || null,
          business_email: client?.business_email || rfqData.rfq.email || null,
          business_phone: client?.business_phone || rfqData.rfq.phone || null,
          business_location: client?.business_location || rfqData.rfq.location || null,
          contact_name: rfqData.rfq.contact_name || null,
          email: rfqData.rfq.email || null,
          phone: rfqData.rfq.phone || null,
          location: rfqData.rfq.location || null,
        });

        // Supplier is the one who submitted the quote
        const quoteResponse = rfqData.responses?.find(
          (q: any) => q.id === quote.id
        );
        if (quoteResponse?.business_account) {
          setSupplierInfo({
            business_name: quoteResponse.business_account.business_name || null,
            business_email: quoteResponse.business_account.business_email || null,
            business_phone: quoteResponse.business_account.business_phone || null,
            business_location: quoteResponse.business_account.business_location || null,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching quote details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const attachments = [
    quote.attachement,
    quote.attachment_1,
    quote.attachment_2,
  ].filter((att) => att && att.trim() !== "");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadAttachment = (base64String: string, index: number) => {
    try {
      const [mimeType, base64Data] = base64String.split(",");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: mimeType.split(":")[1].split(";")[0],
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quote-attachment-${index + 1}.${
        blob.type.includes("pdf") ? "pdf" : "jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:bg-black/60 sm:p-4">
      <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:rounded-3xl sm:border sm:border-gray-200 dark:sm:border-gray-700">
        {/* Header */}
        <div className="flex-shrink-0 bg-white p-6 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Proforma Invoice / Quotation
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="p-6 md:p-8">
            {/* Supplier Information */}
            <div className="mb-8">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {supplierInfo?.business_name || "[Your Company Name]"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {supplierInfo?.business_location || "[Your Company Address]"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {supplierInfo?.business_phone || "[Phone Number]"} | {supplierInfo?.business_email || "[Email Address]"}
              </div>
            </div>

            {/* Client Information */}
            <div className="mb-8">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                To:
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {clientInfo?.business_name || clientInfo?.contact_name || "[Client's Company Name]"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {clientInfo?.location || clientInfo?.business_location || "[Client's Address]"}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {clientInfo?.phone || clientInfo?.business_phone || "[Client's Phone Number]"} | {clientInfo?.email || clientInfo?.business_email || "[Client's Email Address]"}
              </div>
            </div>

            {/* Quote Header Info */}
            <div className="mb-8 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Date: </span>
                <span className="text-gray-900 dark:text-white">{formatDateShort(quote.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Quotation Number: </span>
                <span className="font-mono text-gray-900 dark:text-white">{quote.id?.slice(0, 8).toUpperCase() || "N/A"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Validity Date: </span>
                <span className="text-gray-900 dark:text-white">{quote.quote_validity || "Not specified"}</span>
              </div>
            </div>

            {/* Quote Summary Table */}
            <div className="mb-8">
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Quote Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 text-left font-medium text-gray-700 dark:text-gray-300">Item Description</th>
                      <th className="pb-2 text-right font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-900 dark:text-white">Quote Amount</td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: quote.currency || "RWF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(parseFloat(quote.qouteAmount))}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-900 dark:text-white">Delivery Time</td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {quote.delivery_time || "Not specified"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-900 dark:text-white">Quote Validity</td>
                      <td className="py-2 text-right text-gray-900 dark:text-white">
                        {quote.quote_validity || "Not specified"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-8">
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Terms & Conditions
              </h3>
              <div className="space-y-3 text-sm">
                {quote.PaymentTerms && quote.PaymentTerms.trim() !== "" && (
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Payment Terms:</div>
                    <div className="mt-1 text-gray-900 dark:text-white">{quote.PaymentTerms}</div>
                  </div>
                )}

                {quote.DeliveryTerms && quote.DeliveryTerms.trim() !== "" && (
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Delivery Terms:</div>
                    <div className="mt-1 text-gray-900 dark:text-white">{quote.DeliveryTerms}</div>
                  </div>
                )}

                {quote.warrantly && quote.warrantly.trim() !== "" && (
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Warranty:</div>
                    <div className="mt-1 text-gray-900 dark:text-white">{quote.warrantly}</div>
                  </div>
                )}

                {quote.cancellatioinTerms && quote.cancellatioinTerms.trim() !== "" && (
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Cancellation Terms:</div>
                    <div className="mt-1 text-gray-900 dark:text-white">{quote.cancellatioinTerms}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {quote.message && quote.message.trim() !== "" && (
              <div className="mb-8">
                <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Message
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  We appreciate your request for a quotation. Below is the detailed information regarding the products/services as per your inquiry:
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-white">
                  {quote.message}
                </p>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                  Attachments:
                </h3>
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                  Please find attached the necessary documents as per your request:
                </p>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => downloadAttachment(attachment, index)}
                      className="flex w-full items-center gap-2 text-left text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Download className="h-4 w-4" />
                      <span>Attachment {index + 1}: [Download/View Attachment]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Closing */}
            <div className="mt-8 text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-2">
                We look forward to the opportunity to work with you. Should you have any questions, please don't hesitate to contact us.
              </p>
              <div className="mt-4">
                <div className="font-medium text-gray-900 dark:text-white">Kind regards,</div>
                <div className="mt-1">{supplierInfo?.business_name || "[Your Name]"}</div>
                <div className="mt-1">{supplierInfo?.business_email || "[Your Contact Information]"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white p-4 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              <span>
                Quote ID: <span className="font-mono">{quote.id?.slice(0, 8).toUpperCase() || "N/A"}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
