import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useShopperForm, steps, transportOptions, guarantorRelationshipOptions, mutualStatusOptions } from "../../hooks/useShopperForm";
import { CustomInput, FileUploadInput } from "./ShopperUIComponents";
import { ChevronLeft, Camera, PenTool, CheckCircle2, User, Phone, MapPin, Users, FileText, Check } from "lucide-react";

export const MobileBecomeShopper = () => {
  const { theme } = useTheme();
  const {
    formValue, currentStep, errors, loading, registrationSuccess,
    capturedPhoto, capturedLicense, capturedNationalIdFront, capturedNationalIdBack,
    capturedSignature, policeClearanceFile, proofOfResidencyFile, maritalStatusFile,
    stream, showCamera, cameraLoading, videoRef, canvasRef, signatureCanvasRef,
    handleInputChange, startCamera, stopCamera, capturePhoto, nextStep, prevStep,
    handleSubmit, setPoliceClearanceFile, setProofOfResidencyFile, setMaritalStatusFile,
    setCapturedSignature, setShowSignaturePad, showSignaturePad
  } = useShopperForm() as any;

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-black">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Application Sent!</h1>
        <p className="text-gray-600 dark:text-gray-400">Your application to become a Plasa is being reviewed. We'll contact you soon.</p>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Full Name" name="full_name" value={formValue.full_name} onChange={handleInputChange} error={errors.full_name} required placeholder="Your full legal name" />
            <CustomInput label="National ID Number" name="national_id" value={formValue.national_id} onChange={handleInputChange} error={errors.national_id} required placeholder="16-digit ID number" />
            <CustomInput label="Transport Mode" name="transport_mode" type="select" options={transportOptions} value={formValue.transport_mode} onChange={handleInputChange} error={errors.transport_mode} required />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Phone Number" name="phone_number" value={formValue.phone_number} onChange={handleInputChange} error={errors.phone_number} required placeholder="e.g., 0788829084" />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Physical Address" name="address" type="textarea" rows={3} value={formValue.address} onChange={handleInputChange} error={errors.address} required placeholder="District, Sector, Cell, Village" />
            <CustomInput label="Marital Status" name="mutual_status" type="select" options={mutualStatusOptions} value={formValue.mutual_status} onChange={handleInputChange} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Guarantor Name" name="guarantor" value={formValue.guarantor} onChange={handleInputChange} placeholder="Name of someone who knows you" />
            <CustomInput label="Guarantor Phone" name="guarantorPhone" value={formValue.guarantorPhone} onChange={handleInputChange} placeholder="Their phone number" />
            <CustomInput label="Relationship" name="guarantorRelationship" type="select" options={guarantorRelationshipOptions} value={formValue.guarantorRelationship} onChange={handleInputChange} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="space-y-4">
              <label className="text-sm font-bold dark:text-gray-300">Identity Photos</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => startCamera("profile")} 
                  className={`flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed transition-all ${capturedPhoto ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
                >
                  {capturedPhoto ? <Image src={capturedPhoto} fill className="rounded-2xl object-cover" alt="Profile" /> : <><Camera className="mb-2 h-6 w-6 text-gray-400" /><span className="text-xs">Profile Photo</span></>}
                </button>
                <button 
                  onClick={() => startCamera("national_id_front")} 
                  className={`flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed transition-all ${capturedNationalIdFront ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
                >
                  {capturedNationalIdFront ? <Image src={capturedNationalIdFront} fill className="rounded-2xl object-cover" alt="ID Front" /> : <><Camera className="mb-2 h-6 w-6 text-gray-400" /><span className="text-xs">ID Front</span></>}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold dark:text-gray-300">Official Certificates</label>
              <FileUploadInput label="Police Clearance" file={policeClearanceFile} onChange={(e:any) => setPoliceClearanceFile(e.target.files[0])} onRemove={() => setPoliceClearanceFile(null)} description="Optional: Certificate from Irembo" />
              <button 
                onClick={() => {}} // Open signature logic handle
                className={`w-full flex items-center justify-center py-4 rounded-2xl border-2 border-dashed ${capturedSignature ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
              >
                <PenTool className="mr-2 h-5 w-5" />
                <span>{capturedSignature ? 'Change Signature' : 'Add Digital Signature'}</span>
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'}`}>
              <h4 className="font-bold flex items-center mb-4"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Quick Review</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{formValue.full_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Transport</span><span className="font-medium">{formValue.transport_mode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{formValue.phone_number}</span></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center px-4">By submitting, you agree to our terms of service for delivery partners.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex min-h-screen flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-[10000] flex flex-col px-6 pt-12 pb-6 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-xl border-b border-gray-100 dark:border-gray-900`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevStep} disabled={currentStep === 0} className={`p-2 rounded-xl transition-colors ${currentStep === 0 ? 'opacity-0' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{steps[currentStep].title}</h1>
            <p className="text-xs text-gray-500">{steps[currentStep].description}</p>
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex h-1.5 w-full space-x-1 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
          {steps.map((_, i) => (
            <div key={i} className={`h-full flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-green-500' : 'bg-transparent'}`} />
          ))}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 px-6 py-8 pb-32">
        {renderCurrentStep()}
      </main>

      {/* Sticky Bottom Actions */}
      <footer className={`fixed bottom-0 left-0 right-0 z-[10001] px-6 py-6 pb-8 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-xl border-t border-gray-100 dark:border-gray-900`}>
        <button 
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={loading}
          className="w-full flex items-center justify-center py-4 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 transition-all duration-300"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span>{currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}</span>
          )}
        </button>
      </footer>

      {/* Camera Modal - Minimal Overlays */}
      {showCamera && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none flex items-center justify-center">
             <div className="w-full aspect-[3/4] border-2 border-white/50 rounded-3xl" />
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex items-center justify-around px-12">
            <button onClick={stopCamera} className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
            <div className="w-16" />
          </div>
        </div>
      )}
    </div>
  );
};
