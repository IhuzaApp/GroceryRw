import { Building2, Utensils, Store, MapPin, User, CreditCard, ShieldCheck } from "lucide-react";

interface Step6ReviewProps {
  formData: any;
  type: string;
  plan: any;
  cycle: string;
}

export default function Step6Review({ formData, type, plan, cycle }: Step6ReviewProps) {
  const SummaryItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-6 transition-all hover:bg-emerald-50/50">
      <div className="rounded-xl bg-white p-3 shadow-sm text-[#022C22]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-lg font-bold text-[#1A1A1A]">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Final Review</h2>
        <p className="mt-2 text-gray-500">Please confirm all information is accurate before finalizing.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SummaryItem label="Business Name" value={formData.name} icon={Building2} />
        <SummaryItem label="Business Type" value={type} icon={type === "RESTAURANT" ? Utensils : Store} />
        <SummaryItem label="TIN / SSD" value={`${formData.tin} / ${formData.ussd}`} icon={ShieldCheck} />
        <SummaryItem label="Location" value={formData.address} icon={MapPin} />
        <SummaryItem label="Admin User" value={formData.fullnames} icon={User} />
        <SummaryItem label="Subscription" value={`${plan?.name} (${cycle})`} icon={CreditCard} />
      </div>

      <div className="rounded-2xl border-2 border-[#022C22]/10 bg-emerald-50/30 p-8">
        <div className="flex items-center gap-4">
          <Info className="h-6 w-6 text-[#022C22]" />
          <p className="text-sm font-medium text-gray-600">
            By clicking confirm, you agree to setup {formData.name} on the Plas ecosystem. An invoice for the first billing period will be generated automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
