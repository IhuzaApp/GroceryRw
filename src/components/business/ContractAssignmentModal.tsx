"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// Lightweight signature pad using canvas that returns a data URL
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
    ctx.strokeStyle = "#111827"; // gray-900
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

// Lightweight photo capture using getUserMedia + canvas
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

interface ContractData {
  contractId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  supplierCompany: string;
  contractTitle: string;
  contractType: "service" | "supply" | "maintenance" | "consulting";
  startDate: string;
  endDate: string;
  duration: string;
  totalValue: number;
  currency: string;
  paymentSchedule:
    | "monthly"
    | "quarterly"
    | "annually"
    | "milestone"
    | "one-time";
  deliverables: Array<{
    id: string;
    description: string;
    dueDate: string;
    value: number;
    status: "pending" | "in-progress" | "completed";
  }>;
  terms: {
    paymentTerms: string;
    deliveryTerms: string;
    warrantyTerms: string;
    terminationTerms: string;
    forceMajeure: string;
    confidentiality: string;
    intellectualProperty: string;
  };
  contactInfo: {
    clientContact: {
      name: string;
      email: string;
      phone: string;
      position: string;
    };
    supplierContact: {
      name: string;
      email: string;
      phone: string;
      position: string;
    };
  };
  specialConditions: string;
  attachments: File[];
}

interface QuoteResponseData {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCompany: string;
  quoteAmount: number;
  currency: string;
  deliveryTime: string;
  validity: string;
  message: string;
  terms: {
    payment: string;
    warranty: string;
    delivery: string;
    cancellation: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

interface ContractAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignContract: (contractData: ContractData) => void;
  rfqData: {
    id: string;
    title: string;
    description: string;
    budget: { min: number; max: number };
    estimated_quantity?: string;
  };
  supplierData: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  quoteResponseId?: string; // The ID of the quote response being accepted
  quoteResponse?: QuoteResponseData; // Full quote response data
}

const contractTypes = [
  { value: "service", label: "Service Agreement" },
  { value: "supply", label: "Supply Contract" },
  { value: "maintenance", label: "Maintenance Contract" },
  { value: "consulting", label: "Consulting Agreement" },
];

const paymentSchedules = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "milestone", label: "Milestone-based" },
  { value: "one-time", label: "One-time Payment" },
];

