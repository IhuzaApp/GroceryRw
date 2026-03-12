import { useState } from "react";
import { Check, Info, Loader2 } from "lucide-react";
import { usePlans, Plan, Module } from "../../../hooks/usePlans";

export default function PosPricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { plans, isLoading, isError } = usePlans();

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#00A67E]" />
        <p className="font-medium text-gray-500">
          Loading subscription plans...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 bg-gray-50 p-4">
        <div className="rounded-full bg-red-100 p-3">
          <Info className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-xl font-bold text-gray-800">Unable to load plans</p>
        <p className="max-w-md text-center text-gray-500">
          There was a problem fetching the subscription data. Please check your
          connection or contact support.
        </p>
      </div>
    );
  }

  return (
    <section id="pos-pricing" className="bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-[#00A67E]/10 px-4 py-1.5 text-sm font-bold text-[#00A67E]">
            Pricing Plans
          </div>
          <h2 className="mb-6 text-4xl font-bold text-[#1A1A1A] md:text-5xl lg:text-6xl">
            Choose subscription plan
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Transparent pricing designed to scale with your business growth. No
            hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`text-lg font-bold transition-colors ${
                billingCycle === "monthly" ? "text-[#1A1A1A]" : "text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative h-9 w-16 rounded-full bg-gray-200 transition-all hover:bg-gray-300 focus:outline-none"
            >
              <div
                className={`absolute top-1.5 h-6 w-6 rounded-full bg-[#00A67E] shadow-sm transition-all ${
                  billingCycle === "yearly" ? "left-8.5" : "left-1.5"
                }`}
                style={{
                  left:
                    billingCycle === "yearly"
                      ? "calc(100% - 1.875rem)"
                      : "0.375rem",
                }}
              ></div>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`text-lg font-bold transition-colors ${
                  billingCycle === "yearly" ? "text-[#1A1A1A]" : "text-gray-400"
                }`}
              >
                Yearly
              </button>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#00A67E]">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan: Plan) => {
            const price =
              billingCycle === "monthly"
                ? plan.price_monthly
                : plan.price_yearly;
            const isPremium =
              plan.name.toLowerCase().includes("premium") ||
              plan.name.toLowerCase().includes("pro");

            return (
              <div
                key={plan.id}
                className={`relative flex w-full max-w-sm flex-col rounded-[2.5rem] border ${
                  isPremium
                    ? "border-[#022C22] ring-4 ring-[#022C22]/5"
                    : "border-gray-100"
                } bg-white p-10 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#022C22] px-4 py-1 text-xs font-bold text-[#1A1A1A]">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">
                    {plan.name}
                  </h3>
                  <p className="mt-3 font-medium leading-relaxed text-gray-500">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1A1A1A]">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-gray-400">RWF</span>
                    <span className="ml-1 font-bold text-gray-400">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </div>

                <div className="mb-10 flex-grow">
                  <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    Includes
                  </p>
                  <ul className="space-y-5">
                    <li className="flex items-center gap-4">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00A67E]/10">
                        <Check
                          className="h-3.5 w-3.5 text-[#00A67E]"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">
                        {plan.ai_request_limit === -1
                          ? "Unlimited"
                          : plan.ai_request_limit}{" "}
                        AI Requests
                      </span>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00A67E]/10">
                        <Check
                          className="h-3.5 w-3.5 text-[#00A67E]"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">
                        {plan.reel_limit === -1 ? "Unlimited" : plan.reel_limit}{" "}
                        Reel Uploads
                      </span>
                    </li>
                    {plan.modules.slice(0, 6).map((module: Module) => (
                      <li key={module.id} className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00A67E]/10">
                          <Check
                            className="h-3.5 w-3.5 text-[#00A67E]"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="font-semibold leading-tight text-[#1A1A1A]">
                          {module.name}
                        </span>
                      </li>
                    ))}
                    {plan.modules.length > 6 && (
                      <li className="flex items-center gap-4 pl-10">
                        <span className="text-sm font-bold text-gray-400">
                          + {plan.modules.length - 6} more features
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    const registerSection =
                      document.getElementById("pos-register");
                    if (registerSection) {
                      registerSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`mt-4 block w-full rounded-2xl ${
                    isPremium
                      ? "bg-[#1A1A1A] text-white hover:bg-black"
                      : "bg-[#022C22] text-[#1A1A1A] hover:bg-[#00c596]"
                  } transform py-5 text-center font-bold shadow-lg transition-all duration-300 active:scale-95`}
                >
                  Choose {plan.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
