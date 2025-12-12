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
} from "lucide-react";

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

interface ContractAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignContract: (contractData: ContractData) => void;
  rfqData: {
    id: string;
    title: string;
    description: string;
    budget: { min: number; max: number };
  };
  supplierData: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
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
}: ContractAssignmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractData, setContractData] = useState<ContractData>({
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
    totalValue: rfqData.budget.min,
    currency: "USD",
    paymentSchedule: "monthly",
    deliverables: [
      {
        id: "1",
        description: "Initial project setup and planning",
        dueDate: "",
        value: 0,
        status: "pending",
      },
    ],
    terms: {
      paymentTerms: "Net 30 days",
      deliveryTerms: "As per agreed schedule",
      warrantyTerms: "12 months from delivery",
      terminationTerms: "30 days written notice",
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
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        position: "Supplier Representative",
      },
    },
    specialConditions: "",
    attachments: [],
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate signatures and photos
      if (
        !clientSignature ||
        !supplierSignature ||
        !clientPhoto ||
        !supplierPhoto ||
        !signatureConsent
      ) {
        alert(
          "Please capture both signatures and photos and accept the consent before assigning the contract."
        );
        setIsSubmitting(false);
        return;
      }
      // Calculate total value from deliverables
      const totalValue = calculateTotalValue();
      const updatedContractData: any = {
        ...contractData,
        totalValue: totalValue || contractData.totalValue,
        // Attach evidence
        signatures: {
          clientSignature,
          supplierSignature,
          clientPhoto,
          supplierPhoto,
          consentAccepted: signatureConsent,
        },
      };

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onAssignContract(updatedContractData);
      onClose();
    } catch (error) {
      console.error("Error assigning contract:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
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
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
          className="max-h-[60vh] overflow-y-auto p-6"
        >
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
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
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
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={contractData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 12 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Contract Value *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={contractData.totalValue}
                      onChange={(e) =>
                        handleInputChange(
                          "totalValue",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
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
              </div>
            </div>
          )}

          {/* Step 2: Terms & Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.paymentTerms}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "paymentTerms",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.deliveryTerms}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "deliveryTerms",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Warranty Terms
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.warrantyTerms}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "warrantyTerms",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Termination Terms
                  </label>
                  <input
                    type="text"
                    value={contractData.terms.terminationTerms}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "terms",
                        "terminationTerms",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
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

              <div className="space-y-4">
                {contractData.deliverables.map((deliverable, index) => (
                  <div
                    key={deliverable.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={deliverable.description}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          required
                        />
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
                            onChange={(e) =>
                              handleDeliverableChange(
                                index,
                                "dueDate",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Value ($)
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
                Signatures & Photo Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Both parties must sign and capture a photo at the time of
                signing.
              </p>

              {/* Client (Buyer) */}
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

              {/* Supplier */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Supplier Signature
                  </h4>
                  <SignaturePad
                    value={supplierSignature}
                    onChange={setSupplierSignature}
                  />
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Supplier Photo
                  </h4>
                  <PhotoCapture
                    value={supplierPhoto}
                    onChange={setSupplierPhoto}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={signatureConsent}
                  onChange={(e) => setSignatureConsent(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  I confirm that both parties have signed in person and the
                  captured photos were taken at the time of signing. I consent
                  to store the signature and photo as proof of agreement.
                </span>
              </label>
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    Supplier Evidence
                  </h4>
                  <div className="flex items-center gap-4">
                    {supplierSignature && (
                      <img
                        src={supplierSignature}
                        alt="Supplier signature"
                        className="h-20 rounded border dark:border-gray-600"
                      />
                    )}
                    {supplierPhoto && (
                      <img
                        src={supplierPhoto}
                        alt="Supplier photo"
                        className="h-20 w-20 rounded-full border object-cover dark:border-gray-600"
                      />
                    )}
                  </div>
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
                type="submit"
                disabled={isSubmitting}
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
