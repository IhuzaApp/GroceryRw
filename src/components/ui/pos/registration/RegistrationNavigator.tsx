"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface Step {
    id: number;
    title: string;
    icon: LucideIcon;
}

interface RegistrationNavigatorProps {
    steps: Step[];
    currentStep: number;
}

export default function RegistrationNavigator({
    steps,
    currentStep,
}: RegistrationNavigatorProps) {
    return (
        <div className="mb-12 hidden md:block">
            <div className="flex items-center justify-between">
                {steps.map((s, idx) => (
                    <div key={s.id} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${currentStep >= s.id
                                    ? "border-[#022C22] bg-[#022C22] text-white"
                                    : "border-gray-200 bg-white text-gray-400"
                                    }`}
                            >
                                <s.icon className="h-5 w-5" />
                            </div>
                            <span
                                className={`text-xs font-bold ${currentStep >= s.id ? "text-[#022C22]" : "text-gray-400"
                                    }`}
                            >
                                {s.title}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                className={`h-[2px] flex-1 translate-y-[-12px] transition-all ${currentStep > s.id ? "bg-[#022C22]" : "bg-gray-200"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
