import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";

export default function PlasBusinessHero({ onOpenDrawer }: { onOpenDrawer: () => void }) {
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
    <div className="relative overflow-hidden bg-[#2D5016] py-32 md:py-48">
      {/* Background Pattern - Subtle line-art style icons */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
          {/* SVG Icons Pattern */}
          {Array.from({ length: 30 }).map((_, index) => {
            const iconIndex = index % 5;
            const iconComponents = [
              <svg key={`1-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
              <svg key={`2-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
              <svg key={`3-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              <svg key={`4-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
              <svg key={`5-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            ];
            return (
              <div key={`pattern-${index}`} className="text-white" style={{ transform: `rotate(${(index * 12) % 360}deg) translate(${Math.sin(index) * 20}px, ${Math.cos(index) * 20}px)` }}>
                {iconComponents[iconIndex]}
              </div>
            );
          })}
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm duration-700 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Now open for all businesses and individuals
          </div>

          <h1 className="mb-8 text-5xl font-black leading-[0.9] tracking-tight text-white md:text-7xl lg:text-8xl">
            Grow your business with <span className="text-[#022C22]">Plas</span>
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-white/90 md:text-2xl">
            The all-in-one platform to reach thousands of customers, manage your
            inventory, and scale your sales — all for{" "}
            <span className="font-bold text-white underline decoration-[#022C22] decoration-4 underline-offset-8">
              free
            </span>
            .
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <button
              onClick={handleGetStarted}
              className="group relative rounded-2xl bg-[#022C22] px-10 py-5 text-lg font-bold text-white shadow-lg shadow-[#022C22]/20 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button
              onClick={onOpenDrawer}
              className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              Explore Opportunities
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:border-[#022C22]/50">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-white/80">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved Transition */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-px">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
