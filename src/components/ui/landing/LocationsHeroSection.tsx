export default function LocationsHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#2D5016] py-16 text-white md:py-24">
      {/* Background Shapes */}
      <div className="absolute right-0 top-0 -mr-[10%] -mt-[5%] h-[70%] w-[50%] rounded-full bg-[#3a661c] opacity-40 blur-3xl"></div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2 font-medium text-white shadow-sm backdrop-blur-sm">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-[#00D9A5]"></span>
            Plas Presence Across Mama Africa
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Our <span className="text-[#00D9A5]">African Network</span>
          </h1>
          <p className="text-lg font-medium text-white/90 md:text-xl">
            From the heart of Rwanda to the bustling cities of Kenya, Uganda,
            Ethiopia, and South Africa. Plas is expanding its smart logistics
            and business ecosystem to empower entrepreneurs across the
            continent.
          </p>
        </div>
      </div>
    </section>
  );
}
