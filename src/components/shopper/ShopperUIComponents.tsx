import React, { memo, useRef, useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Check, Car, Bike, Truck, User, Search, MapPin } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMap } from "../../context/GoogleMapProvider";

export const CustomInput = memo(
  ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    value = "",
    onChange,
    error = "",
    options = null,
    rows = 1,
    ...props
  }: any) => {
    const { theme } = useTheme();
    const baseClasses = `w-full rounded-xl border px-4 py-3 md:px-5 md:py-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/10 shadow-sm hover:shadow-md ${
      error
        ? "border-red-300 bg-red-50 dark:border-red-600/50 dark:bg-red-900/10"
        : theme === "dark"
        ? "border-[#222] bg-[#111] text-gray-100 hover:border-green-500/30 focus:border-green-500"
        : "border-gray-200 bg-white text-gray-900 hover:border-green-400 focus:border-green-500"
    }`;

    return (
      <div className="group space-y-1.5 md:space-y-2.5">
        <label
          className={`block text-[11px] font-bold uppercase tracking-wider transition-colors md:text-[13px] ${
            error
              ? "text-red-500"
              : theme === "dark"
              ? "text-gray-500 group-focus-within:text-green-500"
              : "text-gray-500 group-focus-within:text-green-600"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {type === "select" && options ? (
          <select
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={baseClasses}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((o: any) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={baseClasses}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            className={baseClasses}
            {...props}
          />
        )}

        {error && (
          <p className="text-xs font-semibold text-red-600 animate-in fade-in slide-in-from-top-1 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

export const TransportModeSelector = memo(({ value, onChange, error }: any) => {
  const { theme } = useTheme();

  const options = [
    { label: "Car", value: "car", icon: <Car className="h-6 w-6" /> },
    {
      label: "Motorcycle",
      value: "motorcycle",
      icon: <Truck className="h-6 w-6" />,
    },
    { label: "Bicycle", value: "bicycle", icon: <Bike className="h-6 w-6" /> },
    { label: "On Foot", value: "on_foot", icon: <User className="h-6 w-6" /> },
  ];

  return (
    <div className="space-y-4">
      <label
        className={`block text-[11px] font-bold uppercase tracking-wider md:text-[13px] ${
          theme === "dark" ? "text-gray-500" : "text-gray-500"
        }`}
      >
        Mode of Transport
      </label>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange("transport_mode", option.value)}
              className={`group relative flex flex-col items-center justify-center rounded-[32px] border-2 p-6 transition-all duration-300 hover:scale-105 active:scale-95 ${
                isSelected
                  ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                  : theme === "dark"
                  ? "border-gray-800 bg-[#0a0a0a] hover:border-green-500/50"
                  : "border-gray-100 bg-gray-50/50 hover:border-green-400 hover:bg-white hover:shadow-xl hover:shadow-green-500/5"
              }`}
            >
              <div
                className={`mb-4 rounded-2xl p-4 transition-all duration-500 ${
                  isSelected
                    ? "bg-green-500 text-white"
                    : theme === "dark"
                    ? "bg-white/5 text-gray-500"
                    : "bg-white text-gray-400 shadow-sm"
                }`}
              >
                {option.icon}
              </div>
              <span
                className={`text-sm font-black transition-colors ${
                  isSelected
                    ? "text-green-600 dark:text-green-500"
                    : "text-gray-500"
                }`}
              >
                {option.label}
              </span>

              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg duration-300 animate-in zoom-in">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
});

export const FileUploadInput = memo(
  ({ label, name, file, onChange, onRemove, error, description }: any) => {
    const { theme } = useTheme();
    return (
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-end justify-between">
          <label
            className={`block text-[11px] font-bold uppercase tracking-wider md:text-[13px] ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {label}
          </label>
          <span
            className={`text-[9px] font-medium opacity-50 md:text-[10px] ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            MAX 5MB (PDF/JPG)
          </span>
        </div>

        {file ? (
          <div
            className={`flex items-center justify-between rounded-xl border p-4 md:p-5 ${
              theme === "dark"
                ? "border-green-900/40 bg-green-950/20"
                : "border-green-100 bg-green-50/50"
            }`}
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div
                className={`rounded-lg p-2 md:rounded-xl md:p-2.5 ${
                  theme === "dark"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-500 text-white"
                }`}
              >
                <Check className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <p
                  className={`max-w-[150px] truncate text-xs font-bold md:max-w-none md:text-sm ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {file.name}
                </p>
                <p className="text-[9px] opacity-50 md:text-[10px]">
                  Upload successful
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="rounded-lg p-1.5 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90 md:p-2"
            >
              <svg
                className="h-4 w-4 md:h-5 md:w-5"
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
        ) : (
          <div className="group relative">
            <input
              type="file"
              id={name}
              onChange={onChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label
              htmlFor={name}
              className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed transition-all md:min-h-[140px] md:rounded-[24px] ${
                error
                  ? "border-red-300 bg-red-50"
                  : theme === "dark"
                  ? "border-gray-800 bg-[#0a0a0a] hover:border-green-500 hover:bg-[#111]"
                  : "border-gray-200 bg-gray-50/50 hover:border-green-500 hover:bg-white hover:shadow-xl hover:shadow-green-500/5"
              }`}
            >
              <div
                className={`mb-2 rounded-full p-3 transition-transform group-hover:scale-110 md:mb-3 md:p-4 ${
                  theme === "dark" ? "bg-[#1a1a1a]" : "bg-white shadow-sm"
                }`}
              >
                <svg
                  className={`h-6 w-6 md:h-7 md:w-7 ${
                    theme === "dark" ? "text-green-500" : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <span className="mb-1 text-xs font-bold md:text-sm">
                Click to upload
              </span>
              <span
                className={`text-[10px] md:text-[11px] ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {description}
              </span>
            </label>
          </div>
        )}
        {error && (
          <p className="ml-1 text-xs font-bold text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

export const HorizontalStepper = ({ steps, currentStep, theme }: any) => {
  return (
    <div className="mb-8 md:mb-12">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-gray-100 dark:bg-gray-900" />
        <div
          className="absolute left-0 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-green-500 transition-all duration-700"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step: any, i: number) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-500 md:h-10 md:w-10 ${
                  isActive
                    ? "scale-110 border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/30"
                    : isCompleted
                    ? "border-green-500 bg-green-100 text-green-600 dark:bg-green-500/20"
                    : theme === "dark"
                    ? "border-gray-800 bg-[#0a0a0a] text-gray-700"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 md:h-5 md:w-5" />
                ) : (
                  <span className="text-[10px] font-black md:text-xs">
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-colors md:-bottom-7 md:text-[10px] ${
                  isActive
                    ? "text-green-600"
                    : isCompleted
                    ? "text-green-500/70"
                    : "text-gray-400"
                }`}
              >
                {step.title.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

CustomInput.displayName = "CustomInput";
FileUploadInput.displayName = "FileUploadInput";

export const SignaturePad = memo(
  ({ onSign, error }: { onSign: (val: string) => void; error?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const { theme } = useTheme();

    const getCoordinates = (event: any, canvas: HTMLCanvasElement) => {
      if (event.touches && event.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          offsetX: (event.touches[0].clientX - rect.left) * scaleX,
          offsetY: (event.touches[0].clientY - rect.top) * scaleY,
        };
      }
      return {
        offsetX: event.nativeEvent.offsetX,
        offsetY: event.nativeEvent.offsetY,
      };
    };

    const startDrawing = (e: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      const { offsetX, offsetY } = getCoordinates(e, canvas);
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    };

    const draw = (e: any) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { offsetX, offsetY } = getCoordinates(e, canvas);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      if (canvasRef.current) {
        onSign(canvasRef.current.toDataURL("image/png"));
      }
    };

    const clear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onSign("");
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 200;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = theme === "dark" ? "white" : "black";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      }
    }, [theme]);

    return (
      <div className="relative space-y-2">
        <div
          className={`relative h-[200px] w-full overflow-hidden rounded-2xl border-2 transition-all ${
            error
              ? "border-red-400 bg-red-50 dark:bg-red-900/10"
              : theme === "dark"
              ? "border-gray-800 bg-[#0a0a0a]"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ touchAction: "none" }}
            className="h-full w-full cursor-crosshair"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              clear();
            }}
            className="absolute right-2 top-2 rounded-lg bg-gray-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
        {error && (
          <p className="ml-1 text-xs font-bold text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
SignaturePad.displayName = "SignaturePad";

export const AddressAutocomplete = memo(
  ({ label, value, onSelect, error, required = false }: any) => {
    const { theme } = useTheme();
    const [autocomplete, setAutocomplete] =
      useState<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useGoogleMap();

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
      setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
      if (autocomplete !== null) {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const address = place.formatted_address || "";
          const lat = place.geometry.location.lat().toString();
          const lng = place.geometry.location.lng().toString();
          onSelect(address, lat, lng);
        }
      }
    };

    const baseClasses = `w-full rounded-xl border px-4 py-3 md:px-5 md:py-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/10 shadow-sm hover:shadow-md ${
      error
        ? "border-red-300 bg-red-50 dark:border-red-600/50 dark:bg-red-900/10"
        : theme === "dark"
        ? "border-[#222] bg-[#111] text-gray-100 hover:border-green-500/30 focus:border-green-500"
        : "border-gray-200 bg-white text-gray-900 hover:border-green-400 focus:border-green-500"
    }`;

    if (!isLoaded)
      return (
        <CustomInput
          label={label}
          value={value}
          disabled
          placeholder="Loading maps..."
        />
      );

    return (
      <div className="group space-y-1.5 md:space-y-2.5">
        <label
          className={`block text-[11px] font-bold uppercase tracking-wider transition-colors md:text-[13px] ${
            error
              ? "text-red-500"
              : theme === "dark"
              ? "text-gray-500 group-focus-within:text-green-500"
              : "text-gray-500 group-focus-within:text-green-600"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <div className="relative">
            <input
              type="text"
              defaultValue={value}
              placeholder="Search for your address..."
              className={`${baseClasses} pl-10 md:pl-12`}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </Autocomplete>
        {error && (
          <p className="text-xs font-semibold text-red-600 animate-in fade-in slide-in-from-top-1 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
AddressAutocomplete.displayName = "AddressAutocomplete";
