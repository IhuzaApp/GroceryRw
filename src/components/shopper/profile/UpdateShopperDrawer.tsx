import React, { useState, useRef, useEffect } from "react";
import { Drawer, Form, Button, Input, SelectPicker, Message, useToaster, Modal, Panel, Schema, AutoComplete } from "rsuite";
import { logger } from "../../../utils/logger";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useGoogleMap } from "../../../context/GoogleMapProvider";

interface ShopperProfile {
  id: string;
  full_name: string;
  address: string;
  phone_number: string;
  national_id: string;
  driving_license?: string;
  transport_mode: string;
  profile_photo?: string;
  status: string;
  active: boolean;
  background_check_completed: boolean;
  onboarding_step: string;
  created_at: string;
  updated_at: string;
}

interface FormValue {
  id?: string;
  full_name: string;
  phone_number: string;
  national_id: string;
  driving_license: string;
  transport_mode: string;
  profile_photo: string;
  address: string;
}

interface UpdateShopperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    id: string;
    full_name: string;
    phone_number: string;
    national_id: string;
    driving_license: string;
    transport_mode: string;
    profile_photo?: string;
    address?: string;
  };
  onUpdate: (data: any) => Promise<{ success: boolean; message: string }>;
}

// Form validation schema
const validationModel = Schema.Model({
  full_name: Schema.Types.StringType().isRequired("Full name is required"),
  phone_number: Schema.Types.StringType().isRequired("Phone number is required"),
  address: Schema.Types.StringType().isRequired("Address is required"),
  transport_mode: Schema.Types.StringType().isRequired("Transport mode is required"),
  profile_photo: Schema.Types.StringType(),
});

