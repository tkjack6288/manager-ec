import React from 'react';
import Link from 'next/link';
import { Crown, Star, Shield, Gem, TrendingUp, ArrowRight, Gift } from 'lucide-react';

export default function VipInfoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-moso-gold/20 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-moso-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -left-20 w-72 h-72 bg-moso-pink/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24 mt-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 mb-8 shadow-[0_0_50px_rgba(234,179,8,0.4)] relative">
            <div className="absolute inset-1 rounded-full bg-slate-950 flex items-center justify-center">
                <Crown size={48} className="text-transparent fill-moso-gold bg-clip-text bg-gradient-to-br from-amber-200 to-amber-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            跨越界線，成為 <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-lg">
              黑卡級 VIP 會員
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            這不是給所有人的權益，而是為追求極致的您所準備的專屬領地。<br/>
            成為 Moso VIP，讓每一次的消費，都成為展現您尊爵身分的印記。
          </p>
        </div>

        {/* Privileges Section */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-moso-gold/50"></div>
          <h2 className="text-2xl font-bold tracking-widest text-moso-gold uppercase">VVIP 專屬四大特權</h2>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-moso-gold/50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          
          {/* Privilege 1 */}
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 hover:from-moso-gold/50 hover:to-amber-600/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-moso-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 relative z-10 flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <TrendingUp size={32} className="text-moso-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">極致 15% 現金級回饋</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                一般會員僅有 10%。身為 VIP 的您，每一筆訂單都享有 <strong className="text-moso-gold font-bold">高達 15% 的 Moso 幣回饋</strong>。無上限、無折抵門檻，您的消費，永遠比別人更具價值。
              </p>
            </div>
          </div>

          {/* Privilege 2 */}
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 hover:from-moso-gold/50 hover:to-amber-600/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-moso-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 relative z-10 flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <Shield size={32} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">全天候頂級特權通道</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                您無需排隊。VIP 享有 24 小時優先專線客服，並具備 <strong className="text-blue-400 font-bold">自動秒速退款特權</strong>，無需人工審核，資金靈活度永遠掌握在您手中。
              </p>
            </div>
          </div>

          {/* Privilege 3 */}
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 hover:from-moso-gold/50 hover:to-amber-600/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-moso-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 relative z-10 flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/5 border border-purple-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <Gem size={32} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">近乎苛求的免運禮遇</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                打破框架。一般會員需滿 NT$1,000，而您只需要 <strong className="text-purple-400 font-bold">NT$ 499</strong> 即可享受全館免運。您的每一次微小購物，我們都以最高規格為您配送。
              </p>
            </div>
          </div>

          {/* Privilege 4 */}
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 hover:from-moso-gold/50 hover:to-amber-600/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-moso-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 relative z-10 flex flex-col">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-600/5 border border-rose-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <Gift size={32} className="text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">年度生日奢華獻禮</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                專屬於您的紀念日，我們為您準備了 <strong className="text-rose-400 font-bold">1,000 枚 Moso 幣與無門檻 8 折券</strong>。讓這份成就感，成為您每年最期待的驚喜。
              </p>
            </div>
          </div>

        </div>

        {/* Upgrade Progress Section */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-[1px] bg-gradient-to-r from-moso-gold/50 via-amber-200/50 to-moso-gold/50 shadow-[0_0_50px_rgba(234,179,8,0.1)]">
            <div className="bg-slate-950 rounded-3xl p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-moso-gold/10 blur-[100px] pointer-events-none"></div>
              
              <Star size={40} className="text-moso-gold mb-6" fill="currentColor" />
              <h2 className="text-4xl font-black text-white mb-6">晉升殿堂的門檻</h2>
              <p className="text-xl text-slate-400 mb-10">
                累積消費滿 <strong className="text-moso-gold text-3xl mx-2">NT$ 10,000</strong>，系統將自動為您解鎖所有特權。
              </p>

              <div className="w-full max-w-2xl mb-12">
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-3 px-2">
                  <span>一般會員</span>
                  <span className="text-moso-gold tracking-widest flex items-center gap-1"><Crown size={14}/> VIP</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                  <div className="h-full w-[15%] bg-gradient-to-r from-moso-gold/40 to-moso-gold relative shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwbDQwLTQwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 mt-3 mr-2 font-mono">
                  距離解鎖成就，只差一步。
                </div>
              </div>

              <Link 
                href="/products" 
                className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-slate-900 bg-gradient-to-r from-amber-200 via-moso-gold to-amber-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12"></div>
                <span className="relative text-lg tracking-widest flex items-center gap-2">
                  立即啟程，累積您的成就 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
