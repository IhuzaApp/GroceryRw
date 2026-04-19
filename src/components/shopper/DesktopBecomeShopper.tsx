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
  HorizontalStepper,
  TransportModeSelector,
  SignaturePad,
  AddressAutocomplete,
} from "./ShopperUIComponents";
import {
  CheckCircle2,
  LayoutDashboard,
  MapPin,
  Truck,
  ChevronRight,
  ChevronLeft,
  Shield,
  Clock,
  Wallet,
  X,
  Camera,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { BiometricCameraModal } from "./BiometricCameraModal";
// @ts-ignore
import { Resend } from "resend";

export const DesktopBecomeShopper = () => {
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
    videoRef,
    canvasRef,
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
      <div className="flex min-h-[90vh] items-center justify-center bg-gradient-to-b from-transparent to-green-500/5 p-6">
        <div
          className={`w-full max-w-xl rounded-[48px] p-16 text-center shadow-2xl duration-700 animate-in zoom-in ${
            theme === "dark"
              ? "border border-gray-900 bg-[#0a0a0a] shadow-black"
              : "border border-gray-100 bg-white shadow-gray-200/50"
          }`}
        >
          <div className="relative mb-10">
            <div className="absolute inset-0 animate-pulse bg-green-500 opacity-20 blur-3xl" />
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/40">
              <CheckCircle2 className="h-14 w-14" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight">
            Application Sent!
          </h1>
          <p className="mb-10 text-lg font-medium leading-relaxed text-gray-500">
            We've received your application. Our team will verify your identity
            documents within 48 hours. Welcome to the Plasa family!
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="group relative overflow-hidden rounded-2xl bg-green-600 px-12 py-4 font-black text-white shadow-xl shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center">
              Back to Home{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen px-8 py-20 md:pl-32 md:pr-12 ${
          theme === "dark"
            ? "bg-[#000] text-white"
            : "bg-[#fafafa] text-gray-900"
        }`}
      >
        <div className="mx-auto max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* New Centered Header */}
          <header className="relative mb-16 text-center">
            <button
              onClick={() => router.push("/Myprofile")}
              className={`absolute right-0 top-0 rounded-3xl p-4 transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Cancel Application"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
            <div className="mb-8 flex justify-center">
              <Image
                src="/assets/logos/PlasLogoPNG.png"
                width={160}
                height={60}
                alt="Plas Logo"
                className="object-contain"
              />
            </div>
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-green-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-green-600">
              <Shield className="h-3 w-3" />
              <span>Secure Plasa Onboarding</span>
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tighter">
              Start Earning as a Plasa
            </h1>
            <p className="mx-auto max-w-xl text-lg font-medium text-gray-500">
              Fill out the form below to join Rwanda's premium delivery network.
              Your security is our priority.
            </p>
          </header>

          {/* New Horizontal Stepper Component */}
          <HorizontalStepper
            steps={steps}
            currentStep={currentStep}
            theme={theme}
          />

          {/* Main Focused Card */}
          <div
            className={`relative mt-20 rounded-[48px] p-12 shadow-2xl transition-all duration-500 md:p-16 ${
              theme === "dark"
                ? "border border-gray-900 bg-[#0a0a0a] shadow-black/80"
                : "border border-gray-100 bg-white shadow-gray-200/40"
            }`}
          >
            {/* Section Indicator */}
            <div className="mb-10 flex items-center space-x-3 opacity-60">
              <div className="h-[2px] w-8 bg-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {steps[currentStep].title}
              </span>
            </div>

            {apiError && (
              <div className="mb-10 duration-300 animate-in fade-in zoom-in">
                <div className="flex items-start space-x-4 rounded-[32px] border border-red-100 bg-red-50 p-6 text-red-600">
                  <span className="mt-1 text-2xl">⚠️</span>
                  <div>
                    <h4 className="text-lg font-black">{apiError.title}</h4>
                    <p className="text-sm font-medium opacity-90">
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
                    <div className="col-span-full space-y-12 duration-1000 animate-in fade-in slide-in-from-bottom-4">
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
                          <h2 className="mb-4 text-5xl font-black tracking-tighter text-white">
                            Empowering <br /> Every Journey.
                          </h2>
                          <p className="max-w-2xl text-xl font-medium text-white/80">
                            Join Rwanda's premier delivery community. Drive
                            change, earn with flexibility, and lead the future
                            of local commerce.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                          {
                            icon: <Clock className="h-8 w-8" />,
                            title: "Total Flexibility",
                            desc: "Choose your own hours and areas. Work as much or as little as you like.",
                          },
                          {
                            icon: <Wallet className="h-8 w-8" />,
                            title: "Instant Payouts",
                            desc: "No waiting for month-end. Get your earnings settled directly and quickly.",
                          },
                          {
                            icon: <ShieldCheck className="h-8 w-8" />,
                            title: "Full Protection",
                            desc: "Safety first with real-time support and insurance for every trip.",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`rounded-[40px] border p-8 transition-all hover:scale-105 ${
                              theme === "dark"
                                ? "border-white/5 bg-white/5"
                                : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="mb-6 inline-block rounded-2xl bg-green-500/10 p-4 text-green-500">
                              {item.icon}
                            </div>
                            <h4 className="mb-2 text-lg font-black">
                              {item.title}
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-500">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case 1:
                  return (
                    <div className="grid grid-cols-1 gap-x-12 gap-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput
                          label="First Name"
                          name="first_name"
                          value={formValue.first_name}
                          onChange={handleInputChange}
                          error={errors.first_name}
                          required
                          placeholder="Legal first name"
                        />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput
                          label="Last Name / Surname"
                          name="last_name"
                          value={formValue.last_name}
                          onChange={handleInputChange}
                          error={errors.last_name}
                          required
                          placeholder="Surname"
                        />
                      </div>
                      <div className="col-span-full md:col-span-1">
                        <CustomInput
                          label="National ID / Passport"
                          name="national_id"
                          value={formValue.national_id}
                          onChange={handleInputChange}
                          error={errors.national_id}
                          required
                          placeholder="Enter number"
                        />
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
                          max={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() - 18
                              )
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                        />
                      </div>
                      <div className="col-span-full">
                        <TransportModeSelector
                          value={formValue.transport_mode}
                          onChange={handleInputChange}
                          error={errors.transport_mode}
                        />
                      </div>

                      <div className="col-span-full">
                        <div
                          className={`rounded-[32px] border-2 border-dashed p-8 transition-all ${
                            faceVerified
                              ? "border-green-500 bg-green-500/5"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`rounded-2xl p-4 ${
                                  faceVerified
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-400 dark:bg-white/5"
                                }`}
                              >
                                <ShieldCheck className="h-8 w-8" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black">
                                  Face Verification
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Fast biometric liveness security check
                                </p>
                              </div>
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
                              className={`rounded-2xl px-8 py-4 font-black transition-all active:scale-95 disabled:opacity-50 ${
                                faceVerified
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-700"
                              }`}
                            >
                              {faceVerified
                                ? "Face Verified Successfully"
                                : "Verify Face (Liveness)"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                case 2:
                  return (
                    <div className="grid grid-cols-1 gap-x-12 gap-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4 md:grid-cols-2">
                      <div className="col-span-full md:col-span-1">
                        <CustomInput
                          label="Verified Phone Number"
                          name="phone_number"
                          value={formValue.phone_number}
                          onChange={handleInputChange}
                          error={errors.phone_number}
                          required
                          placeholder="e.g. 078XXXXXXX"
                        />
                      </div>
                      <div className="col-span-full md:col-span-1">
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
                    </div>
                  );
                case 3:
                  return (
                    <div className="grid grid-cols-1 gap-x-12 gap-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4 md:grid-cols-2">
                      <div className="col-span-full">
                        <AddressAutocomplete
                          label="Residential Address"
                          value={formValue.address}
                          onSelect={handleLocationSelect}
                          error={errors.address}
                          required
                        />
                      </div>
                      <div className="col-span-full md:col-span-1 lg:col-span-1">
                        <CustomInput
                          label="Marital Status"
                          name="mutual_status"
                          type="select"
                          options={mutualStatusOptions}
                          value={formValue.mutual_status}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  );
                case 4:
                  return (
                    <div className="grid grid-cols-1 gap-x-12 gap-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="col-span-full lg:col-span-1">
                        <CustomInput
                          label="Guarantor Full Name"
                          name="guarantor"
                          value={formValue.guarantor}
                          onChange={handleInputChange}
                          placeholder="Name"
                        />
                      </div>
                      <div className="col-span-full lg:col-span-1">
                        <CustomInput
                          label="Guarantor Contact"
                          name="guarantorPhone"
                          value={formValue.guarantorPhone}
                          onChange={handleInputChange}
                          placeholder="Phone"
                        />
                      </div>
                      <div className="col-span-full lg:col-span-1">
                        <CustomInput
                          label="Relationship"
                          name="guarantorRelationship"
                          type="select"
                          options={guarantorRelationshipOptions}
                          value={formValue.guarantorRelationship}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  );
                case 5:
                  return (
                    <div className="col-span-full space-y-12 duration-700 animate-in fade-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                          <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Live Profile Capture
                          </label>
                          <button
                            onClick={() => startCamera("profile_photo")}
                            className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                              capturedPhoto
                                ? "border-green-500"
                                : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                <div className="mb-3 rounded-full bg-gray-50 p-5 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                  <Camera className="h-8 w-8 text-green-600" />
                                </div>
                                <span className="text-sm font-bold">
                                  Take Profile Photo
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            National ID Documents
                          </label>
                          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <button
                              onClick={() => startCamera("national_id_front")}
                              className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                                capturedNationalIdFront
                                  ? "border-green-500"
                                  : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                  <div className="mb-2 rounded-full bg-gray-50 p-4 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                    <Camera className="h-6 w-6 text-green-600" />
                                  </div>
                                  <span className="text-xs font-bold">
                                    ID Front Photo
                                  </span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => startCamera("national_id_back")}
                              className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                                capturedNationalIdBack
                                  ? "border-green-500"
                                  : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                  <div className="mb-2 rounded-full bg-gray-50 p-4 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                    <Camera className="h-6 w-6 text-green-600" />
                                  </div>
                                  <span className="text-xs font-bold">
                                    ID Back Photo
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {(formValue.transport_mode === "car" ||
                        formValue.transport_mode === "motorcycle") && (
                        <div className="space-y-4 border-t border-gray-100 pt-6 dark:border-white/5">
                          <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Vehicle Documents
                          </label>
                          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="col-span-3 grid grid-cols-1 gap-8 md:grid-cols-3">
                              <button
                                onClick={() => startCamera("plate_number")}
                                className={`group relative flex aspect-[5/2] w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                                  capturedPlateNumber
                                    ? "border-green-500"
                                    : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                    <div className="mb-2 rounded-full bg-gray-50 p-4 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                      <Camera className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-center text-xs font-bold">
                                      Vehicle Plate
                                      <br />
                                      Number
                                    </span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => startCamera("license_front")}
                                className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                                  capturedLicenseFront
                                    ? "border-green-500"
                                    : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                    <div className="mb-2 rounded-full bg-gray-50 p-4 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                      <Camera className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-center text-xs font-bold">
                                      Driving License
                                      <br />
                                      Front
                                    </span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => startCamera("license_back")}
                                className={`group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed transition-all ${
                                  capturedLicenseBack
                                    ? "border-green-500"
                                    : "border-gray-200 hover:border-green-500/50 dark:border-gray-800"
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
                                    <div className="mb-2 rounded-full bg-gray-50 p-4 transition-transform group-hover:scale-110 dark:bg-gray-900">
                                      <Camera className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-center text-xs font-bold">
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

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <FileUploadInput
                          name="police_clearance"
                          label="Police Clearance Certificate *"
                          file={policeClearanceFile}
                          onChange={(e: any) =>
                            setPoliceClearanceFile(e.target.files[0])
                          }
                          onRemove={() => setPoliceClearanceFile(null)}
                          description="Upload certificate from Irembo site (required)"
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
                    <div className="col-span-full space-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4">
                      <div
                        className={`grid grid-cols-1 gap-6 rounded-[32px] p-8 md:grid-cols-2 lg:grid-cols-4 ${
                          theme === "dark" ? "bg-[#111]/50" : "bg-gray-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Full Name
                          </p>
                          <p className="text-lg font-bold">
                            {formValue.first_name} {formValue.last_name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Transport
                          </p>
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <p className="text-lg font-bold capitalize">
                              {formValue.transport_mode}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Phone
                          </p>
                          <p className="text-lg font-bold">
                            {formValue.phone_number}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Address
                          </p>
                          <p className="truncate text-lg font-bold">
                            {formValue.address}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                          Captured Documents
                        </p>
                        <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                          {[
                            { label: "Profile", src: capturedPhoto },
                            { label: "ID Front", src: capturedNationalIdFront },
                            { label: "ID Back", src: capturedNationalIdBack },
                            formValue.transport_mode === "car" ||
                            formValue.transport_mode === "motorcycle"
                              ? { label: "License", src: capturedLicenseFront }
                              : null,
                            formValue.transport_mode === "car" ||
                            formValue.transport_mode === "motorcycle"
                              ? { label: "Plate", src: capturedPlateNumber }
                              : null,
                          ]
                            .filter(Boolean)
                            .map((doc: any, idx) => (
                              <div
                                key={idx}
                                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-green-500 md:h-20 md:w-20"
                              >
                                <Image
                                  src={doc.src}
                                  fill
                                  className="object-cover"
                                  alt={doc.label}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-8 border-t border-gray-100 pt-8 dark:border-white/5">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            id="backgroundCheck"
                            checked={formValue.agreedToBackgroundCheck || false}
                            onChange={(e) =>
                              handleInputChange(
                                "agreedToBackgroundCheck",
                                e.target.checked
                              )
                            }
                            className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <label
                            htmlFor="backgroundCheck"
                            className="cursor-pointer text-sm leading-relaxed text-gray-500 dark:text-gray-400"
                          >
                            I agree to a background check and certify that the
                            information I have provided is accurate and true. I
                            authorize Plasa to verify my details including
                            criminal records and driving history if applicable.
                          </label>
                        </div>

                        <div className="max-w-xl space-y-4">
                          <label className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
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

          {/* Action Footer */}
          <footer className="mt-20 flex items-center justify-between border-t border-gray-100 pt-12 dark:border-gray-900">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`group flex items-center space-x-2 rounded-2xl px-8 py-4 font-black transition-all ${
                currentStep === 0
                  ? "opacity-0"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>Previous</span>
            </button>

            <button
              onClick={
                currentStep === steps.length - 1 ? handleSubmit : nextStep
              }
              disabled={loading}
              className="group relative flex items-center space-x-3 rounded-3xl bg-green-600 px-12 py-5 font-black text-white shadow-2xl shadow-green-600/30 transition-all hover:bg-green-700 active:scale-95"
            >
              {loading ? (
                <div className="border-3 h-6 w-6 animate-spin rounded-full border-white border-t-transparent" />
              ) : (
                <>
                  <span className="text-lg">
                    {currentStep === steps.length - 1
                      ? "Finish Registration"
                      : "Next Step"}
                  </span>
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
