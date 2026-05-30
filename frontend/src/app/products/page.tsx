"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sort, setSort] = useState("latest");
    const limit = 50;

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const applyFilter = () => {
        setPage(1);
        fetchProducts(1, sort);
        setIsFilterOpen(false);
    };

    const fetchProducts = (pageNum: number, currentSort: string) => {
        setLoading(true);
        let url = `http://localhost:8000/products/?skip=${(pageNum - 1) * limit}&limit=${limit}&sort=${currentSort}`;
        if (minPrice) {
            url += `&min_price=${Number(minPrice)}`;
        }
        if (maxPrice) {
            url += `&max_price=${Number(maxPrice)}`;
        }

        axios.get(url)
            .then(res => {
                const newProducts = res.data;
                setProducts(prev => pageNum === 1 ? newProducts : [...prev, ...newProducts]);
                setHasMore(newProducts.length === limit);
                setLoading(false);
            })
            .catch(err => {
                console.error("無法取得商品資料：", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        setPage(1);
        fetchProducts(1, sort);
    }, [sort]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, sort);
    };

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-10">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header Section */}
                <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-moso-pink opacity-20 blur-3xl rounded-full"></div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">全部商品</h1>
                        <p className="text-slate-300 max-w-xl">
                            探索所有的頂級商品，享受購物 10% 回饋與專屬 VIP 折扣。
                        </p>
                    </motion.div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm relative">
                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                        目前顯示 <span className="text-moso-pink font-bold">{products.length}</span> 項商品
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={18} /> 篩選
                        </button>

                        {/* Filter Dropdown */}
                        {isFilterOpen && (
                            <div className="absolute top-16 right-0 md:right-40 z-20 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-5">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">價格區間</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <input
                                        type="number"
                                        placeholder="最低"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-moso-pink bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="最高"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-moso-pink bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setMinPrice("");
                                            setMaxPrice("");
                                            setPage(1);
                                            setIsFilterOpen(false);
                                            // Call fetch outside to avoid stale state issues, or just let useEffect handle it if we want.
                                            // But since we just reset state, we can do it manually:
                                            setLoading(true);
                                            axios.get(`http://localhost:8000/products/?skip=0&limit=${limit}&sort=${sort}`)
                                                .then(res => {
                                                    setProducts(res.data);
                                                    setHasMore(res.data.length === limit);
                                                    setLoading(false);
                                                });
                                        }}
                                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        清除
                                    </button>
                                    <button
                                        onClick={applyFilter}
                                        className="px-4 py-2 text-sm bg-moso-pink text-white rounded-lg hover:bg-moso-red transition-colors"
                                    >
                                        套用篩選
                                    </button>
                                </div>
                            </div>
                        )}

                        <select
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-moso-pink"
                            onChange={(e) => setSort(e.target.value)}
                            value={sort}
                        >
                            <option value="latest">最新上架</option>
                            <option value="price_asc">價格由低到高</option>
                            <option value="price_desc">價格由高到低</option>
                            <option value="rating_desc">評價最高</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((prod, i) => (
                        <motion.div
                            key={prod.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all"
                        >
                            <Link href={`/product/${prod.id}`}>
                                <div className="relative h-56 overflow-hidden">
                                    <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-moso-pink transition-colors">
                                        <Heart size={20} />
                                    </button>
                                    <img src={prod.images ? (typeof prod.images === 'string' ? (JSON.parse(prod.images)[0] || "https://via.placeholder.com/800") : (prod.images[0] || "https://via.placeholder.com/800")) : "https://via.placeholder.com/800"} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </Link>
                            <div className="p-5">
                                <Link href={`/product/${prod.id}`}>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-2 group-hover:text-moso-pink transition-colors line-clamp-2 mt-2" title={prod.name}>
                                        {prod.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-1 mb-4">
                                    <Star className="text-moso-gold fill-moso-gold" size={16} />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{prod.rating || 5.0}</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-xl font-extrabold text-moso-red">NT$ {Math.round(prod.selling_price).toLocaleString()}</div>
                                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white group-hover:bg-moso-pink group-hover:text-white transition-colors">
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination / Loading state */}
                <div className="mt-12 flex justify-center">
                    {loading && (
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moso-pink my-4"></div>
                    )}

                    {!loading && hasMore && (
                        <button
                            onClick={loadMore}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-moso-pink text-slate-700 dark:text-slate-200 hover:text-moso-pink font-semibold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all"
                        >
                            載入更多
                        </button>
                    )}

                    {!loading && !hasMore && products.length > 0 && (
                        <p className="text-slate-500 dark:text-slate-400 my-4">已經到底囉！</p>
                    )}
                </div>

            </div>
        </div>
    );
}
