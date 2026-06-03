"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Package, Clock, Snowflake, Thermometer, Box } from 'lucide-react';

export default function ShippingInfoPage() {
  const [settings, setSettings] = useState({
    free_shipping_threshold_normal: 79,
    free_shipping_threshold_refrigerated: 150,
    free_shipping_threshold_frozen: 150
  });

  useEffect(() => {
    fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/admin/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to load settings", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-6">
            <Truck size={40} className="text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            快速安心的 <span className="text-blue-500">運費與配送</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            我們致力於將您心愛的商品，以最快、最安全的方式送達您手中。針對不同屬性的商品，我們提供專業的溫層配送服務。
          </p>
        </div>

        {/* Shipping Rates Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <Package size={28} className="text-moso-pink" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">運費收費標準</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Normal */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300">
                <Box size={20} className="text-slate-500" />
                <h3 className="text-lg font-bold">一般常溫配送</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">NT$ 100</span>
                <span className="text-sm text-slate-500"> / 筆</span>
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold px-4 py-2 rounded-lg inline-block">
                滿 NT$ {settings.free_shipping_threshold_normal} 即享免運
              </div>
            </div>

            {/* Refrigerated */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 border-t-4 border-t-blue-400">
              <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300">
                <Thermometer size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold">低溫冷藏配送</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">NT$ 150</span>
                <span className="text-sm text-slate-500"> / 筆</span>
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold px-4 py-2 rounded-lg inline-block">
                滿 NT$ {settings.free_shipping_threshold_refrigerated} 即享免運
              </div>
            </div>

            {/* Frozen */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 border-t-4 border-t-blue-600">
              <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300">
                <Snowflake size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold">極鮮冷凍配送</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">NT$ 150</span>
                <span className="text-sm text-slate-500"> / 筆</span>
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold px-4 py-2 rounded-lg inline-block">
                滿 NT$ {settings.free_shipping_threshold_frozen} 即享免運
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <p><strong>特別注意：</strong> 由於物流溫層限制，常溫、冷藏與冷凍商品無法合併寄送。若您的購物車內包含不同溫層的商品，系統將會將其拆分為不同的訂單出貨，並分別計算運費與免運門檻。</p>
          </div>
        </div>

        {/* Delivery Time Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 mb-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <Clock size={28} className="text-moso-gold" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">出貨與到貨時間</h2>
          </div>

          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-moso-gold mt-2 shrink-0"></div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">出貨時間</h4>
                <p className="text-slate-600 dark:text-slate-400">訂單確認付款後，我們將於 1-2 個工作天內完成出貨（不含週末及國定假日）。</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-moso-gold mt-2 shrink-0"></div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">宅配到府</h4>
                <p className="text-slate-600 dark:text-slate-400">出貨後約 1-2 個工作天可送達指定地址。偏遠地區或離島可能需要額外 1-3 天的工作日。</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-moso-gold mt-2 shrink-0"></div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">訂單追蹤</h4>
                <p className="text-slate-600 dark:text-slate-400">商品寄出後，系統將會發送通知信，您也可以至「會員中心 &gt; 訂單查詢」中追蹤您的包裹動態。</p>
              </div>
            </li>
          </ul>
        </div>

        {/* VIP Note */}
        <div className="bg-gradient-to-r from-moso-pink to-moso-gold rounded-2xl p-[2px]">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">想享受更低的免運門檻？</h4>
              <p className="text-slate-600 dark:text-slate-400">
                升級成為 VIP 會員，全館商品只需滿 NT$ 499 即可享免運，讓您的購物更加輕鬆無負擔。
              </p>
            </div>
            <Link
              href="/vip-info"
              className="px-6 py-3 bg-gradient-to-r from-moso-pink to-moso-gold text-white font-bold rounded-full whitespace-nowrap hover:shadow-lg transition-all hover:scale-105"
            >
              了解 VIP 特權
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
