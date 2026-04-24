
"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Star, CheckCircle, Shield, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 透過 API 取得 GCP 資料庫內的單一商品資料
        axios.get(`http://localhost:8000/products/${productId}`)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("無法取得商品資料：", err);
                setLoading(false);
            });
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-moso-pink mb-4"></div>
                <p className="text-slate-500">正在載入商品資訊...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">找不到此商品</h2>
                <p className="text-slate-500 mb-8">該商品可能已下架或網址有誤。</p>
                <Link href="/" className="px-6 py-3 bg-moso-pink text-white rounded-full hover:bg-moso-red transition-colors">
                    回首頁逛逛
                </Link>
            </div>
        );
    }

    const imageUrl = product.images && product.images.length > 0
        ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images[0])
        : "https://via.placeholder.com/800";

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-10">
            <div className="container mx-auto px-4 md:px-6">
                {/* 面包屑導覽 */}
                <div className="text-sm text-slate-500 mb-6 flex gap-2">
                    <Link href="/" className="hover:text-moso-pink">首頁</Link>
                    <span>/</span>
                    <Link href={`/category/${product.category}`} className="hover:text-moso-pink">{product.category || "未分類"}</Link>
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-300 truncate w-48">{product.name}</span>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 mb-10">
                    <div className="flex flex-col md:flex-row gap-10">

                        {/* 左側：商品圖片 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                                <div className="absolute top-4 left-4 z-10 bg-moso-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                    回饋 10%
                                </div>
                                <button className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-moso-pink shadow-md transition-colors">
                                    <Heart size={24} />
                                </button>
                                <img src={product.images ? (typeof product.images === 'string' ? (JSON.parse(product.images)[0] || "https://via.placeholder.com/800") : (product.images[0] || "https://via.placeholder.com/800")) : "https://via.placeholder.com/800"} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                        </motion.div>

                        {/* 右側：商品資訊 */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full md:w-1/2 flex flex-col"
                        >
                            <div className="mb-2 text-moso-pink font-semibold text-sm tracking-wide">{product.category || "未分類"}</div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                    <Star className="text-moso-gold fill-moso-gold" size={18} />
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{product.rating || 5.0}</span>
                                </div>
                                <span className="text-sm text-slate-500">已售出 1,234 件</span>
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded-sm font-medium">在庫充足 ({product.stock || 99})</span>
                            </div>

                            <div className="mb-8">
                                <span className="text-sm text-slate-500 line-through mb-1 block">原價 NT$ {Math.round(product.price * 1.2 * 1.2).toLocaleString()}</span>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-black text-moso-red">NT$ {Math.round(product.price * 1.2).toLocaleString()}</span>
                                    <span className="text-sm font-medium text-moso-pink bg-moso-pink/10 px-2 py-1 rounded-md mb-1">
                                        購買可賺 {Math.round(product.price * 1.2 * 0.1).toLocaleString()} Moso 幣
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span>支援 Moso 幣全額折抵</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <Shield size={20} className="text-blue-500" />
                                    <span>100% 正品保證，假一賠十</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <Truck size={20} className="text-moso-gold" />
                                    <span>VIP 會員享 24 小時快速到貨免運費</span>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-4">
                                <button
                                    onClick={() => {
                                        const existingCartStr = localStorage.getItem("moso_cart");
                                        let cartItems = [];
                                        if (existingCartStr) {
                                            try {
                                                cartItems = JSON.parse(existingCartStr);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id);
                                        if (existingItemIndex !== -1) {
                                            cartItems[existingItemIndex].quantity += 1;
                                        } else {
                                            cartItems.push({
                                                id: product.id,
                                                name: product.name,
                                                price: Math.round(product.price * 1.2),
                                                quantity: 1,
                                                image: imageUrl,
                                                temperature: product.temperature_layer || product.temperature || 'frozen'
                                            });
                                        }
                                        localStorage.setItem("moso_cart", JSON.stringify(cartItems));
                                        // 觸發自定義事件讓 Header 更新
                                        window.dispatchEvent(new Event("cart_updated"));
                                        alert("已加入購物車！");
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={20} />
                                    加入購物車
                                </button>
                                <button
                                    onClick={() => {
                                        const existingCartStr = localStorage.getItem("moso_cart");
                                        let cartItems = [];
                                        if (existingCartStr) {
                                            try {
                                                cartItems = JSON.parse(existingCartStr);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id);
                                        if (existingItemIndex !== -1) {
                                            cartItems[existingItemIndex].quantity += 1;
                                        } else {
                                            cartItems.push({
                                                id: product.id,
                                                name: product.name,
                                                price: Math.round(product.price * 1.2),
                                                quantity: 1,
                                                image: imageUrl,
                                                temperature: product.temperature_layer || product.temperature || 'frozen'
                                            });
                                        }
                                        localStorage.setItem("moso_cart", JSON.stringify(cartItems));
                                        window.dispatchEvent(new Event("cart_updated"));
                                        window.location.href = "/cart";
                                    }}
                                    className="flex-1 bg-gradient-to-r from-moso-pink to-moso-red hover:opacity-90 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-moso-pink/30 transition-all transform hover:scale-105"
                                >
                                    立即結帳
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* 商品詳情描述區塊 */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        商品詳細資訊
                    </h2>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">
                        {product.description || "暫無詳細商品描述。"}
                    </div>
                </div>
            </div>
        </div>
    );
}
