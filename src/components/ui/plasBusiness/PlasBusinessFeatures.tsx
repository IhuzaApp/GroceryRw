import {
  Store,
  BarChart3,
  Package,
  Globe2,
  Zap,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Globe2 className="h-8 w-8" />,
    title: "Large Audience Reach",
    description:
      "Instantly connect with thousands of active customers in your region looking for products like yours.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: <Package className="h-8 w-8" />,
    title: "Inventory Management",
    description:
      "Powerful tools to track your stock, manage variations, and receive low-inventory alerts automatically.",
    color: "bg-emerald-50 text-[#00A67E] border-emerald-100",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Real-time Analytics",
    description:
      "Understand your sales trends, customer behavior, and popular items with our detailed dashboard.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    icon: <Store className="h-8 w-8" />,
    title: "Custom Digital Store",
    description:
      "Create a beautiful, mobile-optimized online presence for your business in just a few clicks.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Instant Setup",
    description:
      "Start selling today. Our streamlined onboarding process gets you up and running without technical hassle.",
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Secure Payments",
    description:
      "Robust and secure payment processing options that build trust with your customers and ensure payout safety.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];

export default function PlasBusinessFeatures() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-[#1A1A1A] md:text-5xl">
            Everything you need to <span className="text-[#00A67E]">Scale</span>
          </h2>
          <p className="text-xl leading-relaxed text-gray-500">
            Plas Business provides a comprehensive suite of enterprise-grade
            tools designed to simplify your operations and maximize your growth.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-[40px] border border-gray-100 bg-white p-10 transition-all duration-500 hover:border-[#022C22] hover:shadow-[0_20px_60px_-15px_rgba(0,217,165,0.15)]"
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border transition-transform duration-500 group-hover:scale-110 ${feature.color}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-4 text-2xl font-bold text-[#1A1A1A] transition-colors group-hover:text-[#00A67E]">
                {feature.title}
              </h3>
              <p className="text-lg leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
