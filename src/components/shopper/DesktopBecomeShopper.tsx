import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { useShopperForm, steps, transportOptions, guarantorRelationshipOptions, mutualStatusOptions } from "../../hooks/useShopperForm";
import { CustomInput, FileUploadInput, HorizontalStepper } from "./ShopperUIComponents";
import { CheckCircle2, Camera, PenTool, LayoutDashboard, UserCheck, ShieldCheck, MapPin, Truck, ChevronRight, ChevronLeft, X, ArrowRight, Shield, Clock, Wallet } from "lucide-react";

export const DesktopBecomeShopper = () => {
  const { theme } = useTheme();
  const {
    router,
    formValue, currentStep, errors, loading, registrationSuccess,
    capturedPhoto, capturedLicense, capturedNationalIdFront, capturedNationalIdBack,
    capturedSignature, policeClearanceFile, proofOfResidencyFile, maritalStatusFile,
    stream, showCamera, videoRef, handleInputChange, startCamera, stopCamera, 
    capturePhoto, nextStep, prevStep, handleSubmit, setPoliceClearanceFile
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
      <div className={`min-h-screen py-20 px-6 ${theme === 'dark' ? 'bg-[#000] text-white' : 'bg-[#fafafa] text-gray-900'}`}>
        <div className="max-w-4xl mx-auto">
          {/* New Centered Header */}
          <header className="relative text-center mb-16">
            <button 
              onClick={() => router.push('/Myprofile')}
              className={`absolute top-0 right-0 p-4 rounded-3xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Cancel Application"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
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

            {(() => {
              switch (currentStep) {
                case 0:
                  return (
                    <div className="col-span-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[48px] shadow-2xl">
                           <Image 
                             src="/images/shopper/welcome_hero.png" 
                             fill 
                             className="object-cover object-[center_30%]" 
                             alt="Welcome to Plasa"
                             priority
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                           <div className="absolute bottom-12 left-12 right-12">
                              <h2 className="text-5xl font-black text-white tracking-tighter mb-4">The Future of Delivery <br/> starts with You.</h2>
                              <p className="text-xl text-white/80 font-medium max-w-2xl">Join Rwanda's most advanced delivery network. Earn on your own terms with full transparency and support.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Full Legal Name" name="full_name" value={formValue.full_name} onChange={handleInputChange} error={errors.full_name} required placeholder="As shown on ID" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="National ID / Passport" name="national_id" value={formValue.national_id} onChange={handleInputChange} error={errors.national_id} required placeholder="Enter number" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Mode of Transport" name="transport_mode" type="select" options={transportOptions} value={formValue.transport_mode} onChange={handleInputChange} error={errors.transport_mode} required />
                      </div>
                    </div>
                  );
                case 2:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Verified Phone Number" name="phone_number" value={formValue.phone_number} onChange={handleInputChange} error={errors.phone_number} required placeholder="e.g. 078XXXXXXX" />
                      </div>
                    </div>
                  );
                case 3:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full">
                        <CustomInput label="Residential Address" name="address" type="textarea" rows={3} value={formValue.address} onChange={handleInputChange} error={errors.address} required placeholder="Province, District, Sector, Cell, Village" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Marital Status" name="mutual_status" type="select" options={mutualStatusOptions} value={formValue.mutual_status} onChange={handleInputChange} />
                      </div>
                    </div>
                  );
                case 4:
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Guarantor Full Name" name="guarantor" value={formValue.guarantor} onChange={handleInputChange} placeholder="Name" />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput label="Guarantor Contact" name="guarantorPhone" value={formValue.guarantorPhone} onChange={handleInputChange} placeholder="Phone" />
                      </div>
                      <div className="col-span-full md:col-span-1">
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
                            <button onClick={() => startCamera('profile')} className={`group relative w-full aspect-video rounded-[32px] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${capturedPhoto ? 'border-green-500' : 'border-gray-200 dark:border-gray-800 hover:border-green-500/50'}`}>
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
                        <div className="max-w-xl">
                          <FileUploadInput label="Police Clearance (Optional)" file={policeClearanceFile} onChange={(e:any) => setPoliceClearanceFile(e.target.files[0])} onRemove={() => setPoliceClearanceFile(null)} description="Upload certificate from Irembo site" />
                        </div>
                     </div>
                  );
                case 6:
                  return (
                     <div className="col-span-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-[32px] ${theme === 'dark' ? 'bg-[#111]/50' : 'bg-green-50/30'}`}>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Full Name</p>
                             <p className="text-xl font-bold">{formValue.full_name}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Transport</p>
                             <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-green-600" />
                                <p className="text-xl font-bold capitalize">{formValue.transport_mode}</p>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Contact</p>
                             <p className="text-xl font-bold">{formValue.phone_number}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 font-medium text-center">By clicking finish, you confirm that all provided information is accurate and you agree to our partner terms.</p>
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

        {/* Cinematic Modal Capture */}
        {showCamera && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-12 animate-in fade-in duration-500">
            <div className="relative max-w-5xl w-full h-full flex flex-col">
              <header className="flex items-center justify-between text-white mb-10 translate-y-0 animate-in slide-in-from-top duration-700">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Biometric Capture</h2>
                  <p className="text-gray-400 text-sm font-medium">Keep your face/document within the indicated frame.</p>
                </div>
                <button onClick={stopCamera} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
                  <X className="h-8 w-8" />
                </button>
              </header>
              
              <div className="flex-1 relative rounded-[60px] overflow-hidden border-8 border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.15)] bg-black animate-in zoom-in duration-1000">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                
                {/* Cinematic Scanner Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[50%] aspect-square md:aspect-video border-2 border-green-500/50 rounded-full md:rounded-[40px] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-3xl" />
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-3xl" />
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-3xl" />
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-3xl" />
                     
                     <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />
                  </div>
                </div>
              </div>

              <footer className="mt-12 flex justify-center animate-in slide-in-from-bottom duration-700">
                 <button onClick={capturePhoto} className="group relative w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center transition-all hover:border-white/30 active:scale-90">
                    <div className="w-20 h-20 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] group-hover:scale-95 transition-transform" />
                    <div className="absolute -inset-4 border-2 border-green-500 rounded-full animate-ping opacity-20" />
                 </button>
              </footer>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .animate-scan {
            animation: scan 3s linear infinite;
          }
        `}</style>
    </>
  );
};
