"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block px-1 font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        {label}
      </label>
      <div className="group relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-xs font-bold text-gray-900 outline-none transition-all focus:ring-4 focus:ring-green-500/10 dark:border-white/5 dark:bg-white/10 dark:text-white"
        >
          {options.map((t: string) => (
            <option key={t} value={t} className="bg-white dark:bg-black">
              {t}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}
