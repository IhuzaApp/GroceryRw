import { Camera, Loader2, CheckCircle, UploadCloud } from "lucide-react";
import Image from "next/image";

interface Step3BrandingProps {
  formData: any;
  handleUpload: (file: File | null, type: "logo" | "profile" | "rdb_cert") => Promise<void>;
  uploading: { logo: boolean; profile: boolean; rdb_cert: boolean };
}

export default function Step3Branding({ formData, handleUpload, uploading }: Step3BrandingProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Branding & Visuals</h2>
        <p className="mt-2 text-gray-500">Make your business stand out on the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-600">Business Logo</label>
          <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:bg-gray-100">
            {uploading.logo ? (
              <Loader2 className="h-10 w-10 animate-spin text-[#022C22]" />
            ) : formData.logo ? (
              <>
                <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">Upload Logo</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files?.[0] || null, "logo")}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>

        {/* Profile Image Upload */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-600">Cover / Profile Image</label>
          <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:bg-gray-100">
            {uploading.profile ? (
              <Loader2 className="h-10 w-10 animate-spin text-[#022C22]" />
            ) : formData.profile ? (
              <>
                <Image src={formData.profile} alt="Profile" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">Upload Cover</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files?.[0] || null, "profile")}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
