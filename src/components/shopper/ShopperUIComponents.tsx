import React, { memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Check } from "lucide-react";

export const CustomInput = memo(({ 
  label, 
  name, 
  type = "text", 
  required = false, 
  placeholder = "", 
  value = "", 
  onChange, 
  error = "", 
  options = null, 
  rows = 1 
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
    <div className="space-y-1.5 md:space-y-2.5 group">
      <label className={`block text-[11px] md:text-[13px] font-bold uppercase tracking-wider transition-colors ${
        error ? "text-red-500" : theme === "dark" ? "text-gray-500 group-focus-within:text-green-500" : "text-gray-500 group-focus-within:text-green-600"
      }`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === "select" && options ? (
        <select value={value} onChange={(e) => onChange(name, e.target.value)} className={baseClasses}>
          <option value="">Select an option</option>
          {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} rows={rows} className={baseClasses} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder} className={baseClasses} />
      )}

      {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
});

export const FileUploadInput = memo(({ label, name, file, onChange, onRemove, error, description }: any) => {
  const { theme } = useTheme();
  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex justify-between items-end">
        <label className={`block text-[11px] md:text-[13px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
          {label}
        </label>
        <span className={`text-[9px] md:text-[10px] font-medium opacity-50 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>MAX 5MB (PDF/JPG)</span>
      </div>
      
      {file ? (
        <div className={`flex items-center justify-between rounded-xl border p-4 md:p-5 ${
          theme === "dark" ? "border-green-900/40 bg-green-950/20" : "border-green-100 bg-green-50/50"
        }`}>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl ${theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-500 text-white"}`}>
              <Check className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div>
               <p className={`text-xs md:text-sm font-bold truncate max-w-[150px] md:max-w-none ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>{file.name}</p>
               <p className="text-[9px] md:text-[10px] opacity-50">Upload successful</p>
            </div>
          </div>
          <button onClick={onRemove} className="p-1.5 md:p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all active:scale-90">
            <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ) : (
        <div className="group relative">
          <input type="file" id={name} onChange={onChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
          <label htmlFor={name} className={`flex flex-col items-center justify-center min-h-[120px] md:min-h-[140px] rounded-[20px] md:rounded-[24px] border-2 border-dashed transition-all cursor-pointer ${
            error ? "border-red-300 bg-red-50" : theme === "dark" ? "border-gray-800 bg-[#0a0a0a] hover:border-green-500 hover:bg-[#111]" : "border-gray-200 bg-gray-50/50 hover:border-green-500 hover:bg-white hover:shadow-xl hover:shadow-green-500/5"
          }`}>
            <div className={`p-3 md:p-4 rounded-full mb-2 md:mb-3 transition-transform group-hover:scale-110 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white shadow-sm'}`}>
              <svg className={`h-6 w-6 md:h-7 md:w-7 ${theme === "dark" ? "text-green-500" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <span className="text-xs md:text-sm font-bold mb-1">Click to upload</span>
            <span className={`text-[10px] md:text-[11px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{description}</span>
          </label>
        </div>
      )}
      {error && <p className="text-xs font-bold text-red-600 ml-1">{error}</p>}
    </div>
  );
});

export const HorizontalStepper = ({ steps, currentStep, theme }: any) => {
  return (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-900 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-green-500 -translate-y-1/2 z-0 transition-all duration-700" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step: any, i: number) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          
          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                isActive 
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/30 scale-110" 
                  : isCompleted 
                    ? "bg-green-100 dark:bg-green-500/20 border-green-500 text-green-600" 
                    : theme === 'dark' 
                      ? "bg-[#0a0a0a] border-gray-800 text-gray-700" 
                      : "bg-white border-gray-200 text-gray-400"
              }`}>
                {isCompleted ? <Check className="h-3 w-3 md:h-5 md:w-5" /> : <span className="text-[10px] md:text-xs font-black">{i + 1}</span>}
              </div>
              <span className={`absolute -bottom-6 md:-bottom-7 whitespace-nowrap text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${
                isActive ? "text-green-600" : isCompleted ? "text-green-500/70" : "text-gray-400"
              }`}>
                {step.title.split(' ')[0]}
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
