import React, { useState } from "react";
import { Modal, Button, Loader } from "rsuite";
import { useRouter } from "next/router";
import { formatCurrency } from "../../lib/formatCurrency";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  shop: string;
  shopAddress: string;
  dateCreated: string;
  dateCompleted: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
}

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
}

const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
}) => {
  const router = useRouter();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  // For file selection management
  const acceptedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  
  const handleViewInvoiceDetails = () => {
    if (!invoiceData?.id) {
      console.error("Invoice ID is missing");
      setUploadError("Unable to view invoice details: Invoice ID is missing");
      return;
    }
    onClose();
    router.push(`/Plasa/invoices/${invoiceData.id}`);
  };
  
  const handleReturnToBatches = () => {
    onClose();
    router.push('/Plasa/active-batches');
  };

  const handleUpdateDatabase = async (fileName: string) => {
    if (!invoiceData?.orderId) return;
    
    try {
      // Temporary placeholder URL using the filename
      const placeholderUrl = `placeholder_delivery_photo_${fileName}`;
      
      // API call to update the order with the delivery photo placeholder
      const response = await fetch('/api/shopper/updateDeliveryPhoto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          photoUrl: placeholderUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order with delivery photo');
      }
      
      setSelectedFileName(fileName);
      setPhotoUploaded(true);
      setUploadError(null);
    } catch (error) {
      console.error('Error updating order with photo placeholder:', error);
      setUploadError('Failed to update order record');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !invoiceData?.orderId) {
      setUploadError('No file selected');
      return;
    }
    
    const file = fileList[0];
    
    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }
    
    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }
    
    setPhotoUploading(true);
    setUploadError(null);
    
    try {
      // Extract filename and timestamp
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      
      // Instead of uploading to Firebase, just use the filename
      await handleUpdateDatabase(fileName);
      
    } catch (error) {
      console.error('Error handling file:', error);
      setUploadError('Failed to process photo. Please try again.');
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <Modal open={open} onClose={onClose} size="md">
        <Modal.Header>
          <Modal.Title>Delivery Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size="lg" content="Processing..." />
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!invoiceData) {
    return (
      <Modal open={open} onClose={onClose} size="md">
        <Modal.Header>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="py-4 text-center text-red-600">
            Could not process delivery confirmation. Please try again later.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} appearance="primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>Delivery Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4 p-2">
          {/* Success message */}
          <div className="rounded-md bg-green-50 p-4 text-center text-green-800">
            <div className="mb-2 flex justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Order Successfully Delivered!</h3>
            <p className="mt-1">
              Order #{invoiceData.orderNumber} has been marked as delivered.
            </p>
          </div>
          
          {/* Order summary */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{invoiceData.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">{formatCurrency(invoiceData.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Photo upload section */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold">Upload Delivery Photo</h3>
            <p className="mb-3 text-sm text-gray-600">
              Please select a photo of the delivered package as proof of delivery.
            </p>
            
            {photoUploaded ? (
              <div className="mt-4 text-center">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="font-medium">Selected file:</p>
                  <p className="text-gray-600 break-all">{selectedFileName}</p>
                </div>
                <p className="mt-3 text-green-600">Photo information saved successfully!</p>
              </div>
            ) : (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="mb-2 block w-full text-sm text-gray-500
                    file:mr-4 file:rounded-md file:border-0
                    file:bg-green-50 file:py-2 file:px-4
                    file:text-sm file:font-semibold
                    file:text-green-700 hover:file:bg-green-100"
                />
                
                {photoUploading && (
                  <div className="mt-2">
                    <Loader content="Processing..." />
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-2 text-sm text-red-600">
                    {uploadError}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <p>
              <strong>Note:</strong> You can view the invoice details or return to 
              available batches after selecting a delivery photo.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          onClick={handleViewInvoiceDetails} 
          appearance="primary" 
          color="green"
          disabled={!photoUploaded && !photoUploading}
        >
          View Invoice Details
        </Button>
        <Button 
          onClick={handleReturnToBatches} 
          appearance="default"
          disabled={photoUploading}
        >
          Return to Batches
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeliveryConfirmationModal;
