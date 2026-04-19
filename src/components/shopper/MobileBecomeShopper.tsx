import React from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import {
  useShopperForm,
  steps,
  guarantorRelationshipOptions,
  mutualStatusOptions,
} from "../../hooks/useShopperForm";
import {
  CustomInput,
  FileUploadInput,
  TransportModeSelector,
  SignaturePad,
  AddressAutocomplete,
} from "./ShopperUIComponents";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  PenTool,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Users,
  FileText,
  Check,
  X,
  Shield,
  Wallet,
  Clock,
  Zap,
} from "lucide-react";
import { BiometricCameraModal } from "./BiometricCameraModal";
// @ts-ignore
import { Resend } from "resend";

export const MobileBecomeShopper = () => {
  const { theme } = useTheme();
  const {
    router,
    formValue,
    currentStep,
    errors,
    loading,
    registrationSuccess,
    apiError,
    capturedPhoto,
    capturedLicenseFront,
    capturedLicenseBack,
    capturedPlateNumber,
    capturedNationalIdFront,
    capturedNationalIdBack,
    capturedSignature,
    policeClearanceFile,
    proofOfResidencyFile,
    maritalStatusFile,
    stream,
    showCamera,
    cameraLoading,
    videoRef,
    canvasRef,
    signatureCanvasRef,
    handleInputChange,
    handleLocationSelect,
    startCamera,
    stopCamera,
    capturePhoto,
    nextStep,
    prevStep,
    handleSubmit,
    setPoliceClearanceFile,
    setProofOfResidencyFile,
    setMaritalStatusFile,
    setCapturedSignature,
    faceVerified,
    verificationStatus,
    livenessStep,
    captureMode,
    livenessProgress,
    lowLight,
  } = useShopperForm() as any;

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-black">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Application Sent!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your application to become a Plasa is being reviewed. We'll contact
          you soon.
        </p>
      </div>
    );
  }

  const renderCurrentStep = () => {
    return (
      <div className="flex flex-col">
        {apiError && (
          <div className="mx-6 mt-4 duration-300 animate-in fade-in zoom-in">
            <div
              className={`rounded-2xl border p-4 ${
                theme === "dark"
                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                  : "border-red-100 bg-red-50 text-red-600"
              } flex items-start space-x-3`}
            >
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-black">{apiError.title}</h4>
                <p className="text-[11px] font-medium opacity-90">
                  {apiError.message}
                </p>
              </div>
            </div>
          </div>
        )}
        {(() => {
          switch (currentStep) {
            case 0:
              return (
                <div className="space-y-8 duration-1000 animate-in fade-in">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src="/images/shopper/welcome_hero_v2.png"
                      fill
                      className="object-cover"
                      alt="Welcome to Plasa"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute left-8 top-8">
                      <Image
                        src="/assets/logos/PlasLogoPNG.png"
                        width={120}
                        height={40}
                        alt="Plas Logo"
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        <Zap className="h-3 w-3" />
                        <span>Instant Approval</span>
                      </div>
                      <h2 className="text-4xl font-black leading-[0.9] tracking-tighter text-white">
                        Empowering <br /> Every Journey.
                      </h2>
                      <p className="mt-4 max-w-[240px] text-sm font-medium text-white/70">
                        Join Rwanda's premier delivery community. Drive change
                        and earn with total flexibility.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 px-6">
                    <div
                      className={`rounded-[32px] border p-5 ${
                        theme === "dark"
                          ? "border-white/5 bg-white/5"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-2xl bg-green-500/10 p-3 text-green-500">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-black">
                            Flexible Schedule
                          </h4>
                          <p className="text-xs font-medium text-gray-500">
                            Work on your own terms.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-[32px] border p-5 ${
                        theme === "dark"
                          ? "border-white/5 bg-white/5"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-black">
                            Weekly Payouts
                          </h4>
                          <p className="text-xs font-medium text-gray-500">
                            Get paid every single week.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-10">
                    <div
                      className={`rounded-[32px] border-2 border-dashed p-6 ${
                        theme === "dark" ? "border-white/10" : "border-gray-200"
                      }`}
                    >
                      <h4 className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Identity Requirements
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "Valid ID",
                          "Smartphone",
                          "18+ Years",
                          "Reliable Transport",
                        ].map((item) => (
                          <span
                            key={item}
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                              theme === "dark"
                                ? "bg-white/5 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
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
                <div className="space-y-6 px-6 duration-500 animate-in fade-in slide-in-from-right">
                  <CustomInput
                    label="First Name"
                    name="first_name"
                    value={formValue.first_name}
                    onChange={handleInputChange}
                    error={errors.first_name}
                    required
                    placeholder="Legal first name"
                  />
                  <CustomInput
                    label="Last Name / Surname"
                    name="last_name"
                    value={formValue.last_name}
                    onChange={handleInputChange}
                    error={errors.last_name}
                    required
                    placeholder="Surname"
                  />
                  <CustomInput
                    label="National ID Number"
                    name="national_id"
                    value={formValue.national_id}
                    onChange={handleInputChange}
                    error={errors.national_id}
                    required
                    placeholder="16-digit ID number"
                  />
                  <CustomInput
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formValue.dob}
                    onChange={handleInputChange}
                    error={errors.dob}
                    required
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                  <TransportModeSelector
                    value={formValue.transport_mode}
                    onChange={handleInputChange}
                    error={errors.transport_mode}
                  />

                  <div
                    className={`rounded-[32px] border-2 border-dashed p-6 transition-all ${
                      faceVerified
                        ? "border-green-500 bg-green-500/5"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="mb-4 flex items-center space-x-3">
                      <Shield
                        className={`h-5 w-5 ${
                          faceVerified ? "text-green-500" : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-bold">
                        Face Verification
                      </span>
                    </div>
                    <button
                      onClick={() => startCamera("profile")}
                      disabled={
                        faceVerified ||
                        !formValue.first_name ||
                        !formValue.last_name ||
                        !formValue.national_id ||
                        !formValue.dob
                      }
                      className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
                        faceVerified
                          ? "bg-green-500/10 text-green-500"
                          : "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      }`}
                    >
                      {faceVerified
                        ? "Face Verified"
                        : "Verify Face (Liveness)"}
                    </button>
                  </div>
                </div>
              );
            case 2:
              return (
                <div className="space-y-6 px-6 duration-500 animate-in fade-in slide-in-from-right">
                  <CustomInput
                    label="Verified Phone Number"
                    name="phone_number"
                    value={formValue.phone_number}
                    onChange={handleInputChange}
                    error={errors.phone_number}
                    required
                    placeholder="e.g. 078XXXXXXX"
                  />
                  <CustomInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formValue.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                    placeholder="name@example.com"
                  />
                </div>
              );
            case 3:
              return (
                <div className="space-y-6 px-6 duration-500 animate-in fade-in slide-in-from-right">
                  <AddressAutocomplete
                    label="Physical Address"
                    value={formValue.address}
                    onSelect={handleLocationSelect}
                    error={errors.address}
                    required
                  />
                  <CustomInput
                    label="Marital Status"
                    name="mutual_status"
                    type="select"
                    options={mutualStatusOptions}
                    value={formValue.mutual_status}
                    onChange={handleInputChange}
                  />
                </div>
              );
            case 4:
              return (
                <div className="space-y-6 px-6 duration-500 animate-in fade-in slide-in-from-right">
                  <CustomInput
                    label="Guarantor Name"
                    name="guarantor"
                    value={formValue.guarantor}
                    onChange={handleInputChange}
                    placeholder="Name of someone who knows you"
                  />
                  <CustomInput
                    label="Guarantor Phone"
                    name="guarantorPhone"
                    value={formValue.guarantorPhone}
                    onChange={handleInputChange}
                    placeholder="Their phone number"
                  />
                  <CustomInput
                    label="Relationship"
                    name="guarantorRelationship"
                    type="select"
                    options={guarantorRelationshipOptions}
                    value={formValue.guarantorRelationship}
                    onChange={handleInputChange}
                  />
                </div>
              );
            case 5:
              return (
                <div className="space-y-8 px-6 duration-500 animate-in fade-in slide-in-from-right">
                  <div className="space-y-4">
                    <label className="text-sm font-bold dark:text-gray-300">
                      Identity Photos
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => startCamera("profile_photo")}
                        className={`relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                          capturedPhoto
                            ? "border-green-500 bg-green-500/5"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        {capturedPhoto ? (
                          <Image
                            src={capturedPhoto}
                            fill
                            className="object-cover"
                            alt="Profile"
                          />
                        ) : (
                          <>
                            <Camera className="mb-2 h-6 w-6 text-gray-400" />
                            <span className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Selfie Photo
                            </span>
                          </>
                        )}
                      </button>
                      <div className="grid h-48 grid-rows-2 gap-4">
                        <button
                          onClick={() => startCamera("national_id_front")}
                          className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
                            capturedNationalIdFront
                              ? "border-green-500 bg-green-500/5"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          {capturedNationalIdFront ? (
                            <Image
                              src={capturedNationalIdFront}
                              fill
                              className="object-cover"
                              alt="ID Front"
                            />
                          ) : (
                            <>
                              <Camera className="mb-1 h-4 w-4 text-gray-400" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                ID Front
                              </span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => startCamera("national_id_back")}
                          className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
                            capturedNationalIdBack
                              ? "border-green-500 bg-green-500/5"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          {capturedNationalIdBack ? (
                            <Image
                              src={capturedNationalIdBack}
                              fill
                              className="object-cover"
                              alt="ID Back"
                            />
                          ) : (
                            <>
                              <Camera className="mb-1 h-4 w-4 text-gray-400" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                ID Back
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {(formValue.transport_mode === "car" ||
                    formValue.transport_mode === "motorcycle") && (
                    <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-white/5">
                      <label className="text-sm font-bold dark:text-gray-300">
                        Vehicle Documents
                      </label>
                      <div className="space-y-4">
                        <div className="w-full">
                          <button
                            onClick={() => startCamera("plate_number")}
                            className={`relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
                              capturedPlateNumber
                                ? "border-green-500 bg-green-500/5"
                                : "border-gray-200 dark:border-gray-800"
                            }`}
                          >
                            {capturedPlateNumber ? (
                              <Image
                                src={capturedPlateNumber}
                                fill
                                className="object-cover"
                                alt="Plate Number"
                              />
                            ) : (
                              <>
                                <Camera className="mb-1 h-5 w-5 text-gray-400" />
                                <span className="mt-1 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                  Vehicle Plate
                                  <br />
                                  Number
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => startCamera("license_front")}
                            className={`relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
                              capturedLicenseFront
                                ? "border-green-500 bg-green-500/5"
                                : "border-gray-200 dark:border-gray-800"
                            }`}
                          >
                            {capturedLicenseFront ? (
                              <Image
                                src={capturedLicenseFront}
                                fill
                                className="object-cover"
                                alt="License Front"
                              />
                            ) : (
                              <>
                                <Camera className="mb-1 h-5 w-5 text-gray-400" />
                                <span className="mt-1 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                  Driving License
                                  <br />
                                  Front
                                </span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => startCamera("license_back")}
                            className={`relative flex h-32 flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition-all ${
                              capturedLicenseBack
                                ? "border-green-500 bg-green-500/5"
                                : "border-gray-200 dark:border-gray-800"
                            }`}
                          >
                            {capturedLicenseBack ? (
                              <Image
                                src={capturedLicenseBack}
                                fill
                                className="object-cover"
                                alt="License Back"
                              />
                            ) : (
                              <>
                                <Camera className="mb-1 h-5 w-5 text-gray-400" />
                                <span className="mt-1 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                  Driving License
                                  <br />
                                  Back
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-sm font-bold dark:text-gray-300">
                      Official Certificates
                    </label>
                    <FileUploadInput
                      name="police_clearance"
                      label="Police Clearance *"
                      file={policeClearanceFile}
                      onChange={(e: any) =>
                        setPoliceClearanceFile(e.target.files[0])
                      }
                      onRemove={() => setPoliceClearanceFile(null)}
                      description="Certificate from Irembo site (required)"
                    />
                    <FileUploadInput
                      name="proof_of_residency"
                      label="Proof of Residency"
                      file={proofOfResidencyFile}
                      onChange={(e: any) =>
                        setProofOfResidencyFile(e.target.files[0])
                      }
                      onRemove={() => setProofOfResidencyFile(null)}
                      description="Utility bill, lease, or official letter"
                    />
                    <FileUploadInput
                      name="marital_status_cert"
                      label="Marital Status Certificate"
                      file={maritalStatusFile}
                      onChange={(e: any) =>
                        setMaritalStatusFile(e.target.files[0])
                      }
                      onRemove={() => setMaritalStatusFile(null)}
                      description="Official marital status document"
                    />
                  </div>
                </div>
              );
            case 6:
              return (
                <div className="space-y-8 px-6 pb-10 duration-500 animate-in fade-in slide-in-from-right">
                  <div
                    className={`space-y-6 rounded-[24px] p-6 ${
                      theme === "dark" ? "bg-[#111]" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Full Name
                      </p>
                      <p className="text-sm font-bold">
                        {formValue.first_name} {formValue.last_name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Transport
                      </p>
                      <p className="text-sm font-bold capitalize">
                        {formValue.transport_mode}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Phone
                      </p>
                      <p className="text-sm font-bold">
                        {formValue.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      Captured Photos
                    </p>
                    <div className="flex items-center space-x-3 overflow-x-auto pb-4">
                      {[
                        { label: "Profile", src: capturedPhoto },
                        { label: "ID Front", src: capturedNationalIdFront },
                        { label: "ID Back", src: capturedNationalIdBack },
                        formValue.transport_mode === "car" ||
                        formValue.transport_mode === "motorcycle"
                          ? { label: "License", src: capturedLicenseFront }
                          : null,
                      ]
                        .filter(Boolean)
                        .map((doc: any, idx) => (
                          <div
                            key={idx}
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-green-500"
                          >
                            <Image
                              src={doc.src}
                              fill
                              className="object-cover"
                              alt={doc.label}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="backgroundCheckMobile"
                        checked={formValue.agreedToBackgroundCheck || false}
                        onChange={(e) =>
                          handleInputChange(
                            "agreedToBackgroundCheck",
                            e.target.checked
                          )
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label
                        htmlFor="backgroundCheckMobile"
                        className="text-xs leading-relaxed text-gray-500 dark:text-gray-400"
                      >
                        I agree to a background check and certify that the
                        information I have provided is accurate and true.
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                        Digital Signature
                      </label>
                      <SignaturePad
                        onSign={setCapturedSignature}
                        error={errors.signature}
                      />
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-screen flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Premium Header */}
      <header
        className={`sticky top-0 z-[10000] flex flex-col px-5 pb-5 pt-8 ${
          theme === "dark" ? "bg-black/80" : "bg-white/80"
        } border-b border-gray-100 backdrop-blur-3xl transition-all duration-500 dark:border-white/5`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className={`rounded-xl p-2 transition-all active:scale-90 ${
                  theme === "dark"
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="rounded-xl bg-green-500/10 p-2">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-black leading-none tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/Myprofile")}
            className={`rounded-xl p-2 transition-all active:scale-90 ${
              theme === "dark"
                ? "bg-white/5 hover:bg-white/10"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            title="Cancel Application"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sleek Progress Bar */}
        <div className="flex h-1 w-full space-x-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 rounded-full transition-all duration-700 ease-out ${
                i <= currentStep
                  ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 pb-40">{renderCurrentStep()}</main>

      {/* Persistent Bottom CTA */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-[10001] px-5 py-5 pb-8 ${
          theme === "dark" ? "bg-black/90" : "bg-white/90"
        } border-t border-gray-50 backdrop-blur-2xl transition-all duration-500 dark:border-white/5`}
      >
        <button
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={loading}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-green-600 py-4 pl-6 pr-3 font-black text-white shadow-xl shadow-green-600/20 transition-all duration-300 hover:bg-green-700 active:scale-95"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/5 to-white/0 transition-transform duration-1000 group-hover:translate-x-full" />

          <span className="relative z-10 text-base">
            {loading
              ? "Processing..."
              : currentStep === steps.length - 1
              ? "Submit Application"
              : currentStep === 0
              ? "Start Onboarding"
              : "Next Step"}
          </span>

          <div className="relative z-10 rounded-xl bg-white/20 p-2.5 transition-transform group-hover:scale-110">
            {currentStep === steps.length - 1 ? (
              <Check className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
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
