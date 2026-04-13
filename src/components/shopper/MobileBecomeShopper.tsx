import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useShopperForm, steps, guarantorRelationshipOptions, mutualStatusOptions } from "../../hooks/useShopperForm";
import { CustomInput, FileUploadInput, TransportModeSelector } from "./ShopperUIComponents";
import { ChevronLeft, ChevronRight, Camera, PenTool, CheckCircle2, User, Phone, MapPin, Users, FileText, Check, X, Shield, Wallet, Clock, Zap } from "lucide-react";
import { BiometricCameraModal } from "./BiometricCameraModal";

export const MobileBecomeShopper = () => {
  const { theme } = useTheme();
  const {
    router,
    formValue, currentStep, errors, loading, registrationSuccess,
    capturedPhoto, capturedLicense, capturedNationalIdFront, capturedNationalIdBack,
    capturedSignature, policeClearanceFile, proofOfResidencyFile, maritalStatusFile,
    stream, showCamera, cameraLoading, videoRef, canvasRef, signatureCanvasRef,
    handleInputChange, startCamera, stopCamera, capturePhoto, nextStep, prevStep,
    handleSubmit, setPoliceClearanceFile, setProofOfResidencyFile, setMaritalStatusFile,
    setCapturedSignature, setShowSignaturePad, showSignaturePad,
    faceVerified, verificationStatus, livenessStep, captureMode, livenessProgress, lowLight
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
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image 
                src="/images/shopper/welcome_hero_v2.png" 
                fill 
                className="object-cover" 
                alt="Welcome to Plasa"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                    <Zap className="h-3 w-3" />
                    <span>Instant Approval</span>
                 </div>
                 <h2 className="text-4xl font-black text-white leading-[0.9] tracking-tighter">Empowering <br/> Every Journey.</h2>
                 <p className="text-white/70 text-sm mt-4 font-medium max-w-[240px]">Join Rwanda's premier delivery community. Drive change and earn with total flexibility.</p>
              </div>
            </div>

            <div className="px-6 grid grid-cols-1 gap-4">
              <div className={`p-5 rounded-[32px] border ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">Flexible Schedule</h4>
                    <p className="text-xs text-gray-500 font-medium">Work on your own terms.</p>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-[32px] border ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">Weekly Payouts</h4>
                    <p className="text-xs text-gray-500 font-medium">Get paid every single week.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-10">
              <div className={`p-6 rounded-[32px] border-2 border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Identity Requirements</h4>
                 <div className="flex flex-wrap justify-center gap-2">
                    {['Valid ID', 'Smartphone', '18+ Years', 'Reliable Transport'].map(item => (
                      <span key={item} className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-600'}`}>
                         {item}
                      </span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
           <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="First Name" name="first_name" value={formValue.first_name} onChange={handleInputChange} error={errors.first_name} required placeholder="Legal first name" />
            <CustomInput label="Last Name / Surname" name="last_name" value={formValue.last_name} onChange={handleInputChange} error={errors.last_name} required placeholder="Surname" />
            <CustomInput label="National ID Number" name="national_id" value={formValue.national_id} onChange={handleInputChange} error={errors.national_id} required placeholder="16-digit ID number" />
            <CustomInput 
              label="Date of Birth" 
              name="dob" 
              type="date" 
              value={formValue.dob} 
              onChange={handleInputChange} 
              error={errors.dob} 
              required 
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            <TransportModeSelector value={formValue.transport_mode} onChange={handleInputChange} error={errors.transport_mode} />
            
            <div className={`p-6 rounded-[32px] border-2 border-dashed transition-all ${faceVerified ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
               <div className="flex items-center space-x-3 mb-4">
                  <Shield className={`h-5 w-5 ${faceVerified ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold">Face Verification</span>
               </div>
               <button 
                onClick={() => startCamera('profile')}
                disabled={faceVerified || !formValue.first_name || !formValue.last_name || !formValue.national_id || !formValue.dob}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  faceVerified ? 'bg-green-500/10 text-green-500' : 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                }`}
               >
                 {faceVerified ? "Face Verified" : "Verify Face (Liveness)"}
               </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Verified Phone Number" name="phone_number" value={formValue.phone_number} onChange={handleInputChange} error={errors.phone_number} required placeholder="e.g. 078XXXXXXX" />
            <CustomInput label="Email Address" name="email" type="email" value={formValue.email} onChange={handleInputChange} error={errors.email} required placeholder="name@example.com" />
          </div>
        );
      case 3:
        return (
          <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Physical Address" name="address" type="textarea" rows={3} value={formValue.address} onChange={handleInputChange} error={errors.address} required placeholder="District, Sector, Cell, Village" />
            <CustomInput label="Marital Status" name="mutual_status" type="select" options={mutualStatusOptions} value={formValue.mutual_status} onChange={handleInputChange} />
          </div>
        );
      case 4:
        return (
          <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <CustomInput label="Guarantor Name" name="guarantor" value={formValue.guarantor} onChange={handleInputChange} placeholder="Name of someone who knows you" />
            <CustomInput label="Guarantor Phone" name="guarantorPhone" value={formValue.guarantorPhone} onChange={handleInputChange} placeholder="Their phone number" />
            <CustomInput label="Relationship" name="guarantorRelationship" type="select" options={guarantorRelationshipOptions} value={formValue.guarantorRelationship} onChange={handleInputChange} />
          </div>
        );
      case 5:
        return (
          <div className="px-6 space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="space-y-4">
              <label className="text-sm font-bold dark:text-gray-300">Identity Photos</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => startCamera("profile")} 
                  className={`relative flex flex-col items-center justify-center h-48 rounded-[32px] border-2 border-dashed transition-all overflow-hidden ${capturedPhoto ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
                >
                  {capturedPhoto ? <Image src={capturedPhoto} fill className="object-cover" alt="Profile" /> : <><Camera className="mb-2 h-6 w-6 text-gray-400" /><span className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Selfie Photo</span></>}
                </button>
                <div className="grid grid-rows-2 gap-4 h-48">
                  <button 
                    onClick={() => startCamera("national_id_front")} 
                    className={`relative flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed transition-all overflow-hidden ${capturedNationalIdFront ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
                  >
                    {capturedNationalIdFront ? <Image src={capturedNationalIdFront} fill className="object-cover" alt="ID Front" /> : <><Camera className="mb-1 h-4 w-4 text-gray-400" /><span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ID Front</span></>}
                  </button>
                  <button 
                    onClick={() => startCamera("national_id_back")} 
                    className={`relative flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed transition-all overflow-hidden ${capturedNationalIdBack ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
                  >
                    {capturedNationalIdBack ? <Image src={capturedNationalIdBack} fill className="object-cover" alt="ID Back" /> : <><Camera className="mb-1 h-4 w-4 text-gray-400" /><span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ID Back</span></>}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold dark:text-gray-300">Official Certificates</label>
              <FileUploadInput label="Police Clearance" file={policeClearanceFile} onChange={(e:any) => setPoliceClearanceFile(e.target.files[0])} onRemove={() => setPoliceClearanceFile(null)} description="Optional: Certificate from Irembo" />
              <button 
                onClick={() => {}} // Open signature logic handle
                className={`w-full flex items-center justify-center py-5 rounded-[24px] border-2 border-dashed ${capturedSignature ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}
              >
                <PenTool className="mr-2 h-5 w-5" />
                <span className="text-sm font-bold">{capturedSignature ? 'Change Signature' : 'Add Digital Signature'}</span>
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="px-6 space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className={`p-8 rounded-[40px] ${theme === 'dark' ? 'bg-[#111]' : 'bg-gray-50'}`}>
              <h4 className="font-black tracking-tight text-xl flex items-center mb-6"><CheckCircle2 className="mr-2 h-6 w-6 text-green-500" /> Confirm Details</h4>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center"><span className="text-gray-500">Legal Name</span><span>{formValue.first_name} {formValue.last_name}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Transport</span><span className="capitalize">{formValue.transport_mode}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Phone</span><span className="">{formValue.phone_number}</span></div>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-4" />
                <div className="flex justify-between items-center"><span className="text-gray-500 text-xs">Steps Competed</span><span className="text-green-500 font-black">7 of 7</span></div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 text-center px-10 leading-relaxed font-medium">By submitting, you agree to our terms of service for delivery partners and privacy policy.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex min-h-screen flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      {/* Premium Header */}
      <header className={`sticky top-0 z-[10000] flex flex-col px-5 pt-8 pb-5 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 transition-all duration-500`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            {currentStep > 0 ? (
              <button 
                onClick={prevStep} 
                className={`p-2 rounded-xl transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-green-500/10">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">{steps[currentStep].title}</h1>
              <p className="text-[9px] uppercase font-black tracking-widest text-gray-500 mt-1">{steps[currentStep].description}</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/Myprofile')}
            className={`p-2 rounded-xl transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Cancel Application"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Sleek Progress Bar */}
        <div className="flex h-1 w-full space-x-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
          {steps.map((_, i) => (
            <div key={i} className={`h-full flex-1 transition-all duration-700 ease-out rounded-full ${i <= currentStep ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-transparent'}`} />
          ))}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 pb-40">
        {renderCurrentStep()}
      </main>

      {/* Persistent Bottom CTA */}
      <footer className={`fixed bottom-0 left-0 right-0 z-[10001] px-5 py-5 pb-8 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-2xl border-t border-gray-50 dark:border-white/5 transition-all duration-500`}>
        <button 
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={loading}
          className="w-full relative flex items-center justify-between pl-6 pr-3 py-4 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          
          <span className="text-base relative z-10">
            {loading ? 'Processing...' : currentStep === steps.length - 1 ? 'Submit Application' : currentStep === 0 ? 'Start Onboarding' : 'Next Step'}
          </span>
          
          <div className="bg-white/20 p-2.5 rounded-xl relative z-10 group-hover:scale-110 transition-transform">
             {currentStep === steps.length - 1 ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </button>
      </footer>

      {/* Camera/Signature Modals would go here */}
      {/* Biometric/Document Camera Modal */}
      <BiometricCameraModal 
        show={showCamera}
        captureMode={captureMode}
        livenessStep={livenessStep}
        livenessProgress={livenessProgress}
        lowLight={lowLight}
        verificationStatus={verificationStatus}
        videoRef={videoRef}
        canvasRef={canvasRef}
        stopCamera={stopCamera}
        capturePhoto={capturePhoto}
        isMobile={true}
      />
    </div>
  );
};
