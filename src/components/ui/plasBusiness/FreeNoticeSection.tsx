export default function FreeNoticeSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[60px] border-[16px] border-emerald-50 bg-[#022C22] p-12 shadow-[0_40px_100px_-20px_rgba(2,44,34,0.4)] md:p-24">
            {/* Background Decorative Circles */}
            <div className="absolute right-0 top-0 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-700 opacity-10"></div>

            <div className="relative z-10 text-center">
              <div className="mb-8 inline-block rounded-full bg-white/10 px-6 py-2 text-sm font-black uppercase tracking-[0.2em] text-white/80">
                Zero Cost. Zero Risk.
              </div>

              <h2 className="mb-8 text-5xl font-black leading-[0.85] tracking-tighter text-white md:text-8xl">
                EVERYTHING IS <br className="hidden md:block" />
                <span className="text-white underline decoration-white/20 underline-offset-8">100% FREE</span>
              </h2>

              <p className="mx-auto mb-12 max-w-3xl text-xl font-bold leading-tight text-white/70 md:text-3xl">
                No subscription fees, no listing costs, and no hidden surprises.
                We only succeed when you succeed.
              </p>

              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
                {[
                  { title: "$0 Setup", desc: "No initial investment" },
                  { title: "$0 Monthly", desc: "No subscription fees" },
                  { title: "$0 Listings", desc: "List unlimited items" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
                  >
                    <h3 className="mb-2 text-3xl font-black text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-white/60">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
