"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, History, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface Transaction {
    id: string;
    type: "earn" | "spend" | "deposit";
    amount: number;
    description: string;
    date: string;
    status: "completed" | "pending";
}

export default function MemberWalletPage() {
    const [mosoCoin, setMosoCoin] = useState(1000);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // 從 localStorage 讀取最新資料（僅為輔助顯示）
        const savedData = localStorage.getItem("memberData");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.mosoCoin !== undefined) {
                // 先不依賴 localStorage 的舊資料，以防覆蓋
            }
        }

        // 呼叫真實 API 取得錢包資料
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`http://localhost:8000/wallets/me?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    // 設定 Moso 幣餘額，無條件進位成整數
                    setMosoCoin(Math.ceil(res.data.moso_coin || 0));

                    // 處理並排序交易紀錄
                    const apiTxns = res.data.transactions || [];

                    // 排序：最新的排前面
                    apiTxns.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    const mappedTxns = apiTxns.map((txn: any) => {
                        // 對應 transaction_type 到描述
                        let desc = "系統調整";
                        if (txn.transaction_type === "spend") desc = "消費折抵";
                        if (txn.transaction_type === "reward") desc = "消費回饋";
                        if (txn.transaction_type === "refund") desc = "退款轉入";
                        if (txn.transaction_type === "reward_revert") desc = "回饋扣回";
                        if (txn.transaction_type === "deposit") desc = "現金儲值";

                        // 判斷類型（收入或支出）
                        const tType = txn.amount >= 0 ? "earn" : "spend";

                        return {
                            id: txn.id.substring(0, 8).toUpperCase(), // 顯示部分 ID 作為參考
                            type: tType,
                            amount: Math.abs(txn.amount), // 取絕對值，前端會依 type 補上正負號
                            description: desc, // 根據需求，只顯示中文狀態，不顯示 reference_id
                            date: new Date(txn.created_at).toLocaleDateString("zh-TW", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
                            status: "completed"
                        };
                    });

                    setTransactions(mappedTxns);
                })
                .catch(err => {
                    console.error("無法取得錢包資料：", err);
                });
        }
    }, []);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "earn":
            case "deposit":
                return <ArrowDownLeft className="text-green-500" size={20} />;
            case "spend":
                return <ArrowUpRight className="text-red-500" size={20} />;
            default:
                return <Clock className="text-slate-500" size={20} />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case "earn":
            case "deposit":
                return "text-green-500";
            case "spend":
                return "text-red-500";
            default:
                return "text-slate-500";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">

                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            <Wallet className="text-moso-pink" size={32} />
                            Moso 幣錢包
                        </h1>
                        <Link href="/member/profile" className="text-slate-500 hover:text-moso-pink transition-colors text-sm font-medium">
                            返回會員中心
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        {/* 錢包餘額卡片 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="md:col-span-3 bg-gradient-to-br from-moso-pink to-moso-gold rounded-3xl shadow-lg overflow-hidden text-white"
                        >
                            <div className="p-8 md:p-10 relative">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <Wallet size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-white/80 text-lg font-medium mb-2">可用餘額</p>
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-5xl md:text-6xl font-extrabold">
                                            {mosoCoin.toLocaleString()}
                                        </span>
                                        <span className="text-xl font-medium">Moso 幣</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm text-sm">
                                        <AlertCircle size={16} />
                                        <span>1 Moso 幣 = 1 元新台幣，無使用期限可全額折抵</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 交易紀錄區塊 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                            <History className="text-slate-500 dark:text-slate-400" size={24} />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">交易紀錄</h2>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {transactions.length > 0 ? (
                                transactions.map((txn) => (
                                    <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                {getTransactionIcon(txn.type)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white mb-1">{txn.description}</p>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{txn.date}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                        {txn.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-xl font-bold ${getTransactionColor(txn.type)}`}>
                                            {txn.type === "spend" ? "-" : "+"}{txn.amount}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-slate-500 dark:text-slate-400">
                                    <p>目前沒有交易紀錄</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
