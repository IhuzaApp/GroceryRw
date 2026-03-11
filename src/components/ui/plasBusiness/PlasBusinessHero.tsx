import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";

export default function PlasBusinessHero() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/plasBusiness");
    } else {
      router.push("/Auth/Login?redirect=/plasBusiness");
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#1A1A1A] py-32 md:py-48">
      {/* Background Accents */}
      <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00D9A5] opacity-10 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500 opacity-10 blur-[100px]"></div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-[#00D9A5] duration-700 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D9A5] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D9A5]"></span>
            </span>
            Now open for all businesses and individuals
          </div>

          <h1 className="mb-8 text-5xl font-black leading-[0.9] tracking-tight text-white md:text-7xl lg:text-8xl">
            Grow your business with <span className="text-[#00D9A5]">Plas</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-gray-400 md:text-2xl">
            The all-in-one platform to reach thousands of customers, manage your
            inventory, and scale your sales — all for{" "}
            <span className="font-bold text-white underline decoration-[#00D9A5] decoration-4 underline-offset-8">
              free
            </span>
            .
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <button
              onClick={handleGetStarted}
              className="group relative rounded-2xl bg-[#00D9A5] px-10 py-5 text-lg font-bold text-[#1A1A1A] shadow-[0_0_40px_rgba(0,217,165,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              View Sample Store
            </button>
          </div>

          {/* Key Trust Points */}
          <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              "No Monthly Fees",
              "Unlimited Products",
              "Daily Payouts",
              "24/7 Support",
            ].map((point, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 duration-1000 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:border-[#00D9A5]/50">
                  <CheckCircle2 className="h-6 w-6 text-[#00D9A5]" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 translate-y-px bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
