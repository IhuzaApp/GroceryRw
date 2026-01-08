"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import AboutTopBar from "../src/components/ui/landing/AboutTopBar";
import AboutHeader from "../src/components/ui/landing/AboutHeader";
import AboutFooter from "../src/components/ui/landing/AboutFooter";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
    anonymous: false,
    acceptedPolicy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const topics = [
    "Careers at Plas",
    "Recruitment Process",
    "Partnership Opportunities",
    "Technical Support",
    "General Inquiry",
    "Plasers (Delivery Partners)",
    "Business Accounts",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptedPolicy) {
      alert("Please accept the Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        topic: "",
        message: "",
        anonymous: false,
        acceptedPolicy: false,
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * {
          font-family: 'Nunito', sans-serif;
        }
        h1, h2, h3, h4, h5, h6, .font-cartoon {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }
      `,
        }}
      />
      <div className="min-h-screen bg-white">
        {/* Top Bar */}
        <AboutTopBar />

        {/* Header */}
        <AboutHeader activePage="contact" />

        {/* Upper Section - Dark Green with Pattern */}
        <div className="relative bg-[#2D5016] py-24 md:py-32">
          {/* Background Pattern - Subtle line-art style icons */}
          <div className="absolute inset-0 overflow-hidden opacity-5">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-24 p-12">
              {Array.from({ length: 30 }).map((_, index) => {
                const iconIndex = index % 5;
                const iconComponents = [
                  // Burger
                  <svg
                    key={`burger-${index}`}
                    color="white"
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>,
                  // Shopping bag
                  <svg
                    key={`bag-${index}`}
                    color="white"
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>,
                  // Scooter
                  <svg
                    key={`scooter-${index}`}
                    color="white"
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>,
                  // Phone
                  <svg
                    key={`phone-${index}`}
                    color="white"
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>,
                  // Package
                  <svg
                    key={`package-${index}`}
                    color="white"
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>,
                ];
                return (
                  <div
                    key={`pattern-${index}`}
                    className="text-gray-700"
                    style={{
                      transform: `rotate(${(index * 12) % 360}deg) translate(${
                        Math.sin(index) * 20
                      }px, ${Math.cos(index) * 20}px)`,
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
              Ask Plas
            </h1>
          </div>

          {/* Curved Transition to Yellow Section */}
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
                fill="#00D9A5"
              />
            </svg>
          </div>
        </div>

        {/* Form Section - Yellow Background */}
        <div className="bg-[#00D9A5] py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Left - Form (2/3 width) */}
              <div className="lg:col-span-2">
                <div className="rounded-lg bg-white p-8 shadow-lg md:p-12">
                  <h2 className="mb-6 text-3xl font-bold text-gray-700 md:text-4xl">
                    Send us your question!
                  </h2>
                  <p className="mb-8 text-base leading-relaxed text-gray-700">
                    Do you want to know more about careers at Plas, or do you
                    have any concerns about your recruitment process? We love
                    hungry minds, so don't be shy and send us your doubts!
                  </p>

                  {submitStatus === "success" && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
                      <p className="font-semibold">
                        Thank you for your message!
                      </p>
                      <p className="text-sm">We'll get back to you soon.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border-b-2 border-gray-300 bg-transparent px-2 py-3 text-gray-800 focus:border-[#00D9A5] focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border-b-2 border-gray-300 bg-transparent px-2 py-3 text-gray-800 focus:border-[#00D9A5] focus:outline-none"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Topic */}
                    <div>
                      <label
                        htmlFor="topic"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Select topic
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        required
                        className="w-full border-b-2 border-gray-300 bg-transparent px-2 py-3 text-gray-800 focus:border-[#00D9A5] focus:outline-none"
                      >
                        <option value="">Choose a topic...</option>
                        {topics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Your Question
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-3 text-gray-800 focus:border-[#00D9A5] focus:outline-none"
                        placeholder="Ask Plas here..."
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="anonymous"
                          checked={formData.anonymous}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00D9A5] focus:ring-[#00D9A5]"
                        />
                        <span className="text-sm text-gray-700">
                          I want my question to be published as anonymous
                        </span>
                      </label>

                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="acceptedPolicy"
                          checked={formData.acceptedPolicy}
                          onChange={handleChange}
                          required
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00D9A5] focus:ring-[#00D9A5]"
                        />
                        <span className="text-sm text-gray-700">
                          I have read and accepted Plas's{" "}
                          <a
                            href="/privacy-policy"
                            className="text-[#00D9A5] underline hover:text-[#00C896]"
                          >
                            Privacy Policy
                          </a>{" "}
                          and AskPlas's Community Guidelines
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-[#00D9A5] px-8 py-4 text-lg font-medium text-gray-700 transition-colors hover:bg-[#00C896] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                    >
                      {isSubmitting ? "Sending..." : "Ask"}
                    </button>
                  </form>

                  {/* Legal Disclaimer */}
                  <div className="mt-8 text-xs text-gray-600">
                    <p>
                      Plas Technologies Ltd. may process the data you share with
                      us in your request for the purpose of providing you with
                      the answer regarding your request. For more information on
                      how we process your data and how to exercise your rights,
                      please refer to our{" "}
                      <a
                        href="/privacy-policy"
                        className="text-[#00D9A5] underline hover:text-[#00C896]"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Info Panel (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="rounded-lg bg-green-400 p-8 shadow-lg">
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D9A5]">
                        <svg
                          className="h-8 w-8 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="mb-2 text-lg font-bold text-gray-800">
                        Basic info about you
                      </h4>
                      <p className="text-sm text-gray-700">
                        Don't worry, we won't spam you. Your details are only
                        used to answer you.
                      </p>
                      <div className="absolute left-8 top-20 h-8 w-0.5 border-l-2 border-dashed border-gray-400"></div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D9A5]">
                        <svg
                          className="h-8 w-8 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h4 className="mb-2 text-lg font-bold text-gray-800">
                        Write any question
                      </h4>
                      <p className="text-sm text-gray-700">
                        Choose any topic and Ask Plas!
                      </p>
                      <div className="absolute left-8 top-20 h-8 w-0.5 border-l-2 border-dashed border-gray-400"></div>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D9A5]">
                        <svg
                          className="h-8 w-8 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <h4 className="mb-2 text-lg font-bold text-gray-800">
                        Your answer will be published soon
                      </h4>
                      <p className="text-sm text-gray-700">
                        Your question and our answer will be visible to
                        everyone. If your question has been answered before,
                        you'll be sent a link to the answer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <AboutFooter />
      </div>
    </>
  );
}
