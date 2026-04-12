import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export type Step = {
  title: string;
  description: string;
};

export const steps: Step[] = [
  { title: "Welcome", description: "Get started as a Plasa" },
  { title: "Personal Info", description: "Basic information" },
  { title: "Contact Details", description: "Phone & Telegram" },
  { title: "Address & Location", description: "Residence details" },
  { title: "Guarantor Info", description: "Reference person" },
  { title: "Documents", description: "Required documents" },
  { title: "Review & Submit", description: "Final review" },
];

export const transportOptions = [
  { label: "Car", value: "car" },
  { label: "Motorcycle", value: "motorcycle" },
  { label: "Bicycle", value: "bicycle" },
  { label: "On Foot", value: "on_foot" },
];

export const guarantorRelationshipOptions = [
  { label: "Family Member", value: "family" },
  { label: "Friend", value: "friend" },
  { label: "Colleague", value: "colleague" },
  { label: "Other", value: "other" },
];

export const mutualStatusOptions = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
  { label: "Separated", value: "separated" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export const validateField = (name: string, value: string): string | null => {
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
    default:
      return null;
  }
};

export const base64ToFile = async (
  base64String: string,
  filename: string,
  mimeType: string
): Promise<File> => {
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
};

export const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDimension = 800;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context failed"));
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.7;
      let result = canvas.toDataURL("image/jpeg", quality);
      while (result.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(result);
    };
    img.onerror = reject;
  });
};

