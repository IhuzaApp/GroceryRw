import {
  Calculator,
  Users,
  Smartphone,
  TrendingUp,
  ShoppingCart,
  Truck,
  Wallet,
  ShieldCheck,
  Megaphone,
  Box,
  Settings,
  HeadphonesIcon,
} from "lucide-react";

export default function PosFeaturesSection() {
  const featureCategories = [
    {
      title: "Point of Sale & Operations",
      icon: <ShoppingCart className="h-6 w-6 text-[#00A67E]" />,
      bgColor: "bg-emerald-50",
      features: [
        "Interactive Checkout & Sales Terminal",
        "Detailed Inventory & Product Tracking",
        "Recipe & Production Management for Restaurants",
        "Cost & Profit Margin Analysis",
        "Multi-branch Company & Shop Dashboards",
        "Order Management (Delivery & Pickup)",
      ],
    },
    {
      title: "Tax, Finance & Compliance",
      icon: <Calculator className="h-6 w-6 text-[#00A67E]" />,
      bgColor: "bg-teal-50",
      features: [
        "AI Tax Declaration Assistant",
        "Tax Liability Forecasting & Optimization",
        "System & Shopper Wallet Management",
        "Withdrawal & Refund Claim Handling",
        "Smart Financial Data Import",
        "Detailed Ledger & Transaction Tracking",
      ],
    },
    {
      title: "Procurement & Supply Chain",
      icon: <Truck className="h-6 w-6 text-[#00A67E]" />,
      bgColor: "bg-green-50",
      features: [
        "Supplier Relationship Management",
        "Automated Purchase Orders",
        "Price Quotation Requests & Comparisons",
        "Goods Received Tracking",
        "Procurement Analytics & Reporting",
        "Delivery Radius & Fee Configuration",
      ],
    },
    {
      title: "Marketing & Growth",
      icon: <Megaphone className="h-6 w-6 text-[#00A67E]" />,
      bgColor: "bg-cyan-50",
      features: [
        "Reels for Video Marketing",
        "Influencer Dashboard & Referral Tracking",
        "Platform-wide Discounts & Vouchers",
        "Native Plas App Integration",
        "Targeted Promotions Management",
        "Customer Directory Insights",
      ],
    },
    {
      title: "Management & Architecture",
      icon: <ShieldCheck className="h-6 w-6 text-[#00A67E]" />,
      bgColor: "bg-blue-50",
      features: [
        "Role-Based Access Control (RBAC)",
        "Contextual Multi-level Scoping",
        "Staff & Payroll Management",
        "SaaS Subscription Tiers & Billing",
        "Help Center & Ticketing System",
        "Fleet & Plasas (Shopper) Management",
      ],
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold text-[#1A1A1A] md:text-4xl lg:text-5xl">
            Everything your business needs
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            From ringing up sales to forecasting taxes, our end-to-end
            management ecosystem empowers your shop, restaurant, or enterprise
            to operate at peak efficiency.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureCategories.map((category, index) => (
            <div
              key={index}
              className={`rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                index === 4
                  ? "w-full lg:col-span-2 lg:max-w-3xl lg:justify-self-center"
                  : ""
              }`}
            >
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.bgColor}`}
                >
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {category.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00A67E]/10">
                      <svg
                        className="h-3 w-3 text-[#00A67E]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
