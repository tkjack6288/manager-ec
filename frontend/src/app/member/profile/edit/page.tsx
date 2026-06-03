"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileEditPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // 初始化 formData
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        address: ""
    });

    useEffect(() => {
        // 從 localStorage 讀取或給予預設假資料
        const savedData = localStorage.getItem("memberData");
        if (savedData) {
            setFormData(JSON.parse(savedData));
        } else {
            const defaultData = {
                name: "測試會員",
                email: "test@example.com",
                phone: "0912345678",
                birthday: "1990-01-01",
                address: "台北市信義區信義路五段7號"
            };
            setFormData(defaultData);
            localStorage.setItem("memberData", JSON.stringify(defaultData));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem("token");
            if (token) {
                // 同步更新至後端資料庫
                const res = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/users/me`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: formData.name })
                });

                if (!res.ok) {
                    console.warn("後端更新失敗");
                }
            }

            // 同時儲存資料到 localStorage
            localStorage.setItem("memberData", JSON.stringify(formData));
            console.log("Saved Profile:", formData);

            // 儲存成功後可導回會員中心
            router.push("/member/profile");
        } catch (error) {
            console.error("儲存發生錯誤", error);
            alert("儲存發生錯誤");
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">個人資料設定</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                更新您的基本資訊與聯絡方式
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                            {/* 頭像設定區域 */}
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="w-20 h-20 bg-gradient-to-tr from-moso-pink to-moso-gold rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                                    {formData.name ? formData.name.charAt(0) : "U"}
                                </div>
                                <div>
                                    <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors">
                                        更換頭像
                                    </button>
                                    <p className="text-xs text-slate-500 mt-2">支援 JPG、PNG，最大不超過 5MB</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* 姓名 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        姓名
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                        required
                                    />
                                </div>

                                {/* 電子郵件 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" />
                                        電子郵件 (帳號)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        readOnly
                                        disabled
                                    />
                                    <p className="text-xs text-slate-500">電子郵件作為登入帳號，無法直接修改</p>
                                </div>

                                {/* 手機號碼 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400" />
                                        手機號碼
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                                    />
                                </div>

                                {/* 生日 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        生日
                                    </label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* 寄送地址 */}
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" />
                                    預設寄送地址
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moso-pink resize-none"
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
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
                                            儲存變更
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
