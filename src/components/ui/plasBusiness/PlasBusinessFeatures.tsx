import { Store, BarChart3, Package, Globe2, Zap, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: <Globe2 className="h-8 w-8" />,
        title: "Large Audience Reach",
        description: "Instantly connect with thousands of active customers in your region looking for products like yours.",
        color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
        icon: <Package className="h-8 w-8" />,
        title: "Inventory Management",
        description: "Powerful tools to track your stock, manage variations, and receive low-inventory alerts automatically.",
        color: "bg-emerald-50 text-[#00A67E] border-emerald-100",
    },
    {
        icon: <BarChart3 className="h-8 w-8" />,
        title: "Real-time Analytics",
        description: "Understand your sales trends, customer behavior, and popular items with our detailed dashboard.",
        color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
        icon: <Store className="h-8 w-8" />,
        title: "Custom Digital Store",
        description: "Create a beautiful, mobile-optimized online presence for your business in just a few clicks.",
        color: "bg-orange-50 text-orange-600 border-orange-100",
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: "Instant Setup",
        description: "Start selling today. Our streamlined onboarding process gets you up and running without technical hassle.",
        color: "bg-pink-50 text-pink-600 border-pink-100",
    },
    {
        icon: <ShieldCheck className="h-8 w-8" />,
        title: "Secure Payments",
        description: "Robust and secure payment processing options that build trust with your customers and ensure payout safety.",
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
];

export default function PlasBusinessFeatures() {
    return (
        <section className="bg-white py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 tracking-tight">
                        Everything you need to <span className="text-[#00A67E]">Scale</span>
                    </h2>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        Plas Business provides a comprehensive suite of enterprise-grade tools designed to simplify your operations and maximize your growth.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-10 rounded-[40px] border border-gray-100 bg-white hover:border-[#00D9A5] hover:shadow-[0_20px_60px_-15px_rgba(0,217,165,0.15)] transition-all duration-500"
                        >
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 duration-500 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4 group-hover:text-[#00A67E] transition-colors">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
