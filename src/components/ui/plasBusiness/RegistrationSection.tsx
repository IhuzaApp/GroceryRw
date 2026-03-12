import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function RegistrationSection() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
    <section className="relative bg-white pb-32 pt-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 overflow-hidden rounded-[60px] bg-[#1A1A1A] shadow-2xl lg:grid-cols-2">
          {/* Form Column */}
          <div className="p-12 md:p-20">
            {status === "success" ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center duration-500 animate-in fade-in zoom-in">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle className="h-12 w-12 text-[#022C22]" />
                </div>
                <h2 className="mb-4 text-4xl font-black text-white">
                  Registration Sent!
                </h2>
                <p className="max-w-sm text-xl leading-relaxed text-gray-400">
                  Thank you for your interest in Plas Business. Our team will
                  review your application and contact you shortly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 font-bold text-[#022C22] hover:underline"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-8 text-4xl font-black tracking-tight text-white md:text-5xl">
                  Ready to grow? <br />
                  <span className="text-[#022C22]">Register Now</span>
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-[#022C22] focus:outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Business Name"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-[#022C22] focus:outline-none"
                    />
                  </div>
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-[#022C22] focus:outline-none"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-[#022C22] focus:outline-none"
                  />
                  <textarea
                    placeholder="Briefly describe what you want to sell"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 transition-colors focus:border-[#022C22] focus:outline-none"
                  ></textarea>

                  {status === "error" && (
                    <p className="text-sm font-medium text-red-400">
                      Something went wrong. Please try again or contact support
                      directly.
                    </p>
                  )}

                  <button
                    disabled={status === "loading"}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#022C22] px-10 py-5 text-lg font-black text-[#1A1A1A] transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
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

                  <p className="text-center text-sm text-gray-500">
                    By submitting, you agree to Plas's Terms of Service and
                    Privacy Policy.
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Contact Info Column */}
          <div className="relative flex flex-col justify-center bg-emerald-900 p-12 md:p-20">
            {/* Background Texture */}
            <div className="pointer-events-none absolute inset-0 opacity-5">
              <svg width="100%" height="100%">
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="mb-10 text-3xl font-bold text-white">
                Still have questions?
              </h3>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#022C22]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-white">
                      Email us
                    </h4>
                    <p className="cursor-pointer text-emerald-100/60 transition-colors hover:text-[#022C22]">
                      business@plas-era.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#022C22]">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-white">
                      Call Support
                    </h4>
                    <p className="text-emerald-100/60">0788829084</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-emerald-100/30">
                      Available 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#022C22]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-white">
                      Our HQ
                    </h4>
                    <p className="text-emerald-100/60">
                      Norrsken House, <br />
                      Kigali, Rwanda
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 border-t border-white/10 pt-10">
                <p className="text-lg italic leading-relaxed text-emerald-100/60">
                  "Our mission is to empower local commerce across the
                  continent, starting with you."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
