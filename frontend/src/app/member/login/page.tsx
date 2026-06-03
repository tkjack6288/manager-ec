"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 呼叫後端登入 API
            const response = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.detail || "帳號或密碼錯誤");
                return;
            }

            const data = await response.json();

            // 儲存 token
            localStorage.setItem("token", data.access_token);

            // 獲取會員資料
            const userResponse = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/users/me`, {
                headers: {
                    "Authorization": `Bearer ${data.access_token}`
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();

                // 讀取既有 memberData 保留其他模擬資料（如果有的話），並更新真實姓名和 email
                const savedData = localStorage.getItem("memberData");
                let memberData = {
                    name: userData.name || "會員",
                    email: userData.email,
                    phone: "0912345678",
                    birthday: "1990-01-01",
                    address: "台北市信義區信義路五段7號",
                    isVip: userData.is_vip || false,
                    mosoCoin: 0
                };

                if (savedData) {
                    memberData = { ...JSON.parse(savedData), name: userData.name || "會員", email: userData.email, isVip: userData.is_vip || false };
                }

                localStorage.setItem("memberData", JSON.stringify(memberData));

                // 檢查網址是否有跳轉參數
                const urlParams = new URLSearchParams(window.location.search);
                const redirectPath = urlParams.get("redirect") || "/member/profile";

                // 登入後導向指定頁面或會員中心
                router.push(redirectPath);
            } else {
                alert("無法取得會員資料");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("登入過程中發生錯誤，請稍後再試。");
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
                            會員登入
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            歡迎回來！請登入您的帳號
                        </p>
                    </div>

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

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    密碼
                                </label>
                                <Link href="/member/forgot-password" className="text-sm text-moso-pink hover:underline">
                                    忘記密碼？
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-moso-pink to-moso-red hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-moso-pink/30 transition-all transform hover:scale-[1.02]"
                        >
                            登入
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        還沒有帳號嗎？{" "}
                        <Link href="/member/register" className="text-moso-pink font-semibold hover:underline">
                            立即註冊
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
