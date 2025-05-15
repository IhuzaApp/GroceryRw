import React, { useState, useRef } from "react";
import { Modal, Button, Divider, Loader, Uploader, Message } from "rsuite";
import { useRouter } from "next/router";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../../lib/firebase";
import { formatCurrency } from "../../lib/formatCurrency";
import { isMobileDevice } from "../../lib/formatters";

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

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
}) => {
  const router = useRouter();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const isMobile = isMobileDevice();
  
  console.log("InvoiceModal render state:", { open, loading, hasInvoiceData: !!invoiceData });
  
  // Effect to log when modal opens
  React.useEffect(() => {
    if (open) {
      console.log("InvoiceModal opened with data:", invoiceData);
    }
  }, [open, invoiceData]);
  
  // Prevent modal from closing until photo is uploaded
  const handleAttemptClose = () => {
    if (photoUploaded) {
      onClose();
    } else {
      // Show error if user tries to close without uploading
      setUploadError("Please upload a delivery confirmation photo before proceeding");
    }
  };
  
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

  const handleUploadSuccess = async (url: string) => {
    if (!invoiceData?.orderId) return;
    
    try {
      // API call to update the order with the delivery photo URL
      const response = await fetch('/api/shopper/updateDeliveryPhoto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: invoiceData.orderId,
          photoUrl: url
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order with delivery photo');
      }
      
      setPhotoUrl(url);
      setPhotoUploaded(true);
      setUploadError(null);
    } catch (error) {
      console.error('Error updating order with photo URL:', error);
      setUploadError('Photo uploaded but failed to update order record');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
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
    setUploadProgress(0);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `delivery_photos/${invoiceData.orderId}_${new Date().getTime()}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          // Handle upload errors
          console.error('Upload error:', error);
          setUploadError('Failed to upload photo. Please try again.');
          setPhotoUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await handleUploadSuccess(downloadUrl);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadError('Failed to process uploaded photo');
            setPhotoUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload photo. Please try again.');
      setPhotoUploading(false);
    }
  };

  // For file upload management
  const acceptedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (loading) {
    return (
      <Modal open={open} onClose={handleAttemptClose} size="md" backdrop="static">
        <Modal.Header closeButton={false}>
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
      <Modal open={open} onClose={handleAttemptClose} size="md" backdrop="static">
        <Modal.Header closeButton={false}>
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
    <Modal open={open} onClose={handleAttemptClose} size="md" backdrop="static">
      <Modal.Header closeButton={false}>
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
          
          {/* Required Action Notice */}
          {!photoUploaded && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Required Action</p>
                  <p className="mt-1">You must upload a delivery photo to proceed.</p>
                </div>
              </div>
            </div>
          )}
          
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
              Please take a photo of the delivered package as proof of delivery.
            </p>
            
            {photoUploaded ? (
              <div className="mt-4 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="relative h-40 w-40 overflow-hidden rounded-lg border">
                    {photoUrl && (
                      <img 
                        src={photoUrl} 
                        alt="Delivery confirmation" 
                        className="h-full w-full object-cover" 
                      />
                    )}
                  </div>
                </div>
                <p className="text-green-600">Photo uploaded successfully!</p>
              </div>
            ) : (
              <div className="mt-2">
                {isMobile ? (
                  <div className="space-y-3">
                    {/* Camera capture for mobile devices */}
                    <div>
                      <label htmlFor="camera-capture" className="block w-full rounded-md bg-green-600 px-4 py-2.5 text-center text-white shadow-sm hover:bg-green-500 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Take Photo with Camera
                      </label>
                      <input
                        id="camera-capture"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleUpload(e.target.files)}
                        className="sr-only"
                      />
                    </div>
                    
                    {/* Gallery option for mobile */}
                    <div>
                      <label htmlFor="gallery-upload" className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-white shadow-sm hover:bg-blue-500 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Choose from Gallery
                      </label>
                      <input
                        id="gallery-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files)}
                        className="sr-only"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e.target.files)}
                    className="mb-2 block w-full text-sm text-gray-500
                      file:mr-4 file:rounded-md file:border-0
                      file:bg-green-50 file:py-2 file:px-4
                      file:text-sm file:font-semibold
                      file:text-green-700 hover:file:bg-green-100"
                  />
                )}
                
                {photoUploading && (
                  <div className="mt-2">
                    <div className="relative h-4 overflow-hidden rounded bg-gray-200">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-center text-sm text-gray-600">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-2 text-sm text-red-600 p-2 border border-red-200 bg-red-50 rounded">
                    <strong>Error:</strong> {uploadError}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <p>
              <strong>Note:</strong> You must upload a delivery photo before you can proceed. 
              After uploading, you can view the invoice details or return to available batches.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          onClick={handleViewInvoiceDetails} 
          appearance="primary" 
          color="green"
          disabled={!photoUploaded}
        >
          View Invoice Details
        </Button>
        <Button 
          onClick={handleReturnToBatches} 
          appearance="default"
          disabled={!photoUploaded || photoUploading}
        >
          Return to Batches
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
