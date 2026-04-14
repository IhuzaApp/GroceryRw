import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useShopperForm, steps, guarantorRelationshipOptions, mutualStatusOptions } from "../../hooks/useShopperForm";
import { CustomInput, FileUploadInput, HorizontalStepper, TransportModeSelector, SignaturePad, AddressAutocomplete } from "./ShopperUIComponents";
import { CheckCircle2, LayoutDashboard, MapPin, Truck, ChevronRight, ChevronLeft, Shield, Clock, Wallet, X, Camera, ArrowRight, ShieldCheck } from "lucide-react";
import { BiometricCameraModal } from "./BiometricCameraModal";
// @ts-ignore
import { Resend } from "resend"; 

export const DesktopBecomeShopper = () => {
  const { theme } = useTheme();
  const {
    router,
    formValue, currentStep, errors, loading, registrationSuccess, apiError,
    capturedPhoto, capturedLicenseFront, capturedLicenseBack, capturedPlateNumber, capturedNationalIdFront, capturedNationalIdBack,
    capturedSignature, policeClearanceFile, proofOfResidencyFile, maritalStatusFile,
    stream, showCamera, videoRef, canvasRef, handleInputChange, handleLocationSelect, startCamera, stopCamera, 
    capturePhoto, nextStep, prevStep, handleSubmit, setPoliceClearanceFile, setProofOfResidencyFile, setMaritalStatusFile,
    setCapturedSignature,
    faceVerified, verificationStatus, livenessStep, captureMode, livenessProgress, lowLight
  } = useShopperForm() as any;

  if (registrationSuccess) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center p-6 bg-gradient-to-b from-transparent to-green-500/5">
        <div className={`max-w-xl w-full p-16 text-center rounded-[48px] shadow-2xl animate-in zoom-in duration-700 ${theme === 'dark' ? 'bg-[#0a0a0a] border border-gray-900 shadow-black' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 animate-pulse" />
            <div className="relative flex h-28 w-28 mx-auto items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/40">
              <CheckCircle2 className="h-14 w-14" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight">Application Sent!</h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">We've received your application. Our team will verify your identity documents within 48 hours. Welcome to the Plasa family!</p>
          <button onClick={() => window.location.href = '/'} className="group relative px-12 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center">
               Back to Home <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen py-20 px-8 md:pl-32 md:pr-12 ${theme === 'dark' ? 'bg-[#000] text-white' : 'bg-[#fafafa] text-gray-900'}`}>
        <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          {/* New Centered Header */}
          <header className="relative text-center mb-16">
            <button 
              onClick={() => router.push('/Myprofile')}
              className={`absolute top-0 right-0 p-4 rounded-3xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Cancel Application"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
            <div className="flex justify-center mb-8">
               <Image 
                 src="/assets/logos/PlasLogoPNG.png" 
                 width={160} 
                 height={60} 
                 alt="Plas Logo" 
                 className="object-contain"
               />
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-[11px] font-black uppercase tracking-widest mb-6">
              <Shield className="h-3 w-3" />
              <span>Secure Plasa Onboarding</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">Start Earning as a Plasa</h1>
            <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">Fill out the form below to join Rwanda's premium delivery network. Your security is our priority.</p>
          </header>

          {/* New Horizontal Stepper Component */}
          <HorizontalStepper steps={steps} currentStep={currentStep} theme={theme} />

          {/* Main Focused Card */}
          <div className={`relative mt-20 p-12 md:p-16 rounded-[48px] shadow-2xl transition-all duration-500 ${
            theme === 'dark' 
              ? 'bg-[#0a0a0a] border border-gray-900 shadow-black/80' 
              : 'bg-white border border-gray-100 shadow-gray-200/40'
          }`}>
            {/* Section Indicator */}
            <div className="flex items-center space-x-3 mb-10 opacity-60">
                <div className="h-[2px] w-8 bg-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{steps[currentStep].title}</span>
             </div>

            {apiError && (
              <div className="mb-10 animate-in fade-in zoom-in duration-300">
                <div className="p-6 rounded-[32px] bg-red-50 border border-red-100 flex items-start space-x-4 text-red-600">
                  <span className="text-2xl mt-1">⚠️</span>
                  <div>
                    <h4 className="text-lg font-black">{apiError.title}</h4>
                    <p className="text-sm font-medium opacity-90">{apiError.message}</p>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              switch (currentStep) {
                case 0:
                  return (
                    <div className="col-span-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[48px] shadow-2xl">
                           <Image 
                             src="/images/shopper/welcome_hero_v2.png" 
                             fill 
                             className="object-cover object-center" 
                             alt="Welcome to Plasa"
                             priority
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                           <div className="absolute bottom-12 left-12 right-12">
                              <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Empowering <br/> Every Journey.</h2>
                              <p className="text-xl text-white/80 font-medium max-w-2xl">Join Rwanda's premier delivery community. Drive change, earn with flexibility, and lead the future of local commerce.</p>
                           </div>
                        </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { icon: <Clock className="h-8 w-8" />, title: 'Total Flexibility', desc: 'Choose your own hours and areas. Work as much or as little as you like.' },
                            { icon: <Wallet className="h-8 w-8" />, title: 'Instant Payouts', desc: 'No waiting for month-end. Get your earnings settled directly and quickly.' },
                            { icon: <ShieldCheck className="h-8 w-8" />, title: 'Full Protection', desc: 'Safety first with real-time support and insurance for every trip.' }
                          ].map((item, i) => (
                            <div key={i} className={`p-8 rounded-[40px] border transition-all hover:scale-105 ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                              <div className="mb-6 p-4 rounded-2xl bg-green-500/10 text-green-500 inline-block">{item.icon}</div>
                              <h4 className="text-lg font-black mb-2">{item.title}</h4>
                              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                case 1:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="First Name" name="first_name" value={formValue.first_name} onChange={handleInputChange} error={errors.first_name} required placeholder="Legal first name" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Last Name / Surname" name="last_name" value={formValue.last_name} onChange={handleInputChange} error={errors.last_name} required placeholder="Surname" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="National ID / Passport" name="national_id" value={formValue.national_id} onChange={handleInputChange} error={errors.national_id} required placeholder="Enter number" />
                      </div>
                      <div className="col-span-full md:col-span-1">
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
                      </div>
                      <div className="col-span-full">
                         <TransportModeSelector value={formValue.transport_mode} onChange={handleInputChange} error={errors.transport_mode} />
                      </div>
                      
                      <div className="col-span-full">
                        <div className={`p-8 rounded-[32px] border-2 border-dashed transition-all ${faceVerified ? 'border-green-500 bg-green-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                              <div className={`p-4 rounded-2xl ${faceVerified ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                <ShieldCheck className="h-8 w-8" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black">Face Verification</h4>
                                <p className="text-sm text-gray-500">Fast biometric liveness security check</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => startCamera('profile')}
                              disabled={faceVerified || !formValue.first_name || !formValue.last_name || !formValue.national_id || !formValue.dob}
                              className={`px-8 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 ${
                                faceVerified ? 'bg-green-500/10 text-green-500' : 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20'
                              }`}
                            >
                              {faceVerified ? "Face Verified Successfully" : "Verify Face (Liveness)"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                case 2:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Verified Phone Number" name="phone_number" value={formValue.phone_number} onChange={handleInputChange} error={errors.phone_number} required placeholder="e.g. 078XXXXXXX" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Email Address" name="email" type="email" value={formValue.email} onChange={handleInputChange} error={errors.email} required placeholder="name@example.com" />
                      </div>
                    </div>
                  );
                case 3:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full">
                        <AddressAutocomplete label="Residential Address" value={formValue.address} onSelect={handleLocationSelect} error={errors.address} required />
                      </div>
                      <div className="col-span-full md:col-span-1 lg:col-span-1">
                        <CustomInput label="Marital Status" name="mutual_status" type="select" options={mutualStatusOptions} value={formValue.mutual_status} onChange={handleInputChange} />
                      </div>
                    </div>
                  );
                case 4:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full lg:col-span-1">
                        <CustomInput label="Guarantor Full Name" name="guarantor" value={formValue.guarantor} onChange={handleInputChange} placeholder="Name" />
                      </div>
                      <div className="col-span-full lg:col-span-1">
                        <CustomInput label="Guarantor Contact" name="guarantorPhone" value={formValue.guarantorPhone} onChange={handleInputChange} placeholder="Phone" />
                      </div>
                      <div className="col-span-full lg:col-span-1">
                         <CustomInput label="Relationship" name="guarantorRelationship" type="select" options={guarantorRelationshipOptions} value={formValue.guarantorRelationship} onChange={handleInputChange} />
                      </div>
                    </div>
                  );
                case 5:
                  return (
                     <div className="col-span-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Live Profile Capture</label>
                            <button onClick={() => startCamera('profile_photo')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedPhoto ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                              {capturedPhoto ? (
                                 <Image src={capturedPhoto} fill className="object-cover" alt="Profile" />
                              ) : (
                                <>
                                  <div className="p-5 rounded-full bg-gray-50 dark:bg-gray-900 mb-3 group-hover:scale-110 transition-transform">
                                     <Camera className="h-8 w-8 text-green-600" />
                                  </div>
                                  <span className="text-sm font-bold">Take Profile Photo</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">National ID Documents</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <button onClick={() => startCamera('national_id_front')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedNationalIdFront ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                                {capturedNationalIdFront ? (
                                   <Image src={capturedNationalIdFront} fill className="object-cover" alt="ID Front" />
                                ) : (
                                  <>
                                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:scale-110 transition-transform">
                                       <Camera className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-xs font-bold">ID Front Photo</span>
                                  </>
                                )}
                              </button>
                              <button onClick={() => startCamera('national_id_back')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedNationalIdBack ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                                {capturedNationalIdBack ? (
                                   <Image src={capturedNationalIdBack} fill className="object-cover" alt="ID Back" />
                                ) : (
                                  <>
                                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:scale-110 transition-transform">
                                       <Camera className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-xs font-bold">ID Back Photo</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {(formValue.transport_mode === 'car' || formValue.transport_mode === 'motorcycle') && (
                          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
                            <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Vehicle Documents</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <button onClick={() => startCamera('plate_number')} className={`group relative w-full aspect-[5/2] rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedPlateNumber ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                                  {capturedPlateNumber ? (
                                    <Image src={capturedPlateNumber} fill className="object-cover" alt="Plate Number" />
                                  ) : (
                                    <>
                                      <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:scale-110 transition-transform">
                                        <Camera className="h-6 w-6 text-green-600" />
                                      </div>
                                      <span className="text-xs font-bold text-center">Vehicle Plate<br/>Number</span>
                                    </>
                                  )}
                                </button>
                                <button onClick={() => startCamera('license_front')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedLicenseFront ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                                  {capturedLicenseFront ? (
                                    <Image src={capturedLicenseFront} fill className="object-cover" alt="License Front" />
                                  ) : (
                                    <>
                                      <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:scale-110 transition-transform">
                                        <Camera className="h-6 w-6 text-green-600" />
                                      </div>
                                      <span className="text-xs font-bold text-center">Driving License<br/>Front</span>
                                    </>
                                  )}
                                </button>
                                <button onClick={() => startCamera('license_back')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedLicenseBack ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
                                  {capturedLicenseBack ? (
                                    <Image src={capturedLicenseBack} fill className="object-cover" alt="License Back" />
                                  ) : (
                                    <>
                                      <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:scale-110 transition-transform">
                                        <Camera className="h-6 w-6 text-green-600" />
                                      </div>
                                      <span className="text-xs font-bold text-center">Driving License<br/>Back</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FileUploadInput name="police_clearance" label="Police Clearance Certificate *" file={policeClearanceFile} onChange={(e:any) => setPoliceClearanceFile(e.target.files[0])} onRemove={() => setPoliceClearanceFile(null)} description="Upload certificate from Irembo site (required)" />
                          <FileUploadInput name="proof_of_residency" label="Proof of Residency" file={proofOfResidencyFile} onChange={(e:any) => setProofOfResidencyFile(e.target.files[0])} onRemove={() => setProofOfResidencyFile(null)} description="Utility bill, lease, or official letter" />
                          <FileUploadInput name="marital_status_cert" label="Marital Status Certificate" file={maritalStatusFile} onChange={(e:any) => setMaritalStatusFile(e.target.files[0])} onRemove={() => setMaritalStatusFile(null)} description="Official marital status document" />
                        </div>
                     </div>
                  );
                case 6:
                  return (
                     <div className="col-span-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-[32px] ${theme === 'dark' ? 'bg-[#111]/50' : 'bg-gray-50/50'}`}>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Full Name</p>
                             <p className="text-lg font-bold">{formValue.first_name} {formValue.last_name}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Transport</p>
                             <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4 text-green-600" />
                                <p className="text-lg font-bold capitalize">{formValue.transport_mode}</p>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Phone</p>
                             <p className="text-lg font-bold">{formValue.phone_number}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Address</p>
                             <p className="text-lg font-bold truncate">{formValue.address}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[12px] font-black uppercase text-gray-400 tracking-widest">Captured Documents</p>
                          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                            {[
                              { label: 'Profile', src: capturedPhoto },
                              { label: 'ID Front', src: capturedNationalIdFront },
                              { label: 'ID Back', src: capturedNationalIdBack },
                              (formValue.transport_mode === 'car' || formValue.transport_mode === 'motorcycle') ? { label: 'License', src: capturedLicenseFront } : null,
                              (formValue.transport_mode === 'car' || formValue.transport_mode === 'motorcycle') ? { label: 'Plate', src: capturedPlateNumber } : null,
                            ].filter(Boolean).map((doc: any, idx) => (
                              <div key={idx} className="flex-shrink-0 relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border-2 border-green-500">
                                <Image src={doc.src} fill className="object-cover" alt={doc.label} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <CheckCircle2 className="text-white h-6 w-6" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-white/5 pt-8 space-y-8">
                          <div className="flex items-start space-x-4">
                            <input 
                               type="checkbox" 
                               id="backgroundCheck" 
                               checked={formValue.agreedToBackgroundCheck || false}
                               onChange={(e) => handleInputChange("agreedToBackgroundCheck", e.target.checked)}
                               className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <label htmlFor="backgroundCheck" className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed cursor-pointer">
                               I agree to a background check and certify that the information I have provided is accurate and true. I authorize Plasa to verify my details including criminal records and driving history if applicable.
                            </label>
                          </div>
                          
                          <div className="space-y-4 max-w-xl">
                            <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Digital Signature</label>
                            <SignaturePad onSign={setCapturedSignature} error={errors.signature} />
                          </div>
                        </div>
                     </div>
                  );
                default:
                  return null;
              }
            })()}
            </div>

            {/* Action Footer */}
            <footer className="mt-20 flex items-center justify-between border-t border-gray-100 dark:border-gray-900 pt-12">
              <button 
                onClick={prevStep} 
                disabled={currentStep === 0} 
                className={`group flex items-center space-x-2 px-8 py-4 rounded-2xl font-black transition-all ${
                  currentStep === 0 ? 'opacity-0' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span>Previous</span>
              </button>
              
              <button 
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep} 
                disabled={loading}
                className="group relative flex items-center space-x-3 px-12 py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-3xl shadow-2xl shadow-green-600/30 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                ) : (
                  <>
                    <span className="text-lg">{currentStep === steps.length - 1 ? 'Finish Registration' : 'Next Step'}</span>
                    <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </footer>
          </div>
        </div>

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
        />
    </>
  );
};
