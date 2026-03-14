import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  UploadCloud,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Step2IdentityProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleUpload: (
    file: File | null,
    type: "logo" | "profile" | "rdb_cert"
  ) => Promise<void>;
  uploading: { logo: boolean; profile: boolean; rdb_cert: boolean };
}

export default function Step2Identity({
  formData,
  onChange,
  handleUpload,
  uploading,
}: Step2IdentityProps) {
  return (
    <div className="space-y-8 duration-500 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Business Identity</h2>
        <p className="mt-2 text-gray-500">
          Let&apos;s get the core details of your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">
            Legal Business Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="name"
              value={formData.name}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="e.g. Plas Technologies Ltd"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">TIN Number</label>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="tin"
              value={formData.tin}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">
            Business USSD / SSD Code
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center font-bold text-gray-400">
              *
            </div>
            <input
              name="ussd"
              value={formData.ussd}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="#123#"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600">
            Business Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="0788000000"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-600">
            Business Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
              placeholder="contact@yourbusiness.com"
            />
          </div>
        </div>

        {/* RDB Certificate Upload */}
        <div className="space-y-4 md:col-span-2">
          <label className="text-sm font-bold text-gray-600">
            RDB Certificate (PDF/Image)
          </label>
          <div className="relative flex flex-col gap-4">
            <div
              className={`relative flex min-h-[120px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${formData.rdb_cert_url
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
            >
              {uploading.rdb_cert ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-[#022C22]" />
                  <span className="text-sm font-medium text-gray-500">
                    Uploading certificate...
                  </span>
                </div>
              ) : formData.rdb_cert_url ? (
                <div className="flex flex-col items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-8 w-8" />
                  <span className="text-sm font-bold">
                    Certificate Uploaded
                  </span>
                  <button
                    onClick={() => handleUpload(null, "rdb_cert")}
                    className="text-xs font-bold uppercase underline"
                  >
                    Replace File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-600">
                      Click to upload RDB Certificate
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, JPG or PNG (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) =>
                      handleUpload(e.target.files?.[0] || null, "rdb_cert")
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              )}
            </div>
            {!formData.rdb_cert_url && (
              <div className="relative">
                <input
                  name="rdb_cert"
                  value={formData.rdb_cert}
                  onChange={onChange}
                  className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                  placeholder="Or enter certificate number manually"
                />
              </div>
            )}
          </div>
        </div>
      </div >
    </div >
  );
}
