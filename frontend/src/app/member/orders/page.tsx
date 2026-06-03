/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, AlertCircle, Store, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";

// 定義訂單狀態對應的顏色和圖示
const getStatusConfig = (status: string) => {
    switch (status) {
        case "pending":
        case "paid":
            return { label: "處理中", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", icon: <Clock size={16} /> };
        case "shipped":
        case "shipping":
            return { label: "已出貨", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", icon: <Truck size={16} /> };
        case "completed":
            return { label: "已完成", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", icon: <CheckCircle2 size={16} /> };
        case "cancelled":
            return { label: "已取消", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", icon: <AlertCircle size={16} /> };
        case "returning":
            return { label: "申請退貨中", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", icon: <Clock size={16} /> };
        case "return_cancelled":
            return { label: "客戶取消退貨", color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", icon: <AlertCircle size={16} /> };
        case "處理中":
            return { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", icon: <Clock size={16} /> };
        case "已出貨":
            return { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", icon: <Truck size={16} /> };
        case "已完成":
            return { color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", icon: <CheckCircle2 size={16} /> };
        case "已取消":
            return { color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", icon: <AlertCircle size={16} /> };
        case "returned":
        case "已退貨":
            return { label: "已退貨", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", icon: <AlertCircle size={16} /> };
        default:
            return { label: status, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10", icon: <Package size={16} /> };
    }
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState("不想買了");
    const [cancelNote, setCancelNote] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    const [returnModalOrder, setReturnModalOrder] = useState<any>(null);
    const [returnReason, setReturnReason] = useState("");
    const [returnNote, setReturnNote] = useState("");
    const [isReturning, setIsReturning] = useState(false);

    const [isCancellingReturn, setIsCancellingReturn] = useState(false);

    const [reviewModalItem, setReviewModalItem] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [rewardCoin, setRewardCoin] = useState(50);
    const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/admin/settings`)
            .then(res => {
                if (res.data && res.data.review_reward_coin !== undefined) {
                    setRewardCoin(res.data.review_reward_coin);
                }
            })
            .catch(err => console.error("無法取得設定", err));
    }, []);

    const fetchOrders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);

        axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/orders/me?skip=0&limit=50&t=${Date.now()}`, {
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
    };

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const handleCancelOrder = async () => {
        if (!cancelModalOrder) return;
        try {
            setIsCancelling(true);
            const token = localStorage.getItem("token");
            await axios.put(`https://manager-ec-backend-164815154526.asia-east1.run.app/orders/${cancelModalOrder.id}/cancel`, {
                cancel_reason: cancelReason,
                cancel_note: cancelNote
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("訂單已成功取消！Moso 幣已退回您的錢包，刷卡金額將透過綠界進行退刷作業。");
            setCancelModalOrder(null);
            setSelectedOrder(null);
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("取消訂單失敗");
        } finally {
            setIsCancelling(false);
        }
    };

    // 根據標籤過濾訂單
    const handleReturnOrder = async () => {
        if (!returnModalOrder) return;
        try {
            setIsReturning(true);
            const token = localStorage.getItem("token");
            await axios.put(`https://manager-ec-backend-164815154526.asia-east1.run.app/orders/${returnModalOrder.id}/return`, {
                cancel_reason: returnReason,
                cancel_note: returnReason === "其他" ? returnNote : ""
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("退貨申請已送出！待我們收到您寄回的商品並確認無誤後，將隨即為您處理後續退款作業（包含退回 Moso 幣與綠界信用卡退刷）。");
            setReturnModalOrder(null);
            setSelectedOrder(null);
            fetchOrders();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || "申請退貨失敗");
        } finally {
            setIsReturning(false);
        }
    };

    const handleCancelReturn = async (orderId: string) => {
        if (!confirm("確定要取消退貨申請嗎？取消後訂單將恢復為原狀態。")) return;
        try {
            setIsCancellingReturn(true);
            const token = localStorage.getItem("token");
            await axios.put(`https://manager-ec-backend-164815154526.asia-east1.run.app/orders/${orderId}/return_cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("退貨申請已取消");
            setSelectedOrder(null);
            fetchOrders();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || "取消退貨失敗");
        } finally {
            setIsCancellingReturn(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewModalItem) return;
        try {
            setIsSubmittingReview(true);
            const token = localStorage.getItem("token");
            await axios.post(`https://manager-ec-backend-164815154526.asia-east1.run.app/products/${reviewModalItem.product_id}/reviews`, {
                order_item_id: reviewModalItem.id,
                rating: reviewRating,
                comment: reviewComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`評價成功！您已獲得 ${rewardCoin} Moso 幣回饋！`);
            setReviewedItems(prev => ({ ...prev, [reviewModalItem.id]: true }));
            setReviewModalItem(null);
            setReviewRating(5);
            setReviewComment("");
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || "評價失敗");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // 根據標籤過濾訂單
    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "processing") return order.status === "pending" || order.status === "paid" || order.status === "處理中";
        if (activeTab === "shipped") return order.status === "shipped" || order.status === "shipping" || order.status === "已出貨";
        if (activeTab === "completed") return order.status === "completed" || order.status === "已完成" || order.status === "returned" || order.status === "已退貨" || order.status === "returning" || order.status === "return_cancelled";
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
                            { id: "completed", label: "已完成/已退貨" },
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
                                                        href={`https://manager-ec-backend-164815154526.asia-east1.run.app/payments/ecpay/checkout/${order.id}?t=${Date.now()}`}
                                                        className="px-4 py-1.5 bg-moso-pink hover:bg-moso-red text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap shadow-sm"
                                                    >
                                                        前往綠界結帳
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-sm font-medium text-moso-pink hover:text-moso-red transition-colors whitespace-nowrap"
                                                >
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
                                                            src={item.product_image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200"}
                                                            alt={`商品 ${item.product_id}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <a href={`/product/${item.product_id}`} target="_blank" rel="noopener noreferrer" className="inline-block">
                                                            <h4 className="text-base font-bold text-slate-800 dark:text-white truncate hover:text-moso-pink transition-colors">
                                                                {item.product_name ? `${item.product_name}` : `商品 ID: ${item.product_id}`}
                                                            </h4>
                                                        </a>
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

            {/* 訂單詳情 Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        key="details-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Package className="text-moso-pink" />
                                    訂單詳情
                                </h2>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="space-y-6">
                                    {/* 基本資訊 */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-slate-500 dark:text-slate-400 mb-1">訂單編號</div>
                                            <div className="font-semibold text-slate-800 dark:text-white">{selectedOrder.id}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 dark:text-slate-400 mb-1">訂購日期</div>
                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                {new Date(selectedOrder.created_at || new Date()).toLocaleString("zh-TW")}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 dark:text-slate-400 mb-1">訂單狀態</div>
                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                {getStatusConfig(selectedOrder.status).label}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 dark:text-slate-400 mb-1">付款方式</div>
                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                {selectedOrder.payment_method === "wallet" ? "全額抵扣" : selectedOrder.payment_method || "信用卡"}
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-700" />

                                    {/* 配送資訊 */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">配送資訊</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex gap-2">
                                                <span className="text-slate-500 dark:text-slate-400 min-w-[64px]">收件人</span>
                                                <span className="font-semibold text-slate-800 dark:text-white">{selectedOrder.shipping_name || "-"}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-slate-500 dark:text-slate-400 min-w-[64px]">聯絡電話</span>
                                                <span className="font-semibold text-slate-800 dark:text-white">{selectedOrder.shipping_phone || "-"}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-slate-500 dark:text-slate-400 min-w-[64px]">配送地址</span>
                                                <span className="font-semibold text-slate-800 dark:text-white">{selectedOrder.shipping_address || "-"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-700" />

                                    {/* 商品明細 */}
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">商品明細</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                                                            {item.quantity}x
                                                        </span>
                                                        <a
                                                            href={`/product/${item.product_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-700 dark:text-slate-300 hover:text-moso-pink hover:underline transition-colors"
                                                        >
                                                            {item.product_name ? `${item.product_name}` : `商品 ID: ${item.product_id}`}
                                                        </a>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="font-medium text-slate-800 dark:text-white">
                                                            NT$ {(item.quantity * (item.price || item.unit_price || 0)).toLocaleString()}
                                                        </div>
                                                        {(selectedOrder.status === "completed" || selectedOrder.status === "已完成") && !reviewedItems[item.id] && (
                                                            <button
                                                                onClick={() => setReviewModalItem(item)}
                                                                className="px-3 py-1 bg-moso-pink text-white text-xs font-bold rounded-lg hover:bg-moso-red transition-colors shadow-sm"
                                                            >
                                                                我要評價
                                                            </button>
                                                        )}
                                                        {reviewedItems[item.id] && (
                                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">已評價</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-700" />

                                    {/* 金額統計 */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                            <span>訂單總額</span>
                                            <span>NT$ {(selectedOrder.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                        {(selectedOrder.moso_coin_used > 0) && (
                                            <div className="flex justify-between items-center text-moso-pink font-medium">
                                                <span>Moso 幣折抵</span>
                                                <span>- NT$ {selectedOrder.moso_coin_used.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                            <span>實付金額</span>
                                            <span className="text-moso-red">NT$ {(selectedOrder.final_paid || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Moso 幣回饋提示 */}
                                    {selectedOrder.reward_moso_coin > 0 && (
                                        <div className="bg-moso-pink/10 border border-moso-pink/20 rounded-xl p-4 flex items-start gap-3">
                                            <div className="p-1.5 bg-moso-pink rounded-full text-white mt-0.5">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-moso-pink">獲得 Moso 幣回饋</h4>
                                                <p className="text-xs text-moso-pink/80 mt-1">
                                                    本筆訂單已為您產生 <strong>{selectedOrder.reward_moso_coin.toLocaleString()}</strong> 元 Moso 幣回饋！
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOrder.status === "returning" && (() => {
                                        const updateDate = new Date(selectedOrder.updated_at || selectedOrder.created_at);
                                        const diffDays = Math.abs(new Date().getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
                                        if (diffDays > 7) {
                                            return (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                                                    <div className="p-1.5 bg-red-500 rounded-full text-white mt-0.5">
                                                        <AlertCircle size={14} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-red-600">退貨提醒</h4>
                                                        <p className="text-xs text-red-500 mt-1">
                                                            此訂單未確認收貨無誤, 請儘快退回商品, 以利後續退款作業
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex justify-between">
                                <div>
                                    {(selectedOrder.status === "pending" || selectedOrder.status === "paid" || selectedOrder.status === "處理中") && (
                                        <button
                                            onClick={() => setCancelModalOrder(selectedOrder)}
                                            className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                                        >
                                            取消訂單
                                        </button>
                                    )}
                                    {(selectedOrder.status === "completed" || selectedOrder.status === "已完成") && (
                                        (() => {
                                            const completedDate = new Date(selectedOrder.updated_at || selectedOrder.created_at);
                                            const now = new Date();
                                            const diffTime = Math.abs(now.getTime() - completedDate.getTime());
                                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                            if (diffDays <= 10) {
                                                return (
                                                    <button
                                                        onClick={() => setReturnModalOrder(selectedOrder)}
                                                        className="px-6 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-medium rounded-lg transition-colors"
                                                    >
                                                        申請退貨
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                    {selectedOrder.status === "returning" && (
                                        <button
                                            onClick={() => handleCancelReturn(selectedOrder.id)}
                                            disabled={isCancellingReturn}
                                            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {isCancellingReturn ? (
                                                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : null}
                                            取消退貨
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    關閉
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 取消訂單 Modal */}
                {cancelModalOrder && (
                    <motion.div
                        key="cancel-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="text-red-500" />
                                    取消訂單
                                </h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    請注意，取消訂單後無法復原。使用的 Moso 幣將退回至您的錢包，刷卡現金部分將自動向綠界金流發起退刷作業。
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">取消原因 <span className="text-red-500">*</span></label>
                                    <select
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-moso-pink outline-none"
                                    >
                                        <option value="不想買了">不想買了</option>
                                        <option value="買錯商品">買錯商品</option>
                                        <option value="配送時間太久">配送時間太久</option>
                                        <option value="其他">其他原因</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">取消說明 (選填)</label>
                                    <textarea
                                        value={cancelNote}
                                        onChange={(e) => setCancelNote(e.target.value)}
                                        placeholder="您可以補充更多資訊..."
                                        rows={3}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-moso-pink outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setCancelModalOrder(null)}
                                    disabled={isCancelling}
                                    className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    返回
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={isCancelling}
                                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isCancelling ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : null}
                                    確認取消並退款
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 退貨訂單 Modal */}
                {returnModalOrder && (
                    <motion.div
                        key="return-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="text-purple-500" />
                                    申請退貨
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">退貨原因 <span className="text-red-500">*</span></label>
                                    <select
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-moso-pink outline-none"
                                    >
                                        <option value="" disabled>請選擇退貨原因</option>
                                        <option value="商品瑕疵">商品瑕疵</option>
                                        <option value="商品不符">商品不符</option>
                                        <option value="尺寸不合">尺寸不合</option>
                                        <option value="不想買了">不想買了</option>
                                        <option value="其他">其他原因</option>
                                    </select>
                                </div>
                                {returnReason === "其他" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">請說明退貨原因 <span className="text-red-500">*</span></label>
                                        <textarea
                                            value={returnNote}
                                            onChange={(e) => setReturnNote(e.target.value)}
                                            placeholder="請輸入退貨原因..."
                                            rows={3}
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-moso-pink outline-none resize-none"
                                        ></textarea>
                                    </div>
                                )}
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                                        <Truck size={16} className="text-moso-pink" />
                                        超商退貨資訊
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-2 font-bold text-[#007A3B] mb-2">
                                                <Store size={16} /> 7-ELEVEN 退貨
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 ml-6">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>7-ELEVEN 富邦門市</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Package size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>收件人：翁秀姍</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Phone size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>電話：0988-944-774</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-2 font-bold text-[#00A040] mb-2">
                                                <Store size={16} /> 全家便利商店 退貨
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 ml-6">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>新實店</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Package size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>收件人：翁秀姍</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Phone size={14} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span>電話：0988-944-774</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setReturnModalOrder(null)}
                                    disabled={isReturning}
                                    className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleReturnOrder}
                                    disabled={isReturning || !returnReason || (returnReason === "其他" && !returnNote.trim())}
                                    className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isReturning ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : null}
                                    確認送出
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {/* 評價 Modal */}
                {reviewModalItem && (
                    <motion.div
                        key="review-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    撰寫商品評價
                                </h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    為 <span className="font-bold text-slate-700 dark:text-slate-300">{reviewModalItem.product_name}</span> 留下評價，即可獲得 <span className="font-bold text-moso-pink">{rewardCoin}</span> Moso 幣回饋！
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">評分 (1-5 星) <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className={`text-2xl ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'} hover:scale-110 transition-transform`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">評價內容 (選填)</label>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="請分享您對這個商品的看法..."
                                        rows={4}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-moso-pink outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setReviewModalItem(null)}
                                    disabled={isSubmittingReview}
                                    className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                    className="px-5 py-2 bg-moso-pink hover:bg-moso-red text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSubmittingReview ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : null}
                                    送出評價
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
