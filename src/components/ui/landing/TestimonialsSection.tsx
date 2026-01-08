import { useState } from "react";
import Image from "next/image";

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "I've been giving my 110% on projects that have helped me develop my skills and grow day after day. From three fundraising processes to several M&A opportunities across different verticals and geographies, I certainly feel that being part of such transformational work at Plas has been a unique lifetime opportunity and I'm very excited about what's to come!",
      author: "Laura Martín",
      role: "Head of International Strategy",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      text: "I feel very grateful because they have become more than some colleagues. The trust they place in me is making me grow every day, I have learned to work as a team and I have more and more responsibilities.",
      author: "Jordi Sevillano",
      role: "People Experience Team",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      text: "I joined Plas at a very early stage of the company. My biggest challenge during these 4 years has been adapting to the growth and changes and giving my best during this adventure. We started building tripods with cereal boxes for shootings, and now we launch TVC campaigns almost every quarter around the world! This amazing journey has been so intense that now I have green blood inside my veins.",
      author: "María Herraiz Sabate",
      role: "Sr. Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-800 md:text-5xl">
          What our people say
        </h2>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentTestimonial * 100}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full px-4">
                  <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                    {/* Quote Icon */}
                    <div className="mb-4">
                      <svg
                        className="h-12 w-12 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    {/* Testimonial Text */}
                    <p className="mb-6 text-lg italic leading-relaxed text-gray-700">
                      {testimonial.text}
                    </p>
                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  currentTestimonial === index
                    ? "bg-[#00D9A5]"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

