import React, { useState, useRef } from "react";
import { Button, Form, Panel, SelectPicker, useToaster, Message, Loader, Modal, List } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";

interface VehicleManagementProps {
  userId: string;
  onVehicleAdded: () => void;
}

interface Vehicle {
  id: string;
  type: string;
  plate_number: string;
  model: string;
  photo: string;
}

interface VehicleModel {
  label: string;
  value: string;
}

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

export default function VehicleManagement({ userId, onVehicleAdded }: VehicleManagementProps) {
  const { theme } = useTheme();
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [formValue, setFormValue] = useState({
    type: "",
    plate_number: "",
    model: "",
    photo: ""
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Vehicle models by type
  const vehicleModels = {
    car: [
      { label: "Toyota", value: "toyota" },
      { label: "Honda", value: "honda" },
      { label: "Suzuki", value: "suzuki" },
      { label: "Nissan", value: "nissan" },
      { label: "Mitsubishi", value: "mitsubishi" },
      { label: "Other", value: "other_car" }
    ],
    motorcycle: [
      { label: "Honda", value: "honda" },
      { label: "Yamaha", value: "yamaha" },
      { label: "Suzuki", value: "suzuki" },
      { label: "Kawasaki", value: "kawasaki" },
      { label: "Bajaj", value: "bajaj" },
      { label: "Other", value: "other_motorcycle" }
    ],
    bicycle: [
      { label: "Mountain Bike", value: "mountain" },
      { label: "Road Bike", value: "road" },
      { label: "Hybrid Bike", value: "hybrid" },
      { label: "Electric Bike", value: "electric" },
      { label: "Other", value: "other_bicycle" }
    ],
    scooter: [
      { label: "Honda", value: "honda" },
      { label: "Yamaha", value: "yamaha" },
      { label: "Suzuki", value: "suzuki" },
      { label: "Vespa", value: "vespa" },
      { label: "Other", value: "other_scooter" }
    ]
  };

  // Reset model when vehicle type changes
  const handleVehicleTypeChange = (value: string | null, event: React.SyntheticEvent) => {
    setFormValue(prev => ({ ...prev, type: value || "", model: "" }));
  };

  // Handle model change
  const handleModelChange = (value: string | null, event: React.SyntheticEvent) => {
    setFormValue(prev => ({ ...prev, model: value || "" }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setStream(stream);
      setShowCamera(true);

      // When the modal is shown, attach the stream to the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error("Error accessing camera:", errorMessage);
      toaster.push(
        <Message type="error" closable>
          Could not access camera. Please check permissions.
        </Message>,
        { placement: 'topEnd', duration: 5000 }
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
            setCapturedPhoto(compressedImage);
            setShowPreview(true);
          })
          .catch((error) => {
            logger.error("Error compressing image:", error);
            toaster.push(
              <Message type="error" closable>
                Failed to process image
              </Message>,
              { placement: 'topEnd', duration: 5000 }
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
    setShowPreview(false);
  };

  const retakePhoto = () => {
    setCapturedPhoto("");
    setShowPreview(false);
    startCamera();
  };

  const handleSubmit = async () => {
    console.log("Component: Starting form submission", {
      formValue,
      hasPhoto: !!capturedPhoto,
      photoLength: capturedPhoto?.length
    });

    if (!formValue.type || !formValue.plate_number || !formValue.model) {
      console.log("Component: Missing required fields", {
        hasType: !!formValue.type,
        hasPlateNumber: !!formValue.plate_number,
        hasModel: !!formValue.model
      });
      toaster.push(
        <Message type="warning" closable>
          Please fill in all required fields
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
      return;
    }

    if (!capturedPhoto) {
      console.log("Component: No photo captured");
      toaster.push(
        <Message type="warning" closable>
          Please take a vehicle photo
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Component: Compressing photo");
      // Compress the captured photo
      const compressedPhoto = await compressImage(capturedPhoto, 100); // Compress to ~100KB
      console.log("Component: Photo compressed", {
        originalLength: capturedPhoto.length,
        compressedLength: compressedPhoto.length
      });

      console.log("Component: Sending request to API", {
        userId,
        type: formValue.type,
        plate_number: formValue.plate_number,
        model: formValue.model,
        photoLength: compressedPhoto.length
      });

      // Save the vehicle information with the compressed photo
      const response = await fetch('/api/queries/shopper-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          type: formValue.type,
          plate_number: formValue.plate_number,
          model: formValue.model,
          photo: compressedPhoto
        }),
      });

      console.log("Component: API response status", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Component: API error response", errorData);
        throw new Error(errorData.error || 'Failed to save vehicle information');
      }

      const data = await response.json();
      console.log("Component: API success response", data);

      toaster.push(
        <Message type="success" closable>
          Vehicle added successfully
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );

      // Reset form
      setFormValue({
        type: "",
        plate_number: "",
        model: "",
        photo: ""
      });
      setCapturedPhoto("");
      
      // Call onVehicleAdded to trigger refetch
      onVehicleAdded();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Component: Error details", {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      logger.error("Error saving vehicle information:", errorMessage);
      toaster.push(
        <Message type="error" closable>
          {errorMessage}
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // Add function to load vehicles
  const loadVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await fetch(`/api/queries/get-shopper-vehicles?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load vehicles');
      }
      const data = await response.json();
      console.log('Vehicles data:', data);
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toaster.push(
        <Message type="error" closable>
          Failed to load vehicles
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Load vehicles when component mounts
  React.useEffect(() => {
    loadVehicles();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Existing Vehicles List */}
      {vehicles.length > 0 ? (
        <Panel shaded bordered className={`${
          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>Your Vehicles</h3>
            <Button
              appearance="primary"
              color="blue"
              onClick={() => {
                toaster.push(
                  <Message type="info" closable>
                    Please contact support to make changes to your vehicle information
                  </Message>,
                  { placement: 'topEnd', duration: 5000 }
                );
              }}
            >
              <i className="fas fa-ticket-alt mr-2" />
              Raise Ticket
            </Button>
          </div>
          
          {loadingVehicles ? (
            <div className="flex justify-center p-4">
              <Loader size="md" />
            </div>
          ) : (
            <List>
              {vehicles.map((vehicle) => (
                <List.Item key={vehicle.id}>
                  <div className="flex items-center space-x-4 p-4">
                    <div className="h-20 w-20 overflow-hidden rounded-lg">
                      <img
                        src={vehicle.photo}
                        alt={`${vehicle.type} photo`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                      </h4>
                      <p className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>
                        Model: {vehicle.model}
                      </p>
                      <p className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>
                        Plate: {vehicle.plate_number}
                      </p>
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          )}
        </Panel>
      ) : (
        /* Add Vehicle Form - Only shown when no vehicles exist */
        <Panel shaded bordered className={`${
          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}>
          <h3 className={`mb-4 text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>Add Vehicle</h3>

          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Vehicle Type</Form.ControlLabel>
              <SelectPicker
                data={[
                  { label: "Car", value: "car" },
                  { label: "Motorcycle", value: "motorcycle" },
                  { label: "Bicycle", value: "bicycle" },
                  { label: "Scooter", value: "scooter" },
                ]}
                value={formValue.type}
                onChange={handleVehicleTypeChange}
                block
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Plate Number</Form.ControlLabel>
              <Form.Control
                name="plate_number"
                value={formValue.plate_number}
                onChange={(value) => setFormValue(prev => ({ ...prev, plate_number: value }))}
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Model</Form.ControlLabel>
              <SelectPicker
                data={formValue.type ? vehicleModels[formValue.type as keyof typeof vehicleModels] : []}
                value={formValue.model}
                onChange={handleModelChange}
                block
                disabled={!formValue.type}
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Vehicle Photo</Form.ControlLabel>
              <Form.HelpText>
                Take a clear photo of your vehicle
              </Form.HelpText>

              <div className="mb-4 mt-2">
                <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-lg border border-gray-300">
                  {capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt="Vehicle photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No vehicle photo</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-center space-x-3">
                  <Button
                    appearance="primary"
                    onClick={startCamera}
                    className="bg-blue-500 text-white"
                  >
                    <i className="fas fa-camera mr-2" />
                    {capturedPhoto ? "Update Photo" : "Take Photo"}
                  </Button>
                </div>
              </div>
            </Form.Group>

            <Form.Group>
              <Button
                appearance="primary"
                color="green"
                onClick={handleSubmit}
                loading={loading}
                block
              >
                Add Vehicle
              </Button>
            </Form.Group>
          </Form>
        </Panel>
      )}

      {/* Camera Modal */}
      <Modal open={showCamera} onClose={stopCamera} size="md">
        <Modal.Header>
          <Modal.Title>Take Vehicle Photo</Modal.Title>
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
                <Button
                  appearance="primary"
                  color="blue"
                  onClick={capturePhoto}
                  className="mt-4 bg-blue-500 text-white"
                >
                  Capture Photo
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Make sure the vehicle is clearly visible
                </p>
              </>
            ) : (
              <>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg">
                  <img
                    src={capturedPhoto}
                    alt="Captured vehicle"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button appearance="ghost" onClick={retakePhoto}>
                    Retake
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={stopCamera}
                    className="bg-green-500 text-white"
                  >
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
    </div>
  );
} 