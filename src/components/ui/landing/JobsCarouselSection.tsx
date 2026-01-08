import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function JobsCarouselSection() {
  const [currentJob, setCurrentJob] = useState(0);

  const jobs = [
    {
      title: "Delivery Rider - Kenya",
      location: "Nairobi, Kenya",
      pronouns: "(They/She/He)",
    },
    {
      title: "Account Manager - Uganda",
      location: "Kampala, Uganda",
      pronouns: "(She/He/They)",
    },
    {
      title: "Junior Developer - Rwanda",
      location: "Kigali, Rwanda",
      pronouns: "(They/She/He)",
    },
    {
      title: "Operations Manager - Rwanda",
      location: "Gasabo, Rwanda",
      pronouns: "(She/He/They)",
    },
    {
      title: "Marketing Specialist - Rwanda",
      location: "Nyarugenge, Rwanda",
      pronouns: "(They/She/He)",
    },
    {
      title: "Customer Support - Kenya",
      location: "Nairobi, Kenya",
      pronouns: "(She/He/They)",
    },
  ];

  return (
    <div className="bg-[#F0FDF4] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
          Your next job is on the way
        </h2>

        {/* Job Cards Carousel */}
        <div className="relative">
          {/* Navigation Arrow Left */}
          <button
            onClick={() =>
              setCurrentJob((prev) => {
                const newIndex = prev - 3;
                return newIndex < 0 ? Math.max(0, jobs.length - 3) : newIndex;
              })
            }
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-white p-3 shadow-lg transition-colors hover:bg-gray-50 md:left-4"
            aria-label="Previous jobs"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          {/* Navigation Arrow Right */}
          <button
            onClick={() =>
              setCurrentJob((prev) => {
                const newIndex = prev + 3;
                return newIndex >= jobs.length ? 0 : newIndex;
              })
            }
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-white p-3 shadow-lg transition-colors hover:bg-gray-50 md:right-4"
            aria-label="Next jobs"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Job Cards Container */}
          <div className="overflow-hidden px-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${Math.floor(currentJob / 3) * 100}%)`,
              }}
            >
              {jobs.map((job, index) => (
                <div key={index} className="min-w-[33.333%] px-4">
                  <div className="rounded-2xl bg-[#D1FAE5] p-6 shadow-md transition-transform hover:scale-105">
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      {job.title} {job.pronouns}
                    </h3>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(jobs.length / 3) }).map(
              (_, index) => {
                const pageStart = index * 3;
                const isActive = Math.floor(currentJob / 3) === index;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentJob(pageStart)}
                    className={`h-3 w-3 rounded-full transition-colors ${
                      isActive ? "bg-gray-800" : "bg-gray-300"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
