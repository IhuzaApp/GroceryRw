import { useState } from "react";
import { ArrowRight, Mail, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";

export default function RegistrationSection() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        fullName: "",
        businessName: "",
        email: "",
        phone: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch("/api/business-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to submit");
            setStatus("success");
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <section className="bg-white pb-32 pt-12 relative">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 bg-[#1A1A1A] rounded-[60px] overflow-hidden shadow-2xl">
                    {/* Form Column */}
                    <div className="p-12 md:p-20">
                        {status === "success" ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                                    <CheckCircle className="h-12 w-12 text-[#00D9A5]" />
                                </div>
                                <h2 className="text-4xl font-black text-white mb-4">Registration Sent!</h2>
                                <p className="text-xl text-gray-400 leading-relaxed max-w-sm">
                                    Thank you for your interest in Plas Business. Our team will review your application and contact you shortly.
                                </p>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="mt-8 text-[#00D9A5] font-bold hover:underline"
                                >
                                    Send another request
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                                    Ready to grow? <br />
                                    <span className="text-[#00D9A5]">Register Now</span>
                                </h2>

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9A5] transition-colors"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Business Name"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9A5] transition-colors"
                                        />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9A5] transition-colors"
                                    />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9A5] transition-colors"
                                    />
                                    <textarea
                                        placeholder="Briefly describe what you want to sell"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9A5] transition-colors"
                                    ></textarea>

                                    {status === "error" && (
                                        <p className="text-red-400 text-sm font-medium">
                                            Something went wrong. Please try again or contact support directly.
                                        </p>
                                    )}

                                    <button
                                        disabled={status === "loading"}
                                        className="w-full group px-10 py-5 bg-[#00D9A5] rounded-2xl text-[#1A1A1A] font-black text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {status === "loading" ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <>
                                                Submit Registration
                                                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-gray-500 text-sm text-center">
                                        By submitting, you agree to Plas's Terms of Service and Privacy Policy.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Contact Info Column */}
                    <div className="relative bg-emerald-900 p-12 md:p-20 flex flex-col justify-center">
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <svg width="100%" height="100%">
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                                </pattern>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-10">Still have questions?</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#00D9A5]">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-1">Email us</h4>
                                        <p className="text-emerald-100/60 transition-colors hover:text-[#00D9A5] cursor-pointer">business@plas-era.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#00D9A5]">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-1">Call Support</h4>
                                        <p className="text-emerald-100/60">0788829084</p>
                                        <p className="text-xs text-emerald-100/30 uppercase tracking-widest mt-1">Available 24/7</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#00D9A5]">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-1">Our HQ</h4>
                                        <p className="text-emerald-100/60">Norrsken House, <br />Kigali, Rwanda</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-10 border-t border-white/10">
                                <p className="text-emerald-100/60 italic text-lg leading-relaxed">
                                    "Our mission is to empower local commerce across the continent, starting with you."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