export const useShopperForm = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

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

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingExistingData, setLoadingExistingData] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [apiError, setApiError] = useState<{ title: string; message: string; details?: any } | null>(null);

  // Document states
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [capturedLicense, setCapturedLicense] = useState("");
  const [capturedNationalIdFront, setCapturedNationalIdFront] = useState("");
  const [capturedNationalIdBack, setCapturedNationalIdBack] = useState("");
  const [capturedSignature, setCapturedSignature] = useState("");
  const [policeClearanceFile, setPoliceClearanceFile] = useState<File | null>(null);
  const [proofOfResidencyFile, setProofOfResidencyFile] = useState<File | null>(null);
  const [maritalStatusFile, setMaritalStatusFile] = useState<File | null>(null);

  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureMode, setCaptureMode] = useState<string>("");
  const [cameraLoading, setCameraLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Removed automatic pre-filling from session to allow users to provide 
  // accurate legal information which might differ from their account profile.
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

            if (shopper.needCollection) {
              setIsUpdating(true);
              toast("Loading your existing application for updates...", { icon: "ℹ️" });
            }

            setFormValue({
              full_name: shopper.full_name || "",
              address: shopper.address || "",
              phone_number: shopper.phone_number || "",
              national_id: shopper.national_id || "",
              driving_license: shopper.drivingLicense_Image || "",
              transport_mode: shopper.transport_mode || "",
              guarantor: shopper.guarantor || "",
              guarantorPhone: shopper.guarantorPhone || "",
              guarantorRelationship: shopper.guarantorRelationship || "",
              latitude: shopper.latitude || "",
              longitude: shopper.longitude || "",
              mutual_status: shopper.mutual_status || "",
            });

            if (shopper.profile_photo) setCapturedPhoto(shopper.profile_photo);
            if (shopper.national_id_photo_front) setCapturedNationalIdFront(shopper.national_id_photo_front);
            if (shopper.national_id_photo_back) setCapturedNationalIdBack(shopper.national_id_photo_back);
            if (shopper.drivingLicense_Image) setCapturedLicense(shopper.drivingLicense_Image);
            if (shopper.signature) setCapturedSignature(shopper.signature);

            // Load files
            if (shopper.Police_Clearance_Cert) {
              setPoliceClearanceFile(await base64ToFile(shopper.Police_Clearance_Cert, "police_clearance.pdf", "application/pdf"));
            }
            if (shopper.proofOfResidency) {
              setProofOfResidencyFile(await base64ToFile(shopper.proofOfResidency, "proof_of_residency.pdf", "application/pdf"));
            }
            if (shopper.mutual_StatusCertificate) {
              setMaritalStatusFile(await base64ToFile(shopper.mutual_StatusCertificate, "marital_status_certificate.pdf", "application/pdf"));
            }

            if (shopper.collection_comment) {
              toast.error(`Feedback: ${shopper.collection_comment}`, { duration: 6000 });
            }
          }
        }
      } catch (error) {
        console.error("Error loading application:", error);
      } finally {
        setLoadingExistingData(false);
      }
    };

    if (sessionStatus === "authenticated") {
      loadExistingApplication();
    }
  }, [session, sessionStatus]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      const error = validateField(name, value);
      if (error) newErrors[name] = error;
      return newErrors;
    });
  }, []);

  const startCamera = async (mode: string) => {
    try {
      setCameraLoading(true);
      setCaptureMode(mode);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode === "profile" ? "user" : "environment" },
        audio: false,
      });
      setStream(newStream);
      setShowCamera(true);
      setCameraLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Camera access failed");
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const data = canvas.toDataURL("image/jpeg");
      const compressed = await compressImage(data);
      
      switch (captureMode) {
        case "profile": setCapturedPhoto(compressed); break;
        case "license": setCapturedLicense(compressed); break;
        case "national_id_front": setCapturedNationalIdFront(compressed); break;
        case "national_id_back": setCapturedNationalIdBack(compressed); break;
      }
      stopCamera();
    }
  };

  const nextStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      ["full_name", "national_id", "transport_mode"].forEach(f => {
        const err = validateField(f, formValue[f]);
        if (err) newErrors[f] = err;
      });
    } else if (currentStep === 2) {
      const err = validateField("phone_number", formValue.phone_number);
      if (err) newErrors.phone_number = err;
    } else if (currentStep === 3 && !formValue.address) {
      newErrors.address = "Address is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!capturedPhoto || !capturedNationalIdFront || !capturedNationalIdBack) {
      toast.error("Required photos are missing");
      return;
    }

    setLoading(true);
    try {
      const convert = (file: File | null): Promise<string> => new Promise((res) => {
        if (!file) return res("");
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const payload = {
        ...formValue,
        profile_photo: capturedPhoto,
        national_id_photo_front: capturedNationalIdFront,
        national_id_photo_back: capturedNationalIdBack,
        drivingLicense_Image: capturedLicense,
        signature: capturedSignature,
        Police_Clearance_Cert: await convert(policeClearanceFile),
        proofOfResidency: await convert(proofOfResidencyFile),
        mutual_StatusCertificate: await convert(maritalStatusFile),
        user_id: (session?.user as any).id,
        force_update: isUpdating,
      };

      const res = await fetch("/api/queries/register-shopper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");

      setRegistrationSuccess(true);
      toast.success("Application submitted!");
      setTimeout(() => router.push("/Myprofile"), 2000);
    } catch (err: any) {
      toast.error(err.message);
      setApiError({ title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    router,
    formValue, currentStep, errors, loading, registrationSuccess, apiError,
    capturedPhoto, capturedLicense, capturedNationalIdFront, capturedNationalIdBack,
    capturedSignature, policeClearanceFile, proofOfResidencyFile, maritalStatusFile,
    stream, showCamera, captureMode, cameraLoading, videoRef, canvasRef, signatureCanvasRef,
    handleInputChange, startCamera, stopCamera, capturePhoto, nextStep, prevStep,
    handleSubmit, setPoliceClearanceFile, setProofOfResidencyFile, setMaritalStatusFile,
    setCapturedSignature, setFormValue, setCapturedPhoto, setCapturedLicense,
    setCapturedNationalIdFront, setCapturedNationalIdBack, setIsUpdating,
    sessionStatus, loadingExistingData
  };
};
