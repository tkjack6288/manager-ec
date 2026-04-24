"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/users/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                alert("發送重設密碼信件時發生錯誤。");
            }
        } catch (error) {
            console.error(error);
            alert("發送失敗，請確認網路連線。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* 裝飾背景 */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-moso-pink opacity-20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-moso-gold opacity-20 blur-3xl rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                            忘記密碼
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            請輸入您的註冊信箱，我們將寄送重設密碼連結給您。
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    電子郵件
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center bg-gradient-to-r from-moso-pink to-moso-red hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-moso-pink/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "發送重設密碼連結"
                                )}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">信件已寄出</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                請檢查您的信箱 {email} 並點擊信中的連結以重設密碼。如果幾分鐘內沒收到，請檢查垃圾信件匣。
                            </p>
                        </motion.div>
                    )}

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        記起密碼了嗎？{" "}
                        <Link href="/member/login" className="text-moso-pink font-semibold hover:underline">
                            返回登入
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
