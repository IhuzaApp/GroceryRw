import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

function ThemeAwareLogo() {
    const { theme } = useTheme();
    return (
        <div className="mb-8 flex justify-center">
            <Image
                src="/assets/logos/PlasLogo.svg"
                alt="Plas Logo"
                width={200}
                height={90}
                className={`h-20 w-auto transition-all duration-200 ${theme === "dark" ? "brightness-0 invert" : ""
                    }`}
            />
        </div>
    );
}

export default function CompleteProfile() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { name: queryName, email: queryEmail, image: queryImage } = router.query;

    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("male");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.isProfileComplete) {
            router.push("/");
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }

        setIsLoading(true);
        try {
            if (status === "authenticated") {
                // Existing user updating profile
                const res = await fetch("/api/auth/complete-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, gender }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to update profile");

                toast.success("Profile updated successfully!");
                await update();
                router.push("/");
            } else {
                // New user registering via Google redirect
                if (!queryEmail || !queryName) {
                    throw new Error("Missing registration details. Please try signing in again.");
                }

                const res = await fetch("/api/auth/register-google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: queryName,
                        email: queryEmail,
                        image: queryImage,
                        phone,
                        gender
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Registration failed");

                toast.success("Account created successfully! Signing you in...");

                // Now sign in with Google - since the user now exists in DB, it will succeed
                await signIn("google", { callbackUrl: "/" });
            }
        } catch (err: any) {
            console.error("Profile completion error:", err);
            toast.error(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") return null;

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <ThemeAwareLogo />
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                            Complete Your Profile
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 text-center">
                            Just a few more details to get you started with Plas
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 py-3 px-4 text-gray-900 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Gender
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 py-3 px-4 text-gray-900 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    "Complete Profile"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