// Add image compression helper function
const compressImage = (base64: string, maxSizeKB = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
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
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.7;
      let compressedBase64 = canvas.toDataURL("image/jpeg", quality);

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

// Add default image URLs
const DEFAULT_PROFILE_IMAGE = "/images/default-profile.png";
const DEFAULT_LICENSE_IMAGE = "/images/default-license.png";

export default function UpdateShopperDrawer({
  isOpen,
  onClose,
  currentData,
  onUpdate,
}: UpdateShopperDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isLoaded } = useGoogleMap();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [formValue, setFormValue] = useState<FormValue>({
    id: currentData.id,
    full_name: currentData.full_name,
    phone_number: currentData.phone_number,
    national_id: currentData.national_id,
    driving_license: currentData.driving_license,
    transport_mode: currentData.transport_mode,
    profile_photo: currentData.profile_photo || "",
    address: currentData.address || "",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormValue>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>(currentData.profile_photo || "");
  const [capturedNationalId, setCapturedNationalId] = useState<string>(currentData.national_id || "");
  const [captureMode, setCaptureMode] = useState<"profile" | "national_id">("profile");
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const toaster = useToaster();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch shopper profile when drawer opens
  useEffect(() => {
    const fetchShopperProfile = async () => {
      if (!isOpen || !session?.user?.id) return;

      setFetchingProfile(true);
      try {
        const response = await fetch('/api/queries/shopper-profile');
        if (!response.ok) {
          throw new Error('Failed to fetch shopper profile');
        }

        const data = await response.json();
        const shopperProfile: ShopperProfile = data.shopper;

        if (shopperProfile) {
          // Update form with fetched data
          setFormValue({
            id: shopperProfile.id,
            full_name: shopperProfile.full_name,
            phone_number: shopperProfile.phone_number,
            national_id: shopperProfile.national_id || "",
            driving_license: shopperProfile.driving_license || "",
            transport_mode: shopperProfile.transport_mode,
            profile_photo: shopperProfile.profile_photo || "",
            address: shopperProfile.address || ""
          });

          // Update photos if they exist
          if (shopperProfile.profile_photo) {
            setCapturedPhoto(shopperProfile.profile_photo);
          }
          if (shopperProfile.national_id) {
            setCapturedNationalId(shopperProfile.national_id);
          }
        }
      } catch (error: unknown) {
        logger.error("Error fetching shopper profile:", error instanceof Error ? error.message : String(error));
        toaster.push(
          <Message type="error" closable>
            Failed to load your profile information. Please try again.
          </Message>
        );
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchShopperProfile();
  }, [isOpen, session?.user?.id]);

  const transportOptions = [
    { label: "Car", value: "car" },
    { label: "Motorcycle", value: "motorcycle" },
    { label: "Bicycle", value: "bicycle" },
    { label: "On Foot", value: "on_foot" },
  ];

  const handleSubmit = async () => {
    // Validate form
    const validationResult = validationModel.check(formValue);
    if (!validationResult) {
      toaster.push(
        <Message type="error" closable>
          Please fill in all required fields correctly
        </Message>
      );
      return;
    }

    // Validate photos
    if (!capturedPhoto) {
      toaster.push(
        <Message type="error" closable>
          Profile photo is required
        </Message>
      );
      return;
    }

    if (!capturedNationalId) {
      toaster.push(
        <Message type="error" closable>
          National ID photo is required
        </Message>
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare the data for submission
      const updateData = {
        user_id: session?.user?.id,
        active: true,
        address: formValue.address || "",
        full_name: formValue.full_name,
        national_id: capturedNationalId,
        onboarding_step: "profile_updated",
        phone_number: formValue.phone_number,
        status: "pending",
        transport_mode: formValue.transport_mode,
        updated_at: new Date().toISOString(),
        profile_photo: capturedPhoto
      };

      console.log("Submitting shopper update with user ID:", session?.user?.id);
      console.log("Profile photo changed:", capturedPhoto !== currentData.profile_photo);
      console.log("National ID photo changed:", capturedNationalId !== currentData.national_id);

      const response = await onUpdate(updateData);
      
      if (response.success) {
        toaster.push(
          <Message type="success" closable>
            {response.message}
          </Message>
        );
        
        // Close the drawer
        onClose();
        
        // Sign out without redirect
        await signOut({ 
          redirect: false
        });
        
        // Manually redirect to login page
        router.push("/Auth/Login");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: unknown) {
      logger.error("Error updating shopper information:", error instanceof Error ? error.message : String(error));
      toaster.push(
        <Message type="error" closable>
          Failed to update information. Please try again.
        </Message>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (newValue: any) => {
    setFormValue(newValue);
    // Clear errors when user makes changes
    setFormErrors({});
  };

  const startCamera = async (mode: "profile" | "national_id") => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode === "national_id" ? "environment" : "user" },
        audio: false,
      });

      setStream(newStream);
      setShowCamera(true);
      setCaptureMode(mode);
      setShowPreview(false); // Reset preview state when starting camera

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      }, 100);
    } catch (error: unknown) {
      logger.error("Error accessing camera:", error instanceof Error ? error.message : String(error));
      toaster.push(
        <Message type="error" closable>
          Could not access camera. Please check permissions.
        </Message>
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");

        compressImage(imageData, 50)
          .then((compressedImage) => {
            if (captureMode === "profile") {
              setCapturedPhoto(compressedImage);
            } else {
              setCapturedNationalId(compressedImage);
            }
            setShowPreview(true);
          })
          .catch((error) => {
            logger.error("Error compressing image:", error);
            toaster.push(
              <Message type="error" closable>
                Failed to process image
              </Message>
            );
          });
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setShowPreview(false); // Reset preview state when stopping camera
  };

  const retakePhoto = () => {
    if (captureMode === "profile") {
      setCapturedPhoto("");
    } else {
      setCapturedNationalId("");
    }
    setShowPreview(false);
    // Restart camera after retaking
    startCamera(captureMode);
  };

  const showDrivingLicense = formValue.transport_mode !== "on_foot";

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setFormValue((prev) => ({
          ...prev,
          address: place.formatted_address || "",
        }));
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setFormValue((prev) => ({
      ...prev,
      address: value,
    }));

    if (value.length > 2) {
      setIsLoading(true);
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: value,
        location: new google.maps.LatLng(-1.9403, 29.8739), // Kigali coordinates
        radius: 50000, // 50km radius
        type: 'address' as const
      };

      service.textSearch(request, (results, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Create unique suggestions by adding index to duplicates
          const addressMap = new Map<string, number>();
          const newSuggestions = results
            .map(result => result.formatted_address || '')
            .filter(Boolean)
            .map(address => {
              if (addressMap.has(address)) {
                const count = addressMap.get(address)! + 1;
                addressMap.set(address, count);
                return `${address} (${count})`;
              }
              addressMap.set(address, 1);
              return address;
            });
          setSuggestions(newSuggestions);
        } else {
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (isLoaded && addressInputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: "rw" },
        fields: ["formatted_address", "geometry", "name"],
        types: ["address"],
      });
      setAutocomplete(autocompleteInstance);
    }
  }, [isLoaded, autocomplete]);

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      size="md"
      placement="right"
    >
      <Drawer.Header>
        <Drawer.Title>Update Plasa Information</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <Panel shaded bordered>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Update Your Information</h2>
            <p className="text-gray-600">
              Please update your information below. Your changes will be reviewed by our team.
            </p>
          </div>

          {fetchingProfile ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <Form
              fluid
              model={validationModel}
              formValue={formValue}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCheck={setFormErrors}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                <Form.Group>
                  <Form.ControlLabel>Full Name</Form.ControlLabel>
                  <Form.Control name="full_name" errorPlacement="bottomStart" />
                  {formErrors.full_name && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.full_name}</div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>Phone Number</Form.ControlLabel>
                  <Form.Control name="phone_number" errorPlacement="bottomStart" />
                  {formErrors.phone_number && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.phone_number}</div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>Address</Form.ControlLabel>
                  {isLoaded ? (
                    <div style={{ position: 'relative', zIndex: 1000 }}>
                      <AutoComplete
                        data={suggestions}
                        value={formValue.address}
                        onChange={handleAddressChange}
                        onSelect={(value: string) => {
                          // Remove the count suffix if it exists
                          const cleanValue = value.replace(/\s\(\d+\)$/, '');
                          setFormValue((prev) => ({
                            ...prev,
                            address: cleanValue,
                          }));
                          setSuggestions([]);
                        }}
                        placeholder="Enter your address"
                        style={{ width: '100%' }}
                        renderMenu={menu => (
                          <div className="rs-dropdown-menu">
                            {menu}
                          </div>
                        )}
                      />
                      {isLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      <span className="text-sm text-gray-500">Loading address input...</span>
                    </div>
                  )}
                  {formErrors.address && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.address}</div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>Transport Mode</Form.ControlLabel>
                  <Form.Control
                    name="transport_mode"
                    accepter={SelectPicker}
                    data={transportOptions}
                    block
                    errorPlacement="bottomStart"
                  />
                  {formErrors.transport_mode && (
                    <div className="text-red-500 text-sm mt-1">{formErrors.transport_mode}</div>
                  )}
                </Form.Group>

                {showDrivingLicense && (
                  <Form.Group>
                    <Form.ControlLabel>Driving License Number</Form.ControlLabel>
                    <Form.Control name="driving_license" errorPlacement="bottomStart" />
                    {formErrors.driving_license && (
                      <div className="text-red-500 text-sm mt-1">{formErrors.driving_license}</div>
                    )}
                  </Form.Group>
                )}
              </div>

              <div className="mt-6">
                <Form.Group>
                  <Form.ControlLabel>
                    Profile Photo <span className="text-red-500">*</span>
                  </Form.ControlLabel>
                  <Form.HelpText>
                    Take a clear photo of yourself with your camera
                  </Form.HelpText>

                  <div className="mb-4 mt-2">
                    <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-lg border border-gray-300">
                      {capturedPhoto ? (
                        <img
                          src={capturedPhoto}
                          alt="Profile photo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No profile photo</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-center space-x-3">
                      <button
                        onClick={() => startCamera("profile")}
                        className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <i className="fas fa-camera mr-2" />
                        {capturedPhoto ? "Update Photo" : "Take Photo"}
                      </button>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>
                    National ID Photo <span className="text-red-500">*</span>
                  </Form.ControlLabel>
                  <Form.HelpText>
                    Take a photo of your national ID
                  </Form.HelpText>

                  <div className="mb-4 mt-2">
                    <div className="relative mx-auto h-48 w-64 overflow-hidden rounded-lg border border-gray-300">
                      {capturedNationalId ? (
                        <img
                          src={capturedNationalId}
                          alt="National ID"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No national ID photo</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-center space-x-3">
                      <button
                        onClick={() => startCamera("national_id")}
                        className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <i className="fas fa-camera mr-2" />
                        {capturedNationalId ? "Update Photo" : "Take Photo"}
                      </button>
                    </div>
                  </div>
                </Form.Group>
              </div>

              <Form.Group className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Information"}
                </button>
              </Form.Group>
            </Form>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold">What Happens Next?</h3>
            <ol className="ml-5 mt-2 list-decimal space-y-2 text-gray-600">
              <li>Our team will review your updated information</li>
              <li>You will be logged out to apply the changes</li>
              <li>Once approved, you can log back in</li>
              <li>Your updated information will be active</li>
            </ol>
          </div>
        </Panel>
      </Drawer.Body>

      {/* Camera Modal */}
      <Modal open={showCamera} onClose={stopCamera} size="md">
        <Modal.Header>
          <Modal.Title>
            {captureMode === "profile" ? "Take Profile Photo" : "Take National ID Photo"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center">
            {!showPreview ? (
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
                  className="mt-4 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Capture Photo
                </button>
                {captureMode === "national_id" && (
                  <p className="mt-2 text-sm text-gray-500">
                    Make sure all details on the ID are clearly visible
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg">
                  <img
                    src={captureMode === "profile" ? capturedPhoto : capturedNationalId}
                    alt={captureMode === "profile" ? "Captured profile" : "Captured national ID"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={retakePhoto}
                    className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Retake
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Use This Photo
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={stopCamera}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </Drawer>
  );
} 