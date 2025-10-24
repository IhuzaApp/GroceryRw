import React, { useState, memo, useCallback, useRef, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import ShopperRegistrationForm from "@components/shopper/ShopperRegistrationForm";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";

// Mobile Component - Clean, minimal design
const MobileBecomeShopper = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Form - Full page, no card styling */}
      <div className="h-full">
        <MobileShopperRegistrationForm />
      </div>
    </div>
  );
};

// Custom Input Component for mobile - same as desktop
const MobileCustomInput = memo(
  ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    value = "",
    onChange,
    error = "",
    options = null,
    rows = 1,
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    options?: { label: string; value: string }[] | null;
    rows?: number;
  }) => {
    const { theme } = useTheme();
    return (
      <div className="space-y-2">
        <label
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {type === "select" && options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-100"
                : "border-gray-300 bg-white text-gray-900"
            }`}
          />
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

MobileCustomInput.displayName = "MobileCustomInput";

// File Upload Component for Irembo documents
const MobileFileUploadInput = memo(
  ({
    label,
    name,
    file,
    onChange,
    onRemove,
    error = "",
    description = "Upload document from Irembo site (PDF, JPEG, PNG)",
  }: {
    label: string;
    name: string;
    file: File | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    error?: string;
    description?: string;
  }) => {
    const { theme } = useTheme();

    return (
      <div className="space-y-2">
        <label
          className={`block text-sm font-medium ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
        </label>

        <p
          className={`text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>

        {file ? (
          <div
            className={`rounded-lg border p-4 ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {file.name}
                </span>
                <span
                  className={`ml-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button
                onClick={onRemove}
                className={`rounded p-1 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20`}
              >
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              id={name}
              name={name}
              onChange={onChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor={name}
              className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                error
                  ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : theme === "dark"
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <svg
                  className="mb-2 h-8 w-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  PDF, PNG, JPG (MAX. 5MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

MobileFileUploadInput.displayName = "MobileFileUploadInput";

// Mobile-specific form component with complete desktop functionality
const MobileShopperRegistrationForm = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();
  const [formValue, setFormValue] = useState<Record<string, string>>({
    full_name: "",
    address: "",
    phone_number: "",
    national_id: "",
    transport_mode: "on_foot",
    driving_license: "",
    guarantor: "",
    guarantorPhone: "",
    guarantorRelationship: "",
    mutual_status: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [capturedLicense, setCapturedLicense] = useState<string>("");
  const [capturedNationalIdFront, setCapturedNationalIdFront] =
    useState<string>("");
  const [capturedNationalIdBack, setCapturedNationalIdBack] =
    useState<string>("");
  const [capturedPoliceClearance, setCapturedPoliceClearance] =
    useState<string>("");
  const [capturedProofOfResidency, setCapturedProofOfResidency] =
    useState<string>("");
  const [capturedMutualStatus, setCapturedMutualStatus] = useState<string>("");
  const [policeClearanceFile, setPoliceClearanceFile] = useState<File | null>(
    null
  );
  const [proofOfResidencyFile, setProofOfResidencyFile] = useState<File | null>(
    null
  );
  const [maritalStatusFile, setMaritalStatusFile] = useState<File | null>(null);
  const [capturedSignature, setCapturedSignature] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [captureMode, setCaptureMode] = useState<string>("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingExistingData, setLoadingExistingData] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [locationInputRef] = useState<React.RefObject<HTMLInputElement>>(
    React.createRef()
  );
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [videoRef] = useState<React.RefObject<HTMLVideoElement>>(
    React.createRef()
  );
  const [canvasRef] = useState<React.RefObject<HTMLCanvasElement>>(
    React.createRef()
  );
  const [signatureCanvasRef] = useState<React.RefObject<HTMLCanvasElement>>(
    React.createRef()
  );
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize signature canvas
  useEffect(() => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [showSignaturePad]);

  // Handle video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const steps = [
    { title: "Personal Info", description: "Basic information" },
    { title: "Contact Details", description: "Phone & Telegram" },
    { title: "Address & Location", description: "Residence details" },
    { title: "Guarantor Info", description: "Reference person" },
    { title: "Documents", description: "Required documents" },
    { title: "Review & Submit", description: "Final review" },
  ];

  // Options arrays - same as desktop
  const transportOptions = [
    { label: "Car", value: "car" },
    { label: "Motorcycle", value: "motorcycle" },
    { label: "Bicycle", value: "bicycle" },
    { label: "On Foot", value: "on_foot" },
  ];

  const guarantorRelationshipOptions = [
    { label: "Family Member", value: "family" },
    { label: "Friend", value: "friend" },
    { label: "Colleague", value: "colleague" },
    { label: "Other", value: "other" },
  ];

  const mutualStatusOptions = [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Divorced", value: "divorced" },
    { label: "Widowed", value: "widowed" },
    { label: "Separated", value: "separated" },
    { label: "Prefer not to say", value: "prefer_not_to_say" },
  ];

  // Complete validation function - same as desktop
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "full_name":
        return !value.trim() ? "Full name is required" : null;
      case "address":
        return !value.trim() ? "Address is required" : null;
      case "phone_number":
        if (!value.trim()) return "Phone number is required";
        if (!/^\+?[0-9]{10,15}$/.test(value))
          return "Please enter a valid phone number";
        return null;
      case "national_id":
        return !value.trim() ? "National ID is required" : null;
      case "transport_mode":
        return !value.trim() ? "Transport mode is required" : null;
      case "guarantorPhone":
        if (value && !/^\+?[0-9]{10,15}$/.test(value))
          return "Please enter a valid phone number";
        return null;
      case "guarantor":
        return value && value.trim().length < 2
          ? "Guarantor name must be at least 2 characters"
          : null;
      case "guarantorRelationship":
        return value && value.trim().length < 2
          ? "Please specify relationship to guarantor"
          : null;
      default:
        return null;
    }
  };

  // Handle input change - same as desktop
  const handleInputChange = useCallback((name: string, value: string) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing and validate the new value
    setErrors((prev) => {
      const newErrors = { ...prev };

      // Remove the error for this field
      if (newErrors[name]) {
        delete newErrors[name];
      }

      // Validate the new value
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      }

      return newErrors;
    });
  }, []);

  // Next step function - same validation as desktop
  const nextStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Personal Info
        ["full_name", "national_id", "transport_mode"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 1: // Contact Details
        ["phone_number"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 2: // Address
        ["address"].forEach((field) => {
          const error = validateField(field, formValue[field] || "");
          if (error) newErrors[field] = error;
        });
        break;
      case 3: // Guarantor
        if (
          formValue.guarantor ||
          formValue.guarantorPhone ||
          formValue.guarantorRelationship
        ) {
          ["guarantor", "guarantorPhone", "guarantorRelationship"].forEach(
            (field) => {
              const error = validateField(field, formValue[field] || "");
              if (error) newErrors[field] = error;
            }
          );
        }
        break;
      case 4: // Documents
        // Document validation can be added here if needed
        break;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step function
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Image compression utility
  const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions
        let { width, height } = img;
        const maxDimension = 800;

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        // Try different quality levels to meet size requirement
        let quality = 0.8;
        let dataURL = canvas.toDataURL("image/jpeg", quality);

        while (dataURL.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataURL = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = base64;
    });
  };

  // Camera functionality
  const startCamera = async (mode: string) => {
    try {
      setCameraLoading(true);
      setCameraError(null);
      setCaptureMode(mode);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setCameraLoading(false);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraLoading(false);
      setCameraError(
        "Unable to access camera. Please check permissions and try again."
      );
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraLoading(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx?.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL("image/jpeg");

      // Compress and set the appropriate state
      compressImage(dataURL)
        .then((compressedDataURL) => {
          switch (captureMode) {
            case "profile":
              setCapturedPhoto(compressedDataURL);
              break;
            case "national_id_front":
              setCapturedNationalIdFront(compressedDataURL);
              break;
            case "national_id_back":
              setCapturedNationalIdBack(compressedDataURL);
              break;
            case "license":
              setCapturedLicense(compressedDataURL);
              break;
          }
          stopCamera();
          setCaptureMode("");
          toast.success("Photo captured successfully!");
        })
        .catch((error) => {
          console.error("Error compressing image:", error);
          toast.error("Error processing image");
        });
    }
  };

  // File upload handlers
  const handleFileChange = (
    name: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      switch (name) {
        case "police_clearance":
          setPoliceClearanceFile(file);
          break;
        case "proof_of_residency":
          setProofOfResidencyFile(file);
          break;
        case "marital_status":
          setMaritalStatusFile(file);
          break;
      }
    }
  };

  const removeFile = (name: string) => {
    switch (name) {
      case "police_clearance":
        setPoliceClearanceFile(null);
        break;
      case "proof_of_residency":
        setProofOfResidencyFile(null);
        break;
      case "marital_status":
        setMaritalStatusFile(null);
        break;
    }
  };

  // Signature functionality
  const startSignaturePad = () => {
    setShowSignaturePad(true);
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      setCapturedSignature(dataURL);
      setShowSignaturePad(false);
      toast.success("Signature saved!");
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    // Add your submission logic here
    setTimeout(() => {
      setLoading(false);
      router.push("/Plasa");
    }, 2000);
  };

  // Render step content - complete desktop functionality
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderContactDetailsStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderGuarantorStep();
      case 4:
        return renderDocumentsStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Personal Info Step - same as desktop
  const renderPersonalInfoStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3
            className={`mb-6 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Personal Information
          </h3>
          <div className="space-y-4">
            <MobileCustomInput
              key="full_name"
              label="Full Name"
              name="full_name"
              value={formValue.full_name}
              onChange={(value) => handleInputChange("full_name", value)}
              error={errors.full_name}
              required
            />

            <MobileCustomInput
              key="national_id"
              label="National ID"
              name="national_id"
              value={formValue.national_id}
              onChange={(value) => handleInputChange("national_id", value)}
              error={errors.national_id}
              required
            />

            <MobileCustomInput
              key="transport_mode"
              label="Transport Mode"
              name="transport_mode"
              type="select"
              value={formValue.transport_mode}
              onChange={(value) => handleInputChange("transport_mode", value)}
              error={errors.transport_mode}
              options={transportOptions}
              required
            />

            <MobileCustomInput
              key="driving_license"
              label="Driving License"
              name="driving_license"
              value={formValue.driving_license}
              onChange={(value) => handleInputChange("driving_license", value)}
              error={errors.driving_license}
              placeholder="Enter driving license number (optional)"
            />
          </div>
        </div>
      </div>
    );
  };

  // Contact Details Step - same as desktop
  const renderContactDetailsStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3
            className={`mb-6 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Contact Details
          </h3>
          <div className="space-y-4">
            <MobileCustomInput
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formValue.phone_number}
              onChange={(value) => handleInputChange("phone_number", value)}
              error={errors.phone_number}
              placeholder="+250 123 456 789"
              required
            />
          </div>
        </div>
      </div>
    );
  };

  // Address Step - same as desktop
  const renderAddressStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3
            className={`mb-6 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Address & Location
          </h3>
          <div className="space-y-4">
            <MobileCustomInput
              label="Address"
              name="address"
              type="textarea"
              value={formValue.address}
              onChange={(value) => handleInputChange("address", value)}
              error={errors.address}
              placeholder="Enter your full address"
              rows={3}
              required
            />

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Location (for coordinates)
              </label>
              <input
                id="location-autocomplete"
                type="text"
                placeholder="Search for your location..."
                className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.latitude || errors.longitude
                    ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-gray-100"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                ref={locationInputRef}
              />
              {(errors.latitude || errors.longitude) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.latitude || errors.longitude}
                </p>
              )}
              {formValue.latitude && formValue.longitude && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  ✓ Location captured: {formValue.latitude},{" "}
                  {formValue.longitude}
                </p>
              )}
            </div>

            <MobileCustomInput
              label="Marital Status"
              name="mutual_status"
              type="select"
              value={formValue.mutual_status}
              onChange={(value) => handleInputChange("mutual_status", value)}
              error={errors.mutual_status}
              options={mutualStatusOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  // Guarantor Step - same as desktop
  const renderGuarantorStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3
            className={`mb-6 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Guarantor Information
          </h3>
          <p
            className={`mb-6 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Provide contact information for someone who can vouch for you
            (optional)
          </p>
          <div className="space-y-4">
            <MobileCustomInput
              label="Guarantor Name"
              name="guarantor"
              value={formValue.guarantor}
              onChange={(value) => handleInputChange("guarantor", value)}
              error={errors.guarantor}
              placeholder="Full name of your guarantor"
            />

            <MobileCustomInput
              label="Guarantor Phone"
              name="guarantorPhone"
              type="tel"
              value={formValue.guarantorPhone}
              onChange={(value) => handleInputChange("guarantorPhone", value)}
              error={errors.guarantorPhone}
              placeholder="+250 123 456 789"
            />

            <MobileCustomInput
              label="Relationship"
              name="guarantorRelationship"
              type="select"
              value={formValue.guarantorRelationship}
              onChange={(value) =>
                handleInputChange("guarantorRelationship", value)
              }
              error={errors.guarantorRelationship}
              options={guarantorRelationshipOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  // Documents Step - complete mobile implementation
  const renderDocumentsStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3
            className={`mb-6 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Required Documents
          </h3>

          {/* Profile Photo */}
          <div className="mb-8">
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <p
              className={`mb-4 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Take a clear photo of yourself
            </p>
            {capturedPhoto ? (
              <div className="mt-2">
                <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <Image
                    src={capturedPhoto}
                    alt="Captured profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => startCamera("profile")}
                    className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 !text-white transition-colors hover:bg-green-700"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => startCamera("profile")}
                  className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 !text-white transition-colors hover:bg-green-700"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Take Profile Photo
                </button>
              </div>
            )}
            {errors.profile_photo && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.profile_photo}
              </p>
            )}
          </div>

          {/* Photo Documents */}
          <div className="mb-8">
            <h4
              className={`text-md mb-4 font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Photo Documents (Take with Camera)
            </h4>
            <div className="space-y-6">
              {/* National ID Front */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  National ID Front <span className="text-red-500">*</span>
                </label>
                {capturedNationalIdFront ? (
                  <div className="mt-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                      <Image
                        src={capturedNationalIdFront}
                        alt="National ID Front"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => startCamera("national_id_front")}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-sm !text-white transition-colors hover:bg-green-700"
                    >
                      <svg
                        className="mr-1 h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startCamera("national_id_front")}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 !text-white transition-colors hover:bg-green-700"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                    Take Photo
                  </button>
                )}
                {errors.national_id_front && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.national_id_front}
                  </p>
                )}
              </div>

              {/* National ID Back */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  National ID Back <span className="text-red-500">*</span>
                </label>
                {capturedNationalIdBack ? (
                  <div className="mt-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                      <Image
                        src={capturedNationalIdBack}
                        alt="National ID Back"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => startCamera("national_id_back")}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-sm !text-white transition-colors hover:bg-green-700"
                    >
                      <svg
                        className="mr-1 h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startCamera("national_id_back")}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 !text-white transition-colors hover:bg-green-700"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                    Take Photo
                  </button>
                )}
                {errors.national_id_back && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.national_id_back}
                  </p>
                )}
              </div>

              {/* Driving License */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Driving License Photo
                </label>
                {capturedLicense ? (
                  <div className="mt-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                      <Image
                        src={capturedLicense}
                        alt="Driving License"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => startCamera("license")}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-3 py-1.5 text-sm !text-white transition-colors hover:bg-green-700"
                    >
                      <svg
                        className="mr-1 h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startCamera("license")}
                    className={`mt-2 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 transition-colors ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                    Take Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="mb-8">
            <h4
              className={`text-md mb-4 font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Official Documents (Upload from Irembo)
            </h4>
            <div className="space-y-6">
              <MobileFileUploadInput
                label="Police Clearance Certificate"
                name="police_clearance"
                file={policeClearanceFile}
                onChange={(e) => handleFileChange("police_clearance", e)}
                onRemove={() => removeFile("police_clearance")}
                error={errors.police_clearance}
                description="Upload Police Clearance Certificate from Irembo site (PDF, JPEG, PNG)"
              />

              <MobileFileUploadInput
                label="Proof of Residency"
                name="proof_of_residency"
                file={proofOfResidencyFile}
                onChange={(e) => handleFileChange("proof_of_residency", e)}
                onRemove={() => removeFile("proof_of_residency")}
                error={errors.proof_of_residency}
                description="Upload Proof of Residency from Irembo site (PDF, JPEG, PNG)"
              />

              <MobileFileUploadInput
                label="Marital Status Certificate"
                name="marital_status"
                file={maritalStatusFile}
                onChange={(e) => handleFileChange("marital_status", e)}
                onRemove={() => removeFile("marital_status")}
                error={errors.marital_status}
                description="Upload Marital Status Certificate from Irembo site (PDF, JPEG, PNG)"
              />
            </div>
          </div>

          {/* Digital Signature */}
          <div className="mt-6">
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Digital Signature
            </label>
            <p
              className={`mb-3 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sign in the box below using your finger or stylus
            </p>

            {capturedSignature ? (
              <div className="mt-2">
                <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <Image
                    src={capturedSignature}
                    alt="Digital Signature"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={startSignaturePad}
                    className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm !text-white transition-colors hover:bg-green-700"
                  >
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Sign Again
                  </button>
                  <button
                    onClick={() => setCapturedSignature("")}
                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
                  >
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startSignaturePad}
                className={`mt-2 inline-flex items-center rounded-lg px-4 py-2 transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Sign Here
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Review Step - same as desktop
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Review Your Information
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Personal Information
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {formValue.full_name}
                </p>
                <p>
                  <strong>National ID:</strong> {formValue.national_id}
                </p>
                <p>
                  <strong>Transport:</strong>{" "}
                  {
                    transportOptions.find(
                      (t) => t.value === formValue.transport_mode
                    )?.label
                  }
                </p>
                {formValue.driving_license && (
                  <p>
                    <strong>Driving License:</strong>{" "}
                    {formValue.driving_license}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Contact Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Phone:</strong> {formValue.phone_number}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Address
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Address:</strong> {formValue.address}
                </p>
                {formValue.latitude && formValue.longitude && (
                  <p>
                    <strong>Coordinates:</strong> {formValue.latitude},{" "}
                    {formValue.longitude}
                  </p>
                )}
                {formValue.mutual_status && (
                  <p>
                    <strong>Marital Status:</strong>{" "}
                    {
                      mutualStatusOptions.find(
                        (m) => m.value === formValue.mutual_status
                      )?.label
                    }
                  </p>
                )}
              </div>
            </div>

            {(formValue.guarantor ||
              formValue.guarantorPhone ||
              formValue.guarantorRelationship) && (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Guarantor Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {formValue.guarantor}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formValue.guarantorPhone}
                  </p>
                  <p>
                    <strong>Relationship:</strong>{" "}
                    {
                      guarantorRelationshipOptions.find(
                        (g) => g.value === formValue.guarantorRelationship
                      )?.label
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Documents Status
              </h4>
              <div className="space-y-2 text-sm">
                <p>
                  ✅ Profile Photo: {capturedPhoto ? "Uploaded" : "Missing"}
                </p>
                <p>
                  ✅ National ID Front:{" "}
                  {capturedNationalIdFront ? "Uploaded" : "Missing"}
                </p>
                <p>
                  ✅ National ID Back:{" "}
                  {capturedNationalIdBack ? "Uploaded" : "Missing"}
                </p>
                <p>
                  📄 Driving License:{" "}
                  {capturedLicense ? "Uploaded" : "Not provided"}
                </p>
                <p>
                  📄 Police Clearance:{" "}
                  {policeClearanceFile
                    ? `Uploaded (${policeClearanceFile.name})`
                    : "Not provided"}
                </p>
                <p>
                  📄 Proof of Residency:{" "}
                  {proofOfResidencyFile
                    ? `Uploaded (${proofOfResidencyFile.name})`
                    : "Not provided"}
                </p>
                <p>
                  📄 Marital Status Certificate:{" "}
                  {maritalStatusFile
                    ? `Uploaded (${maritalStatusFile.name})`
                    : "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="-mx-4 -mt-6 flex h-full flex-col">
      {/* Mobile Header */}
      <div className="w-full border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`rounded-lg p-2 transition-colors ${
              currentStep === 0
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {steps[currentStep].description}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {currentStep + 1} of {steps.length}
            </p>
          </div>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="mx-4 flex-1 px-4 py-6">{renderStepContent()}</div>

      {/* Mobile Footer */}
      <div className="mx-4 border-t border-gray-200 px-4 py-4 dark:border-gray-700">
        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={Object.keys(errors).length > 0}
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              Object.keys(errors).length > 0
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-green-600 !text-white hover:bg-green-700"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              loading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-green-600 !text-white hover:bg-green-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        )}
      </div>

      {/* Camera Modal */}
      {(stream || cameraLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Take Photo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position the document/yourself in the frame and tap capture
              </p>
            </div>

            <div className="relative mb-4">
              {cameraLoading ? (
                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-900">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
                    <p className="text-sm text-white">Starting camera...</p>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-red-900">
                  <div className="text-center">
                    <svg
                      className="mx-auto mb-2 h-12 w-12 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-sm text-red-200">{cameraError}</p>
                    <button
                      onClick={() => startCamera(captureMode)}
                      className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-64 w-full rounded-lg bg-gray-900 object-cover"
                  style={{ transform: "scaleX(-1)" }} // Mirror the video for better UX
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={stopCamera}
                className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                disabled={cameraLoading}
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 !text-white hover:bg-green-700 disabled:opacity-50"
                disabled={cameraLoading || !stream}
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Digital Signature
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign using your finger or stylus
              </p>
            </div>

            <div className="mb-4">
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                onMouseDown={handleSignatureStart}
                onMouseMove={handleSignatureMove}
                onMouseUp={handleSignatureEnd}
                onMouseLeave={handleSignatureEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  handleSignatureStart(mouseEvent as any);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  handleSignatureMove(mouseEvent as any);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSignatureEnd();
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSignaturePad(false)}
                className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 !text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Desktop Component - Original design
const DesktopBecomeShopper = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="ml-16 p-4">
        <div className="mx-auto max-w-6xl">
          {/* Desktop Header */}
          <div className="mb-8 text-center">
            <div
              className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ${
                theme === "dark"
                  ? "bg-green-600/20 text-white"
                  : "bg-green-100 text-white"
              }`}
            >
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1
              className={`mb-4 text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Become a Plasa
            </h1>
            <p
              className={`mx-auto max-w-2xl text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join our community of delivery partners and start earning money by
              delivering orders to customers in your area.
            </p>
          </div>

          {/* Desktop Benefits Section */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              className={`rounded-xl border p-6 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                  theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                }`}
              >
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3
                className={`mb-2 font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Earn Money
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Get paid for each delivery you complete. The more you deliver,
                the more you earn.
              </p>
            </div>

            <div
              className={`rounded-xl border p-6 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                  theme === "dark" ? "bg-green-600/20" : "bg-green-100"
                }`}
              >
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className={`mb-2 font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Flexible Schedule
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Work when you want. Choose your own hours and accept deliveries
                that fit your schedule.
              </p>
            </div>

            <div
              className={`rounded-xl border p-6 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                  theme === "dark" ? "bg-purple-600/20" : "bg-purple-100"
                }`}
              >
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className={`mb-2 font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Easy Application
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Simple step-by-step application process. Get approved quickly
                and start delivering.
              </p>
            </div>
          </div>

          {/* Desktop Registration Form */}
          <div
            className={`rounded-2xl border ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-white shadow-lg"
            }`}
          >
            <ShopperRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BecomeShopperPage() {
  return (
    <RootLayout>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileBecomeShopper />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopBecomeShopper />
      </div>
    </RootLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };

  // Original authentication code (disabled for testing)
  // const session = await getServerSession(
  //   context.req,
  //   context.res,
  //   authOptions as any
  // );
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: "/Auth/Login?callbackUrl=/Myprofile/become-shopper",
  //       permanent: false,
  //     },
  //   };
  // }
  // return { props: {} };
};
