"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Search, PackageOpen } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sort, setSort] = useState("latest");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applyFilter = () => {
    fetchData();
    setIsFilterOpen(false);
  };

  const fetchData = () => {
    if (!query) return;
    setIsSearching(true);
    let url = `http://localhost:8000/products/?skip=0&limit=50&name=${encodeURIComponent(query)}&sort=${sort}`;
    if (minPrice) {
      url += `&min_price=${Number(minPrice)}`;
    }
    if (maxPrice) {
      url += `&max_price=${Number(maxPrice)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsSearching(false);
      })
      .catch(err => {
        console.error("搜尋發生錯誤：", err);
        setIsSearching(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [query, sort]);

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
          <Search className="text-moso-pink" />
          「{query}」的搜尋結果
        </h1>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mt-2 gap-4 relative">
          <p className="text-slate-500">為您找到 {results.length} 筆相關商品</p>

          <div className="flex items-center gap-3">
            {results.length > 0 && (
              <button
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <PackageOpen size={18} /> 篩選
              </button>
            )}

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
                      let url = `http://localhost:8000/products/?skip=0&limit=50&name=${encodeURIComponent(query)}&sort=${sort}`;
                      fetch(url)
                        .then(res => res.json())
                        .then(data => setResults(data));
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

            {results.length > 0 && (
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
            )}
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moso-pink mb-4"></div>
          <p className="text-slate-500">正在努力搜尋中...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {results.map((prod, i) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Link href={`/product/${prod.id}`} className="block h-full">
                <div className="relative h-48">
                  <img src={prod.images ? (typeof prod.images === 'string' ? (JSON.parse(prod.images)[0] || "https://via.placeholder.com/800") : (prod.images[0] || "https://via.placeholder.com/800")) : "https://via.placeholder.com/800"} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 mt-2" title={prod.name}>{prod.name}</h3>
                  <div className="text-lg font-extrabold text-moso-red">NT$ {Math.round(prod.selling_price).toLocaleString()}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <PackageOpen size={64} className="text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">找不到相關商品</h2>
          <p className="text-slate-500 max-w-md">
            抱歉，我們找不到符合「{query}」的商品，請嘗試使用其他關鍵字搜尋。
          </p>
          <Link href="/" className="mt-8 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-full hover:bg-moso-pink transition-colors">
            回首頁逛逛
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
