export default function GreenBookSection() {
  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-gray-800 md:text-5xl">
                Our Green Book
              </h2>
              <svg
                className="h-8 w-8 text-[#00D9A5]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-gray-700">
              Curious about <span className="font-bold">our story</span>,{" "}
              <span className="font-bold">our values</span>, the{" "}
              <span className="font-bold">kind of people</span> who thrive at
              Plas, or what <span className="font-bold">day-to-day life</span>{" "}
              is like? This handy booklet has it all!
            </p>
            <button
              onClick={() => {
                // Add link to Green Book PDF or page
                window.open("#", "_blank");
              }}
              className="self-start rounded-lg bg-[#00D9A5] px-6 py-3 font-medium text-white transition-colors hover:bg-[#00C896]"
            >
              Read our Green Book here
            </button>
          </div>

          {/* Right Side - Green Book Graphic */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Main Book */}
              <div className="relative h-96 w-72 transform rotate-[-8deg] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D9A5] to-[#00A67E] rounded-lg"></div>
                <div className="absolute inset-0 flex flex-col p-8">
                  {/* Title */}
                  <div className="mb-6">
                    <h3 className="text-4xl font-bold text-gray-800 leading-tight">
                      GREEN BO
                      <span className="relative inline-block mx-1">
                        <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-gray-800"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </span>
                        <span className="relative z-10 opacity-0">O</span>
                      </span>
                      K
                    </h3>
                  </div>
                  {/* Colored Icons */}
                  <div className="mb-4 flex gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                    <div className="h-4 w-4 rounded-full bg-pink-500"></div>
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  </div>
                  {/* Welcome Text */}
                  <p className="mb-6 text-base font-medium text-white">
                    Welcome to the ride of your life!
                  </p>
                  {/* Bottom Shapes */}
                  <div className="mt-auto space-y-3">
                    <div className="h-10 rounded border-2 border-gray-800 bg-transparent"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#00D9A5]"></div>
                      <div className="h-8 flex-1 rounded border-2 border-gray-800 bg-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Second Book (Behind) */}
              <div className="absolute -right-6 top-6 h-96 w-72 transform rotate-[8deg] opacity-50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D9A5] to-[#00A67E] rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

