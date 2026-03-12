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
      text: "No business license required to start. Just your items and your ambition.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Built-in Trust",
      text: "Leverage Plas's reputation. Shoppers buy with confidence from verified sellers.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Zero Overhead",
      text: "Don't worry about hosting or marketing costs. We bring the buyers to you.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Easy Management",
      text: "Our mobile app makes it simple to upload products and manage orders on the go.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-emerald-950 py-24 md:py-32">
      {/* Decorative Blur */}
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#022C22] opacity-5 blur-[150px]"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[60px] bg-[#022C22] opacity-20 blur-2xl"></div>
              <div className="relative overflow-hidden rounded-[48px] border border-white/10 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                  alt="Individual Seller"
                  width={800}
                  height={1000}
                  className="aspect-[4/5] h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/90 to-transparent p-8">
                  <p className="text-2xl font-bold leading-tight text-white">
                    "Plas gave me the platform to turn my side-hustle into a
                    full-time business."
                  </p>
                  <p className="mt-2 font-bold text-emerald-400">
                    — Sarah, Individual Seller
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 flex flex-col justify-center lg:order-2">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-bold text-emerald-400">
              For Individual Sellers
            </div>
            <h2 className="mb-8 text-4xl font-black leading-none tracking-tight text-white md:text-6xl">
              Not a big business?{" "}
              <span className="text-[#022C22]">Perfect.</span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-emerald-100/70">
              Plas Business isn't just for major supermarkets. We've built the
              world's most accessible platform for individuals who want to sell.
              Whether you're selling handmade crafts, second-hand items, or
              home-cooked meals, Plas helps you reach the world.
            </p>

            <div className="grid gap-8 sm:grid-cols-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wide text-white">
                    {benefit.title}
                  </h3>
                  <p className="leading-relaxed text-emerald-100/60">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartSelling}
              className="mt-12 w-fit transform rounded-2xl bg-white px-8 py-4 font-black text-emerald-950 transition-all hover:scale-105 hover:bg-[#022C22] hover:text-white"
            >
              Start Selling Individual Items
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