export function ContractAssignmentModal({
  isOpen,
  onClose,
  onAssignContract,
  rfqData,
  supplierData,
  quoteResponseId,
  quoteResponse,
}: ContractAssignmentModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserBusinessId, setCurrentUserBusinessId] = useState<
    string | null
  >(null);
  const [userRole, setUserRole] = useState<"client" | "supplier" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    startDate?: boolean;
    endDate?: boolean;
    deliverables?: number[]; // indices of invalid deliverables
    signatures?: string[]; // missing signature fields
  }>({});

  // Initialize contract data with quote response data if available
  const getInitialContractData = (): ContractData => {
    const baseData: ContractData = {
      contractId: `CONTRACT-${Date.now()}`,
      rfqId: rfqData.id,
      supplierId: supplierData.id,
      supplierName: supplierData.name,
      supplierCompany: supplierData.company,
      contractTitle: `Contract for ${rfqData.title}`,
      contractType: "service",
      startDate: "",
      endDate: "",
      duration: "",
      totalValue: quoteResponse?.quoteAmount || rfqData.budget.min,
      currency: quoteResponse?.currency || "RWF",
      paymentSchedule: "monthly",
      deliverables: [
        {
          id: "1",
          description:
            quoteResponse?.message || "Initial project setup and planning",
          dueDate: "",
          value: quoteResponse?.quoteAmount || 0,
          status: "pending",
        },
      ],
      terms: {
        paymentTerms: quoteResponse?.terms?.payment || "Net 30 days",
        deliveryTerms:
          quoteResponse?.terms?.delivery || "As per agreed schedule",
        warrantyTerms:
          quoteResponse?.terms?.warranty || "12 months from delivery",
        terminationTerms:
          quoteResponse?.terms?.cancellation || "30 days written notice",
        forceMajeure: "Standard force majeure clause",
        confidentiality: "Mutual confidentiality agreement",
        intellectualProperty: "Client retains IP rights",
      },
      contactInfo: {
        clientContact: {
          name: "",
          email: "",
          phone: "",
          position: "",
        },
        supplierContact: {
          name: quoteResponse?.contactInfo?.name || supplierData.name,
          email: quoteResponse?.contactInfo?.email || supplierData.email,
          phone: quoteResponse?.contactInfo?.phone || supplierData.phone,
          position:
            quoteResponse?.contactInfo?.position || "Supplier Representative",
        },
      },
      specialConditions: "",
      attachments: [],
    };
    return baseData;
  };

  const [contractData, setContractData] = useState<ContractData>(
    getInitialContractData()
  );

  // Determine user role (client or supplier) based on business account
  useEffect(() => {
    const determineUserRole = async () => {
      if (!session?.user?.id) return;

      try {
        // Get current user's business account
        const response = await fetch("/api/queries/check-business-account");
        const data = await response.json();

        if (data.hasAccount && data.account?.id) {
          const userBusinessId = data.account.id;
          setCurrentUserBusinessId(userBusinessId);

          // Compare with supplier's business ID
          // If user's business ID matches supplier's ID, they are the supplier
          // Otherwise, they are the client (buyer)
          if (userBusinessId === supplierData.id) {
            setUserRole("supplier");
          } else {
            setUserRole("client");
          }
        }
      } catch (error) {
        console.error("Error determining user role:", error);
        // Default to client if we can't determine
        setUserRole("client");
      }
    };

    if (isOpen && session?.user) {
      determineUserRole();
    }
  }, [isOpen, session, supplierData.id]);

  // Update contract data when quote response changes
  useEffect(() => {
    if (quoteResponse && isOpen) {
      setContractData((prev) => ({
        ...prev,
        totalValue: quoteResponse.quoteAmount,
        currency: quoteResponse.currency,
        supplierName: quoteResponse.supplierName,
        supplierCompany: quoteResponse.supplierCompany,
        terms: {
          ...prev.terms,
          paymentTerms: quoteResponse.terms.payment || prev.terms.paymentTerms,
          deliveryTerms:
            quoteResponse.terms.delivery || prev.terms.deliveryTerms,
          warrantyTerms:
            quoteResponse.terms.warranty || prev.terms.warrantyTerms,
          terminationTerms:
            quoteResponse.terms.cancellation || prev.terms.terminationTerms,
        },
        contactInfo: {
          ...prev.contactInfo,
          supplierContact: {
            name: quoteResponse.contactInfo.name,
            email: quoteResponse.contactInfo.email,
            phone: quoteResponse.contactInfo.phone,
            position:
              quoteResponse.contactInfo.position || "Supplier Representative",
          },
        },
        deliverables: prev.deliverables.map((del, index) =>
          index === 0
            ? {
                ...del,
                description: quoteResponse.message || del.description,
                value: quoteResponse.quoteAmount || del.value,
              }
            : del
        ),
      }));
    }
  }, [quoteResponse, isOpen]);

  // Signature and photo capture state
  const [clientSignature, setClientSignature] = useState<string>("");
  const [supplierSignature, setSupplierSignature] = useState<string>("");
  const [clientPhoto, setClientPhoto] = useState<string>("");
  const [supplierPhoto, setSupplierPhoto] = useState<string>("");
  const [signatureConsent, setSignatureConsent] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Contract Details",
      description: "Basic contract information",
    },
    {
      id: 2,
      title: "Terms & Conditions",
      description: "Contract terms and conditions",
    },
    {
      id: 3,
      title: "Deliverables",
      description: "Project deliverables and timeline",
    },
    {
      id: 4,
      title: "Signatures",
      description: "Capture signatures and photos",
    },
    {
      id: 5,
      title: "Review & Assign",
      description: "Final review and contract assignment",
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setContractData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parentField: string,
    childField: string,
    value: any
  ) => {
    setContractData((prev) => {
      const prevAny: any = prev as any;
      const nextParent = Object.assign({}, prevAny[parentField] || {}, {
        [childField]: value,
      });
      return Object.assign({}, prevAny, {
        [parentField]: nextParent,
      }) as ContractData;
    });
  };

  const handleDeliverableChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newDeliverables = [...contractData.deliverables];
    newDeliverables[index] = { ...newDeliverables[index], [field]: value };
    setContractData((prev) => ({
      ...prev,
      deliverables: newDeliverables,
    }));
  };

  const addDeliverable = () => {
    const newDeliverable = {
      id: Date.now().toString(),
      description: "",
      dueDate: "",
      value: 0,
      status: "pending" as const,
    };
    setContractData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable],
    }));
  };

  const removeDeliverable = (index: number) => {
    setContractData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setContractData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setContractData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalValue = () => {
    return contractData.deliverables.reduce(
      (total, deliverable) => total + deliverable.value,
      0
    );
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return "";

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate years, months, weeks, and days
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const weeks = Math.floor((diffDays % 30) / 7);
    const days = diffDays % 7;

    // Format duration in a readable way
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    }
    if (weeks > 0 && years === 0) {
      // Only show weeks if less than a year
      parts.push(`${weeks} ${weeks === 1 ? "week" : "weeks"}`);
    }
    if (days > 0 && years === 0 && months === 0) {
      // Only show days if less than a month
      parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }

    return parts.length > 0 ? parts.join(", ") : `${diffDays} days`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Form submitted, starting validation...");
    setIsSubmitting(true);

    try {
      // Validate required fields and collect all missing fields
      const missingFields: string[] = [];

      if (!quoteResponseId) {
        missingFields.push("Quote response ID");
      }

      if (!contractData.startDate) {
        missingFields.push("Start date");
      }

      if (!contractData.endDate) {
        missingFields.push("End date");
      }

      // Validate deliverables
      const invalidDeliverables = contractData.deliverables.filter(
        (del, index) => !del.description || !del.dueDate
      );
      if (invalidDeliverables.length > 0) {
        missingFields.push(
          `Deliverable ${invalidDeliverables
            .map((_, i) => i + 1)
            .join(", ")} (description and due date)`
        );
      }

      // Validate client signature and photo only
      if (!clientSignature) missingFields.push("Client signature");
      if (!clientPhoto) missingFields.push("Client photo");
      if (!signatureConsent) missingFields.push("Signature consent");

      if (missingFields.length > 0) {
        toast.error(
          `Please complete the following: ${missingFields.join(", ")}`,
          { duration: 5000 }
        );
        setIsSubmitting(false);
        return;
      }

      // Calculate total value from deliverables
      const totalValue = calculateTotalValue();
      const contractValue = totalValue || contractData.totalValue;

      if (!contractValue || contractValue <= 0) {
        toast.error("Contract value must be greater than 0.");
        setIsSubmitting(false);
        return;
      }

      // Prepare deliverables as JSON
      const deliverablesJson = contractData.deliverables.map((deliverable) => ({
        id: deliverable.id,
        description: deliverable.description,
        dueDate: deliverable.dueDate,
        value: deliverable.value,
        status: deliverable.status,
      }));

      console.log("Submitting contract with data:", {
        rfq_response_id: quoteResponseId,
        contract_Value: contractValue.toString(),
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        type: contractData.contractType,
      });

      // Call the API to create the contract
      const requestBody = {
        rfq_response_id: quoteResponseId,
        contract_Value: contractValue.toString(),
        value: contractValue.toString(),
        type: contractData.contractType,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        duration: contractData.duration || "",
        dueDate: contractData.endDate, // Using endDate as dueDate if not specified separately
        paymentSchedule: contractData.paymentSchedule,
        paymentTerms: contractData.terms.paymentTerms || "",
        terminationTerms: contractData.terms.terminationTerms || "",
        specialConditions: contractData.specialConditions || "",
        projecDeliverables: deliverablesJson,
        clientSignature: clientSignature,
        clientPhoto: clientPhoto,
        supplierSignature: supplierSignature,
        supplierPhoto: supplierPhoto,
        proofAggred: signatureConsent,
        status: "waiting_for_supplier", // Contract starts as waiting for supplier to accept
      };

      console.log("API Request Body:", requestBody);

      const response = await fetch("/api/mutations/add-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API Response Status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("API Response Data:", data);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        const text = await response.text();
        console.error("Response text:", text);
        toast.error("Failed to parse server response. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        const errorMessage =
          data.graphqlErrors ||
          data.message ||
          data.error ||
          "Failed to create contract";
        console.error("API Error:", errorMessage, data);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Prepare contract data for callback
      const updatedContractData: any = {
        ...contractData,
        totalValue: contractValue,
        rfqResponseId: quoteResponseId,
        // Attach evidence
        signatures: {
          clientSignature,
          supplierSignature,
          clientPhoto,
          supplierPhoto,
          consentAccepted: signatureConsent,
        },
      };

      toast.success("Contract created successfully!");

      // Small delay to show success message
      await new Promise((resolve) => setTimeout(resolve, 500));

      onAssignContract(updatedContractData);
      onClose();
    } catch (error: any) {
      console.error("Error assigning contract:", error);
      const errorMessage =
        error?.message || "Failed to create contract. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    switch (currentStep) {
      case 1: // Contract Details
        if (!contractData.startDate) {
          errors.startDate = true;
          isValid = false;
        }
        if (!contractData.endDate) {
          errors.endDate = true;
          isValid = false;
        }
        if (contractData.startDate && contractData.endDate) {
          const start = new Date(contractData.startDate);
          const end = new Date(contractData.endDate);
          if (end <= start) {
            toast.error("End date must be after start date", {
              duration: 3000,
            });
            errors.endDate = true;
            isValid = false;
          }
        }
        if (!isValid) {
          toast.error("Please complete all required fields", {
            duration: 3000,
          });
        }
        setFieldErrors(errors);
        return isValid;

      case 2: // Terms & Conditions
        // Terms are mostly optional or pre-filled, so no validation needed
        setFieldErrors({});
        return true;

      case 3: // Deliverables
        const invalidIndices: number[] = [];
        contractData.deliverables.forEach((del, index) => {
          if (!del.description || !del.dueDate) {
            invalidIndices.push(index);
            isValid = false;
          }
        });
        if (!isValid) {
          errors.deliverables = invalidIndices;
          toast.error(
            `Please fill in description and due date for all deliverables`,
            { duration: 4000 }
          );
        }
        setFieldErrors(errors);
        return isValid;

      case 4: // Signatures
        const missingSignatures: string[] = [];

        // Only validate client signature and photo
        if (!clientSignature) missingSignatures.push("Client signature");
        if (!clientPhoto) missingSignatures.push("Client photo");
        if (!signatureConsent) missingSignatures.push("Signature consent");

        if (missingSignatures.length > 0) {
          errors.signatures = missingSignatures;
          isValid = false;
          toast.error(`Please complete: ${missingSignatures.join(", ")}`, {
            duration: 4000,
          });
        }
        setFieldErrors(errors);
        return isValid;

      default:
        setFieldErrors({});
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return; // Don't proceed if validation fails
    }
    if (currentStep < steps.length) {
      setFieldErrors({}); // Clear errors when moving to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assign Contract
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create contract for {rfqData.title}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                  }`}
                  style={
                    currentStep >= step.id ? { color: "#ffffff" } : undefined
                  }
                >
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-12 ${
                      currentStep > step.id
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-h-[60vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quote Response Information Display */}
          {quoteResponse && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-200">
                Quote Response Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Supplier:
                  </span>
                  <p className="text-blue-900 dark:text-blue-100">
                    {quoteResponse.supplierCompany} (
                    {quoteResponse.supplierName})
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Quote Amount:
                  </span>
                  <p className="text-blue-900 dark:text-blue-100">
                    {contractData.currency}{" "}
                    {quoteResponse.quoteAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Delivery Time:
                  </span>
                  <p className="text-blue-900 dark:text-blue-100">
                    {quoteResponse.deliveryTime}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Quote Validity:
                  </span>
                  <p className="text-blue-900 dark:text-blue-100">
                    {quoteResponse.validity}
                  </p>
                </div>
                {quoteResponse.message && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Supplier Message:
                    </span>
                    <p className="text-blue-900 dark:text-blue-100">
                      {quoteResponse.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Contract Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract Title *
                  </label>
                  <input
                    type="text"
                    value={contractData.contractTitle}
                    onChange={(e) =>
                      handleInputChange("contractTitle", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract Type *
                  </label>
                  <select
                    value={contractData.contractType}
                    onChange={(e) =>
                      handleInputChange("contractType", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {contractTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        handleInputChange("startDate", newStartDate);
                        if (fieldErrors.startDate) {
                          setFieldErrors({ ...fieldErrors, startDate: false });
                        }
                        // Auto-calculate duration if end date is also set
                        if (newStartDate && contractData.endDate) {
                          const calculatedDuration = calculateDuration(
                            newStartDate,
                            contractData.endDate
                          );
                          handleInputChange("duration", calculatedDuration);
                        }
                      }}
                      className={`w-full rounded-lg border py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 ${
                        fieldErrors.startDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500 dark:border-gray-600"
                      } dark:bg-gray-700 dark:text-white`}
                      required
                    />
                    {fieldErrors.startDate && (
                      <p className="mt-1 text-xs text-red-500">
                        Start date is required
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="date"
                      value={contractData.endDate}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        handleInputChange("endDate", newEndDate);
                        if (fieldErrors.endDate) {
                          setFieldErrors({ ...fieldErrors, endDate: false });
                        }
                        // Auto-calculate duration if start date is also set
                        if (contractData.startDate && newEndDate) {
                          const calculatedDuration = calculateDuration(
                            contractData.startDate,
                            newEndDate
                          );
                          handleInputChange("duration", calculatedDuration);
                        }
                      }}
                      className={`w-full rounded-lg border py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 ${
                        fieldErrors.endDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500 dark:border-gray-600"
                      } dark:bg-gray-700 dark:text-white`}
                      required
                    />
                    {fieldErrors.endDate && (
                      <p className="mt-1 text-xs text-red-500">
                        End date is required
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration{" "}
                    {contractData.startDate &&
                      contractData.endDate &&
                      "(Auto-calculated)"}
                  </label>
                  <input
                    type="text"
                    value={contractData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 ${
                      contractData.startDate && contractData.endDate
                        ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "dark:bg-gray-700 dark:text-white"
                    }`}
                    placeholder={
                      contractData.startDate && contractData.endDate
                        ? "Calculated automatically"
                        : "e.g., 12 months"
                    }
                    readOnly={
                      !!(contractData.startDate && contractData.endDate)
                    }
                    title={
                      contractData.startDate && contractData.endDate
                        ? "Automatically calculated from start and end dates"
                        : "Enter duration manually or select dates to auto-calculate"
                    }
                  />
                  {contractData.startDate &&
                    contractData.endDate &&
                    contractData.duration && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        ✓ Automatically calculated from selected dates
                      </p>
                    )}
                </div>
              </div>

              {/* Supplier Information - Read Only */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Supplier Information (from Quote)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={contractData.supplierName}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Supplier Company
                    </label>
                    <input
                      type="text"
                      value={contractData.supplierCompany}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Contact Information - Read Only */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Supplier Contact Information (from Quote)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={contractData.contactInfo.supplierContact.name}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <input
                      type="email"
                      value={contractData.contactInfo.supplierContact.email}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contractData.contactInfo.supplierContact.phone}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Position
                    </label>
                    <input
                      type="text"
                      value={contractData.contactInfo.supplierContact.position}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Contract Value * (from Quote)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={contractData.totalValue}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      {contractData.currency}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This value comes from the accepted quote and cannot be
                    changed
                  </p>
                </div>
                {rfqData.estimated_quantity && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity (from RFQ)
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <input
                        type="text"
                        value={rfqData.estimated_quantity}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Estimated quantity from the RFQ
                    </p>
                  </div>
                )}
                {!rfqData.estimated_quantity && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Schedule *
                    </label>
                    <select
                      value={contractData.paymentSchedule}
                      onChange={(e) =>
                        handleInputChange("paymentSchedule", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {paymentSchedules.map((schedule) => (
                        <option key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {rfqData.estimated_quantity && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Schedule *
                    </label>
                    <select
                      value={contractData.paymentSchedule}
                      onChange={(e) =>
                        handleInputChange("paymentSchedule", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      {paymentSchedules.map((schedule) => (
                        <option key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Terms & Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Quote Terms Display */}
              {quoteResponse && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <h4 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Terms from Quote Response
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Payment Terms:
                      </span>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {quoteResponse.terms.payment}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Delivery Terms:
                      </span>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {quoteResponse.terms.delivery}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Warranty Terms:
                      </span>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {quoteResponse.terms.warranty}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Cancellation Terms:
                      </span>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {quoteResponse.terms.cancellation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Terms (from Quote)
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.paymentTerms}
                    readOnly={!!quoteResponse}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "paymentTerms",
                        e.target.value
                      )
                    }
                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 ${
                      quoteResponse
                        ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                  {quoteResponse && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pre-filled from quote response
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery Terms (from Quote)
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.deliveryTerms}
                    readOnly={!!quoteResponse}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "deliveryTerms",
                        e.target.value
                      )
                    }
                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 ${
                      quoteResponse
                        ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                  {quoteResponse && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pre-filled from quote response
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Warranty Terms (from Quote)
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.warrantyTerms}
                    readOnly={!!quoteResponse}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "warrantyTerms",
                        e.target.value
                      )
                    }
                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 ${
                      quoteResponse
                        ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                  {quoteResponse && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pre-filled from quote response
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Termination Terms (from Quote)
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.terminationTerms}
                    readOnly={!!quoteResponse}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "terminationTerms",
                        e.target.value
                      )
                    }
                    className={`w-full rounded-lg border border-gray-300 px-4 py-3 ${
                      quoteResponse
                        ? "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                  {quoteResponse && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pre-filled from quote response
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Special Conditions
                </label>
                <textarea
                  value={contractData.specialConditions}
                  onChange={(e) =>
                    handleInputChange("specialConditions", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any special conditions or requirements..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Deliverables */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project Deliverables
                </h3>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  style={{ color: "#ffffff" }}
                >
                  Add Deliverable
                </button>
              </div>

              {quoteResponse && contractData.deliverables.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> The first deliverable has been
                    pre-filled with information from the quote response. You can
                    modify it or add additional deliverables.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {contractData.deliverables.map((deliverable, index) => (
                  <div
                    key={deliverable.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                  >
                    {index === 0 && quoteResponse && (
                      <div className="mb-3 rounded bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Pre-filled from quote response
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={deliverable.description}
                          onChange={(e) => {
                            handleDeliverableChange(
                              index,
                              "description",
                              e.target.value
                            );
                            if (fieldErrors.deliverables?.includes(index)) {
                              setFieldErrors({
                                ...fieldErrors,
                                deliverables: fieldErrors.deliverables.filter(
                                  (i) => i !== index
                                ),
                              });
                            }
                          }}
                          className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 ${
                            fieldErrors.deliverables?.includes(index) &&
                            !deliverable.description
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-green-500 dark:border-gray-600"
                          } dark:bg-gray-700 dark:text-white`}
                          required
                        />
                        {fieldErrors.deliverables?.includes(index) &&
                          !deliverable.description && (
                            <p className="mt-1 text-xs text-red-500">
                              Description is required
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Due Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <input
                            type="date"
                            value={deliverable.dueDate}
                            onChange={(e) => {
                              handleDeliverableChange(
                                index,
                                "dueDate",
                                e.target.value
                              );
                              if (fieldErrors.deliverables?.includes(index)) {
                                setFieldErrors({
                                  ...fieldErrors,
                                  deliverables: fieldErrors.deliverables.filter(
                                    (i) => i !== index
                                  ),
                                });
                              }
                            }}
                            className={`w-full rounded-lg border py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 ${
                              fieldErrors.deliverables?.includes(index) &&
                              !deliverable.dueDate
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-green-500 dark:border-gray-600"
                            } dark:bg-gray-700 dark:text-white`}
                            required
                          />
                        </div>
                        {fieldErrors.deliverables?.includes(index) &&
                          !deliverable.dueDate && (
                            <p className="mt-1 text-xs text-red-500">
                              Due date is required
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Value ({contractData.currency})
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <input
                            type="number"
                            value={deliverable.value}
                            onChange={(e) =>
                              handleDeliverableChange(
                                index,
                                "value",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          {index === 0 && quoteResponse && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Pre-filled from quote amount
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {contractData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        Remove Deliverable
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Total Contract Value:
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${calculateTotalValue().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Signatures */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Client Signature & Photo Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please sign and capture a photo to complete the contract
                acceptance.
              </p>

              {/* Client Signature and Photo */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Client Signature
                  </h4>
                  <SignaturePad
                    value={clientSignature}
                    onChange={setClientSignature}
                  />
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Client Photo
                  </h4>
                  <PhotoCapture value={clientPhoto} onChange={setClientPhoto} />
                </div>
              </div>

              <div>
                <label
                  className={`flex items-start gap-2 text-sm ${
                    fieldErrors.signatures?.includes("Signature consent")
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={signatureConsent}
                    onChange={(e) => {
                      setSignatureConsent(e.target.checked);
                      if (
                        fieldErrors.signatures?.includes("Signature consent")
                      ) {
                        setFieldErrors({
                          ...fieldErrors,
                          signatures: fieldErrors.signatures.filter(
                            (s) => s !== "Signature consent"
                          ),
                        });
                      }
                    }}
                    className={`mt-1 h-4 w-4 ${
                      fieldErrors.signatures?.includes("Signature consent")
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span>
                    I confirm that both parties have signed in person and the
                    captured photos were taken at the time of signing. I consent
                    to store the signature and photo as proof of agreement.
                  </span>
                </label>
                {fieldErrors.signatures?.includes("Signature consent") && (
                  <p className="mt-1 text-xs text-red-500">
                    Please accept the signature consent
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Assign */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Contract Summary
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Contract Title:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {contractData.contractTitle}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Supplier:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {contractData.supplierCompany}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Duration:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {contractData.startDate} to {contractData.endDate}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Total Value:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      ${contractData.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Payment Schedule:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {contractData.paymentSchedule}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Deliverables:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {contractData.deliverables.length} items
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">
                      Contract Assignment
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      By assigning this contract, you are entering into a
                      legally binding agreement with{" "}
                      {contractData.supplierCompany}. The contract will be sent
                      to both parties for review and signature.
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence preview */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Client Evidence
                </h4>
                <div className="flex items-center gap-4">
                  {clientSignature && (
                    <img
                      src={clientSignature}
                      alt="Client signature"
                      className="h-20 rounded border dark:border-gray-600"
                    />
                  )}
                  {clientPhoto && (
                    <img
                      src={clientPhoto}
                      alt="Client photo"
                      className="h-20 w-20 rounded-full border object-cover dark:border-gray-600"
                    />
                  )}
                  {!clientSignature && !clientPhoto && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No evidence captured yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600"
                style={{ color: "#ffffff" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Assign Contract button clicked directly");
                  // Manually trigger form submission
                  const form = e.currentTarget.closest("form");
                  if (form) {
                    const submitEvent = new Event("submit", {
                      bubbles: true,
                      cancelable: true,
                    });
                    form.dispatchEvent(submitEvent);
                  } else {
                    // Fallback: call handleSubmit directly
                    handleSubmit(e as any);
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: "#ffffff" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning Contract...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Assign Contract
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
