import { Utensils, Store, ChevronDown } from "lucide-react";
import { Plan } from "../../../hooks/usePlans";
import { Category } from "../../../hooks/useCategories";

interface Step1SelectionProps {
  type: "RESTAURANT" | "SHOP";
  setType: (type: "RESTAURANT" | "SHOP") => void;
  plan: Plan | null;
  cycle: string;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
}

export default function Step1Selection({
  type,
  setType,
  plan,
  cycle,
  categories,
  selectedCategoryId,
  onCategoryChange,
}: Step1SelectionProps) {
  return (
    <div className="duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">
          Select Business Category
        </h2>
        <p className="mt-3 text-lg text-gray-500">
          How should we categorize your enterprise on the platform?
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => setType("RESTAURANT")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${type === "RESTAURANT"
            ? "border-[#022C22] bg-[#022C22]/5"
            : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
            }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Utensils className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Restaurant</h3>
            <p className="mt-2 text-sm text-gray-500">
              For food services, cafes, and dining establishments.
            </p>
          </div>
        </button>

        <button
          onClick={() => setType("SHOP")}
          className={`flex flex-col items-center gap-6 rounded-[2rem] border-4 p-10 transition-all ${type === "SHOP"
            ? "border-[#022C22] bg-[#022C22]/5"
            : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
            }`}
        >
          <div className="rounded-2xl bg-[#022C22]/10 p-5 text-[#022C22]">
            <Store className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A]">Shop / Store</h3>
            <p className="mt-2 text-sm text-gray-500">
              For retail, boutiques, markets, and pharmacies.
            </p>
          </div>
        </button>
      </div>

      {type === "SHOP" && (
        <div className="mb-12 space-y-4 duration-500 animate-in fade-in slide-in-from-top-4">
          <label className="text-sm font-bold text-gray-600">
            Select Shop Category
          </label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-14 w-full appearance-none rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-10 text-black outline-none focus:border-[#022C22] focus:bg-white font-bold"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-400">
            This helps us organize your shop correctly for your customers.
          </p>
        </div>
      )}

      {plan && (
        <div className="rounded-2xl bg-[#022C22] p-8 text-white shadow-xl shadow-[#022C22]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#00A67E]">
                Selected Plan
              </p>
              <h4 className="mt-1 text-2xl font-bold">{plan.name}</h4>
              <p className="mt-1 font-medium text-emerald-400">
                Billed {cycle}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {(cycle === "monthly"
                  ? plan.price_monthly
                  : plan.price_yearly
                ).toLocaleString()}
              </span>
              <span className="ml-2 font-bold opacity-70">RWF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
