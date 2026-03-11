export default function FreeNoticeSection() {
    return (
        <section className="bg-white py-24 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="relative rounded-[60px] bg-[#00D9A5] p-12 md:p-24 overflow-hidden border-[16px] border-emerald-50 shadow-[0_40px_100px_-20px_rgba(0,217,165,0.4)]">
                        {/* Background Decorative Circles */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-700 opacity-10 rounded-full -translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10 text-center">
                            <div className="inline-block px-6 py-2 bg-emerald-900/10 rounded-full text-emerald-900 font-black text-sm uppercase tracking-[0.2em] mb-8">
                                Zero Cost. Zero Risk.
                            </div>

                            <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.85]">
                                EVERYTHING IS <br className="hidden md:block" />
                                <span className="text-emerald-950">100% FREE</span>
                            </h2>

                            <p className="text-xl md:text-3xl text-emerald-900/80 font-bold max-w-3xl mx-auto mb-12 leading-tight">
                                No subscription fees, no listing costs, and no hidden surprises. We only succeed when you succeed.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {[
                                    { title: "$0 Setup", desc: "No initial investment" },
                                    { title: "$0 Monthly", desc: "No subscription fees" },
                                    { title: "$0 Listings", desc: "List unlimited items" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                        <h3 className="text-3xl font-black text-white mb-2">{item.title}</h3>
                                        <p className="text-emerald-900 font-bold uppercase text-sm tracking-widest">{item.desc}</p>
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
