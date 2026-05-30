import React from 'react';
import Link from 'next/link';
import { CreditCard, Wallet, ShieldCheck, Zap } from 'lucide-react';

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-moso-pink/10 mb-6">
            <CreditCard size={40} className="text-moso-pink" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            多元且安全的 <span className="text-moso-pink">付款方式</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            我們提供最安全、快速的結帳體驗。無論是傳統的信用卡支付，或是極具優勢的 Moso 幣折抵，都能讓您的購物旅程更加順暢。
          </p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Method 1: Moso Coin */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Wallet size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Moso 幣全額折抵</h3>
              </div>
              <span className="bg-moso-pink/10 text-moso-pink text-xs font-bold px-3 py-1 rounded-full">推薦使用</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Moso 幣是本站專屬的虛擬貨幣，**1 枚 Moso 幣等同於新台幣 1 元**。
              您可以使用錢包內的 Moso 幣進行結帳，**折抵無上限**，甚至可以達成 0 元結帳的成就！
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Zap size={16} className="text-yellow-500" />
                <span>結帳即時扣款，秒速完成訂單</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <ShieldCheck size={16} className="text-green-500" />
                <span>若取消訂單，Moso 幣將全額自動退回錢包</span>
              </li>
            </ul>
          </div>

          {/* Method 2: Credit Card (ECPay) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CreditCard size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">線上刷卡 (綠界科技)</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              我們與台灣最大第三方支付平台「綠界科技 ECPay」合作，提供最嚴密的安全交易環境。支援國內外各大銀行的 VISA、MasterCard、JCB 信用卡。
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <ShieldCheck size={16} className="text-green-500" />
                <span>採 PCI-DSS 最高等級資安防護</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <ShieldCheck size={16} className="text-green-500" />
                <span>通過 3D 驗證機制，防止信用卡遭盜刷</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Zap size={16} className="text-yellow-500" />
                <span>取消訂單時，系統將自動向銀行發起退刷作業</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">還有其他付款問題嗎？</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            如果您在結帳過程中遇到任何問題，歡迎隨時聯繫我們的線上智能客服，或直接前往購物體驗。
          </p>
          <Link 
            href="/products" 
            className="inline-block px-8 py-3 bg-moso-pink hover:bg-moso-red text-white font-medium rounded-full transition-colors shadow-lg shadow-moso-pink/30"
          >
            立即開始購物
          </Link>
        </div>

      </div>
    </div>
  );
}
