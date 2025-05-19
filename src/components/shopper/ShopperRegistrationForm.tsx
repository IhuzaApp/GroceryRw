import React, { useState, useRef } from "react";
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
import { gql, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import Image from "next/image";

// GraphQL mutation to register as a shopper
const REGISTER_SHOPPER = gql`
  mutation RegisterShopper(
    $full_name: String!
    $address: String!
    $phone_number: String!
    $national_id: String!
    $driving_license: String
    $transport_mode: String!
    $profile_photo: String
    $user_id: uuid!
  ) {
    insert_shoppers_one(
      object: {
        full_name: $full_name
        address: $address
        phone_number: $phone_number
        national_id: $national_id
        driving_license: $driving_license
        transport_mode: $transport_mode
        profile_photo: $profile_photo
        status: "pending"
        active: false
        background_check_completed: false
        onboarding_step: "application_submitted"
        user_id: $user_id
      }
    ) {
      id
      status
      active
      onboarding_step
    }
  }
`;

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

export default function ShopperRegistrationForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formValue, setFormValue] = useState<Record<string, any>>({
    full_name: "",
    address: "",
    phone_number: "",
    national_id: "",
    driving_license: "",
    transport_mode: "",
    profile_photo: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();
  
  // Camera capture states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedLicense, setCapturedLicense] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'profile' | 'license'>('profile');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const transportOptions = [
    { label: 'Car', value: 'car' },
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Bicycle', value: 'bicycle' },
    { label: 'On Foot', value: 'on_foot' },
  ];

  const [registerShopper, { loading: mutationLoading, error: mutationError }] = useMutation(REGISTER_SHOPPER, {
    onCompleted: (data) => {
      const shopperInfo = data.insert_shoppers_one;
      toaster.push(
        <Message type="success" closable>
          Your application has been submitted! Status: {shopperInfo.status}
        </Message>,
        { placement: 'topEnd' }
      );
      // Redirect back to profile after successful submission
      setTimeout(() => {
        router.push('/Myprofile');
      }, 3000);
    },
    onError: (error) => {
      console.error('GraphQL Error:', error);
      toaster.push(
        <Message type="error" closable>
          Error: {error.message}
        </Message>,
        { placement: 'topEnd' }
      );
    }
  });

  // Function to start camera for profile or license
  const startCamera = async (mode: 'profile' | 'license') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode === 'license' ? "environment" : "user" }, 
        audio: false 
      });
      
      setCameraStream(stream);
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
      toaster.push(
        <Message type="error" closable>
          Could not access camera. Please check permissions.
        </Message>,
        { placement: 'topEnd' }
      );
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
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Save based on capture mode
        if (captureMode === 'profile') {
          setCapturedPhoto(dataUrl);
          // Convert data URL to File object
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
              setPhotoFile(file);
            }
          }, 'image/jpeg');
        } else {
          setCapturedLicense(dataUrl);
          // Convert data URL to File object
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "license-photo.jpg", { type: "image/jpeg" });
              setLicenseFile(file);
            }
          }, 'image/jpeg');
        }
      }
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Function to retake photo
  const retakePhoto = () => {
    if (captureMode === 'profile') {
      setCapturedPhoto(null);
    } else {
      setCapturedLicense(null);
    }
  };

  // Function to confirm photo and close camera
  const confirmPhoto = () => {
    stopCamera();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!session?.user) {
      toaster.push(
        <Message type="error" closable>
          Error: You must be logged in to apply as a shopper
        </Message>,
        { placement: 'topEnd' }
      );
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, you would upload the files to storage
      // and use the returned URLs in the mutation
      // Here, we're just simulating this
      
      // Example of file upload handling
      let profilePhotoUrl = "";
      let drivingLicenseUrl = "";
      
      if (photoFile) {
        // This would be where you upload the file and get URL
        profilePhotoUrl = "https://example.com/uploaded-photo.jpg";
      }
      
      if (licenseFile) {
        // This would be where you upload the file and get URL
        drivingLicenseUrl = "https://example.com/uploaded-license.jpg";
      }
      
      // Get the user ID from the session
      const userId = (session.user as any).id;
      
      // Submit data to backend
      await registerShopper({
        variables: {
          ...formValue,
          profile_photo: profilePhotoUrl,
          driving_license: drivingLicenseUrl,
          user_id: userId
        }
      });
      
    } catch (error) {
      console.error("Error submitting shopper application:", error);
      toaster.push(
        <Message type="error" closable>
          Error: Failed to submit your application. Please try again.
        </Message>,
        { placement: 'topEnd' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Panel shaded bordered>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Shopper Application</h2>
          <p className="text-gray-600">
            Please fill out this form to apply as a shopper. Your information will be reviewed by our team.
          </p>
        </div>
        
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
              <Form.ControlLabel>Profile Photo</Form.ControlLabel>
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
                disabled={loading || mutationLoading}
                className="bg-green-500 text-white"
              >
                {(loading || mutationLoading) ? <Loader /> : 'Submit Application'}
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
                    src={captureMode === 'profile' ? capturedPhoto! : capturedLicense!} 
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