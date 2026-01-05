"use client";

import { useState, useEffect, useRef } from "react";
import { X, Calendar, DollarSign, FileText, CheckCircle, Clock, User, Building, Download, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { downloadContractAsPdf } from "../../lib/contractUtils";

// Signature Pad Component
function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#111827";
  }, []);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawingRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    const last = lastPosRef.current;
    if (!last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const end = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;
    onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div>
      <div
        className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
        style={{ width: "100%", height: 160 }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border px-3 py-1 text-sm"
        >
          Clear
        </button>
        {value && (
          <span className="text-xs text-green-600">Signature captured</span>
        )}
      </div>
    </div>
  );
}

// Photo Capture Component
function PhotoCapture({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamReady(true);
        }
      } catch (e) {
        console.error("Camera error", e);
        toast.error("Failed to access camera");
      }
    };
    init();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onChange(dataUrl);
  };

  return (
    <div>
      {!value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/10">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
        </div>
      )}
      {value && (
        <img
          src={value}
          alt="Captured"
          className="aspect-video w-full rounded-lg object-cover"
        />
      )}
      <div className="mt-2 flex items-center gap-2">
        {!value && (
          <button
            type="button"
            onClick={capture}
            disabled={!streamReady}
            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          >
            Capture Photo
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Retake
          </button>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

interface ContractDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
  onContractUpdated?: () => void;
}

interface ContractData {
  id: string;
  contractId: string;
  title: string;
  supplierName: string;
  supplierCompany: string;
  supplierId: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  paymentSchedule: string;
  progress: number;
  duration: string;
  paymentTerms: string;
  terminationTerms: string;
  specialConditions: string;
  deliverables: Array<{
    id?: string;
    description: string;
    dueDate: string;
    value: number;
    status?: string;
  }>;
  supplierId_field: string;
  quoteId: string;
  rfqId: string;
  rfqDescription?: string;
  estimatedQuantity?: string | null;
  lastActivity: string;
  created: string;
  doneAt?: string | null;
  updateOn?: string | null;
  clientSignature?: string;
  clientPhoto?: string;
  supplierSignature?: string;
  supplierPhoto?: string;
}

export function ContractDetailDrawer({
  isOpen,
  onClose,
  contractId,
  onContractUpdated,
}: ContractDetailDrawerProps) {
  const { data: session } = useSession();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentUserBusinessId, setCurrentUserBusinessId] = useState<string | null>(null);
  const [isSupplier, setIsSupplier] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [supplierSignature, setSupplierSignature] = useState("");
  const [supplierPhoto, setSupplierPhoto] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    if (isOpen && contractId) {
      fetchContractDetails();
      checkUserRole();
    }
  }, [isOpen, contractId]);

  const checkUserRole = async (): Promise<string | null> => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch("/api/queries/check-business-account");
      const data = await response.json();
      
      if (data.hasAccount && data.account?.id) {
        const userBusinessId = data.account.id;
        setCurrentUserBusinessId(userBusinessId);
        return userBusinessId;
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
    return null;
  };

  const fetchContractDetails = async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/queries/contract-details?id=${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data.contract);
        
        // Check if current user is the supplier
        const userBusinessId = await checkUserRole();
        if (userBusinessId && data.contract.supplierId === userBusinessId) {
          setIsSupplier(true);
        } else {
          setIsSupplier(false);
        }
      } else {
        toast.error("Failed to load contract details");
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      toast.error("Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  const handleAcceptContract = () => {
    setShowAcceptModal(true);
  };

  const handleSubmitAcceptance = async () => {
    if (!contractId) return;

    // Validate required fields
    if (!supplierSignature) {
      toast.error("Please provide your signature");
      return;
    }

    if (!supplierPhoto) {
      toast.error("Please capture your photo");
      return;
    }

    if (!termsAgreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      setAccepting(true);
      const response = await fetch("/api/mutations/accept-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId: contractId,
          supplierSignature: supplierSignature,
          supplierPhoto: supplierPhoto,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Contract accepted successfully!");
        setShowAcceptModal(false);
        setSupplierSignature("");
        setSupplierPhoto("");
        setTermsAgreed(false);
        await fetchContractDetails();
        onContractUpdated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to accept contract");
      }
    } catch (error) {
      console.error("Error accepting contract:", error);
      toast.error("Failed to accept contract");
    } finally {
      setAccepting(false);
    }
  };

  const handleDownload = async () => {
    if (!contract) {
      toast.error("Contract data not available");
      return;
    }

    if (contract.status !== "active") {
      toast.error("Only active contracts can be downloaded");
      return;
    }

    try {
      setDownloading(true);
      // Map contract data to match the expected interface
      const contractDataForPdf = {
        id: contract.id,
        contractId: contract.contractId,
        title: contract.title,
        supplierName: contract.supplierName,
        supplierCompany: contract.supplierCompany,
        supplierEmail: contract.supplierEmail,
        supplierPhone: contract.supplierPhone,
        supplierAddress: contract.supplierAddress,
        clientName: contract.clientName,
        clientCompany: contract.clientCompany,
        clientEmail: contract.clientEmail,
        clientPhone: contract.clientPhone,
        clientAddress: contract.clientAddress,
        contractType: contract.contractType,
        status: contract.status,
        startDate: contract.startDate,
        endDate: contract.endDate,
        totalValue: contract.totalValue,
        currency: contract.currency,
        paymentSchedule: contract.paymentSchedule,
        duration: contract.duration,
        paymentTerms: contract.paymentTerms,
        terminationTerms: contract.terminationTerms,
        specialConditions: contract.specialConditions,
        deliverables: contract.deliverables.map((del) => ({
          id: del.id || `del-${Math.random()}`,
          description: del.description,
          dueDate: del.dueDate,
          value: del.value,
          status: del.status || "pending",
        })),
        doneAt: contract.doneAt || undefined,
        updateOn: contract.updateOn || undefined,
        clientSignature: contract.clientSignature,
        clientPhoto: contract.clientPhoto,
        supplierSignature: contract.supplierSignature,
        supplierPhoto: contract.supplierPhoto,
      };
      await downloadContractAsPdf(contractDataForPdf);
      toast.success("Contract downloaded successfully!");
    } catch (error) {
      console.error("Error downloading contract:", error);
      toast.error("Failed to download contract");
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const progress = contract ? calculateProgress(contract.startDate, contract.endDate) : 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[10001] h-full w-full max-w-4xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading contract...</p>
            </div>
          </div>
        ) : contract ? (
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed right-4 top-4 z-[10002] rounded-lg bg-white p-2.5 text-gray-400 shadow-lg transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close contract details"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Paper-like Contract Document */}
            <div className="mx-auto max-w-4xl bg-[#faf9f6] px-4 py-8 shadow-2xl dark:bg-[#1a1814] sm:px-8 sm:py-12 md:px-16 md:py-16">
              {/* Document Header */}
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                  PLAS BUSINESS SERVICES AGREEMENT
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  (Supplier–Client)
                </p>
              </div>

              {/* Contract Tracking Info */}
              <div className="mb-8 border-b-2 border-gray-300 pb-4 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Contract Tracking ID:</span>{" "}
                  <span className="font-mono">{contract.id}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Status:</span>{" "}
                  <span className="capitalize">{contract.status.replace("_", " ")}</span>
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                <p className="mb-4">
                  This PLAS Business Services Agreement ("Agreement") is entered into and becomes effective as of{" "}
                  <span className="font-semibold">{formatDate(contract.startDate)}</span> ("Effective Date"), by and between:
                </p>
              </div>

              {/* Parties Section */}
              <div className="mb-8 space-y-6">
                <div>
                  <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Supplier Information
                  </h2>
                  <div className="ml-4 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <p>
                      <span className="font-semibold">Legal Name:</span>{" "}
                      {contract.supplierCompany || contract.supplierName || "[Supplier Legal Name]"}
                    </p>
                    <p>
                      <span className="font-semibold">Registered Address:</span>{" "}
                      {contract.supplierAddress || "[Supplier Address]"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {contract.supplierEmail || "[Supplier Email]"}
                    </p>
                    {contract.supplierPhone && (
                      <p>
                        <span className="font-semibold">Phone:</span> {contract.supplierPhone}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm italic text-gray-700 dark:text-gray-300">
                    ("Supplier")
                  </p>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Client Information
                  </h2>
                  <div className="ml-4 space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <p>
                      <span className="font-semibold">Legal Name:</span>{" "}
                      {contract.clientCompany || contract.clientName || "[Client Legal Name]"}
                    </p>
                    <p>
                      <span className="font-semibold">Business Address:</span>{" "}
                      {contract.clientAddress || "[Client Address]"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {contract.clientEmail || "[Client Email]"}
                    </p>
                    {contract.clientPhone && (
                      <p>
                        <span className="font-semibold">Phone:</span> {contract.clientPhone}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm italic text-gray-700 dark:text-gray-300">("Client")</p>
                </div>

                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Supplier and Client may be referred to individually as a "Party" and collectively as the "Parties."
                </p>
              </div>

              {/* Contract Sections */}
              <div className="space-y-6 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {/* Section 1: Purpose */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    1. PURPOSE OF AGREEMENT
                  </h3>
                  <p className="ml-4">
                    This Agreement establishes the general terms and conditions under which Supplier will provide services to Client. Specific services, pricing, timelines, and deliverables may be further detailed in Service Orders, Statements of Work (SOWs), or online checkout descriptions, which shall be incorporated into this Agreement by reference.
                  </p>
                </div>

                {/* Section 2: Scope of Services */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    2. SCOPE OF SERVICES
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">2.1 Services Description</p>
                      <p className="mt-1">
                        Supplier agrees to provide professional services including, but not limited to:
                      </p>
                      <ul className="ml-6 mt-2 list-disc space-y-1">
                        <li>{contract.title || "[Detailed description of services]"}</li>
                        {contract.estimatedQuantity && (
                          <li>Quantity: {contract.estimatedQuantity}</li>
                        )}
                        {contract.rfqDescription && (
                          <li>{contract.rfqDescription}</li>
                        )}
                        {contract.deliverables && contract.deliverables.length > 0 && (
                          <>
                            {contract.deliverables.map((del, idx) => (
                              <li key={idx}>
                                {del.description} - Due: {formatDate(del.dueDate)} ({formatCurrencySync(del.value)} {contract.currency})
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">2.2 Changes to Services</p>
                      <p className="mt-1">
                        Any modification, expansion, or reduction of Services must be agreed upon in writing or accepted electronically via the website.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">2.3 No Guaranteed Results</p>
                      <p className="mt-1">
                        Supplier does not guarantee specific results unless explicitly stated in writing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Term and Duration */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    3. TERM AND DURATION
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">3.1 Initial Term</p>
                      <p className="mt-1">
                        This Agreement shall commence on the Effective Date ({formatDate(contract.startDate)}) and continue until {formatDate(contract.endDate)}.
                        {contract.duration && ` Duration: ${contract.duration}`}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">3.2 Renewal</p>
                      <p className="mt-1">
                        Unless otherwise stated, this Agreement shall automatically renew on a monthly basis unless terminated.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Fees, Payments, and Taxes */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    4. FEES, PAYMENTS, AND TAXES
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">4.1 Fees</p>
                      <p className="mt-1">
                        Client agrees to pay Supplier the fees of <span className="font-semibold">{formatCurrencySync(contract.totalValue)} {contract.currency}</span> as displayed on the website, invoice, or agreed Service Order.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">4.2 Payment Terms</p>
                      <p className="mt-1">
                        {contract.paymentTerms || "Payments are due as specified in the payment schedule."}
                      </p>
                      <p className="mt-1">
                        Payment Schedule: {contract.paymentSchedule || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">4.3 Late Payments</p>
                      <p className="mt-1">
                        Overdue payments may incur late fees and suspension of Services until payment is received.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">4.4 Taxes</p>
                      <p className="mt-1">
                        Client is responsible for all applicable taxes, duties, or levies, excluding Supplier's income tax.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 5: Client Obligations */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    5. CLIENT OBLIGATIONS
                  </h3>
                  <p className="ml-4">
                    Client agrees to: provide accurate, complete, and lawful information; cooperate reasonably with Supplier; ensure it has rights to all materials provided; and not use Services for unlawful, fraudulent, or abusive purposes. Failure to meet obligations may delay or suspend Services.
                  </p>
                </div>

                {/* Section 6: Supplier Obligations */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    6. SUPPLIER OBLIGATIONS
                  </h3>
                  <p className="ml-4">
                    Supplier agrees to: perform Services professionally and in good faith; use reasonable skill and care; and comply with applicable laws and regulations.
                  </p>
                </div>

                {/* Section 7: Independent Contractor */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    7. INDEPENDENT CONTRACTOR STATUS
                  </h3>
                  <p className="ml-4">
                    Supplier is an independent contractor. Nothing in this Agreement creates an employment relationship, partnership, joint venture, or agency.
                  </p>
                </div>

                {/* Section 8: Confidentiality */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    8. CONFIDENTIALITY
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">8.1 Confidential Information</p>
                      <p className="mt-1">
                        Includes business data, pricing, trade secrets, client data, technical information, and non-public information.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">8.2 Obligations</p>
                      <p className="mt-1">
                        Each Party agrees to protect confidential information, not disclose it to third parties, and use it solely for purposes of this Agreement.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">8.3 Survival</p>
                      <p className="mt-1">
                        Confidentiality obligations survive termination for 3 years.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 9: Data Protection */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    9. DATA PROTECTION & PRIVACY
                  </h3>
                  <div className="ml-4 space-y-2">
                    <p>9.1 Client acknowledges that Supplier may collect and process data in accordance with its Privacy Policy.</p>
                    <p>9.2 Client warrants compliance with all data protection laws applicable to Client-provided data.</p>
                  </div>
                </div>

                {/* Section 10: Intellectual Property */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    10. INTELLECTUAL PROPERTY RIGHTS
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">10.1 Pre-Existing IP</p>
                      <p className="mt-1">
                        Each Party retains ownership of intellectual property owned prior to this Agreement.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">10.2 Work Product</p>
                      <p className="mt-1">
                        Unless otherwise stated: Supplier retains ownership of tools, methods, and frameworks. Client receives a limited, non-transferable license to use deliverables for internal business purposes.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">10.3 Restrictions</p>
                      <p className="mt-1">
                        Client may not resell, sublicense, or reverse engineer Supplier materials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 11: Representations and Warranties */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    11. REPRESENTATIONS AND WARRANTIES
                  </h3>
                  <p className="ml-4">
                    Each Party represents that: it has authority to enter this Agreement; execution does not violate other agreements; and Services will not knowingly infringe third-party rights.
                  </p>
                </div>

                {/* Section 12: Disclaimer */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    12. DISCLAIMER OF WARRANTIES
                  </h3>
                  <p className="ml-4">
                    Except as expressly stated, Supplier disclaims all warranties, including implied warranties of merchantability and fitness for a particular purpose.
                  </p>
                </div>

                {/* Section 13: Limitation of Liability */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    13. LIMITATION OF LIABILITY
                  </h3>
                  <p className="ml-4">
                    To the maximum extent permitted by law: Supplier shall not be liable for indirect, incidental, or consequential damages. Total liability shall not exceed fees paid in the preceding 12 months.
                  </p>
                </div>

                {/* Section 14: Indemnification */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    14. INDEMNIFICATION
                  </h3>
                  <div className="ml-4">
                    <p className="font-semibold">14.1 By Client</p>
                    <p className="mt-1">
                      Client agrees to indemnify Supplier against claims arising from: Client's misuse of Services; Client-provided content; and violation of laws or third-party rights.
                    </p>
                  </div>
                </div>

                {/* Section 15: Termination */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    15. TERMINATION
                  </h3>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className="font-semibold">15.1 Termination for Convenience</p>
                      <p className="mt-1">
                        Either Party may terminate with 30 days' notice.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">15.2 Termination for Cause</p>
                      <p className="mt-1">
                        Immediate termination if the other Party: breaches this Agreement; fails to pay fees; or engages in illegal activity.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">15.3 Effect of Termination</p>
                      <p className="mt-1">
                        Outstanding payments become immediately due. Licenses granted to Client terminate. Confidentiality obligations remain.
                      </p>
                    </div>
                    {contract.terminationTerms && (
                      <div className="mt-2">
                        <p className="font-semibold">Additional Termination Terms:</p>
                        <p className="mt-1">{contract.terminationTerms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 16: Suspension */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    16. SUSPENSION OF SERVICES
                  </h3>
                  <p className="ml-4">
                    Supplier may suspend Services without liability if: payments are overdue; Client violates this Agreement; or legal or security risks arise.
                  </p>
                </div>

                {/* Section 17: Force Majeure */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    17. FORCE MAJEURE
                  </h3>
                  <p className="ml-4">
                    Neither Party shall be liable for delays caused by events beyond reasonable control, including acts of God, war, pandemics, government actions, or internet failures.
                  </p>
                </div>

                {/* Section 18: Governing Law */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    18. GOVERNING LAW AND JURISDICTION
                  </h3>
                  <p className="ml-4">
                    This Agreement shall be governed by the laws of Rwanda. Courts located in Rwanda shall have exclusive jurisdiction unless arbitration is specified.
                  </p>
                </div>

                {/* Section 19: Dispute Resolution */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    19. DISPUTE RESOLUTION
                  </h3>
                  <p className="ml-4">
                    Disputes shall be resolved through: good-faith negotiation; mediation; and court action if unresolved.
                  </p>
                </div>

                {/* Section 20: Assignment */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    20. ASSIGNMENT
                  </h3>
                  <p className="ml-4">
                    Client may not assign this Agreement without Supplier's prior written consent.
                  </p>
                </div>

                {/* Section 21: Severability */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    21. SEVERABILITY
                  </h3>
                  <p className="ml-4">
                    If any provision is found invalid, the remaining provisions shall remain in full force.
                  </p>
                </div>

                {/* Section 22: Waiver */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    22. WAIVER
                  </h3>
                  <p className="ml-4">
                    Failure to enforce any provision shall not constitute a waiver of future enforcement.
                  </p>
                </div>

                {/* Section 23: Entire Agreement */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    23. ENTIRE AGREEMENT
                  </h3>
                  <p className="ml-4">
                    This Agreement constitutes the entire agreement between the Parties and supersedes all prior agreements.
                  </p>
                </div>

                {/* Section 24: Electronic Acceptance */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                    24. ELECTRONIC ACCEPTANCE & SIGNATURE
                  </h3>
                  <p className="ml-4">
                    By clicking "I Agree," signing electronically, or using Supplier's Services, Client agrees to be legally bound by this Agreement.
                  </p>
                </div>

                {/* Special Conditions */}
                {contract.specialConditions && (
                  <div>
                    <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                      SPECIAL CONDITIONS
                    </h3>
                    <p className="ml-4">{contract.specialConditions}</p>
                  </div>
                )}

                {/* Signatures Section */}
                <div className="mt-12 space-y-12 border-t-2 border-gray-300 pt-8 dark:border-gray-600">
                  <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                    {/* Supplier Signature */}
                    <div className="space-y-6">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        SUPPLIER
                      </p>
                      {contract.supplierSignature ? (
                        <div className="mb-6 flex items-center justify-center">
                          <img
                            src={contract.supplierSignature}
                            alt="Supplier signature"
                            className="max-h-20 w-auto object-contain dark:brightness-0 dark:invert"
                          />
                        </div>
                      ) : (
                        <div className="mb-6 h-20"></div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            Name: {contract.supplierCompany || contract.supplierName || (
                              <span className="text-gray-500 dark:text-gray-400">. . . . . . . . . . . . . . . . . . . .</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            Date: {contract.updateOn ? (
                              formatDate(contract.updateOn)
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">. . . . . . . . . . . . . . . . . . . .</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Client Signature */}
                    <div className="space-y-6">
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        CLIENT
                      </p>
                      {contract.clientSignature ? (
                        <div className="mb-6 flex items-center justify-center">
                          <img
                            src={contract.clientSignature}
                            alt="Client signature"
                            className="max-h-20 w-auto object-contain dark:brightness-0 dark:invert"
                          />
                        </div>
                      ) : (
                        <div className="mb-6 h-20"></div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            Name: {contract.clientCompany || contract.clientName || (
                              <span className="text-gray-500 dark:text-gray-400">. . . . . . . . . . . . . . . . . . . .</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            Date: {contract.doneAt ? (
                              formatDate(contract.doneAt)
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">. . . . . . . . . . . . . . . . . . . .</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="mt-8 border-t-2 border-gray-300 pt-6 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    This contract is legally binding and enforceable under the laws governing the Plas Platform. For any disputes or issues, please reference the Contract Tracking ID: <span className="font-mono font-semibold">{contract.id}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col gap-3 border-t-2 border-gray-300 pt-8 dark:border-gray-600 sm:flex-row sm:justify-end">
                {isSupplier && contract.status === "waiting_for_supplier" && (
                  <button
                    onClick={() => setShowAcceptModal(true)}
                    disabled={accepting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    {accepting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Accept Contract
                      </>
                    )}
                  </button>
                )}
                {contract.status === "active" && (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    {downloading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Download Contract
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Contract not found</p>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Acceptance Modal */}
      {showAcceptModal && (
        <>
          <div
            className="fixed inset-0 z-[10002] bg-black/50 transition-opacity"
            onClick={() => {
              setShowAcceptModal(false);
              setSupplierSignature("");
              setSupplierPhoto("");
              setTermsAgreed(false);
            }}
          />
          <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-gray-900">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Accept Contract
                </h2>
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setSupplierSignature("");
                    setSupplierPhoto("");
                    setTermsAgreed(false);
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 space-y-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To accept this contract, please provide your signature and capture a photo. By accepting, you agree to all terms and conditions outlined in this contract.
                  </p>

                  {/* Supplier Signature */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                      Your Signature <span className="text-red-500">*</span>
                    </label>
                    <SignaturePad
                      value={supplierSignature}
                      onChange={setSupplierSignature}
                    />
                  </div>

                  {/* Supplier Photo */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                      Your Photo <span className="text-red-500">*</span>
                    </label>
                    <PhotoCapture
                      value={supplierPhoto}
                      onChange={setSupplierPhoto}
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="mt-6">
                    <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600"
                      />
                      <span>
                        I have read and agree to all terms and conditions of this contract. I understand that by signing and accepting this contract, I am legally bound to fulfill all obligations as the Supplier.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSupplierSignature("");
                      setSupplierPhoto("");
                      setTermsAgreed(false);
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAcceptance}
                    disabled={accepting || !supplierSignature || !supplierPhoto || !termsAgreed}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-800"
                  >
                    {accepting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Accept Contract
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

