"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, Calendar } from "lucide-react";

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
          business_location:
            client?.business_location || rfqData.rfq.location || null,
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
            business_email:
              quoteResponse.business_account.business_email || null,
            business_phone:
              quoteResponse.business_account.business_phone || null,
            business_location:
              quoteResponse.business_account.business_location || null,
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

  const downloadAttachment = (attachment: string, index: number) => {
    try {
      if (attachment.startsWith("http")) {
        window.open(attachment, "_blank");
        return;
      }

      const [mimeType, base64Data] = attachment.split(",");
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-primary)] shadow-2xl transition-all duration-500">
        {/* Header */}
        <div className="relative flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                <FileText className="h-3 w-3" />
                <span>Formal Document</span>
              </div>
              <h2 className="text-2xl font-black text-white sm:text-4xl">
                Proforma Invoice
              </h2>
              <p className="mt-1 text-sm font-medium text-white/70">
                REF: {quote.id?.slice(0, 8).toUpperCase() || "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20 active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          <div className="mx-auto max-w-4xl p-6 sm:p-12">
            
            {/* Header info grid */}
            <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-3xl border border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/10 p-8">
                 <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">From (Supplied By)</h4>
                 <div className="space-y-1">
                    <p className="text-lg font-black text-[var(--text-primary)]">{supplierInfo?.business_name || "Enterprise Partner"}</p>
                    <p className="text-xs font-bold text-[var(--text-secondary)]">{supplierInfo?.business_location || "Verified Location"}</p>
                    <p className="text-xs font-bold text-blue-600">{supplierInfo?.business_email || "contact@enterprise.com"}</p>
                 </div>
              </div>
              <div className="rounded-3xl border border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/10 p-8">
                 <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Bill To (Client)</h4>
                 <div className="space-y-1">
                    <p className="text-lg font-black text-[var(--text-primary)]">{clientInfo?.business_name || clientInfo?.contact_name || "Enterprise Client"}</p>
                    <p className="text-xs font-bold text-[var(--text-secondary)]">{clientInfo?.location || clientInfo?.business_location || "Delivery Point"}</p>
                    <p className="text-xs font-bold text-blue-600">{clientInfo?.email || clientInfo?.business_email || "procurement@client.com"}</p>
                 </div>
              </div>
            </div>

            {/* Document Details Grid */}
            <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Issue Date", value: formatDateShort(quote.created_at), icon: Calendar },
                { label: "Validity", value: quote.quote_validity || "N/A", icon: Calendar },
                { label: "Delivery", value: quote.delivery_time || "Standard", icon: Calendar },
                { label: "Status", value: quote.status || "Pending", icon: Calendar }
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/10 p-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">{item.label}</p>
                   <p className="mt-1 text-xs font-black text-[var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mb-12 rounded-3xl border-2 border-green-500/20 bg-green-500/5 p-8">
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-green-400">Total Bid Amount</h3>
                    <p className="text-4xl font-black text-[var(--text-primary)]">
                       {new Intl.NumberFormat("en-US", {
                         style: "currency",
                         currency: quote.currency || "RWF",
                         minimumFractionDigits: 0,
                       }).format(parseFloat(quote.qouteAmount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-2 font-black text-white">
                     <span>GUARANTEED RATE</span>
                  </div>
               </div>
            </div>

            {/* Terms & Conditions Sections */}
            <div className="grid grid-cols-1 gap-8 mb-12 sm:grid-cols-2">
                 {[
                   { title: "Payment Terms", value: quote.PaymentTerms },
                   { title: "Delivery Terms", value: quote.DeliveryTerms },
                   { title: "Warranty Policy", value: quote.warrantly },
                   { title: "Cancellation", value: quote.cancellatioinTerms }
                 ].filter(t => t.value).map((term, i) => (
                    <div key={i} className="space-y-2">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">{term.title}</h3>
                       <p className="text-sm font-bold text-[var(--text-primary)] p-4 rounded-2xl bg-[var(--bg-secondary)]/10 border border-[var(--bg-secondary)]">{term.value}</p>
                    </div>
                 ))}
            </div>

            {/* Message Body */}
            {quote.message && (
               <div className="mb-12 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">Additional Proposal Details</h3>
                  <div className="rounded-3xl border border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/5 p-8">
                     <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[var(--text-primary)] opacity-80">
                        {quote.message}
                     </p>
                  </div>
               </div>
            )}

            {/* Attachments UI */}
            {attachments.length > 0 && (
              <div className="space-y-4 mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">Supporting Documents</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => downloadAttachment(attachment, index)}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-secondary)]/10 p-6 transition-all hover:bg-[var(--bg-secondary)] active:scale-95"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
                        <Download className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                        FILE {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-[var(--bg-secondary)] bg-[var(--bg-primary)] p-6 sm:px-12">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
             <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                Document Securely Transacted via Plas Business
             </div>
             <button
               onClick={onClose}
               className="rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] px-8 py-3 text-sm font-black text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)]"
             >
               Close Document
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
