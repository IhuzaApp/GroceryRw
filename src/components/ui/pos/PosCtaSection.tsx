import { HeadphonesIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PosCtaSection() {
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/support/pos-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, ownerName, phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to send request.");
      }

      setIsSuccess(true);
      setShopName("");
      setOwnerName("");
      setPhone("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="pos-register"
      className="relative overflow-hidden bg-white py-24 text-[#1A1A1A]"
    >
      {/* Background Decor */}
      <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#022C22]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D5016]/5 blur-3xl"></div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#022C22]/10">
          <HeadphonesIcon className="h-10 w-10 text-[#00A67E]" />
        </div>

        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
          Still have questions? Register for a Demo
        </h2>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
          If you're not sure which plan is right for you, or if you want a
          personalized tour of the system, fill out the form below.{" "}
          <span className="font-bold text-[#00A67E]">
            Our dedicated agents will contact you directly
          </span>
          .
        </p>

        {isSuccess ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-emerald-50 p-12 shadow-sm">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <HeadphonesIcon className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-[#1A1A1A]">
              Request Received!
            </h3>
            <p className="text-gray-600">
              Thank you for your interest. A Plas agent will contact you shortly
              to schedule your personalized demo.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-8 text-sm font-bold text-[#00A67E] hover:underline"
            >
              Send another request
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-lg space-y-4 rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm md:p-10"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-left">
                <label
                  htmlFor="shopName"
                  className="text-sm font-bold text-gray-500"
                >
                  Shop/Business Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#022C22]"
                  placeholder="e.g. Ndoli's Joint"
                />
              </div>
              <div className="space-y-1 text-left">
                <label
                  htmlFor="ownerName"
                  className="text-sm font-bold text-gray-500"
                >
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#022C22]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="phone"
                className="text-sm font-bold text-gray-500"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#022C22]"
                placeholder="+250 788 123 456"
              />
            </div>

            {error && (
              <p className="text-left text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#022C22] px-8 py-5 text-lg font-bold text-white shadow-lg shadow-[#022C22]/20 transition-all hover:bg-[#00c596] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Request Agent Contact"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
