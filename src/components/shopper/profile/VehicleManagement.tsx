import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Form, Panel, SelectPicker, useToaster, Message, Loader, Modal, List, Placeholder, Drawer, Input } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";
import { useSession } from 'next-auth/react';

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

const VehicleManagement: React.FC<VehicleManagementProps> = ({ userId, onVehicleAdded }) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });
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
    if (!formValue.type || !formValue.plate_number || !formValue.model) {
      toaster.push(
        <Message type="warning" closable>
          Please fill in all required fields
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );
      return;
    }

    if (!capturedPhoto) {
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
      // Compress the captured photo
      const compressedPhoto = await compressImage(capturedPhoto, 100); // Compress to ~100KB

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vehicle information');
      }

      const data = await response.json();

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

  const handleTicketSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ticketForm,
          type: 'vehicle_change',
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      toaster.push(
        <Message type="success" closable>
          Your request has been submitted. Our support team will reach out to you shortly.
        </Message>,
        { placement: 'topEnd', duration: 5000 }
      );

      setDrawerOpen(false);
      setTicketForm({
        subject: '',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error creating ticket:', error);
      toaster.push(
        <Message type="error" closable>
          Failed to submit request. Please try again.
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
      setVehicles(data.vehicles || []);
    } catch (error) {
      logger.error("Error loading vehicles:", error);
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
  useEffect(() => {
    loadVehicles();
  }, [userId]);

  return (
    <div className={`p-4 rounded-lg ${
      theme === "dark" ? "bg-gray-800" : "bg-white"
    } [&_.rs-input]:!rounded-none [&_.rs-picker-toggle]:!rounded-none [&_.rs-picker-menu]:!rounded-none`}>
      {loadingVehicles ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Placeholder.Paragraph rows={1} width={200} />
            <Placeholder.Paragraph rows={1} width={150} />
          </div>
          <List>
            {[1, 2].map((index) => (
              <List.Item key={index}>
                <div className="flex items-center space-x-4">
                  <Placeholder.Graph width={100} height={100} />
                  <div className="flex-1">
                    <Placeholder.Paragraph rows={2} />
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </div>
      ) : vehicles.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>Your Vehicles</h3>
            <Button
              appearance="primary"
              color="green"
              onClick={() => setDrawerOpen(true)}
            >
              <i className="fas fa-ticket-alt mr-2" />
              Raise Ticket
            </Button>
          </div>
          <List>
            {vehicles.map((vehicle) => (
              <List.Item key={vehicle.id}>
                <div className="flex items-center space-x-4">
                  {vehicle.photo && (
                    <img
                      src={vehicle.photo}
                      alt={`${vehicle.type} photo`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>{vehicle.type}</h4>
                    <p className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Model: {vehicle.model}</p>
                    <p className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}>Plate: {vehicle.plate_number}</p>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </div>
      ) : (
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
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
                className="!rounded-none [&_.rs-picker-toggle]:!rounded-none"
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Plate Number</Form.ControlLabel>
              <Form.Control
                name="plate_number"
                value={formValue.plate_number}
                onChange={(value) => setFormValue(prev => ({ ...prev, plate_number: value }))}
                className="!rounded-none"
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
                className="!rounded-none [&_.rs-picker-toggle]:!rounded-none"
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
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="sm"
        backdrop="static"
        className="[&_.rs-input]:!rounded-none [&_.rs-picker-toggle]:!rounded-none [&_.rs-picker-menu]:!rounded-none"
      >
        <Drawer.Header>
          <Drawer.Title>Request Vehicle Change</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Subject</Form.ControlLabel>
              <Input
                value={ticketForm.subject}
                onChange={(value) => setTicketForm(prev => ({ ...prev, subject: value }))}
                placeholder="Brief description of your request"
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Input
                as="textarea"
                rows={5}
                value={ticketForm.description}
                onChange={(value) => setTicketForm(prev => ({ ...prev, description: value }))}
                placeholder="Please provide details about the changes you need"
              />
            </Form.Group>

            <Form.Group>
              <Form.ControlLabel>Priority</Form.ControlLabel>
              <SelectPicker
                data={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' }
                ]}
                value={ticketForm.priority}
                onChange={(value) => setTicketForm(prev => ({ ...prev, priority: value || 'medium' }))}
                style={{ width: '100%' }}
              />
            </Form.Group>
          </Form>
        </Drawer.Body>
        <Drawer.Footer>
          <Button
            appearance="primary"
            color="green"
            onClick={handleTicketSubmit}
            loading={loading}
          >
            Submit Request
          </Button>
          <Button
            appearance="subtle"
            onClick={() => setDrawerOpen(false)}
            className="ml-2"
          >
            Cancel
          </Button>
        </Drawer.Footer>
      </Drawer>
    </div>
  );
};

export default VehicleManagement; 