import { Utensils, Store } from "lucide-react";
import { Plan } from "../../../hooks/usePlans";

interface Step1SelectionProps {
  type: "RESTAURANT" | "SHOP";
  setType: (type: "RESTAURANT" | "SHOP") => void;
  plan: Plan | null;
  cycle: string;
}

export default function Step1Selection({ type, setType, plan, cycle }: Step1SelectionProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Select Business Category</h2>
        <p className="mt-3 text-lg text-gray-500">How should we categorize your enterprise on the platform?</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => setType("RESTAURANT")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${
            type === "RESTAURANT" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
          }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Utensils className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Restaurant</h3>
            <p className="mt-2 text-sm text-gray-500">For food services, cafes, and dining establishments.</p>
          </div>
        </button>

        <button
          onClick={() => setType("SHOP")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${
            type === "SHOP" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
          }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Store className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Shop / Store</h3>
            <p className="mt-2 text-sm text-gray-500">For retail, boutiques, markets, and pharmacies.</p>
          </div>
        </button>
      </div>

      {plan && (
        <div className="rounded-2xl bg-[#022C22] p-8 text-white shadow-xl shadow-[#022C22]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#00A67E]">Selected Plan</p>
              <h4 className="mt-1 text-2xl font-bold">{plan.name}</h4>
              <p className="mt-1 text-emerald-400 font-medium">Billed {cycle}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {(cycle === "monthly" ? plan.price_monthly : plan.price_yearly).toLocaleString()}
              </span>
              <span className="ml-2 font-bold opacity-70">RWF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
