import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratings: {
    rating: number;
    packaging_quality: number;
    delivery_experience: number;
    professionalism: number;
  }, comment: string) => Promise<void>;
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
  const [packagingQuality, setPackagingQuality] = useState(0);
  const [deliveryExperience, setDeliveryExperience] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate overall rating from the three specific ratings
  const calculateOverallRating = () => {
    const ratings = [packagingQuality, deliveryExperience, professionalism].filter(r => r > 0);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round(sum / ratings.length);
  };

  const handleStarClick = (value: number, field: string) => {
    console.log(`[Custom Rating] ${field} clicked: ${value}`);
    setValidationError(null); // Clear validation error when user rates
    switch (field) {
      case "packaging":
        setPackagingQuality(value);
        break;
      case "delivery":
        setDeliveryExperience(value);
        break;
      case "professionalism":
        setProfessionalism(value);
        break;
    }
  };

  const handleStarHover = (value: number, field: string) => {
    setHoveredRating({ ...hoveredRating, [field]: value });
  };

  const handleStarLeave = (field: string) => {
    setHoveredRating({ ...hoveredRating, [field]: 0 });
  };

  const handleSubmit = async () => {
    // Check if all three ratings are provided
    if (packagingQuality === 0 || deliveryExperience === 0 || professionalism === 0) {
      setValidationError("Please rate all aspects: Packaging, Delivery, and Professionalism");
      return;
    }
    
    setValidationError(null);
    const overallRating = calculateOverallRating();
    
    await onSubmit({
      rating: overallRating,
      packaging_quality: packagingQuality,
      delivery_experience: deliveryExperience,
      professionalism: professionalism,
    }, comment);
    // Reset form after successful submission
    if (!submitting && !submitError) {
      setPackagingQuality(0);
      setDeliveryExperience(0);
      setProfessionalism(0);
      setComment("");
      setHoveredRating({});
      setValidationError(null);
    }
  };

  const handleClose = () => {
    setPackagingQuality(0);
    setDeliveryExperience(0);
    setProfessionalism(0);
    setComment("");
    setHoveredRating({});
    setValidationError(null);
    onClose();
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select your rating";
    }
  };

  // Star Rating Component
  const StarRating = ({ 
    value, 
    field, 
    label 
  }: { 
    value: number; 
    field: string; 
    label: string;
  }) => {
    const currentHover = hoveredRating[field] || 0;
    const currentValue = value;
    
    return (
      <div className="space-y-3">
        <label
          className={`block text-sm font-semibold text-left ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </label>
        <div className="flex justify-start gap-2">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isActive = starValue <= (currentHover || currentValue);
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => handleStarClick(starValue, field)}
                onMouseEnter={() => handleStarHover(starValue, field)}
                onMouseLeave={() => handleStarLeave(field)}
                onTouchStart={() => {
                  handleStarClick(starValue, field);
                }}
                className="transition-all duration-200 touch-manipulation hover:scale-110 active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                <svg
                  className="h-10 w-10 sm:h-11 sm:w-11"
                  viewBox="0 0 20 20"
                  fill={isActive ? "#facc15" : theme === "dark" ? "#4b5563" : "#d1d5db"}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            );
          })}
        </div>
        {currentValue > 0 && (
          <p
            className={`text-xs ${
              theme === "dark" ? "text-green-400" : "text-green-500"
            }`}
          >
            {getRatingLabel(currentValue)}
          </p>
        )}
      </div>
    );
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
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-[550px] rounded-t-2xl sm:rounded-2xl border-0 sm:border shadow-2xl ${
          theme === "dark"
            ? "sm:border-gray-700 bg-gray-800"
            : "sm:border-gray-200 bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-6 sm:px-8 ${
            theme === "dark" ? "border-b border-gray-700" : "border-b border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {accentColor === "orange" ? "Rate Your Restaurant Order" : "Rate Your Experience"}
            </h2>
            <p
              className={`mt-1.5 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Help us improve by sharing your feedback
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`rounded-lg p-2 transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
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
          className={`max-h-[70vh] overflow-y-auto px-6 py-8 sm:px-8 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {(submitError || validationError) && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <svg
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
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
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-red-400" : "text-red-700"
                }`}
              >
                {validationError || submitError}
              </p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* Ratings Section */}
            <div className="space-y-6">
              <div className="space-y-6">
                <StarRating
                  value={packagingQuality}
                  field="packaging"
                  label="Packaging the Product"
                />
                <StarRating
                  value={deliveryExperience}
                  field="delivery"
                  label="Delivery Experience"
                />
                <StarRating
                  value={professionalism}
                  field="professionalism"
                  label="Professionalism"
                />
              </div>
            </div>

            {/* Feedback Section - Enhanced Design */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  className={`block text-base font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tell us about your order & service
                  {accentColor === "orange" && (
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      (Optional)
                    </span>
                  )}
                </label>
                {comment.length > 0 && (
                  <span
                    className={`text-xs font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {comment.length} characters
                  </span>
                )}
              </div>
              <div className="relative">
                <textarea
                  className={`w-full rounded-xl p-5 text-sm leading-relaxed transition-all duration-200 resize-none ${
                    theme === "dark"
                      ? "bg-gray-900/40 border-2 border-gray-700/50 text-white placeholder-gray-500/70 focus:bg-gray-900/60 focus:border-gray-600 focus:shadow-lg focus:shadow-gray-900/20"
                      : "bg-gray-50/80 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:shadow-lg focus:shadow-gray-200/50"
                  } focus:outline-none ${colors.border} ${colors.focus}`}
                  placeholder="How was your order? Was everything as expected? How was the delivery service? Any issues or suggestions?"
                  rows={6}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    minHeight: "120px",
                  }}
                />
                {comment.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <svg
                      className={`h-4 w-4 ${
                        theme === "dark" ? "text-gray-600" : "text-gray-300"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Share your experience with the order quality and delivery service
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex w-full flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 ${
            theme === "dark" ? "border-t border-gray-700" : "border-t border-gray-200"
          }`}
        >
          <button
            onClick={handleClose}
            className={`rounded-lg px-6 py-3 text-sm font-medium transition-all ${
              theme === "dark"
                ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                : "text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || packagingQuality === 0 || deliveryExperience === 0 || professionalism === 0}
            className={`flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all ${colors.button} ${colors.focus} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                Send Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
