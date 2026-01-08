export default function CoreValuesSection() {
  return (
    <div className="bg-[#282828] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Main Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            Our core values are the north star that guide our
            <br />
            behaviors, processes and mindset
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side - Rocket Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative h-96 w-96 flex items-center justify-center">
              {/* Circular White Background with Green Border */}
              <div className="absolute inset-0 rounded-full bg-white border-8 border-[#00D9A5] shadow-2xl"></div>
              
              {/* Rocket Illustration */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Green Starbursts around rocket */}
                <div className="absolute -top-6 left-8">
                  <svg className="h-6 w-6 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                  </svg>
                </div>
                <div className="absolute top-12 -right-4">
                  <svg className="h-4 w-4 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                  </svg>
                </div>
                <div className="absolute bottom-20 -left-2">
                  <svg className="h-5 w-5 text-[#00D9A5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                  </svg>
                </div>
                
                {/* Rocket Body */}
                <div className="relative">
                  {/* Rocket Main Body */}
                  <div className="relative h-56 w-32 mx-auto">
                    {/* White Rocket Body */}
                    <div className="absolute inset-x-0 top-8 bottom-0 bg-white rounded-t-full"></div>
                    
                    {/* Orange Nose Cone */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                      <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-b-[32px] border-l-transparent border-r-transparent border-b-[#FF6B35]"></div>
                    </div>
                    
                    {/* Orange Fins */}
                    <div className="absolute bottom-0 left-0">
                      <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF6B35]"></div>
                    </div>
                    <div className="absolute bottom-0 right-0">
                      <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF6B35]"></div>
                    </div>
                    
                    {/* Blue Window with Green Border */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2">
                      <div className="h-14 w-14 rounded-full border-4 border-[#00D9A5] bg-blue-500 flex items-center justify-center">
                        <div className="h-7 w-7 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Exhaust Trails */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    {/* Green Cloud */}
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 h-20 w-24 rounded-full bg-[#00D9A5] opacity-50 blur-lg"></div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-3 h-16 w-20 rounded-full bg-[#00D9A5] opacity-40 blur-lg"></div>
                    </div>
                    {/* Light Blue Cloud */}
                    <div className="relative mt-3">
                      <div className="absolute left-1/2 -translate-x-1/2 h-14 w-18 rounded-full bg-blue-300 opacity-40 blur-lg"></div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-2 h-10 w-14 rounded-full bg-blue-200 opacity-30 blur-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Gas Core Value */}
          <div className="flex flex-col justify-center space-y-6">
            <h3 className="text-5xl font-bold text-white md:text-6xl">Gas</h3>
            <ul className="space-y-4 text-lg leading-relaxed text-white">
              <li>
                We prioritize and focus on{" "}
                <span className="font-bold">what moves the needle.</span>
              </li>
              <li>
                • We work hard and <span className="font-bold">execute fast.</span>
              </li>
              <li>
                • We <span className="font-bold">adapt quickly</span> to uncertainty
                and unexpected challenges.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Values List */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-sm font-medium uppercase text-white md:text-base">
          <span>GAS</span>
          <span>GOOD VIBES</span>
          <span>STAY HUMBLE</span>
          <span>DEEP DIVE</span>
          <span>GLOWNERSHIP</span>
          <span>HIGH BAR</span>
        </div>
      </div>
    </div>
  );
}

