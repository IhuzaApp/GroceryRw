import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Send, X, Star, Package, Truck, UserCheck } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    ratings: {
      rating: number;
      packaging_quality: number;
      delivery_experience: number;
      professionalism: number;
    },
    comment: string
  ) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
  accentColor?: "green" | "purple" | "orange";
}

const CATEGORIES = [
  {
    field: "packaging",
    label: "Packaging",
    icon: <Package className="h-5 w-5" />,
    desc: "How well was it packed?",
  },
  {
    field: "delivery",
    label: "Delivery",
    icon: <Truck className="h-5 w-5" />,
    desc: "Speed & care of delivery",
  },
  {
    field: "professionalism",
    label: "Service",
    icon: <UserCheck className="h-5 w-5" />,
    desc: "Rider professionalism",
  },
];

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Poor", color: "#ef4444" },
  2: { label: "Fair", color: "#f97316" },
  3: { label: "Good", color: "#eab308" },
  4: { label: "Very Good", color: "#84cc16" },
  5: { label: "Excellent", color: "#22c55e" },
};

const ACCENT: Record<string, { from: string; to: string; ring: string; text: string }> = {
  green:  { from: "#16a34a", to: "#15803d", ring: "rgba(22,163,74,0.35)",  text: "#16a34a" },
  purple: { from: "#9333ea", to: "#7e22ce", ring: "rgba(147,51,234,0.35)", text: "#9333ea" },
  orange: { from: "#ea580c", to: "#c2410c", ring: "rgba(234,88,12,0.35)",  text: "#ea580c" },
};

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  submitError,
  accentColor = "green",
}: FeedbackModalProps) {
  const { theme } = useTheme();
  const [packagingQuality, setPackagingQuality] = useState(0);
  const [deliveryExperience, setDeliveryExperience] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const accent = ACCENT[accentColor] ?? ACCENT.green;

  const ratingMap: Record<string, number> = {
    packaging: packagingQuality,
    delivery: deliveryExperience,
    professionalism: professionalism,
  };

  const setterMap: Record<string, (v: number) => void> = {
    packaging: setPackagingQuality,
    delivery: setDeliveryExperience,
    professionalism: setProfessionalism,
  };

  const overall = (() => {
    const vals = [packagingQuality, deliveryExperience, professionalism].filter(
      (v) => v > 0
    );
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();

  const allRated =
    packagingQuality > 0 && deliveryExperience > 0 && professionalism > 0;

  const handleSubmit = async () => {
    if (!allRated) {
      setValidationError("Please rate all three aspects before submitting.");
      return;
    }
    setValidationError(null);
    await onSubmit(
      {
        rating: overall,
        packaging_quality: packagingQuality,
        delivery_experience: deliveryExperience,
        professionalism,
      },
      comment
    );
    if (!submitting && !submitError) {
      setPackagingQuality(0);
      setDeliveryExperience(0);
      setProfessionalism(0);
      setComment("");
      setHovered({});
      setValidationError(null);
    }
  };

  const handleClose = () => {
    setPackagingQuality(0);
    setDeliveryExperience(0);
    setProfessionalism(0);
    setComment("");
    setHovered({});
    setValidationError(null);
    onClose();
  };

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[100000] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-t-[2rem] shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-8 sm:rounded-[2rem]"
        style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-secondary)" }}
      >
        {/* Decorative glow blob */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-[80px]"
          style={{ background: accent.from }}
        />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-7 py-6"
          style={{ borderBottom: "1px solid var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-4">
            {/* Icon badge */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner"
              style={{ background: `${accent.from}20`, color: accent.text }}
            >
              <Star className="h-6 w-6" fill={accent.from} stroke={accent.from} />
            </div>
            <div>
              <h2
                className="text-xl font-black tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {accentColor === "orange"
                  ? "Rate Your Restaurant Order"
                  : "Rate Your Experience"}
              </h2>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Your feedback helps us improve 🙏
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full p-2 transition-all hover:scale-105 active:scale-95"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-secondary)",
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="scrollbar-hide max-h-[68vh] overflow-y-auto px-7 py-7"
          style={{ background: "var(--bg-primary)" }}
        >
          {/* Overall Score Ring */}
          {overall > 0 && (
            <div className="mb-7 flex items-center gap-5 rounded-2xl p-5 duration-500 animate-in fade-in zoom-in-95"
              style={{ background: `${accent.from}12`, border: `1px solid ${accent.from}30` }}
            >
              {/* Score circle */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--bg-secondary)" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={accent.from}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(overall / 5) * 175.9} 175.9`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <span className="relative text-xl font-black" style={{ color: accent.text }}>
                  {overall}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent.text }}>
                  Overall Score
                </p>
                <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                  {RATING_LABELS[overall]?.label ?? ""}
                </p>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-3.5 w-3.5"
                      fill={s <= overall ? "#facc15" : "transparent"}
                      stroke={s <= overall ? "#facc15" : "var(--bg-secondary)"}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {(submitError || validationError) && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 ring-1 ring-inset ring-red-500/20 duration-300 animate-in fade-in">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <p className="text-sm font-bold text-red-500">
                {validationError || submitError}
              </p>
            </div>
          )}

          {/* Star Rating Rows */}
          <div className="space-y-1">
            {CATEGORIES.map(({ field, label, icon, desc }) => {
              const val = ratingMap[field] ?? 0;
              const hov = hovered[field] ?? 0;
              const display = hov || val;

              return (
                <div
                  key={field}
                  className="group flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200"
                  style={{
                    background: val > 0
                      ? `${accent.from}0d`
                      : "transparent",
                    border: val > 0
                      ? `1px solid ${accent.from}25`
                      : "1px solid transparent",
                  }}
                >
                  {/* Left: icon + labels */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: val > 0 ? `${accent.from}18` : "var(--bg-secondary)",
                        color: val > 0 ? accent.text : "var(--text-secondary)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {val > 0
                          ? RATING_LABELS[val]?.label
                          : desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setValidationError(null);
                          setterMap[field]?.(s);
                        }}
                        onMouseEnter={() =>
                          setHovered((h) => ({ ...h, [field]: s }))
                        }
                        onMouseLeave={() =>
                          setHovered((h) => ({ ...h, [field]: 0 }))
                        }
                        className="transition-all duration-150 hover:scale-125 active:scale-95"
                        style={{ touchAction: "manipulation" }}
                      >
                        <Star
                          className="h-8 w-8 drop-shadow-sm sm:h-9 sm:w-9"
                          fill={s <= display ? "#facc15" : "transparent"}
                          stroke={
                            s <= display
                              ? "#facc15"
                              : isDark
                              ? "#4b5563"
                              : "#d1d5db"
                          }
                          strokeWidth={1.5}
                          style={{
                            filter:
                              s <= display
                                ? "drop-shadow(0 0 6px rgba(250,204,21,0.6))"
                                : "none",
                            transition: "all 0.15s ease",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            className="my-6 h-px"
            style={{ background: "var(--bg-secondary)" }}
          />

          {/* Comment box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: "var(--text-primary)" }}
              >
                Additional Comments
                <span
                  className="ml-2 text-[10px] font-normal normal-case tracking-normal"
                  style={{ color: "var(--text-secondary)" }}
                >
                  (optional)
                </span>
              </label>
              {comment.length > 0 && (
                <span
                  className="text-[10px] font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {comment.length} chars
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                className="w-full resize-none rounded-2xl p-5 text-sm leading-relaxed outline-none transition-all duration-200 focus:shadow-lg"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "2px solid var(--bg-secondary)",
                  minHeight: "110px",
                }}
                placeholder="How was your order? Anything we should know? Any suggestions..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accent.from;
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${accent.ring}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--bg-secondary)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-7 py-5"
          style={{ borderTop: "1px solid var(--bg-secondary)" }}
        >
          <button
            onClick={handleClose}
            type="button"
            className="rounded-2xl px-6 py-3.5 text-sm font-bold transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || !allRated}
            type="button"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              boxShadow: `0 8px 24px ${accent.ring}`,
            }}
          >
            {/* Shimmer */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" fill="none"
                  />
                  <path
                    className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 -rotate-12 transition-transform group-hover:rotate-0" />
                Send Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
