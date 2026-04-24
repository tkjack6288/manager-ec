"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "今日營收", value: "NT$ 245,000", change: "+12.5%", icon: <DollarSign size={24} className="text-moso-pink" /> },
    { title: "新增訂單", value: "152", change: "+8.2%", icon: <ShoppingCart size={24} className="text-moso-gold" /> },
    { title: "新註冊會員", value: "84", change: "+15.3%", icon: <Users size={24} className="text-blue-500" /> },
    { title: "Moso 幣發放", value: "24,500", change: "+12.5%", icon: <TrendingUp size={24} className="text-moso-red" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">營運總覽</h1>
        <p className="text-slate-500 mt-1">即時掌握 Mososhop 平台關鍵數據</p>
      </div>

      {/* 數據卡片 Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-500 font-medium mb-1">{stat.title}</h3>
            <div className="text-2xl font-black text-slate-800">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* 圖表與報表區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">本週營收趨勢</h3>
          {/* 模擬圖表區塊 */}
          <div className="w-full h-[300px] flex items-end justify-between px-4 gap-2 relative">
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between z-0 pointer-events-none opacity-20 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-t border-slate-300 border-dashed" />
              ))}
            </div>
            
            {[30, 45, 60, 40, 75, 50, 90].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className="w-full bg-gradient-to-t from-moso-red to-moso-pink rounded-t-lg z-10 relative group cursor-pointer"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded shadow transition-opacity">
                  ${h * 1000}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2 text-xs text-slate-400 font-medium">
            <span>週一</span><span>週二</span><span>週三</span><span>週四</span><span>週五</span><span>週六</span><span>週日</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">最新待處理訂單</h3>
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div>
                  <div className="font-bold text-sm text-slate-800">MOSO-20231{item}9...</div>
                  <div className="text-xs text-slate-400">王＊明 • 剛才</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-moso-red text-sm">$ 4,500</div>
                  <div className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded">待出貨</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            查看所有訂單
          </button>
        </div>
      </div>
    </div>
  );
}
