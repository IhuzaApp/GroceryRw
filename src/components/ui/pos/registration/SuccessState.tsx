import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function SuccessState() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open("https://dash.plas.rw", "_blank");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center duration-500 animate-in zoom-in">
      <div className="relative mb-10 h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl">
          <CheckCircle className="h-20 w-20" />
        </div>
      </div>
      <h2 className="text-3xl font-extrabold text-[#022C22] md:text-4xl">
        All set! We are directing you to the POS page
      </h2>
      <div className="mt-8 space-y-4">
        <p className="text-lg font-medium text-gray-500">
          Congratulations! Your account is ready . Redirecting you to the
          dashboard...
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-400">
            If the redirect doesn't work in 3 seconds, click below:
          </p>
          <a
            href="https://dash.plas.rw"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#022C22]/5 px-6 py-3 font-bold text-[#022C22] transition-colors hover:bg-[#022C22]/10"
          >
            https://dash.plas.rw
          </a>
        </div>
      </div>
    </div>
  );
}
