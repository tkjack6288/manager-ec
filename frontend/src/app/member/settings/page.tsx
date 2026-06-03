"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Save, Lock, Bell, Mail, Smartphone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        emailPromotions: true,
        smsOrders: true,
        newsletter: false
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem("memberSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.notifications) {
                    setNotifications(parsed.notifications);
                }
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (name: string) => {
        setNotifications(prev => ({ ...prev, [name as keyof typeof prev]: !prev[name as keyof typeof prev] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
            alert("新密碼與確認密碼不相符！");
            return;
        }

        setIsSaving(true);

        try {
            if (passwordData.newPassword) {
                let token = localStorage.getItem("moso_token");
                if (!token) {
                    token = localStorage.getItem("token"); // Fallback check
                }

                if (!token) {
                    alert("登入狀態已過期，請重新登入");
                    router.push("/member/login");
                    return;
                }

                const res = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/users/change-password`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        current_password: passwordData.currentPassword,
                        new_password: passwordData.newPassword
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    alert(error.detail || "密碼更新失敗");
                    setIsSaving(false);
                    return;
                }

                alert("密碼已成功更新！");
                // Clear password fields
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            }

            localStorage.setItem("memberSettings", JSON.stringify({ notifications }));
            if (!passwordData.newPassword) {
                alert("設定已儲存！");
            }
        } catch (error) {
            console.error(error);
            alert("系統錯誤");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
            <div className="container mx-auto px-4 md:px-6">

                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/member/profile"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-moso-pink transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        返回會員中心
                    </Link>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 密碼設定 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                                <Lock className="text-moso-pink" size={20} />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">修改密碼</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">目前密碼</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="請輸入目前的密碼"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">新密碼</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="請輸入新密碼"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">確認新密碼</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="請再次輸入新密碼"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 通知設定 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                                <Bell className="text-moso-gold" size={20} />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">通知設定</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                            <Mail className="text-slate-600 dark:text-slate-300" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Email 優惠通知</p>
                                            <p className="text-sm text-slate-500">接收最新的活動與優惠資訊</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notifications.emailPromotions} onChange={() => handleNotificationChange('emailPromotions')} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-moso-pink"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                            <Smartphone className="text-slate-600 dark:text-slate-300" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">訂單簡訊通知</p>
                                            <p className="text-sm text-slate-500">訂單狀態更新時發送簡訊</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={notifications.smsOrders} onChange={() => handleNotificationChange('smsOrders')} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-moso-pink"></div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* 刪除帳號 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden"
                        >
                            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-600 dark:text-red-400">刪除帳號</h3>
                                        <p className="text-sm text-slate-500">永久刪除您的帳號與所有資料，此動作無法復原。</p>
                                    </div>
                                </div>
                                <button type="button" className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap">
                                    申請刪除帳號
                                </button>
                            </div>
                        </motion.div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push("/member/profile")}
                                className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-moso-pink hover:bg-moso-red text-white font-medium rounded-xl transition-colors disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        儲存設定
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
