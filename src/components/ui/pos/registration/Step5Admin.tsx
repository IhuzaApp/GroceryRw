import { User, Mail, Phone, Lock, Briefcase } from "lucide-react";

interface Step5AdminProps {
  formData: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function Step5Admin({ formData, onChange }: Step5AdminProps) {
  return (
    <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-right-4">
      <div>
        <h2 className="text-3xl font-bold text-[#1A1A1A]">
          Administrator Details
        </h2>
        <p className="mt-2 text-gray-500">
          Create the primary administrator account for this business.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Admin Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                required
                name="fullnames"
                value={formData.fullnames}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Position / Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                required
                name="position"
                value={formData.position}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="Manager / Owner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Personal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Personal Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                required
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="078..."
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-600">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={onChange}
              className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 text-black outline-none focus:border-[#022C22] focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
