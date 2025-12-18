import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
  accentColor?: "green" | "purple" | "orange";
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  submitError,
  accentColor = "green",
}: FeedbackModalProps) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleStarClick = (value: number) => {
    console.log(`[Custom Rating] Star clicked: ${value}`);
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }
    await onSubmit(rating, comment);
    // Reset form after successful submission
    if (!submitting && !submitError) {
      setRating(0);
      setComment("");
      setHoveredRating(0);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setHoveredRating(0);
    onClose();
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return "⭐ Poor";
      case 2:
        return "⭐⭐ Fair";
      case 3:
        return "⭐⭐⭐ Good";
      case 4:
        return "⭐⭐⭐⭐ Very Good";
      case 5:
        return "⭐⭐⭐⭐⭐ Excellent";
      default:
        return "Select your rating";
    }
  };

  const getAccentColors = () => {
    switch (accentColor) {
      case "purple":
        return {
          iconBg: theme === "dark" ? "bg-purple-500/20" : "bg-gradient-to-br from-purple-100 to-purple-50",
          iconColor: theme === "dark" ? "text-purple-400" : "text-purple-600",
          button: theme === "dark"
            ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
          focus: "focus:ring-purple-500",
          border: "focus:border-purple-500",
        };
      case "orange":
        return {
          iconBg: theme === "dark" ? "bg-orange-500/20" : "bg-gradient-to-br from-orange-100 to-orange-50",
          iconColor: theme === "dark" ? "text-orange-400" : "text-orange-600",
          button: theme === "dark"
            ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
          focus: "focus:ring-orange-500",
          border: "focus:border-orange-500",
        };
      default: // green
        return {
          iconBg: theme === "dark" ? "bg-green-500/20" : "bg-gradient-to-br from-green-100 to-green-50",
          iconColor: theme === "dark" ? "text-green-400" : "text-green-600",
          button: theme === "dark"
            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
          focus: "focus:ring-green-500",
          border: "focus:border-green-500",
        };
    }
  };

  const colors = getAccentColors();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-[550px] rounded-2xl border shadow-2xl ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-4 py-4 sm:px-6 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.iconBg}`}>
              <svg
                className={`h-6 w-6 ${colors.iconColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {accentColor === "orange" ? "Rate Your Restaurant Order" : "Rate Your Experience"}
              </h2>
              <p
                className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Help us improve by sharing your feedback
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`rounded-lg p-2 transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className={`max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {submitError && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                theme === "dark"
                  ? "bg-red-900/30 border border-red-800/50"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className={`h-5 w-5 ${
                      theme === "dark" ? "text-red-400" : "text-red-500"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-red-400" : "text-red-700"
                    }`}
                  >
                    {submitError}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-6">
            {/* Rating Section - Custom Tailwind Stars */}
            <div
              className={`rounded-xl p-6 text-center transition-all ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-700"
                  : "bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
              }`}
            >
              <h4
                className={`mb-4 text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                How was your experience?
              </h4>
              <div className="flex justify-center mb-4">
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isActive = starValue <= (hoveredRating || rating);
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => handleStarClick(starValue)}
                        onMouseEnter={() => handleStarHover(starValue)}
                        onMouseLeave={handleStarLeave}
                        onTouchStart={() => {
                          // Immediate response on touch
                          handleStarClick(starValue);
                        }}
                        className={`transition-all duration-150 ${
                          isActive
                            ? "scale-110 transform"
                            : "scale-100"
                        } touch-manipulation`}
                        style={{ touchAction: "manipulation" }}
                      >
                        <svg
                          className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                            isActive
                              ? rating > 3
                                ? "text-green-500"
                                : rating > 0
                                ? "text-yellow-400"
                                : "text-yellow-400"
                              : theme === "dark"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white/80"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {getRatingLabel()}
                </p>
              </div>
            </div>
            {/* Details Section */}
            <div
              className={`space-y-4 rounded-xl p-6 border ${
                theme === "dark"
                  ? "bg-gray-700/30 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h4
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Additional Feedback
              </h4>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Share your thoughts{accentColor === "orange" ? " (Optional)" : ""}
                </label>
                <textarea
                  className={`w-full rounded-lg p-4 text-sm transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } border focus:outline-none focus:ring-2 ${colors.border} ${colors.focus}`}
                  placeholder="Tell us what you liked or what we could improve..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex w-full flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6 ${
            theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          <button
            onClick={handleClose}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              theme === "dark"
                ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
            } border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${colors.button} ${colors.focus} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            type="submit"
          >
            {submitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
