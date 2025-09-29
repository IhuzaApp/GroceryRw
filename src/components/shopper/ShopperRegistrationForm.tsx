import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

// Google Maps API types
declare global {
  interface Window {
    google: any;
  }
}

// Custom Input Component - moved outside to prevent recreation
const CustomInput = memo(({ 
  label, 
  name, 
  type = "text", 
  required = false, 
  placeholder = "", 
  value = "", 
  onChange,
  error = "",
  options = null,
  rows = 1
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
      <label className={`block text-sm font-medium ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
          className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
          className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.label === nextProps.label &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type &&
    prevProps.required === nextProps.required &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.rows === nextProps.rows
  );
});

CustomInput.displayName = 'CustomInput';

// File Upload Component for Irembo documents
const FileUploadInput = memo(({
  label,
  name,
  file,
  onChange,
  onRemove,
  error = "",
  description = "Upload document from Irembo site (PDF, JPEG, PNG)"
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
      <label className={`block text-sm font-medium ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}>
        {label}
      </label>
      
      <p className={`text-xs ${
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      }`}>
        {description}
      </p>

      {file ? (
        <div className={`p-4 rounded-lg border ${
          theme === "dark" 
            ? "border-gray-600 bg-gray-700" 
            : "border-gray-300 bg-gray-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}>
                {file.name}
              </span>
              <span className={`text-xs ml-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <button
              onClick={onRemove}
              className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors`}
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                : theme === "dark"
                ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className={`text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}>
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
});

FileUploadInput.displayName = 'FileUploadInput';

// Form validation functions
const validateField = (name: string, value: string): string | null => {
  switch (name) {
    case 'full_name':
      return !value.trim() ? 'Full name is required' : null;
    case 'address':
      return !value.trim() ? 'Address is required' : null;
    case 'phone_number':
      if (!value.trim()) return 'Phone number is required';
      if (!/^\+?[0-9]{10,15}$/.test(value)) return 'Please enter a valid phone number';
      return null;
    case 'national_id':
      return !value.trim() ? 'National ID is required' : null;
    case 'transport_mode':
      return !value.trim() ? 'Transport mode is required' : null;
    case 'guarantorPhone':
      if (value && !/^\+?[0-9]{10,15}$/.test(value)) return 'Please enter a valid phone number';
      return null;
    case 'guarantor':
      return value && value.trim().length < 2 ? 'Guarantor name must be at least 2 characters' : null;
    case 'guarantorRelationship':
      return value && value.trim().length < 2 ? 'Please specify relationship to guarantor' : null;
    default:
      return null;
  }
};

// Add these helper functions for image compression
const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = document.createElement("img");
    img.src = base64;

    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement("canvas");

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      const maxDimension = 800; // Max width or height

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Get compressed image as base64
      let quality = 0.7; // Initial quality
      let compressedBase64 = canvas.toDataURL("image/jpeg", quality);

      // If still too large, reduce quality until we get under target size
      const maxSize = maxSizeKB * 1024;
      while (compressedBase64.length > maxSize && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

export default function ShopperRegistrationForm() {
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [capturedLicense, setCapturedLicense] = useState<string>("");
  const [capturedNationalIdFront, setCapturedNationalIdFront] = useState<string>("");
  const [capturedNationalIdBack, setCapturedNationalIdBack] = useState<string>("");
  const [capturedPoliceClearance, setCapturedPoliceClearance] = useState<string>("");
  const [capturedProofOfResidency, setCapturedProofOfResidency] = useState<string>("");
  const [capturedMutualStatus, setCapturedMutualStatus] = useState<string>("");
  
  // File upload states for documents from Irembo
  const [policeClearanceFile, setPoliceClearanceFile] = useState<File | null>(null);
  const [proofOfResidencyFile, setProofOfResidencyFile] = useState<File | null>(null);
  const [maritalStatusFile, setMaritalStatusFile] = useState<File | null>(null);
  const [capturedSignature, setCapturedSignature] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  
  // Signature pad states
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [captureMode, setCaptureMode] = useState<"profile" | "license" | "national_id_front" | "national_id_back">(
    "profile"
  );
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
    details?: any;
  } | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingExistingData, setLoadingExistingData] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSaved, setAutoSaved] = useState(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-save form data to localStorage only when step changes
  useEffect(() => {
    const autoSaveData = {
      formValue,
      currentStep,
      capturedPhoto,
      capturedLicense,
      capturedNationalIdFront,
      capturedNationalIdBack,
      capturedPoliceClearance,
      capturedProofOfResidency,
      capturedMutualStatus,
      capturedSignature,
    };
    localStorage.setItem('shopperRegistrationDraft', JSON.stringify(autoSaveData));
    setAutoSaved(true);
    
    // Clear auto-saved indicator after 3 seconds
    const timer = setTimeout(() => setAutoSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [currentStep, capturedPhoto, capturedLicense, capturedNationalIdFront, capturedNationalIdBack, capturedPoliceClearance, capturedProofOfResidency, capturedMutualStatus, capturedSignature]);

  // Debounced auto-save for form values (saves after user stops typing for 2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      const autoSaveData = {
        formValue,
        currentStep,
        capturedPhoto,
        capturedLicense,
        capturedNationalIdFront,
        capturedNationalIdBack,
        capturedPoliceClearance,
        capturedProofOfResidency,
        capturedMutualStatus,
        capturedSignature,
      };
      localStorage.setItem('shopperRegistrationDraft', JSON.stringify(autoSaveData));
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [formValue]);

  // Load saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('shopperRegistrationDraft');
    if (savedDraft && !session?.user?.id) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormValue(draft.formValue || {});
        setCurrentStep(draft.currentStep || 0);
        setCapturedPhoto(draft.capturedPhoto || "");
        setCapturedLicense(draft.capturedLicense || "");
        setCapturedNationalIdFront(draft.capturedNationalIdFront || "");
        setCapturedNationalIdBack(draft.capturedNationalIdBack || "");
        setCapturedPoliceClearance(draft.capturedPoliceClearance || "");
        setCapturedProofOfResidency(draft.capturedProofOfResidency || "");
        setCapturedMutualStatus(draft.capturedMutualStatus || "");
        setCapturedSignature(draft.capturedSignature || "");
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentStep > 0) {
        prevStep();
      } else if (event.key === 'ArrowRight' && currentStep < steps.length - 1 && Object.keys(errors).length === 0) {
        nextStep();
      } else if (event.key === 'Enter' && event.ctrlKey && currentStep === steps.length - 1) {
        if (!loading) {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, errors, loading]);

  // Initialize Google Places API
  useEffect(() => {
    const initializeGooglePlaces = () => {
      if (typeof window !== 'undefined' && window.google && locationInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'rw' }, // Restrict to Rwanda
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            setFormValue(prev => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString()
            }));
            
            // Clear any coordinate errors
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.latitude;
              delete newErrors.longitude;
              return newErrors;
            });
          }
        });
      }
    };

    // Load Google Maps API if not already loaded
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeGooglePlaces;
      document.head.appendChild(script);
    } else {
      initializeGooglePlaces();
    }

    return () => {
      // Cleanup if needed
    };
  }, [currentStep]); // Re-initialize when step changes

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

  const steps = [
    { title: "Personal Info", description: "Basic information" },
    { title: "Contact Details", description: "Phone & Telegram" },
    { title: "Address & Location", description: "Residence details" },
    { title: "Guarantor Info", description: "Reference person" },
    { title: "Documents", description: "Required documents" },
    { title: "Review & Submit", description: "Final review" },
  ];

  // Pre-fill form with user data if available
  useEffect(() => {
    if (session?.user) {
      setFormValue((prev) => ({
        ...prev,
        full_name: (session.user as any).name || "",
        phone_number: (session.user as any).phone || "",
      }));
    }
  }, [session]);

  // Load existing shopper application data
  useEffect(() => {
    const loadExistingApplication = async () => {
      if (!session?.user?.id) return;

      setLoadingExistingData(true);
      try {
        const response = await fetch("/api/queries/get-shopper-application");
        if (response.ok) {
          const data = await response.json();
          if (data.shopper) {
            const shopper = data.shopper;
            
            // Check if this is an update scenario (needCollection is true)
            if (shopper.needCollection) {
              setIsUpdating(true);
              toast("Loading your existing application for updates...", {
                icon: "ℹ️",
                duration: 3000,
              });
            }

            // Load all the form data
            setFormValue({
              full_name: shopper.full_name || "",
              address: shopper.address || "",
              phone_number: shopper.phone_number || "",
              national_id: shopper.national_id || "",
              driving_license: shopper.driving_license || "",
              transport_mode: shopper.transport_mode || "",
              guarantor: shopper.guarantor || "",
              guarantorPhone: shopper.guarantorPhone || "",
              guarantorRelationship: shopper.guarantorRelationship || "",
              latitude: shopper.latitude || "",
              longitude: shopper.longitude || "",
              mutual_status: shopper.mutual_status || "",
            });

            // Load images if they exist
            if (shopper.profile_photo) {
              setCapturedPhoto(shopper.profile_photo);
            }
            if (shopper.national_id_photo_front) {
              setCapturedNationalIdFront(shopper.national_id_photo_front);
            }
            if (shopper.national_id_photo_back) {
              setCapturedNationalIdBack(shopper.national_id_photo_back);
            }
            if (shopper.driving_license) {
              setCapturedLicense(shopper.driving_license);
            }
            if (shopper.signature) {
              setCapturedSignature(shopper.signature);
            }

            // Load files by converting base64 strings to File objects
            if (shopper.Police_Clearance_Cert) {
              try {
                const file = await base64ToFile(shopper.Police_Clearance_Cert, "police_clearance.pdf", "application/pdf");
                setPoliceClearanceFile(file);
              } catch (error) {
                console.error("Error loading Police Clearance file:", error);
              }
            }
            if (shopper.proofOfResidency) {
              try {
                const file = await base64ToFile(shopper.proofOfResidency, "proof_of_residency.pdf", "application/pdf");
                setProofOfResidencyFile(file);
              } catch (error) {
                console.error("Error loading Proof of Residency file:", error);
              }
            }
            if (shopper.mutual_StatusCertificate) {
              try {
                const file = await base64ToFile(shopper.mutual_StatusCertificate, "marital_status_certificate.pdf", "application/pdf");
                setMaritalStatusFile(file);
              } catch (error) {
                console.error("Error loading Marital Status Certificate file:", error);
              }
            }

            // Show collection comment if it exists
            if (shopper.collection_comment) {
              toast.error(`Plas Agent Feedback: ${shopper.collection_comment}`, {
                duration: 8000,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading existing application:", error);
      } finally {
        setLoadingExistingData(false);
      }
    };

    loadExistingApplication();
  }, [session?.user?.id]);

  // Initialize signature canvas when signature pad is shown
  useEffect(() => {
    if (showSignaturePad && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size
        canvas.width = 400;
        canvas.height = 200;
        
        // Set drawing style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignaturePad]);

  // Function to start camera for profile or license
  const startCamera = async (mode: "profile" | "license" | "national_id_front" | "national_id_back") => {
    try {
      // Stop any existing camera stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: (mode === "license" || mode === "national_id_front" || mode === "national_id_back") ? "environment" : "user" 
        },
        audio: false,
      });

      setStream(newStream);
      setShowCamera(true);
      setCaptureMode(mode);

      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  // Function to capture photo
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

        // Compress the image before storing
        compressImage(imageData, 50) // Compress to ~50KB
          .then((compressedImage) => {
            // Store the compressed image based on capture mode
            switch (captureMode) {
              case "profile":
              setCapturedPhoto(compressedImage);
                break;
              case "license":
              setCapturedLicense(compressedImage);
                break;
              case "national_id_front":
                setCapturedNationalIdFront(compressedImage);
                break;
              case "national_id_back":
                setCapturedNationalIdBack(compressedImage);
                break;
            }

            // Switch to preview mode
            setShowPreview(true);
          })
          .catch((error) => {
            console.error("Error compressing image:", error);
            toast.error("Failed to process image");
          });
      }
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Function to retake photo
  const retakePhoto = () => {
    switch (captureMode) {
      case "profile":
      setCapturedPhoto("");
        break;
      case "license":
      setCapturedLicense("");
        break;
      case "national_id_front":
        setCapturedNationalIdFront("");
        break;
      case "national_id_back":
        setCapturedNationalIdBack("");
        break;
    }
    
    // Restart the camera stream for retaking
    setTimeout(() => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      
      // Get a new camera stream
      navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: (captureMode === "license" || captureMode === "national_id_front" || captureMode === "national_id_back") ? "environment" : "user" 
        },
        audio: false,
      }).then((newStream) => {
        setStream(newStream);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        }, 100);
      }).catch((err) => {
        console.error("Error restarting camera:", err);
        toast.error("Could not restart camera. Please try again.");
      });
    }, 100);
  };

  // Function to confirm photo and close camera
  const confirmPhoto = () => {
    stopCamera();
  };

  // Helper function to get current image based on capture mode
  const getCurrentImage = () => {
    switch (captureMode) {
      case "profile":
        return capturedPhoto;
      case "license":
        return capturedLicense;
      case "national_id_front":
        return capturedNationalIdFront;
      case "national_id_back":
        return capturedNationalIdBack;
      default:
        return "";
    }
  };

  // Helper function to convert base64 string to File object
  const base64ToFile = async (base64String: string, filename: string, mimeType: string): Promise<File> => {
    // Remove data URL prefix if present
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create File object
    const file = new File([bytes], filename, { type: mimeType });
    return file;
  };

  // Form validation before submission
  const validateForm = () => {
    // For new applications, require all photos
    if (!isUpdating) {
    if (!capturedPhoto) {
      toast.error("Please take a profile photo");
      return false;
      }
      if (!capturedNationalIdFront) {
        toast.error("Please take a photo of your National ID front");
        return false;
      }
      if (!capturedNationalIdBack) {
        toast.error("Please take a photo of your National ID back");
        return false;
      }
    } else {
      // For updates, only validate if photos are missing (user might have cleared them)
      if (!capturedPhoto && !loadingExistingData) {
        toast.error("Please take a profile photo");
        return false;
      }
      if (!capturedNationalIdFront && !loadingExistingData) {
        toast.error("Please take a photo of your National ID front");
        return false;
      }
      if (!capturedNationalIdBack && !loadingExistingData) {
        toast.error("Please take a photo of your National ID back");
        return false;
      }
    }

    return true;
  };

  // Input change handler - stable reference to prevent re-renders
  const handleInputChange = useCallback((name: string, value: string) => {
    setFormValue(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing and validate the new value
    setErrors(prev => {
      const newErrors = { ...prev };
      
      // Remove the error for this field
      if (newErrors[name]) {
        delete newErrors[name];
      }
      
      // Validate the new value and add error if invalid
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      }
      
      return newErrors;
    });
  }, []);

  const clearDraft = () => {
    localStorage.removeItem('shopperRegistrationDraft');
    setFormValue({
      full_name: "",
      address: "",
      phone_number: "",
      national_id: "",
      driving_license: "",
      transport_mode: "",
      guarantor: "",
      guarantorPhone: "",
      guarantorRelationship: "",
      mutual_status: "",
      latitude: "",
      longitude: "",
    });
    setCurrentStep(0);
    setCapturedPhoto("");
    setCapturedLicense("");
    setCapturedNationalIdFront("");
    setCapturedNationalIdBack("");
    setCapturedPoliceClearance("");
    setCapturedProofOfResidency("");
    setCapturedMutualStatus("");
    setCapturedSignature("");
    toast.success("Draft cleared successfully");
  };


  // Step navigation functions
  const nextStep = () => {
    // Validate current step
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Personal Info
        ['full_name', 'national_id', 'transport_mode'].forEach(field => {
          const error = validateField(field, formValue[field] || '');
          if (error) newErrors[field] = error;
        });
        break;
      case 1: // Contact Details
        ['phone_number'].forEach(field => {
          const error = validateField(field, formValue[field] || '');
          if (error) newErrors[field] = error;
        });
        break;
      case 2: // Address
        ['address'].forEach(field => {
          const error = validateField(field, formValue[field] || '');
          if (error) newErrors[field] = error;
        });
        break;
      case 3: // Guarantor (optional)
        if (formValue.guarantorPhone) {
          const error = validateField('guarantorPhone', formValue.guarantorPhone);
          if (error) newErrors.guarantorPhone = error;
        }
        break;
      case 4: // Documents
        if (!capturedPhoto) newErrors.profile_photo = 'Profile photo is required';
        if (!capturedNationalIdFront) newErrors.national_id_front = 'National ID front is required';
        if (!capturedNationalIdBack) newErrors.national_id_back = 'National ID back is required';
        break;
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // File upload handlers for Irembo documents
  const handleFileUpload = (type: 'police_clearance' | 'proof_of_residency' | 'marital_status', file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPEG, JPG, or PNG file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Set the file
    switch (type) {
      case 'police_clearance':
        setPoliceClearanceFile(file);
        break;
      case 'proof_of_residency':
        setProofOfResidencyFile(file);
        break;
      case 'marital_status':
        setMaritalStatusFile(file);
        break;
    }

    // Clear any related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    toast.success(`${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} uploaded successfully`);
  };

  const handleFileChange = (type: 'police_clearance' | 'proof_of_residency' | 'marital_status', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(type, file);
    }
  };

  const removeFile = (type: 'police_clearance' | 'proof_of_residency' | 'marital_status') => {
    switch (type) {
      case 'police_clearance':
        setPoliceClearanceFile(null);
        break;
      case 'proof_of_residency':
        setProofOfResidencyFile(null);
        break;
      case 'marital_status':
        setMaritalStatusFile(null);
        break;
    }
    toast.success('File removed');
  };

  // Signature pad functions
  const startSignaturePad = () => {
    setShowSignaturePad(true);
  };

  const closeSignaturePad = () => {
    setShowSignaturePad(false);
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setCapturedSignature(dataURL);
      setShowSignaturePad(false);
      setIsDrawing(false);
      toast.success('Signature saved successfully');
    }
  };

  // Signature drawing functions
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = 'touches' in e ? getTouchPos(e) : getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = 'touches' in e ? getTouchPos(e) : getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear any API errors
  const clearApiError = () => {
    setApiError(null);
  };

  // Clear any API errors and prepare for update
  const clearApiErrorAndUpdate = () => {
    setApiError(null);
    // If we're updating an existing application, set a flag
    setIsUpdating(true);
  };


  // Handle form submission
  const handleSubmit = async () => {
    // Clear any previous errors
    clearApiError();

    // Check if session is still loading
    if (sessionStatus === "loading") {
      toast.error("Please wait while we load your session data");
      return;
    }

    // Check if user is authenticated
    if (sessionStatus !== "authenticated" || !session?.user) {
      console.error("Session status:", sessionStatus);
      console.error("Session data:", session);
      toast.error(
        "You need to be logged in to apply as a shopper. Please log in and try again."
      );

      // Redirect to login page
      setTimeout(() => {
        router.push("/Auth/Login?callbackUrl=/Myprofile/become-shopper");
      }, 2000);

      return;
    }

    // Validate required photos
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get the user ID from the session
      const userId = (session.user as any).id;

      if (!userId) {
        toast.error("User ID not found in session");
        console.error("Session user data:", session.user);
        setLoading(false);
        return;
      }

      // Convert files to base64 for API submission
      const convertFileToBase64 = (file: File | null): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (!file) {
            resolve("");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Prepare the data for submission (including photos)
      const shopperData = {
        ...formValue,
        Police_Clearance_Cert: await convertFileToBase64(policeClearanceFile),
        proofOfResidency: await convertFileToBase64(proofOfResidencyFile),
        mutual_StatusCertificate: await convertFileToBase64(maritalStatusFile),
        profile_photo: capturedPhoto,
        national_id_photo_front: capturedNationalIdFront,
        national_id_photo_back: capturedNationalIdBack,
        driving_license: capturedLicense,
        signature: capturedSignature,
        user_id: userId,
        force_update: isUpdating, // Set force_update to true if we're updating an existing application
      };

      // Submit data to our API endpoint
      const response = await fetch("/api/queries/register-shopper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopperData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          // User is already registered as a shopper
          setApiError({
            title: "Already Registered",
            message: data.message || "You are already registered as a shopper",
            details: data.shopper,
          });

          toast.error("You are already registered as a shopper");
        } else {
          throw new Error(
            data.error || data.message || "Failed to register shopper"
          );
        }
        return;
      }

      if (data && data.shopper) {
        // Show success toast
        const isUpdate = data.updated === true;
        toast.success(
          isUpdate
            ? `Your shopper application has been updated!`
            : `Your application has been submitted! Status: ${data.shopper.status}`,
          {
            duration: 5000,
            position: "top-center",
            icon: "🎉",
          }
        );

        // Set success state
        setRegistrationSuccess(true);

        // Redirect back to profile after a short delay
        setTimeout(() => {
          router.push("/Myprofile");
        }, 3000);
      }
    } catch (error: any) {
      // Check if it's a network error or API error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error: Unable to connect to server");
      } else {
        toast.error(`Failed to submit application: ${error.message}`);
      }

      setApiError({
        title: "Registration Failed",
        message: error.message || "An unknown error occurred",
        details: error.stack
      });
    } finally {
      setLoading(false);
      // Reset the updating flag
      setIsUpdating(false);
    }
  };

  // If session is loading, show loading state
  if (sessionStatus === "loading") {
    return (
      <div className="p-8 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          theme === "dark" ? "bg-green-600/20" : "bg-green-100"
        }`}>
          <svg className="animate-spin h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Loading your profile...
        </h3>
        <p className={`${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          Please wait while we load your session data...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show login message
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-red-600/20" : "bg-red-100"
          }`}>
            <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Authentication Required
          </h2>
          <p className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            You need to be logged in to apply as a shopper.
          </p>
          <button
            onClick={() => router.push("/Auth/Login?callbackUrl=/Myprofile/become-shopper")}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // If API returned an "already registered" error, show appropriate message with option to continue
  if (apiError && apiError.title === "Already Registered") {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-yellow-600/20" : "bg-yellow-100"
          }`}>
            <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Already Registered
          </h2>
          <p className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            {apiError.message}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push("/Myprofile")}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Return to Profile
            </button>
            <button
              onClick={() => clearApiErrorAndUpdate()}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Update Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If registration was successful, show a success message
  if (loadingExistingData) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-blue-600/20" : "bg-blue-100"
          }`}>
            <svg className="h-8 w-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Loading Application...
          </h2>
          <p className={`${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Please wait while we load your existing application data.
          </p>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-green-600/20" : "bg-green-100"
          }`}>
            <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Application Submitted!
          </h2>
          <p className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Your application to become a shopper is being reviewed. You&apos;ll be redirected to your profile page shortly.
          </p>
          <button
            onClick={() => router.push("/Myprofile")}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  // Step components
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


  const renderPersonalInfoStep = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CustomInput
            key="full_name"
            label="Full Name"
            name="full_name"
            value={formValue.full_name}
            onChange={(value) => handleInputChange("full_name", value)}
            error={errors.full_name}
            required
          />

          <CustomInput
            key="national_id"
            label="National ID"
            name="national_id"
            value={formValue.national_id}
            onChange={(value) => handleInputChange("national_id", value)}
            error={errors.national_id}
            required
          />

          <CustomInput
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

          <CustomInput
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

  const renderContactDetailsStep = () => {
    return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Contact Details
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CustomInput
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

  const renderAddressStep = () => {
    return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Address & Location
        </h3>
        <div className="space-y-6">
          <CustomInput
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
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Location (for coordinates)
            </label>
            <input
              id="location-autocomplete"
              type="text"
              placeholder="Search for your location..."
              className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.latitude || errors.longitude
                  ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-gray-100"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
              ref={locationInputRef}
            />
            {(errors.latitude || errors.longitude) && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.latitude || errors.longitude}
              </p>
            )}
            {(formValue.latitude && formValue.longitude) && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ Coordinates: {formValue.latitude}, {formValue.longitude}
              </p>
            )}
          </div>

          <CustomInput
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

  const renderGuarantorStep = () => {
    return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Guarantor Information
        </h3>
        <p className={`text-sm mb-6 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          Provide contact information for someone who can vouch for you (optional)
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CustomInput
            label="Guarantor Name"
            name="guarantor"
            value={formValue.guarantor}
            onChange={(value) => handleInputChange("guarantor", value)}
            error={errors.guarantor}
            placeholder="Full name of your guarantor"
          />

          <CustomInput
            label="Guarantor Phone"
            name="guarantorPhone"
            type="tel"
            value={formValue.guarantorPhone}
            onChange={(value) => handleInputChange("guarantorPhone", value)}
            error={errors.guarantorPhone}
            placeholder="+250 123 456 789"
          />

          <CustomInput
            label="Relationship"
            name="guarantorRelationship"
            type="select"
            value={formValue.guarantorRelationship}
            onChange={(value) => handleInputChange("guarantorRelationship", value)}
            error={errors.guarantorRelationship}
            options={guarantorRelationshipOptions}
          />
          </div>
      </div>
    </div>
    );
  };

  const renderDocumentsStep = () => {
    return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Required Documents
        </h3>
        
        {/* Profile Photo */}
        <div className="mb-8">
          <label className={`block text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            Profile Photo <span className="text-red-500">*</span>
          </label>
          <p className={`text-sm mb-4 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
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
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                      Retake Photo
                </button>
                  </div>
                </div>
              ) : (
            <div className="mt-2 flex justify-center">
              <button
                    onClick={() => startCamera("profile")}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Take Profile Photo
              </button>
                </div>
              )}
          {errors.profile_photo && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.profile_photo}</p>
          )}
        </div>

        {/* Row 1: Camera Photos - Front ID, Back ID, Driving License */}
        <div className="mb-8">
          <h4 className={`text-md font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Photo Documents (Take with Camera)
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
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
                  className="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full justify-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Retake
                </button>
              </div>
            ) : (
              <button
                onClick={() => startCamera("national_id_front")}
                className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Take Photo
              </button>
            )}
            {errors.national_id_front && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.national_id_front}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
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
                  className="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full justify-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Retake
                </button>
              </div>
            ) : (
              <button
                onClick={() => startCamera("national_id_back")}
                className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Take Photo
              </button>
            )}
            {errors.national_id_back && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.national_id_back}</p>
            )}
          </div>

          {/* Driving License - Third column */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
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
                  className="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full justify-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Retake
                </button>
                </div>
              ) : (
              <button
                    onClick={() => startCamera("license")}
                className={`mt-2 inline-flex items-center px-4 py-2 rounded-lg transition-colors w-full justify-center ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Take Photo
              </button>
            )}
                </div>
        </div>

        {/* Row 2: File Uploads - Police Clearance, Proof of Residency, Marital Status Certificate */}
        <div className="mb-8">
          <h4 className={`text-md font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Official Documents (Upload from Irembo)
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <FileUploadInput
              label="Police Clearance Certificate"
              name="police_clearance"
              file={policeClearanceFile}
              onChange={(e) => handleFileChange('police_clearance', e)}
              onRemove={() => removeFile('police_clearance')}
              error={errors.police_clearance}
              description="Upload Police Clearance Certificate from Irembo site (PDF, JPEG, PNG)"
            />

            <FileUploadInput
              label="Proof of Residency"
              name="proof_of_residency"
              file={proofOfResidencyFile}
              onChange={(e) => handleFileChange('proof_of_residency', e)}
              onRemove={() => removeFile('proof_of_residency')}
              error={errors.proof_of_residency}
              description="Upload Proof of Residency from Irembo site (PDF, JPEG, PNG)"
            />

            <FileUploadInput
              label="Marital Status Certificate"
              name="marital_status"
              file={maritalStatusFile}
              onChange={(e) => handleFileChange('marital_status', e)}
              onRemove={() => removeFile('marital_status')}
              error={errors.marital_status}
              description="Upload Marital Status Certificate from Irembo site (PDF, JPEG, PNG)"
            />
          </div>
        </div>

        {/* Digital Signature */}
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Digital Signature
            </label>
            <p className={`text-sm mb-3 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Sign in the box below using your mouse or touch
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={startSignaturePad}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Sign Again
                  </button>
                  <button
                    onClick={() => setCapturedSignature("")}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startSignaturePad}
                className={`mt-2 inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Sign Here
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderReviewStep = () => {
    return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Application</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-700">Personal Information</h4>
              <p><strong>Name:</strong> {formValue.full_name}</p>
              <p><strong>National ID:</strong> {formValue.national_id}</p>
              <p><strong>Transport:</strong> {transportOptions.find(t => t.value === formValue.transport_mode)?.label}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Contact Details</h4>
              <p><strong>Phone:</strong> {formValue.phone_number}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Address</h4>
            <p>{formValue.address}</p>
            {formValue.latitude && formValue.longitude && (
              <p><strong>Location:</strong> {formValue.latitude}, {formValue.longitude}</p>
            )}
          </div>

          {formValue.guarantor && (
            <div>
              <h4 className="font-medium text-gray-700">Guarantor</h4>
              <p><strong>Name:</strong> {formValue.guarantor}</p>
              <p><strong>Phone:</strong> {formValue.guarantorPhone}</p>
              <p><strong>Relationship:</strong> {guarantorRelationshipOptions.find(g => g.value === formValue.guarantorRelationship)?.label}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-700">Documents Status</h4>
            <div className="space-y-2">
              <p>✅ Profile Photo: {capturedPhoto ? "Uploaded" : "Missing"}</p>
              <p>✅ National ID Front: {capturedNationalIdFront ? "Uploaded" : "Missing"}</p>
              <p>✅ National ID Back: {capturedNationalIdBack ? "Uploaded" : "Missing"}</p>
              <p>📄 Driving License: {capturedLicense ? "Uploaded" : "Not provided"}</p>
              <p>📄 Police Clearance: {policeClearanceFile ? `Uploaded (${policeClearanceFile.name})` : "Not provided"}</p>
              <p>📄 Proof of Residency: {proofOfResidencyFile ? `Uploaded (${proofOfResidencyFile.name})` : "Not provided"}</p>
              <p>📄 Marital Status Certificate: {maritalStatusFile ? `Uploaded (${maritalStatusFile.name})` : "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Shopper Application
          </h2>
          <p className={`${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            Complete all steps to apply as a shopper. Your information will be reviewed by our team.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className={`flex justify-between text-sm font-medium mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            <span>Step {currentStep + 1} of {steps.length}</span>
            <div className="flex items-center space-x-4">
              {autoSaved && (
                <span className={`flex items-center text-xs ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Progress saved
                </span>
              )}
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap ${
                  theme === "dark" ? "bg-gray-800 text-gray-200 border border-gray-700" : "bg-gray-900 text-white"
                }`}>
                  <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                  <div>← Previous step</div>
                  <div>→ Next step</div>
                  <div>Ctrl+Enter Submit</div>
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Custom Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? "bg-green-600 border-green-600 text-white"
                    : theme === "dark"
                    ? "border-gray-600 text-gray-400"
                    : "border-gray-300 text-gray-500"
                }`}>
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    index <= currentStep
                      ? theme === "dark" ? "text-white" : "text-gray-900"
                      : theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-600"
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    index < currentStep ? "bg-green-600" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Show general API error if any */}
        {apiError && apiError.title !== "Already Registered" && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-200">{apiError?.title}</h4>
                <p className="text-red-700 dark:text-red-300">{apiError?.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Render current step content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
          <div className="flex justify-center sm:justify-start">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={Object.keys(errors).length > 0}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  Object.keys(errors).length > 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={clearDraft}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                theme === "dark"
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
              title="Clear all form data and start over"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Draft
            </button>
            
            <button
                onClick={() => router.push("/Myprofile")}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              >
                Cancel
            </button>
          </div>
        </div>

        {currentStep === steps.length - 1 && (
          <div className={`mt-8 pt-6 border-t ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              What Happens Next?
            </h3>
            <ol className={`ml-5 space-y-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Our team will review your application
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We&apos;ll conduct a background check
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Once approved, you&apos;ll be notified via email
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You can then start accepting delivery orders
              </li>
          </ol>
        </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={stopCamera}></div>
            <div className={`relative w-full max-w-md rounded-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-xl`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                <h3 className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {                   captureMode === "profile" ? "Take Profile Photo" :
                   captureMode === "license" ? "Take License Photo" :
                   captureMode === "national_id_front" ? "Take National ID Front Photo" :
                   captureMode === "national_id_back" ? "Take National ID Back Photo" : "Take Photo"}
                </h3>
                <button
                  onClick={stopCamera}
                  className={`p-2 rounded-lg ${
                    theme === "dark" 
                      ? "hover:bg-gray-700 text-gray-400" 
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
          <div className="flex flex-col items-center">
                  {getCurrentImage() === "" ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-auto w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                      <button
                  onClick={capturePhoto}
                        className="mt-4 inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                  Capture Photo
                      </button>
                {captureMode === "license" && (
                        <p className={`mt-3 text-sm text-center ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                    Make sure all details on the license are clearly visible
                  </p>
                )}
                      {(captureMode === "national_id_front" || captureMode === "national_id_back") && (
                        <p className={`mt-3 text-sm text-center ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          Ensure all text and details are clearly readable
                  </p>
                )}
              </>
            ) : (
              <>
                      <div className="relative h-64 w-64 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                  <Image
                          src={getCurrentImage()}
                          alt={`Captured ${captureMode}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                        <button
                          onClick={retakePhoto}
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            theme === "dark"
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                    Retake
                        </button>
                        <button
                    onClick={confirmPhoto}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                    Use This Photo
                        </button>
                </div>
              </>
            )}
          </div>
              </div>

              {/* Footer */}
              <div className={`flex justify-end p-6 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                <button
                  onClick={stopCamera}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
            Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Digital Signature
              </h3>
              <button
                onClick={closeSignaturePad}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className={`text-sm mb-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Please sign in the box below using your mouse or touch device.
              </p>
              
              {/* Signature Canvas */}
              <div className={`border-2 border-dashed rounded-lg p-4 mb-4 ${
                theme === "dark" 
                  ? "border-gray-600 bg-gray-700" 
                  : "border-gray-300 bg-gray-50"
              }`}>
                <canvas
                  ref={signatureCanvasRef}
                  className="w-full h-48 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={clearSignature}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
