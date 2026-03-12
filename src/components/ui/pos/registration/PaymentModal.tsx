import { X, CreditCard, Phone, Loader2, CheckCircle, ChevronRight, Lock } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: "momo" | "card";
  setMethod: (method: "momo" | "card") => void;
  momoNumber: string;
  setMomoNumber: (num: string) => void;
  onPay: () => Promise<void>;
  status: "idle" | "pending" | "success" | "failed";
  plan: any;
  price: number | undefined;
}

export default function PaymentModal({ isOpen, onClose, method, setMethod, momoNumber, setMomoNumber, onPay, status, plan, price }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#022C22]/10 text-[#022C22]">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">Complete Payment</h3>
            <p className="mt-2 text-gray-500">Securely finalize your {plan?.name} subscription</p>
          </div>

          <div className="mb-8 flex items-center justify-between rounded-2xl bg-gray-50 p-6">
            <div className="font-bold text-gray-600">Initial Total</div>
            <div className="text-2xl font-bold text-[#022C22]">
              {price?.toLocaleString()} <span className="text-sm opacity-60">RWF</span>
            </div>
          </div>

          {/* Method Selection */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod("momo")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                method === "momo" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-100 bg-white"
              }`}
            >
              <div className="font-bold text-black">MTN MoMo</div>
              <div className="text-[10px] uppercase tracking-widest text-black/50">Mobile Money</div>
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                method === "card" ? "border-[#022C22] bg-[#022C22]/5" : "border-gray-100 bg-white"
              }`}
            >
              <div className="font-bold text-black">Credit Card</div>
              <div className="text-[10px] uppercase tracking-widest text-black/50">Visa / Master</div>
            </button>
          </div>

          {method === "momo" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">MoMo Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="h-14 w-full rounded-xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-black outline-none focus:border-[#022C22] focus:bg-white text-lg font-medium"
                    placeholder="078..."
                  />
                </div>
              </div>

              <button
                onClick={onPay}
                disabled={status === "pending" || status === "success"}
                className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#022C22] font-bold text-white transition-all hover:bg-[#00c596] disabled:opacity-70"
              >
                {status === "pending" ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : status === "success" ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <span>Success!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Pay & Finish Setup</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400">
                You will receive a prompt on your phone to approve the transaction.
              </p>
            </div>
          ) : (
            <div className="space-y-6 rounded-3xl border-2 border-dashed border-gray-100 p-8 text-center bg-gray-50/50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-700">Card Payments coming soon</h4>
              <p className="text-sm text-gray-500">
                We are currently integrating with local card processors. Please use MTN MoMo for now.
              </p>
              
              <div className="flex justify-center gap-3 opacity-30 grayscale">
                <div className="h-8 w-12 bg-gray-300 rounded" />
                <div className="h-8 w-12 bg-gray-300 rounded" />
                <div className="h-8 w-12 bg-gray-300 rounded" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
