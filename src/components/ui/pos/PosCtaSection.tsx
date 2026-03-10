import { HeadphonesIcon } from "lucide-react";

export default function PosCtaSection() {
    return (
        <section id="pos-register" className="relative overflow-hidden bg-white py-24 text-[#1A1A1A]">
            {/* Background Decor */}
            <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00D9A5]/5 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D5016]/5 blur-3xl"></div>

            <div className="container relative mx-auto px-4 z-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#00D9A5]/10">
                    <HeadphonesIcon className="h-10 w-10 text-[#00A67E]" />
                </div>

                <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                    Still have questions? Register for a Demo
                </h2>

                <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
                    If you're not sure which plan is right for you, or if you want a personalized tour of the system, fill out the form below.{" "}
                    <span className="font-bold text-[#00A67E]">Our dedicated agents will contact you directly</span>.
                </p>

                <form className="mx-auto max-w-lg space-y-4 rounded-3xl bg-gray-50 p-8 md:p-10 border border-gray-100 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1 text-left">
                            <label htmlFor="shopName" className="text-sm font-bold text-gray-500">Shop/Business Name</label>
                            <input
                                type="text"
                                id="shopName"
                                className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#00D9A5]"
                                placeholder="e.g. Ndoli's Joint"
                            />
                        </div>
                        <div className="space-y-1 text-left">
                            <label htmlFor="ownerName" className="text-sm font-bold text-gray-500">Your Full Name</label>
                            <input
                                type="text"
                                id="ownerName"
                                className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#00D9A5]"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label htmlFor="phone" className="text-sm font-bold text-gray-500">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            className="w-full rounded-xl border-none bg-white px-4 py-4 text-[#1A1A1A] placeholder-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-[#00D9A5]"
                            placeholder="+250 788 123 456"
                        />
                    </div>

                    <button
                        type="button"
                        className="mt-4 w-full rounded-xl bg-[#00D9A5] px-8 py-5 text-lg font-bold text-[#1A1A1A] transition-all hover:bg-[#00c596] shadow-lg shadow-[#00D9A5]/20 active:scale-[0.98]"
                        onClick={(e) => {
                            e.preventDefault();
                            alert("Thank you! A Plas agent will contact you shortly.");
                        }}
                    >
                        Request Agent Contact
                    </button>
                </form>
            </div>
        </section>
    );
}
