"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, Flame, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [bannerItems, setBannerItems] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    // 預設 Banner 資料（作為 fallback）
    const defaultBanners = [
      { id: "b1", title: "探索你的無極限購物體驗", subtitle: "限時購物季限定", desc: "買東西賺 10% Moso 幣，全額扣抵無上限。加入 VIP，馬上免除年費挑戰最高回饋。", img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000", reward: 1000 },
      { id: "b2", title: "春季新品發表優惠", subtitle: "全館免運", desc: "最新流行服飾與生活質感單品，限時8折起，結帳輸入折扣碼 SPRING 享額外優惠。", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000", reward: 500 },
      { id: "b3", title: "智慧家電升級大賞", subtitle: "回饋最高20%", desc: "精選3C與質感家電，購買指定品牌加碼送原廠配件，讓您的生活更聰明。", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=2000", reward: 1200 }
    ];
    setBannerItems(defaultBanners);

    // 先顯示假資料
    setRecommendations([
      { id: "1", name: "頂級降噪藍牙耳機 Pro", category: "3C家電", selling_price: 8388, price: 6990, images: "[\"https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800\"]", rating: 4.8 },
      { id: "2", name: "微分子保濕精華液 50ml", category: "美妝保養", selling_price: 1536, price: 1280, images: "[\"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800\"]", rating: 4.9 },
      { id: "3", name: "極究人體工學辦公椅", category: "傢俱", selling_price: 5400, price: 4500, images: "[\"https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800\"]", rating: 4.5 },
      { id: "4", name: "手沖咖啡器具套裝", category: "日用生活", selling_price: 3576, price: 2980, images: "[\"https://images.unsplash.com/photo-1495474472205-51f753c07f46?auto=format&fit=crop&q=80&w=800\"]", rating: 4.7 }
    ]);

    // 透過 API 取得 GCP 資料庫內的商品資料
    axios.get("http://localhost:8000/products/recommendations/daily")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setRecommendations(res.data);
          // 嘗試從推薦商品中隨機取3個作為 banner
          const products = [...res.data];
          if (products.length >= 3) {
            // 打亂陣列取前3個
            const shuffled = products.sort(() => 0.5 - Math.random()).slice(0, 3);
            const newBanners = shuffled.map((p, idx) => {
              let imgUrl = "https://via.placeholder.com/2000";
              if (p.images) {
                try {
                  const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                  if (imgs && imgs.length > 0) imgUrl = imgs[0];
                } catch (e) {
                  imgUrl = p.images;
                }
              }
              const promos = [
                { subtitle: "限時超值回饋", desc: "買東西賺 10% Moso 幣，全額扣抵無上限。加入 VIP，馬上免除年費挑戰最高回饋。" },
                { subtitle: "新品上架特惠", desc: "獨家首賣，會員專享結帳再享9折優惠，快來搶購最新熱門商品！" },
                { subtitle: "年度熱銷狂歡", desc: "百萬用戶一致好評，現在買最划算，搭配Moso幣折抵，讓您省更多。" }
              ];
              return {
                id: p.id,
                title: p.name,
                subtitle: promos[idx % 3].subtitle,
                desc: promos[idx % 3].desc,
                img: imgUrl,
                reward: Math.round(p.selling_price * 0.1) // 以售價的 10% 進行回饋
              };
            });
            setBannerItems(newBanners);
          }
        }
      })
      .catch(err => {
        console.error("無法取得商品資料：", err);
      });
  }, []);

  // Banner 輪播效果
  useEffect(() => {
    if (bannerItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    }, 10000); // 每10秒切換
    return () => clearInterval(interval);
  }, [bannerItems]);

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-slate-900 flex items-center group">
        <AnimatePresence mode="wait">
          {bannerItems.length > 0 && (
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Link
                href={bannerItems[currentBanner].id.startsWith("b") ? "/products" : `/product/${bannerItems[currentBanner].id}`}
                className="absolute inset-0 z-10 block cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-moso-dark via-moso-dark/80 to-transparent w-full md:w-2/3"></div>
                <div className="absolute right-0 top-0 h-full w-full">
                  <img
                    src={bannerItems[currentBanner].img}
                    alt={bannerItems[currentBanner].title}
                    className="object-cover w-full h-full opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </Link>

              <div className="container relative z-20 mx-auto px-4 md:px-6 h-full flex flex-col justify-center pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-xl"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-moso-pink/20 text-moso-pink text-sm font-semibold border border-moso-pink/30">
                      {bannerItems[currentBanner].subtitle}
                    </span>
                    {bannerItems[currentBanner].reward > 0 && (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse">
                        <Flame size={16} className="mr-1" />
                        狂賺回饋 {bannerItems[currentBanner].reward} Moso 幣
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 line-clamp-2">
                    {bannerItems[currentBanner].title}
                  </h1>
                  <p className="text-lg text-slate-300 mb-8 max-w-lg">
                    {bannerItems[currentBanner].desc}
                  </p>
                  <div className="flex flex-wrap gap-4 pointer-events-auto">
                    <Link href="/products" className="bg-gradient-to-r from-moso-pink to-moso-red hover:opacity-90 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-moso-pink/30 transition-all transform hover:scale-105">
                      立即選購
                    </Link>
                    <Link href="/vip" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 backdrop-blur-md border border-white/20">
                      <Gift size={20} />
                      領取千元禮遇
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 輪播指示器 */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {bannerItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${currentBanner === idx ? "w-8 bg-moso-pink" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              aria-label={`切換至第 ${idx + 1} 個橫幅`}
            />
          ))}
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Flame className="text-moso-red" />
              熱門分類
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "3C家電", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=150" },
              { name: "美妝保養", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=150" },
              { name: "流行服飾", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=150" },
              { name: "日用生活", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=150" },
              { name: "運動休閒", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=150" },
              { name: "美食生鮮", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150" }
            ].map((cat, idx) => (
              <Link href={`/category/${encodeURIComponent(cat.name)}`} key={idx} className="block">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-moso-pink/50 transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Recommendations */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">每日專屬推薦</h2>
              <p className="text-slate-500 dark:text-slate-400">為您精選最划算、最多 Moso 幣回饋的嚴選商品</p>
            </div>
            <Link href="/products" className="text-moso-pink font-semibold hover:text-moso-red transition-colors flex items-center gap-1">
              看更多商品 &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {recommendations.map((prod, i) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all"
              >
                <Link
                  href={`/product/${prod.id}`}
                  className="block relative h-64 overflow-hidden"
                >
                  <div className="absolute top-3 left-3 z-10 bg-moso-red text-white text-xs font-bold px-2 py-1 rounded">
                    回饋 10%
                  </div>
                  <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-moso-pink transition-colors">
                    <Heart size={20} />
                  </button>
                  <img src={prod.images ? (typeof prod.images === 'string' ? (JSON.parse(prod.images)[0] || "https://via.placeholder.com/800") : (prod.images[0] || "https://via.placeholder.com/800")) : "https://via.placeholder.com/800"} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </Link>
                <div className="p-5">
                  <Link
                    href={`/product/${prod.id}`}
                    className="block"
                  >
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2 min-h-[56px] mt-2 group-hover:text-moso-pink transition-colors">
                      {prod.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="text-moso-gold fill-moso-gold" size={16} />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{prod.rating || 5.0}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-slate-500 line-through mr-2">NT$ {Math.round(prod.selling_price * 1.2).toLocaleString()}</span>
                      <div className="text-xl font-extrabold text-moso-red">NT$ {Math.round(prod.selling_price).toLocaleString()}</div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white group-hover:bg-moso-pink group-hover:text-white transition-colors">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
