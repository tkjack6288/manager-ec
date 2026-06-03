"use client";

import { motion } from "framer-motion";
import { Gift, CheckCircle, Crown, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function VIPPage() {
    const [claimed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 relative overflow-hidden">
            {/* 裝飾背景 */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-moso-pink opacity-20 blur-3xl rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-moso-gold opacity-20 blur-3xl rounded-full"></div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-moso-gold/10 text-moso-gold rounded-full mb-6">
                        <Crown size={48} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                        專屬您的 <span className="text-moso-gold">VIP 千元禮遇</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
                        只要加入 VIP 會員，不僅立即享有 $1,000 購物金，還能獲得終身 10% 回饋無上限的超級特權！
                    </p>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-700">
                        <div className="grid md:grid-cols-2 gap-10 text-left">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <Star className="text-moso-gold fill-moso-gold" />
                                    VIP 尊享特權
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 mt-1 shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">加入即贈 1000 Moso 幣 (等值 NT$1,000)，可立即折抵任何商品。</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 mt-1 shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">全館購物均享 10% 點數回饋，回饋無上限。</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 mt-1 shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">生日當月加碼送 500 元折價券。</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 mt-1 shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">每月專屬會員日，享全館免運及專屬隱藏優惠。</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                <Gift className="text-moso-pink mb-4" size={64} />
                                {claimed ? (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-green-600 dark:text-green-400 font-bold text-xl flex flex-col items-center gap-2"
                                    >
                                        <CheckCircle size={40} className="mb-2" />
                                        領取成功！
                                        <span className="text-sm text-slate-500 font-normal mt-2">
                                            您的 1,000 Moso 幣已經發放至帳戶。
                                        </span>
                                        <Link href="/products" className="mt-4 px-6 py-2 bg-moso-pink text-white rounded-full hover:bg-moso-red transition-colors text-sm font-bold">
                                            立即去購物
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">限時入會禮</h4>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                                            本月加入會員，首購再加贈專屬精美小禮
                                        </p>
                                        <Link href="/member/register" className="w-full inline-block">
                                            <button
                                                className="w-full bg-gradient-to-r from-moso-gold to-yellow-500 hover:opacity-90 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-moso-gold/30 transition-all transform hover:scale-105"
                                            >
                                                加入會員即享優惠
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
