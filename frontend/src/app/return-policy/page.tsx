"use client";
import React from 'react';
import Link from 'next/link';
import { RefreshCcw, ShieldAlert, BadgeCheck, PhoneForwarded } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
            <RefreshCcw size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            安心無憂的 <span className="text-emerald-500">退換貨政策</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            您的滿意是我們最大的追求。我們提供業界領先的退換貨服務與極速退款機制，讓您的每一次購物都毫無後顧之憂。
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 mb-16">
          
          {/* Policy 1: 7 Days */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <BadgeCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">七天鑑賞期保障</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                依照消費者保護法規定，您享有商品到貨次日起 7 天猶豫期（鑑賞期）的權益。猶豫期並非試用期，退回的商品必須是全新的狀態且包裝完整（包含商品本體、配件、贈品、保證書、原廠包裝及所有附隨文件）。
              </p>
              <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>請保持商品內外包裝的完整性，勿在原廠包裝上黏貼紙張或書寫文字。</li>
                <li>若商品已拆封使用，除商品本身瑕疵外，恕不接受退換貨。</li>
              </ul>
            </div>
          </div>

          {/* Policy 2: Exceptions */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">例外商品說明（冷藏 / 冷凍）</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                部分特殊商品因性質特殊，<strong className="text-rose-500">不適用 7 天鑑賞期</strong>規定。請在購買前確認您的需求：
              </p>
              <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>易於腐敗、保存期限較短之商品（如：生鮮食品、冷藏/冷凍肉品）。</li>
                <li>依消費者要求所為之客製化給付商品。</li>
                <li>已拆封之個人衛生用品（如：內衣褲）。</li>
              </ul>
            </div>
          </div>

          {/* Policy 3: Refund Process */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-moso-gold/5 rounded-bl-full pointer-events-none"></div>
            <div className="w-16 h-16 rounded-2xl bg-moso-gold/10 text-moso-gold flex items-center justify-center shrink-0">
              <RefreshCcw size={32} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">極速退款機制</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                一旦退貨商品驗收無誤，系統將自動啟動退款程序，無需漫長等待：
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">Moso 幣折抵：</span>
                  <span>系統將於 1 秒內，將您扣抵的 Moso 幣全額加回您的數位錢包中，可立即用於下一筆訂單。</span>
                </li>
                <li className="flex gap-3 text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">線上刷卡：</span>
                  <span>系統會自動向綠界科技及銀行發起退刷作業。因各家銀行作業時間不同，預計於 3-5 個工作天內退回至您的信用卡帳單。</span>
                </li>
              </ul>
              <div className="mt-4 inline-block bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-lg text-xs text-slate-500 border border-slate-100 dark:border-slate-700">
                * VIP 會員享有免驗收「自動秒速退款」之尊榮特權。
              </div>
            </div>
          </div>

        </div>

        {/* Contact CTA */}
        <div className="text-center bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-10 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-md">
              <PhoneForwarded size={28} className="text-slate-700 dark:text-slate-300" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">需要辦理退換貨？</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            您可以直接前往「訂單查詢」頁面，點選對應訂單的「申請退貨」按鈕。或是點擊右下角呼叫我們的 AI 智能客服，為您查詢訂單並協助處理。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/member/orders" 
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:shadow-lg transition-all"
            >
              前往訂單查詢
            </Link>
            <button 
              onClick={() => {
                // Trigger chat widget open by dispatching a custom event or focusing
                const chatBtn = document.getElementById('chat-widget-trigger');
                if (chatBtn) chatBtn.click();
              }}
              className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-full border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all"
            >
              聯繫線上客服
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
