"use client";
import React from 'react';
import Link from 'next/link';
import { Share2, Coins, Users, ArrowRight, MousePointerClick, Gift } from 'lucide-react';

export default function AffiliateInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 mb-6">
            <Share2 size={40} className="text-indigo-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            分享好物，<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">賺取被動收入</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            加入 Moso Shop 外部導購聯盟計畫！<br/>
            只要將您喜愛的商品分享給朋友，當他們透過您的專屬連結完成購物，您就能獲得豐厚的 Moso 幣分潤回饋。
          </p>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-12">簡單三步驟，開啟您的分潤之旅</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-indigo-500">
                <MousePointerClick size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. 取得專屬連結</h3>
              <p className="text-slate-600 dark:text-slate-400">
                在任何商品的頁面上，點擊「產生導購連結」，系統會為您自動生成包含您專屬推薦碼的短網址。
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-purple-500">
                <Users size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. 分享給親友或粉絲</h3>
              <p className="text-slate-600 dark:text-slate-400">
                將您的專屬連結分享至社群平台（如 LINE、IG、Facebook），或推薦給身邊的親朋好友。
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-moso-gold">
                <Coins size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. 輕鬆賺取分潤</h3>
              <p className="text-slate-600 dark:text-slate-400">
                只要有人透過該連結下單且超過鑑賞期未退貨，您即可獲得該筆訂單 <strong className="text-moso-gold">0.5%~20%</strong> 的 Moso 幣分潤！
              </p>
            </div>
          </div>
        </div>

        {/* Example Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="text-moso-gold" />
                <h3 className="text-2xl font-bold text-white">分潤試算範例</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg mb-6">
                假設您在群組分享了一款熱銷的保養品，有 10 位朋友透過您的連結購買，每筆訂單金額為 NT$ 2,000。
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center text-slate-300 mb-2">
                  <span>單筆訂單回饋 (假設 5%)</span>
                  <span>100 Moso 幣</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 mb-4">
                  <span>成功推薦次數</span>
                  <span>x 10 筆</span>
                </div>
                <div className="h-px bg-slate-600 mb-4"></div>
                <div className="flex justify-between items-center text-white font-bold text-xl">
                  <span>您總共可獲得</span>
                  <span className="text-moso-gold text-3xl">1,000 幣</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-xs mx-auto">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Moso 幣等同現金</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  您賺取的 Moso 幣可於下次購物時全額折抵無上限，讓您自己購物也能 0 元帶回家！
                </p>
                <Link 
                  href="/member/profile" 
                  className="group flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  立即前往會員中心 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl">
          <h4 className="font-bold mb-2">注意事項與規範：</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>導購連結的 Cookie 有效期將依各導購合作廠商的規範而定。以 30 天為例，只要顧客點擊您的專屬連結後，於 30 天內完成結帳，該筆訂單皆會自動算入您的業績。</li>
            <li>分潤發放時間：為配合七天鑑賞期政策，分潤 Moso 幣將於訂單狀態轉為「已完成（無退貨）」後的次日自動匯入推薦人錢包。</li>
            <li>若發生退換貨，該筆訂單的分潤將會被系統自動取消。</li>
            <li>Moso Shop 保留隨時修改、終止本計畫之權利。</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
