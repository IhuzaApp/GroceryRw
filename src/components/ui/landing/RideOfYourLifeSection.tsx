import Image from "next/image";

export default function RideOfYourLifeSection() {
  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Circular Video */}
          <div className="flex items-center justify-center">
            <div className="relative h-96 w-96 overflow-hidden rounded-full shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#00D9A5] to-[#00A67E]">
                {/* Video Placeholder - You can replace this with an actual video */}
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=800&fit=crop"
                    alt="Plas team member"
                    fill
                    className="object-cover"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <button
                      className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-transform hover:scale-110"
                      aria-label="Play video"
                    >
                      <svg
                        className="ml-1 h-10 w-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
              Plas will be the Ride of your Life!
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-gray-800">
              <p>
                If you&apos;re here, it&apos;s because you&apos;re looking for
                an <span className="font-bold">exciting ride.</span>
              </p>
              <p>
                A ride that will fuel up your ambitions to take on a{" "}
                <span className="font-bold">new challenge</span> and{" "}
                <span className="font-bold">
                  stretch yourself beyond your comfort zone.
                </span>
              </p>
              <p>
                We&apos;ll deliver a{" "}
                <span className="font-bold">
                  non-vanilla culture built on talent, where we work to amplify
                  the impact on millions of people,
                </span>{" "}
                paving the way forward together.
              </p>
              <p>
                So, ready to take the wheel and make this The Ride of your Life?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
