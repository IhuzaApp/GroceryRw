import Image from "next/image";

export default function PosHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#2D5016] py-20 text-white md:py-32">
      {/* Background Shapes */}
      <div className="absolute right-0 top-0 -mr-[20%] -mt-[10%] h-[80%] w-[60%] rounded-full bg-[#3a661c] opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-[10%] -ml-[10%] h-[60%] w-[40%] rounded-full bg-[#1e3b0d] opacity-50 blur-2xl"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Text Content */}
          <div>
            <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2 font-medium text-white shadow-sm backdrop-blur-sm">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-[#022C22]"></span>
              For Shops, Restaurants & Enterprises
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              The smartest <span className="text-[#022C22]">POS System</span>{" "}
              for your business
            </h1>
            <p className="mb-8 text-lg font-medium text-white/90 md:text-xl">
              Streamline operations with our AI-powered Point of Sale. Generate
              payroll, automate tax declarations, manage your reels, and
              integrate directly with the Plas app.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  document
                    .getElementById("pos-pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-lg bg-[#022C22] px-8 py-4 font-bold text-white transition-colors hover:bg-[#00c596]"
              >
                Choose a plan that fits your needs
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto w-full max-w-lg md:max-w-none">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-4 border-white/10 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="POS System Checkout"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating Detail Card */}
            <div
              className="absolute -bottom-6 -left-6 animate-bounce rounded-2xl bg-white p-4 shadow-xl md:p-6"
              style={{ animationDuration: "3s" }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#022C22]/20">
                  <svg
                    className="h-6 w-6 text-[#00A67E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">AI Powered</p>
                  <p className="text-lg font-bold text-[#1A1A1A]">
                    Smart Tax & Payroll
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
