import { useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";

export default function FAQSection() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "When will I receive the information for my onboarding?",
      answer: "You will receive all onboarding information via email within 24-48 hours after accepting your offer. This includes your start date, required documents, and access credentials.",
    },
    {
      question: "What are Plas's values?",
      answer: "Our core values are Gas, Good Vibes, Stay Humble, Deep Dive, Glownership, and High Bar. These values guide our behaviors, processes, and mindset every day.",
    },
    {
      question: "What does a typical day look like at Plas?",
      answer: "A typical day at Plas is dynamic and fast-paced. You'll collaborate with talented colleagues, work on impactful projects, and have opportunities to learn and grow. We value work-life balance and provide flexibility to help you perform at your best.",
    },
    {
      question: "Do you offer health insurance?",
      answer: "Yes, we offer comprehensive health insurance coverage for all full-time employees, including medical, dental, and vision benefits. Coverage begins on your first day of employment.",
    },
    {
      question: "Is the onboarding process done remotely?",
      answer: "The onboarding process can be done both remotely and in-person, depending on your role and location. We provide comprehensive virtual onboarding resources and support for all new team members.",
    },
    {
      question: "Where can I get more information about working at Plas?",
      answer: "You can find more information about working at Plas on our careers page, read our Green Book, or reach out to our People Experience team. We also encourage you to check out our social media channels for insights into our culture.",
    },
    {
      question: "What's it like to work at Plas?",
      answer: "Working at Plas is an exciting journey! We're a fast-growing company with a non-vanilla culture built on talent. You'll work with passionate people, tackle challenging projects, and make a real impact on millions of people's lives. It's truly the ride of your life!",
    },
  ];

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="mb-4 text-center text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
          Ask Plas
        </h2>
        
        {/* Description */}
        <p className="mb-12 text-center text-lg text-gray-700 md:text-xl">
          Our vision is to give everyone easy access to anything in their city.
          We also want to give you all the answers about Plas.
        </p>

        {/* FAQ Items */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border-2 border-gray-200 bg-white transition-all hover:border-[#00D9A5]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="flex-1 text-lg font-medium text-gray-800">
                  {faq.question}
                </span>
                <div
                  className={`ml-4 flex-shrink-0 transition-transform ${
                    openFaq === index ? "rotate-45" : ""
                  }`}
                >
                  <Plus className="h-6 w-6 text-[#00D9A5]" />
                </div>
              </button>
              {openFaq === index && (
                <div className="border-t border-gray-200 px-6 pb-6 pt-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ask Plas Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              // Add link to contact or support page
              router.push("#contact");
            }}
            className="rounded-lg bg-[#00D9A5] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#00C896]"
          >
            Ask Plas
          </button>
        </div>
      </div>
    </div>
  );
}

