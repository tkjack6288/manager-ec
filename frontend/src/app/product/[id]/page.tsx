/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Star, CheckCircle, Sparkles, Key } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import DOMPurify from "dompurify";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [reviews, setReviews] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>("");

    useEffect(() => {
        if (["1", "2", "3", "4"].includes(productId)) {
            const mockProducts: Record<string, any> = {
                "1": { id: "1", name: "頂級降噪藍牙耳機 Pro", category: "3C家電", selling_price: 8388, price: 6990, stock: 10, images: '["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"]', rating: 4.8, description: "頂級降噪體驗，讓您沉浸在音樂的世界中。" },
                "2": { id: "2", name: "微分子保濕精華液 50ml", category: "美妝保養", selling_price: 1536, price: 1280, stock: 20, images: '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"]', rating: 4.9, description: "深層保濕，煥發肌膚光彩。" },
                "3": { id: "3", name: "極究人體工學辦公椅", category: "傢俱", selling_price: 5400, price: 4500, stock: 5, images: '["https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800"]', rating: 4.5, description: "人體工學設計，久坐不累。" },
                "4": { id: "4", name: "手沖咖啡器具套裝", category: "日用生活", selling_price: 3576, price: 2980, stock: 15, images: '["https://images.unsplash.com/photo-1495474472205-51f753c07f46?auto=format&fit=crop&q=80&w=800"]', rating: 4.7, description: "享受手沖咖啡的樂趣。" }
            };
            const data = mockProducts[productId];
            data.variantsList = [];
            setProduct(data);
            setLoading(false);
            return;
        }

        // 透過 API 取得 GCP 資料庫內的單一商品資料
        axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/products/${productId}`)
            .then(res => {
                const data = res.data;
                // Parse variants
                if (data.variants) {
                    try {
                        const parsed = JSON.parse(data.variants);
                        if (Array.isArray(parsed)) {
                            data.variantsList = parsed.map((v: any) => typeof v === 'string' ? { name: v, price: data.price, selling_price: data.selling_price, stock: data.stock } : v);
                            if (data.variantsList.length > 0) {
                                setSelectedVariant(data.variantsList[0].name);
                            }
                        } else if (typeof parsed === "string") {
                            data.variantsList = [{ name: parsed, price: data.price, selling_price: data.selling_price, stock: data.stock }];
                            setSelectedVariant(parsed);
                        }
                    } catch (e) {
                        data.variantsList = [{ name: data.variants, price: data.price, selling_price: data.selling_price, stock: data.stock }];
                        setSelectedVariant(data.variants);
                    }
                } else {
                    data.variantsList = [];
                }
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("無法取得商品資料：", err);
                setLoading(false);
            });

        // 取得商品評價
        axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/products/${productId}/reviews`)
            .then(res => {
                if (res.data && Array.isArray(res.data.reviews)) {
                    setReviews(res.data.reviews);
                } else if (Array.isArray(res.data)) {
                    setReviews(res.data);
                } else {
                    setReviews([]);
                }
            })
            .catch(err => console.error("無法取得商品評價", err));
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

    const imagesList: string[] = (() => {
        if (!product?.images) return ["https://via.placeholder.com/800"];
        try {
            const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["https://via.placeholder.com/800"];
        } catch (e) {
            return [product.images || "https://via.placeholder.com/800"];
        }
    })();
    const imageUrl = imagesList[0];
    const displayImage = selectedImage || imageUrl;

    const activeVariantData = product.variantsList?.find((v: any) => v.name === selectedVariant) || { selling_price: product.selling_price, stock: product.stock };
    const displaySellingPrice = Math.round(activeVariantData.selling_price || 0);
    const displayStock = activeVariantData.stock || 0;
    
    const validReviews = reviews;
    const avgRating = validReviews.length > 0 
        ? (validReviews.reduce((acc, curr) => acc + curr.rating, 0) / validReviews.length).toFixed(1) 
        : "5.0";

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
                            <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 mb-4">
                                <div className="absolute top-4 left-4 z-10 bg-moso-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                    回饋 10%
                                </div>
                                <button className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-moso-pink shadow-md transition-colors">
                                    <Heart size={24} />
                                </button>
                                <img src={displayImage} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                            
                            {/* 縮圖列表 */}
                            {imagesList.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {imagesList.map((img, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setSelectedImage(img)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${displayImage === img ? 'border-moso-pink opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
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
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <Star className="text-moso-gold fill-moso-gold" size={18} />
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{avgRating}</span>
                                    <span className="text-xs text-slate-500 ml-1">({validReviews.length} 則評價)</span>
                                </div>
                                <span className="text-sm text-slate-500">已售出 1,234 件</span>
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded-sm font-medium">
                                    {displayStock > 0 ? `在庫充足 (${displayStock})` : '補貨中'}
                                </span>
                            </div>

                            <div className="mb-8">
                                <span className="text-sm text-slate-500 line-through mb-1 block">原價 NT$ {Math.round(displaySellingPrice * 1.2).toLocaleString()}</span>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-black text-moso-red">NT$ {displaySellingPrice.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-moso-pink bg-moso-pink/10 px-2 py-1 rounded-md mb-1">
                                        購買可賺 {Math.round(displaySellingPrice * 0.1).toLocaleString()} Moso 幣
                                    </span>
                                </div>
                            </div>

                            {/* 多種規格選擇 */}
                            {product.variantsList && product.variantsList.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">請選擇規格</div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variantsList.map((variantObj: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(variantObj.name)}
                                                className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${selectedVariant === variantObj.name
                                                    ? 'border-moso-pink bg-moso-pink/10 text-moso-pink'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                {variantObj.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 尊榮服務區塊 */}
                            <div className="flex flex-col gap-4 mb-8 p-6 relative overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-rose-50/30 border border-amber-200/80 rounded-2xl shadow-[0_8px_30px_-12px_rgba(251,191,36,0.25)] group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
                                
                                {/* 替換特色 1：私人購物顧問 */}
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="mt-1 w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 p-[1px] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                            <Sparkles size={20} className="text-amber-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-800 text-sm tracking-wide">一對一私人購物顧問</div>
                                        <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">為您配置頂級專屬顧問，提供量身打造的風格推薦與生活品味諮詢，盡享極致尊榮。</div>
                                    </div>
                                </div>

                                {/* 替換特色 2：黑卡隱藏版專區 */}
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="mt-1 w-10 h-10 rounded-full bg-gradient-to-br from-moso-pink/60 to-rose-400 p-[1px] flex-shrink-0 shadow-sm">
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                            <Key size={20} className="text-moso-pink" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-800 text-sm tracking-wide">解鎖 VVIP 隱藏版稀世專區</div>
                                        <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">憑藉您的專屬金鑰，開啟僅供頂尖會員鑑賞的非公開選品，彰顯您與眾不同的非凡地位。</div>
                                    </div>
                                </div>

                                {/* 原始特色 3 (Moso幣) 調整為亮色系 */}
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="mt-1 w-10 h-10 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 p-[1px] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                            <CheckCircle size={20} className="text-rose-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-800 text-sm tracking-wide">Moso 幣尊榮全額折抵</div>
                                        <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">無上限的折抵特權與專屬回饋，買越多賺越多，完美彰顯您的財富智慧。</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-4">
                                <button
                                    onClick={() => {
                                        if (displayStock <= 0) {
                                            alert("目前庫存不足");
                                            return;
                                        }
                                        const existingCartStr = localStorage.getItem("moso_cart");
                                        let cartItems = [];
                                        if (existingCartStr) {
                                            try {
                                                cartItems = JSON.parse(existingCartStr);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id && item.variant === selectedVariant);
                                        if (existingItemIndex !== -1) {
                                            cartItems[existingItemIndex].quantity += 1;
                                        } else {
                                            cartItems.push({
                                                id: product.id,
                                                name: product.name,
                                                price: displaySellingPrice,
                                                quantity: 1,
                                                image: imageUrl,
                                                temperature: product.temperature_layer || product.temperature || 'frozen',
                                                variant: selectedVariant
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
                                        if (displayStock <= 0) {
                                            alert("目前庫存不足");
                                            return;
                                        }
                                        const existingCartStr = localStorage.getItem("moso_cart");
                                        let cartItems = [];
                                        if (existingCartStr) {
                                            try {
                                                cartItems = JSON.parse(existingCartStr);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id && item.variant === selectedVariant);
                                        if (existingItemIndex !== -1) {
                                            cartItems[existingItemIndex].quantity += 1;
                                        } else {
                                            cartItems.push({
                                                id: product.id,
                                                name: product.name,
                                                price: displaySellingPrice,
                                                quantity: 1,
                                                image: imageUrl,
                                                temperature: product.temperature_layer || product.temperature || 'frozen',
                                                variant: selectedVariant
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

                {/* 商品詳情與規格區塊 */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 space-y-10">

                    {/* 商品敍述 */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                            商品敍述
                        </h2>
                        <div 
                            className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || "暫無詳細商品描述。") }}
                        />
                    </div>

                    {/* 商品規格 */}
                    {product.specifications && (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                商品規格
                            </h2>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                    {product.specifications}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* 商品評價區塊 */}
                    <div id="reviews-section" className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Star className="text-moso-gold fill-moso-gold" size={24} />
                            商品評價 ({validReviews.length})
                        </h2>
                        {validReviews.length > 0 ? (
                            <div className="space-y-6">
                                {validReviews.map(review => (
                                    <div key={review.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white mb-1">
                                                    {review.user_name || "用戶"}
                                                </div>
                                                <div className="flex text-amber-400 text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-slate-600 dark:text-slate-300">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-slate-500 dark:text-slate-400">目前還沒有評價，快來成為第一個評價的人吧！</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
