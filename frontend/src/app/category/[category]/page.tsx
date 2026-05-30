"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Star, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoryPage() {
  const params = useParams();
  const rawCategory = params.category as string;
  const categoryName = decodeURIComponent(rawCategory);
  const [products, setProducts] = useState<any[]>([]);
  const [sort, setSort] = useState("latest");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applyFilter = () => {
    fetchData();
    setIsFilterOpen(false);
  };

  const fetchData = () => {
    let url = `http://localhost:8000/products/?skip=0&limit=50&category=${encodeURIComponent(categoryName)}&sort=${sort}`;
    if (minPrice) {
      url += `&min_price=${Number(minPrice)}`;
    }
    if (maxPrice) {
      url += `&max_price=${Number(maxPrice)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        console.error("搜尋發生錯誤：", err);
      });
  };

  useEffect(() => {
    fetchData();
  }, [categoryName, sort]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header Section */}
        <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-moso-pink opacity-20 blur-3xl rounded-full"></div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10">
            <div className="text-sm text-moso-pink mb-2 font-semibold tracking-wider uppercase">Category</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{categoryName}</h1>
            <p className="text-slate-300 max-w-xl">
              探索 {categoryName} 相關的頂級商品，享受購物 10% 回饋與專屬 VIP 折扣。
            </p>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm relative">
          <div className="text-slate-600 dark:text-slate-300 font-medium">
            共找到 <span className="text-moso-pink font-bold">{products.length}</span> 項商品
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
                      setIsFilterOpen(false);
                      let url = `http://localhost:8000/products/?skip=0&limit=50&category=${encodeURIComponent(categoryName)}&sort=${sort}`;
                      fetch(url)
                        .then(res => res.json())
                        .then(data => setProducts(data));
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
              transition={{ duration: 0.4, delay: i * 0.1 }}
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

      </div>
    </div>
  );
}
