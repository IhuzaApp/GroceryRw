import { CheckCircle } from "lucide-react";

export default function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
      <div className="relative mb-10 h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl">
          <CheckCircle className="h-20 w-20" />
        </div>
      </div>
      <h2 className="text-4xl font-extrabold text-[#1A1A1A]">Business Created!</h2>
      <p className="mx-auto mt-6 max-w-sm text-lg text-gray-500">
        Congratulations! Your account is ready. Redirecting you to your POS dashboard...
      </p>
    </div>
  );
}
