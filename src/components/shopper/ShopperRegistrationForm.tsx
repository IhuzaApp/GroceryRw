import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  Form, 
  Button, 
  Panel, 
  Schema, 
  Input, 
  SelectPicker, 
  Message,
  ButtonToolbar,
  Loader,
  Modal,
  useToaster
} from "rsuite";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";

// Form validation schema
const { StringType } = Schema.Types;
const validationModel = Schema.Model({
  full_name: StringType().isRequired('Full name is required'),
  address: StringType().isRequired('Address is required'),
  phone_number: StringType()
    .isRequired('Phone number is required')
    .pattern(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  national_id: StringType().isRequired('National ID is required'),
  transport_mode: StringType().isRequired('Transport mode is required'),
});

// Add these helper functions for image compression
const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = document.createElement('img');
    img.src = base64;
    
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      
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
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get compressed image as base64
      let quality = 0.7; // Initial quality
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // If still too large, reduce quality until we get under target size
      const maxSize = maxSizeKB * 1024;
      while (compressedBase64.length > maxSize && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export default function ShopperRegistrationForm() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [formValue, setFormValue] = useState<Record<string, string>>({
    full_name: "",
    address: "",
    phone_number: "",
    national_id: "",
    transport_mode: "on_foot",
    driving_license: "",
  });
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [capturedLicense, setCapturedLicense] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [captureMode, setCaptureMode] = useState<"profile" | "license">("profile");
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [apiError, setApiError] = useState<{
    title: string;
    message: string;
    details?: any;
  } | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const transportOptions = [
    { label: 'Car', value: 'car' },
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Bicycle', value: 'bicycle' },
    { label: 'On Foot', value: 'on_foot' },
  ];

  // Pre-fill form with user data if available
  useEffect(() => {
    if (session?.user) {
      setFormValue(prev => ({
        ...prev,
        full_name: (session.user as any).name || "",
        phone_number: (session.user as any).phone || "",
      }));
    }
  }, [session]);

  // Function to start camera for profile or license
  const startCamera = async (mode: 'profile' | 'license') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode === 'license' ? "environment" : "user" }, 
        audio: false 
      });
      
      setStream(stream);
      setShowCamera(true);
      setCaptureMode(mode);
      
      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data as base64
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Compress the image before storing
        compressImage(imageData, 50) // Compress to ~50KB
          .then(compressedImage => {
            // Store the compressed image
            if (captureMode === 'profile') {
              setCapturedPhoto(compressedImage);
              console.log("Profile photo captured and compressed");
            } else {
              setCapturedLicense(compressedImage);
              console.log("License photo captured and compressed");
            }
            
            // Switch to preview mode
            setShowPreview(true);
          })
          .catch(error => {
            console.error("Error compressing image:", error);
            toast.error("Failed to process image");
          });
      }
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Function to retake photo
  const retakePhoto = () => {
    if (captureMode === 'profile') {
      setCapturedPhoto("");
    } else {
      setCapturedLicense("");
    }
  };

  // Function to confirm photo and close camera
  const confirmPhoto = () => {
    stopCamera();
  };

  // Form validation before submission
  const validateForm = () => {
    if (!capturedPhoto) {
      toast.error("Please take a profile photo");
      return false;
    }
    
    return true;
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
      toast.error("You need to be logged in to apply as a shopper. Please log in and try again.");
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/Auth/Login?callbackUrl=/Myprofile/become-shopper');
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
      
      // Prepare the data for submission
      const shopperData = {
        ...formValue,
        profile_photo: capturedPhoto || "",
        driving_license: capturedLicense || "",
        user_id: userId,
        force_update: isUpdating // Set force_update to true if we're updating an existing application
      };
      
      console.log("Submitting shopper registration with user ID:", userId);
      console.log("Profile photo size:", capturedPhoto ? `${Math.round(capturedPhoto.length / 1024)}KB` : "None");
      console.log("License photo size:", capturedLicense ? `${Math.round(capturedLicense.length / 1024)}KB` : "None");
      
      // Submit data to our API endpoint
      const response = await fetch('/api/queries/register-shopper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopperData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          // User is already registered as a shopper
          setApiError({
            title: "Already Registered",
            message: data.message || "You are already registered as a shopper",
            details: data.shopper
          });
          
          toast.error("You are already registered as a shopper");
        } else {
          throw new Error(data.error || data.message || 'Failed to register shopper');
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
            position: 'top-center',
            icon: '🎉'
          }
        );
        
        // Set success state
        setRegistrationSuccess(true);
        
        // Redirect back to profile after a short delay
        setTimeout(() => {
          router.push('/Myprofile');
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error submitting shopper application:", error);
      toast.error(`Failed to submit application: ${error.message}`);
      
      setApiError({
        title: "Registration Failed",
        message: error.message || "An unknown error occurred",
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
      <Panel shaded bordered className="py-10 text-center">
        <Loader size="lg" content="Loading your profile..." vertical />
        <p className="mt-4 text-gray-600">Please wait while we load your session data...</p>
      </Panel>
    );
  }

  // If user is not authenticated, show login message - this should not happen since the page is protected by getServerSideProps
  if (sessionStatus === "unauthenticated") {
    return (
      <Panel shaded bordered className="py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 text-red-500">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to apply as a shopper.
          </p>
          <Button 
            appearance="primary" 
            onClick={() => router.push('/Auth/Login?callbackUrl=/Myprofile/become-shopper')}
            className="bg-blue-500 text-white"
          >
            Log In
          </Button>
        </div>
      </Panel>
    );
  }

  // If API returned an "already registered" error, show appropriate message with option to continue
  if (apiError && apiError.title === "Already Registered") {
    return (
      <Panel shaded bordered className="py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 text-yellow-500">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Already Registered</h2>
          <p className="text-gray-600 mb-6">
            {apiError.message}
          </p>
          <div className="flex space-x-4">
            <Button 
              appearance="primary" 
              onClick={() => router.push('/Myprofile')}
              className="bg-blue-500 text-white"
            >
              Return to Profile
            </Button>
            <Button 
              appearance="ghost" 
              onClick={() => clearApiErrorAndUpdate()}
            >
              Update Application
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  // If registration was successful, show a success message
  if (registrationSuccess) {
    return (
      <Panel shaded bordered className="text-center py-8">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 text-green-500">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your application to become a shopper is being reviewed. You'll be redirected to your profile page shortly.
          </p>
          <Button 
            appearance="primary" 
            color="green" 
            onClick={() => router.push('/Myprofile')}
            className="bg-green-500 text-white"
          >
            Return to Profile
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel shaded bordered>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Shopper Application</h2>
          <p className="text-gray-600">
            Please fill out this form to apply as a shopper. Your information will be reviewed by our team.
          </p>
        </div>
        
        {/* Show general API error if any */}
        {apiError && apiError.title !== "Already Registered" && (
          <Message type="error" className="mb-4">
            <h4 className="font-bold">{apiError.title}</h4>
            <p>{apiError.message}</p>
          </Message>
        )}
        
        <Form
          fluid
          model={validationModel}
          formValue={formValue}
          onChange={(formValue: Record<string, any>) => setFormValue(formValue)}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <Form.Group>
              <Form.ControlLabel>Full Name</Form.ControlLabel>
              <Form.Control name="full_name" />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Phone Number</Form.ControlLabel>
              <Form.Control name="phone_number" />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Address</Form.ControlLabel>
              <Form.Control name="address" />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>National ID</Form.ControlLabel>
              <Form.Control name="national_id" />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Transport Mode</Form.ControlLabel>
              <Form.Control 
                name="transport_mode" 
                accepter={SelectPicker}
                data={transportOptions}
                block
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Driving License (Optional)</Form.ControlLabel>
              <Form.Control 
                name="driving_license" 
                accepter={Input}
              />
            </Form.Group>
          </div>

          <div className="mt-6">
            <Form.Group>
              <Form.ControlLabel>Profile Photo <span className="text-red-500">*</span></Form.ControlLabel>
              <Form.HelpText>Take a clear photo of yourself with your camera</Form.HelpText>
              
              {capturedPhoto ? (
                <div className="mb-4 mt-2">
                  <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-lg border border-gray-300">
                    <Image 
                      src={capturedPhoto} 
                      alt="Captured profile" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-3 flex justify-center space-x-3">
                    <Button 
                      appearance="primary" 
                      onClick={() => startCamera('profile')}
                      className="bg-blue-500 text-white"
                    >
                      <i className="fas fa-camera mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 mt-2 flex justify-center">
                  <Button 
                    appearance="primary" 
                    onClick={() => startCamera('profile')}
                    className="bg-blue-500 text-white"
                  >
                    <i className="fas fa-camera mr-2" />
                    Take Photo with Camera
                  </Button>
                </div>
              )}
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Driving License Photo (Optional)</Form.ControlLabel>
              <Form.HelpText>Take a photo of your driving license</Form.HelpText>
              
              {capturedLicense ? (
                <div className="mb-4 mt-2">
                  <div className="relative mx-auto h-48 w-64 overflow-hidden rounded-lg border border-gray-300">
                    <Image 
                      src={capturedLicense} 
                      alt="Captured license" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-3 flex justify-center space-x-3">
                    <Button 
                      appearance="primary" 
                      onClick={() => startCamera('license')}
                      className="bg-blue-500 text-white"
                    >
                      <i className="fas fa-camera mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 mt-2 flex justify-center">
                  <Button 
                    appearance="primary" 
                    onClick={() => startCamera('license')}
                    className="bg-blue-500 text-white"
                  >
                    <i className="fas fa-camera mr-2" />
                    Take Photo with Camera
                  </Button>
                </div>
              )}
            </Form.Group>
          </div>

          <Form.Group className="mt-6">
            <ButtonToolbar>
              <Button 
                appearance="primary" 
                color="green" 
                type="submit" 
                disabled={loading}
                className="bg-green-500 text-white"
              >
                {loading ? <Loader /> : 'Submit Application'}
              </Button>
              <Button 
                appearance="ghost" 
                onClick={() => router.push('/Myprofile')}
              >
                Cancel
              </Button>
            </ButtonToolbar>
          </Form.Group>
        </Form>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold">What Happens Next?</h3>
          <ol className="ml-5 mt-2 list-decimal space-y-2 text-gray-600">
            <li>Our team will review your application</li>
            <li>We'll conduct a background check</li>
            <li>Once approved, you'll be notified via email</li>
            <li>You can then start accepting delivery orders</li>
          </ol>
        </div>
      </Panel>

      {/* Camera Modal */}
      <Modal open={showCamera} onClose={stopCamera} size="md">
        <Modal.Header>
          <Modal.Title>
            {captureMode === 'profile' ? 'Take Profile Photo' : 'Take License Photo'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center">
            {(captureMode === 'profile' && !capturedPhoto) || (captureMode === 'license' && !capturedLicense) ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="h-auto w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <Button 
                  appearance="primary" 
                  color="blue" 
                  onClick={capturePhoto} 
                  className="mt-4 bg-blue-500 text-white"
                >
                  Capture Photo
                </Button>
                {captureMode === 'license' && (
                  <p className="mt-2 text-sm text-gray-500">
                    Make sure all details on the license are clearly visible
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg">
                  <Image 
                    src={captureMode === 'profile' ? capturedPhoto : capturedLicense} 
                    alt={captureMode === 'profile' ? "Captured profile" : "Captured license"} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button appearance="ghost" onClick={retakePhoto}>
                    Retake
                  </Button>
                  <Button appearance="primary" onClick={confirmPhoto} className="bg-green-500 text-white">
                    Use This Photo
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={stopCamera} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
} 