"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

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
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            // 獲取會員資料確認是否為管理員
            const userResponse = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/users/me`, {
                headers: {
                    "Authorization": `Bearer ${data.access_token}`
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();

                if (!userData.is_admin) {
                    alert("您沒有管理員權限，無法登入中台。");
                    setIsLoading(false);
                    return;
                }

                // 儲存 token 到專屬的 adminToken
                localStorage.setItem("adminToken", data.access_token);
                
                // 儲存管理員資料
                localStorage.setItem("adminData", JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                }));

                // 檢查是否有跳轉參數
                const urlParams = new URLSearchParams(window.location.search);
                const redirectPath = urlParams.get("redirect") || "/admin";

                router.push(redirectPath);
            } else {
                alert("無法取得帳號權限資料");
            }
        } catch (error) {
            console.error("Admin Login failed:", error);
            alert("登入過程中發生錯誤，請稍後再試。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center py-20 px-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-2xl">M</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-2">
                            中台管理系統
                        </h1>
                        <p className="text-slate-400">
                            Mososhop 內部人員專屬通道
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                管理員帳號
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="admin@mososhop.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                密碼
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all ${isLoading ? "opacity-70 cursor-not-allowed" : "transform hover:scale-[1.02]"}`}
                        >
                            {isLoading ? "驗證中..." : "安全登入"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
