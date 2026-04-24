"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

// 定義訂單狀態對應的顏色和圖示
const getStatusConfig = (status: string) => {
    switch (status) {
        case "pending":
            return { label: "處理中", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", icon: <Clock size={16} /> };
        case "shipped":
            return { label: "已出貨", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", icon: <Truck size={16} /> };
        case "completed":
            return { label: "已完成", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", icon: <CheckCircle2 size={16} /> };
        case "cancelled":
            return { label: "已取消", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", icon: <AlertCircle size={16} /> };
        case "處理中":
            return { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", icon: <Clock size={16} /> };
        case "已出貨":
            return { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", icon: <Truck size={16} /> };
        case "已完成":
            return { color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", icon: <CheckCircle2 size={16} /> };
        case "已取消":
            return { color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", icon: <AlertCircle size={16} /> };
        default:
            return { label: status, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", icon: <Package size={16} /> };
    }
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8000/orders/me?skip=0&limit=50`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("無法取得訂單資料：", err);
                setLoading(false);
            });
    }, []);

    // 根據標籤過濾訂單
    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "processing") return order.status === "pending" || order.status === "處理中";
        if (activeTab === "shipped") return order.status === "shipped" || order.status === "已出貨";
        if (activeTab === "completed") return order.status === "completed" || order.status === "已完成";
        if (activeTab === "cancelled") return order.status === "cancelled" || order.status === "已取消";
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
            <div className="container mx-auto px-4 md:px-6">

                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/member/profile"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-moso-pink transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        返回會員中心
                    </Link>

                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">我的訂單</h1>

                    {/* 分頁標籤 */}
                    <div className="flex overflow-x-auto pb-2 mb-6 gap-2 hide-scrollbar">
                        {[
                            { id: "all", label: "全部訂單" },
                            { id: "processing", label: "處理中" },
                            { id: "shipped", label: "已出貨" },
                            { id: "completed", label: "已完成" },
                            { id: "cancelled", label: "已取消" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 訂單列表 */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moso-pink"></div>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => {
                                const statusConfig = getStatusConfig(order.status);

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                                    >
                                        {/* 訂單標頭 */}
                                        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{order.id}</span>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    訂購日期：{new Date(order.created_at || new Date()).toLocaleString("zh-TW")}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {(order.status === "pending" || order.status === "處理中") && (order.payment_method === "ecpay" || order.payment_method === "綠界") && (
                                                    <a
                                                        href={`http://localhost:8000/payments/ecpay/checkout/${order.id}?t=${Date.now()}`}
                                                        className="px-4 py-1.5 bg-moso-pink hover:bg-moso-red text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap shadow-sm"
                                                    >
                                                        前往綠界結帳
                                                    </a>
                                                )}
                                                <button className="text-sm font-medium text-moso-pink hover:text-moso-red transition-colors whitespace-nowrap">
                                                    查看詳情
                                                </button>
                                            </div>
                                        </div>

                                        {/* 訂單商品 */}
                                        <div className="p-4 md:p-6 space-y-4">
                                            {order.items && order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product_id ? "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200" : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200"}
                                                            alt={`商品 ${item.product_id}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base font-bold text-slate-800 dark:text-white truncate">商品 ID: {item.product_id}</h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">數量：{item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-slate-900 dark:text-white">NT$ {(item.price || 0).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!order.items || order.items.length === 0) && (
                                                <div className="text-sm text-slate-500">此訂單沒有商品明細。</div>
                                            )}
                                        </div>

                                        {/* 訂單總計與 Moso 幣資訊 */}
                                        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <div className="text-slate-500">
                                                    付款方式：<span className="font-semibold text-slate-700 dark:text-slate-300">{order.payment_method || "信用卡"}</span>
                                                </div>
                                                <div className="text-slate-500">
                                                    運送方式：<span className="font-semibold text-slate-700 dark:text-slate-300">{order.shipping_method || "宅配"}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg">
                                                <span className="text-slate-500 dark:text-slate-400 text-sm mr-2">訂單總額</span>
                                                <span className="font-extrabold text-moso-red">NT$ {(order.total_amount || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mb-4">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">目前沒有相關訂單</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">您還沒有建立此狀態的訂單，去逛逛有什麼想買的吧！</p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-moso-pink hover:bg-moso-red text-white font-bold rounded-full transition-colors"
                                >
                                    去購物
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
