import React from "react";
import { AlertCircle, Camera } from "lucide-react";

interface RaiseComplaintModalProps {
  booking: any;
  data: {
    title: string;
    description: string;
    amount: string;
  };
  setData: (data: any) => void;
  onClose: () => void;
  onStartCapture: () => void;
  theme: string;
}

export default function RaiseComplaintModal({
  booking,
  data,
  setData,
  onClose,
  onStartCapture,
  theme,
}: RaiseComplaintModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border ${theme === 'dark' ? 'border-white/10 bg-[#121212]' : 'border-gray-100 bg-white'} p-8 shadow-2xl animate-in zoom-in-95`}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h3 className="mb-2 font-outfit text-2xl font-black">Raise Damage Complaint</h3>
        <p className="mb-8 text-sm text-gray-500">Report vehicle damage or issues discovered upon return. This will hold the security deposit for review.</p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Issue Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-orange-500/20 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
              placeholder="e.g., Scratch on front bumper"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className={`h-32 w-full resize-none rounded-2xl border px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-orange-500/20 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
              placeholder="Describe the damage in detail..."
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Claim Amount (Deposit)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RWF</span>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                className={`w-full rounded-2xl border pl-14 pr-4 py-3 text-sm transition-all focus:ring-2 focus:ring-orange-500/20 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 rounded-2xl border py-4 text-xs font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            onClick={onStartCapture}
            disabled={!data.title || !data.description}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-xs font-black uppercase tracking-widest !text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50"
          >
            Record Damage Video
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
