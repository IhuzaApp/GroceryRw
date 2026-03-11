import { Rocket, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";

export default function IndividualSellersSection() {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const handleStartSelling = () => {
        if (isLoggedIn) {
            router.push("/plasBusiness");
        } else {
            router.push("/Auth/Login?redirect=/plasBusiness");
        }
    };

    const benefits = [
        {
            icon: <Rocket className="h-6 w-6" />,
            title: "Start in Seconds",
            text: "No business license required to start. Just your items and your ambition."
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Built-in Trust",
            text: "Leverage Plas's reputation. Shoppers buy with confidence from verified sellers."
        },
        {
            icon: <TrendingUp className="h-6 w-6" />,
            title: "Zero Overhead",
            text: "Don't worry about hosting or marketing costs. We bring the buyers to you."
        },
        {
            icon: <Sparkles className="h-6 w-6" />,
            title: "Easy Management",
            text: "Our mobile app makes it simple to upload products and manage orders on the go."
        }
    ];

    return (
        <section className="bg-emerald-950 py-24 md:py-32 relative overflow-hidden">
            {/* Decorative Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00D9A5] opacity-5 rounded-full blur-[150px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-[#00D9A5] opacity-20 rounded-[60px] blur-2xl"></div>
                            <div className="relative rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                                    alt="Individual Seller"
                                    width={800}
                                    height={1000}
                                    className="w-full h-full object-cover aspect-[4/5]"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-emerald-950/90 to-transparent">
                                    <p className="text-white text-2xl font-bold leading-tight">
                                        "Plas gave me the platform to turn my side-hustle into a full-time business."
                                    </p>
                                    <p className="text-emerald-400 mt-2 font-bold">— Sarah, Individual Seller</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-bold mb-6 w-fit">
                            For Individual Sellers
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-none">
                            Not a big business? <span className="text-[#00D9A5]">Perfect.</span>
                        </h2>
                        <p className="text-xl text-emerald-100/70 mb-12 leading-relaxed">
                            Plas Business isn't just for major supermarkets. We've built the world's most accessible platform for individuals who want to sell. Whether you're selling handmade crafts, second-hand items, or home-cooked meals, Plas helps you reach the world.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex flex-col gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-[#00D9A5]">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">{benefit.title}</h3>
                                    <p className="text-emerald-100/60 leading-relaxed">{benefit.text}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleStartSelling}
                            className="mt-12 w-fit px-8 py-4 bg-white rounded-2xl text-emerald-950 font-black hover:bg-[#00D9A5] hover:text-white transition-all transform hover:scale-105"
                        >
                            Start Selling Individual Items
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
