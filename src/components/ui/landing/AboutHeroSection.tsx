export default function AboutHeroSection() {
  return (
    <div className="relative bg-[#2D5016] py-24 md:py-32">
      {/* Background Pattern - Subtle line-art style icons */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
          {/* SVG Icons Pattern - Food and delivery related */}
          {Array.from({ length: 30 }).map((_, index) => {
            const iconIndex = index % 5;
            const iconComponents = [
              // Burger
              <svg key={`burger-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>,
              // Shopping bag
              <svg key={`bag-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>,
              // Scooter
              <svg key={`scooter-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              // Phone
              <svg key={`phone-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>,
              // Package
              <svg key={`package-${index}`} className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>,
            ];
            return (
              <div
                key={`pattern-${index}`}
                className="text-white"
                style={{
                  transform: `rotate(${(index * 12) % 360}deg) translate(${Math.sin(index) * 20}px, ${Math.cos(index) * 20}px)`,
                }}
              >
                {iconComponents[iconIndex]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Title */}
      <div className="container relative mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-white md:text-7xl lg:text-8xl">
          About us
        </h1>
      </div>

      {/* Curved Transition to White Section */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-px">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}

