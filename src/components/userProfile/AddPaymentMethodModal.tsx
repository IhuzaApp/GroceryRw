import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import toast from "react-hot-toast";

interface AddPaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [method, setMethod] = useState<"Visa" | "Mastercard" | "MTN MoMo" | "Airtel">("Visa");
    const [names, setNames] = useState("");
    const [number, setNumber] = useState("");
    const [ccv, setCcv] = useState("");
    const [validity, setValidity] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isOpen || !isMounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/queries/payment-methods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    method,
                    names,
                    number,
                    CCV: ccv,
                    validity,
                    is_default: isDefault,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add payment method");

            toast.success(t("payment.addSuccess") || "Payment method added successfully!");
            onSuccess();
            onClose();
            // Reset form
            setNames("");
            setNumber("");
            setCcv("");
            setValidity("");
            setIsDefault(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isMobileMoney = method === "MTN MoMo" || method === "Airtel";

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity sm:items-center sm:p-4">
            <div
                className={`w-full max-w-lg transform rounded-t-[2.5rem] p-8 shadow-2xl transition-all sm:rounded-[2rem] ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                    }`}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight">{t("payment.addMethod") || "Add Payment Method"}</h3>
                    <button onClick={onClose} className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Method Selection */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {(["Visa", "Mastercard", "MTN MoMo", "Airtel"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m)}
                                className={`flex flex-col items-center justify-center rounded-2xl border-2 py-4 transition-all ${method === m
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                    : "border-gray-100 bg-gray-50 hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50"
                                    }`}
                            >
                                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black !text-white shadow-lg ${m === "Visa" ? "bg-blue-600" :
                                    m === "Mastercard" ? "bg-orange-500" :
                                        m === "MTN MoMo" ? "bg-yellow-500 !text-black" :
                                            "bg-red-600"
                                    }`}>
                                    {m === "Visa" ? "VISA" : m === "Mastercard" ? "MC" : m === "MTN MoMo" ? "MTN" : "AIRTEL"}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{m.split(" ")[0]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">{t("payment.cardHolder") || "Names on Account"}</label>
                            <input
                                required
                                type="text"
                                value={names}
                                onChange={(e) => setNames(e.target.value)}
                                placeholder="John Doe"
                                className={`w-full rounded-2xl border-2 px-5 py-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${theme === "dark" ? "border-gray-800 bg-gray-800 focus:border-green-500" : "border-gray-100 bg-gray-50 focus:border-green-500"
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">{isMobileMoney ? (t("payment.phoneNumber") || "Phone Number") : (t("payment.cardNumber") || "Card Number")}</label>
                            <input
                                required
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder={isMobileMoney ? "0780000000" : "**** **** **** 1234"}
                                className={`w-full rounded-2xl border-2 px-5 py-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${theme === "dark" ? "border-gray-800 bg-gray-800 focus:border-green-500" : "border-gray-100 bg-gray-50 focus:border-green-500"
                                    }`}
                            />
                        </div>

                        {!isMobileMoney && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">{t("payment.expiry") || "Expiry Date"}</label>
                                    <input
                                        required
                                        type="text"
                                        value={validity}
                                        onChange={(e) => setValidity(e.target.value)}
                                        placeholder="MM/YY"
                                        className={`w-full rounded-2xl border-2 px-5 py-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${theme === "dark" ? "border-gray-800 bg-gray-800 focus:border-green-500" : "border-gray-100 bg-gray-50 focus:border-green-500"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">CVV</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={4}
                                        value={ccv}
                                        onChange={(e) => setCcv(e.target.value)}
                                        placeholder="123"
                                        className={`w-full rounded-2xl border-2 px-5 py-2.5 text-xs font-medium transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 ${theme === "dark" ? "border-gray-800 bg-gray-800 focus:border-green-500" : "border-gray-100 bg-gray-50 focus:border-green-500"
                                            }`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <button
                            type="button"
                            onClick={() => setIsDefault(!isDefault)}
                            className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${isDefault ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${isDefault ? "translate-x-5" : "translate-x-1"
                                    }`}
                            />
                        </button>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{t("payment.setAsDefault") || "Set as default payment method"}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-[1.2rem] bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-xs font-black uppercase tracking-widest !text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            t("payment.saveMethod") || "Save Payment Method"
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddPaymentMethodModal;
