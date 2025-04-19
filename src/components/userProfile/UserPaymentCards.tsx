import React from "react";

export default function UserPaymentCards(){
    return(
        <><h3 className="mb-4 mt-3 text-lg font-bold">
            Your Payment Cards
        </h3><div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Purple Withdrawal Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white shadow-lg">
                    <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <p className="mb-1 text-xs opacity-80">Withdrawal Card</p>
                            <h4 className="font-bold">STOKE WALLET</h4>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-1 h-5 w-8 rounded-sm bg-yellow-400"></div>
                            <div className="h-5 w-8 rounded-sm bg-yellow-500 opacity-70"></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="mb-1 flex items-center">
                            <div className="mr-2 h-6  w-10 rounded-sm bg-opacity-30">
                                <img
                                    className="-mt-3 h-12 w-12"
                                    src="/assets/images/chip.png"
                                    alt="" />
                            </div>
                            <p className="font-mono text-lg tracking-wider">
                                •••• •••• •••• 5678
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-xs opacity-80">Card Holder</p>
                            <p className="font-medium">SARAH JOHNSON</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs opacity-80">Expires</p>
                            <p className="font-medium">09/27</p>
                        </div>
                        <div className="text-right">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-8 w-8 opacity-80"
                            >
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute bottom-3 right-3">
                        <p className="text-xs font-bold opacity-70">
                            WITHDRAWAL ONLY
                        </p>
                    </div>
                </div>

                {/* Green Payment Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-5 text-white shadow-lg">
                    <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <p className="mb-1 text-xs opacity-80">Payment Card</p>
                            <h4 className="font-bold">GROCERY PAY</h4>
                        </div>
                        <div className="flex items-center">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-10 w-10 text-blue-600"
                            >
                                <path d="M10 13.802l-3.38-3.38-1.42 1.42 4.8 4.8 9.19-9.19-1.41-1.41z" />
                                <path d="M19.03 7.39l.97-.97c.29-.29.29-.77 0-1.06l-1.06-1.06c-.29-.29-.77-.29-1.06 0l-.97.97 2.12 2.12z" />
                            </svg>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="mb-1 flex items-center">
                            <div className="mr-2 h-6 w-10 rounded-sm bg-opacity-30">
                                <img
                                    className="-mt-3 h-12 w-12"
                                    src="/assets/images/chip.png"
                                    alt="" />
                            </div>
                            <p className="font-mono text-lg tracking-wider">
                                •••• •••• •••• 1234
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-xs opacity-80">Card Holder</p>
                            <p className="font-medium">SARAH JOHNSON</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs opacity-80">Expires</p>
                            <p className="font-medium">12/26</p>
                        </div>
                        <div className="text-right">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-8 w-8 opacity-80"
                            >
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute bottom-3 right-3">
                        <p className="text-xs font-bold opacity-70">
                            AUTHORIZED PAYMENTS
                        </p>
                    </div>
                </div>
            </div></>
    )
}