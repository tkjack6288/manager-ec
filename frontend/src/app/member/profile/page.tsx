"use client";

import { motion } from "framer-motion";
import { User, Package, Wallet, Settings, LogOut, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function MemberProfilePage() {
    const router = useRouter();
    // 狀態
    const [memberData, setMemberData] = useState({
        name: "測試會員",
        email: "test@example.com",
        mosoCoin: 1000,
        isVip: true,
        joinDate: "2024-03-22"
    });

    useEffect(() => {
        // 從 localStorage 讀取最新資料
        const savedData = localStorage.getItem("memberData");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMemberData(prev => ({
                ...prev,
                name: parsedData.name,
                email: parsedData.email,
            }));
        }

        // 呼叫 API 取得真實的 Moso 幣餘額
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/wallets/me?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setMemberData(prev => ({
                    ...prev,
                    mosoCoin: Math.ceil(res.data.moso_coin || 0)
                }));
            })
            .catch(err => {
                console.error("無法取得錢包資料：", err);
            });
        }
    }, []);

    const menuItems = [
        { icon: <User size={20} />, label: "個人資料設定", href: "/member/profile/edit" },
        { icon: <Package size={20} />, label: "我的訂單", href: "/member/orders" },
        { icon: <Wallet size={20} />, label: "Moso 幣錢包", href: "/member/wallet" },
        { icon: <Settings size={20} />, label: "帳號設定", href: "/member/settings" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
            <div className="container mx-auto px-4 md:px-6">

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">會員中心</h1>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* 左側：會員資訊卡片 */}
                        <div className="md:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                            >
                                <div className="p-6 text-center border-b border-slate-100 dark:border-slate-700 relative">
                                    {memberData.isVip && (
                                        <div className="absolute top-4 right-4 bg-moso-gold text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <Star size={12} className="fill-white" />
                                            VIP
                                        </div>
                                    )}
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-moso-pink to-moso-gold rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-inner">
                                        {memberData.name.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{memberData.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{memberData.email}</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                                            <Wallet size={18} className="text-moso-pink" />
                                            Moso 幣餘額
                                        </span>
                                        <span className="text-xl font-bold text-moso-red">{memberData.mosoCoin.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">1 Moso 幣 = 1 元新台幣，可全額折抵無上限。</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* 右側：選單與近期動態 */}
                        <div className="md:col-span-2 space-y-8">

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">會員服務</h3>
                                </div>
                                <div>
                                    {menuItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 group"
                                        >
                                            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200 group-hover:text-moso-pink transition-colors">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-moso-pink/10 transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-400 group-hover:text-moso-pink transition-colors" />
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("memberData");
                                            localStorage.removeItem("token");
                                            alert("已成功登出");
                                            router.push("/member/login");
                                        }}
                                        className="w-full flex items-center justify-between p-4 px-6 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-left"
                                    >
                                        <div className="flex items-center gap-4 text-red-500 transition-colors">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg transition-colors">
                                                <LogOut size={20} />
                                            </div>
                                            <span className="font-medium">登出帳號</span>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
