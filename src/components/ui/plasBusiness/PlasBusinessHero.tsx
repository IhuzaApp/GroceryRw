import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function PlasBusinessHero() {
    return (
        <div className="relative bg-[#1A1A1A] py-32 md:py-48 overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#00D9A5] opacity-10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500 opacity-10 rounded-full blur-[100px]"></div>

            <div className="container relative mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00D9A5] text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9A5] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D9A5]"></span>
                        </span>
                        Now open for all businesses and individuals
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[0.9]">
                        Grow your business with <span className="text-[#00D9A5]">Plas</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one platform to reach thousands of customers, manage your inventory, and scale your sales — all for <span className="text-white font-bold underline decoration-[#00D9A5] decoration-4 underline-offset-8">free</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="group relative px-10 py-5 bg-[#00D9A5] rounded-2xl text-[#1A1A1A] font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,217,165,0.3)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started for Free
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
                            View Sample Store
                        </button>
                    </div>

                    {/* Key Trust Points */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            "No Monthly Fees",
                            "Unlimited Products",
                            "Daily Payouts",
                            "24/7 Support"
                        ].map((point, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${i * 150}ms` }}>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00D9A5]/50 transition-colors">
                                    <CheckCircle2 className="h-6 w-6 text-[#00D9A5]" />
                                </div>
                                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Curved Transition */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-px h-24 bg-gradient-to-t from-white to-transparent"></div>
        </div>
    );
}
