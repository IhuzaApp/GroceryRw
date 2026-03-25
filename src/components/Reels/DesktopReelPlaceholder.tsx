import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Home, ChevronUp, ChevronDown } from "lucide-react";
import RootLayout from "@components/ui/layout";

export default function DesktopReelPlaceholder() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const sidebarBgColor = isDark ? "rgba(31, 41, 55, 0.4)" : "rgba(255, 255, 255, 0.4)";
    const borderColor = isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.3)";
    const commentBgColor = isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(243, 244, 246, 0.5)";

    return (
        <RootLayout>
            <div className={`relative min-h-screen w-full overflow-hidden ${isDark ? "bg-black" : "bg-gray-100"}`}>
                {/* Navigation - Back to Home (Non-pulsing) */}
                <div className="fixed left-8 top-1/2 z-50 -translate-y-1/2 space-y-4 opacity-50">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl ${isDark
                                ? "border-gray-700 bg-gray-900/40 text-gray-500"
                                : "border-white/40 bg-white/40 text-gray-400"
                            }`}
                    >
                        <Home size={28} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 mx-auto flex h-screen w-full items-center justify-center px-4 py-6 lg:gap-8 xl:gap-12">
                    {/* Video Reel Container Skeleton */}
                    <div className="relative flex flex-col items-center animate-pulse">
                        <div
                            className={`relative aspect-[9/16] h-[90vh] overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
                                }`}
                            style={{
                                width: "calc(90vh * 9/16)",
                                maxWidth: "28rem",
                            }}
                        >
                            {/* Fake Video Content Area */}
                            <div className={`absolute inset-0 ${isDark ? "bg-gray-800/40" : "bg-gray-200/40"}`} />

                            {/* Floating Action Buttons Skeleton (Right Side) */}
                            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
                                <div className={`h-12 w-12 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                <div className={`h-12 w-12 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                <div className={`h-12 w-12 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                            </div>

                            {/* Video Info Skeleton (Bottom Left) */}
                            <div className="absolute bottom-6 left-4 right-20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                    <div className={`h-4 w-32 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                </div>
                                <div className={`h-3 w-3/4 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                <div className={`h-3 w-1/2 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                            </div>
                        </div>

                        {/* Floating Navigation Controls Skeleton */}
                        <div className="mt-6 flex gap-4 opacity-50">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md ${isDark
                                        ? "border-gray-700 bg-gray-900/40 text-gray-600"
                                        : "border-white/40 bg-white/40 text-gray-300"
                                    }`}
                            >
                                <ChevronUp size={24} />
                            </div>
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md ${isDark
                                        ? "border-gray-700 bg-gray-900/40 text-gray-600"
                                        : "border-white/40 bg-white/40 text-gray-300"
                                    }`}
                            >
                                <ChevronDown size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Comments Sidebar Skeleton */}
                    <div className="flex h-[90vh] w-full max-w-[500px] flex-col animate-pulse">
                        <div
                            style={{
                                width: "100%",
                                height: "90vh",
                                backgroundColor: sidebarBgColor,
                                backdropFilter: "blur(30px)",
                                WebkitBackdropFilter: "blur(30px)",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "2rem",
                                border: `1px solid ${borderColor}`,
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden",
                            }}
                        >
                            {/* Header */}
                            <div className={`flex items-center justify-between p-6 ${isDark ? "bg-black/20" : "bg-white/20"}`} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                <div className={`h-6 w-32 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                <div className={`h-6 w-12 rounded-full ${isDark ? "bg-gray-700/50" : "bg-gray-200"}`} />
                            </div>

                            {/* Comments List Skeleton */}
                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`h-10 w-10 shrink-0 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} style={{ border: `2px solid ${borderColor}` }} />
                                        <div className="flex-1 space-y-3">
                                            <div
                                                style={{ backgroundColor: commentBgColor, borderRadius: "18px", padding: "12px 16px" }}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-4 w-24 rounded-md ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />
                                                </div>
                                                <div className={`h-3 w-5/6 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                                <div className={`h-3 w-2/3 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                            </div>
                                            <div className="flex items-center gap-4 pl-2">
                                                <div className={`h-2 w-12 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                                <div className={`h-3 w-4 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comment Input Skeleton */}
                            <div className={`p-6 ${isDark ? "bg-black/30" : "bg-white/30"}`} style={{ borderTop: `1px solid ${borderColor}` }}>
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 shrink-0 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} style={{ border: `2px solid ${borderColor}` }} />
                                    <div
                                        className="flex flex-1 items-center justify-between rounded-full px-4 py-2"
                                        style={{ backgroundColor: commentBgColor, border: `1px solid ${borderColor}` }}
                                    >
                                        <div className={`h-4 w-32 rounded-md ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                                        <div className={`h-9 w-9 rounded-full ${isDark ? "bg-blue-600/50" : "bg-blue-200"}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RootLayout>
    );
}
