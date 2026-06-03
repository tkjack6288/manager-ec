"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await axios.post("https://manager-ec-backend-164815154526.asia-east1.run.app/newsletter/subscribe", { email });
      if (res.data.status === "already_subscribed") {
        setStatus("already");
        setMessage(res.data.message);
      } else {
        setStatus("success");
        setMessage(res.data.message);
        setEmail("");
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setMessage("訂閱失敗，請檢查 Email 格式或稍後再試。");
    }
  };

  return (
    <footer className="bg-slate-900 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-moso-pink via-moso-gold to-moso-red"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tighter">mososhop</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              全台最優質電子商務平台。<br/>
              買東西賺滿滿 Moso 幣，全額抵扣無上限，讓你的每一分錢更有價值。
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-moso-pink hover:text-white transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-moso-pink hover:text-white transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-moso-pink hover:text-white transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-moso-pink hover:text-white transition-colors duration-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">會員專區</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/member/profile" className="hover:text-moso-pink transition-colors">會員中心</Link></li>
              <li><Link href="/member/orders" className="hover:text-moso-pink transition-colors">訂單查詢</Link></li>
              <li><Link href="/member/wallet" className="hover:text-moso-pink transition-colors">Moso 幣明細</Link></li>
              <li><Link href="/vip-info" className="hover:text-moso-pink transition-colors">升級 VIP 說明</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">購物說明</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/payment-info" className="hover:text-moso-pink transition-colors">付款方式</Link></li>
              <li><Link href="/shipping-info" className="hover:text-moso-pink transition-colors">運費與配送</Link></li>
              <li><Link href="/return-policy" className="hover:text-moso-pink transition-colors">退換貨政策</Link></li>
              <li><Link href="/affiliate-info" className="hover:text-moso-pink transition-colors">外部導購回饋</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">訂閱電子報</h4>
            <p className="text-slate-400 text-sm">輸入 Email 獲取最新優惠與 100 moso 幣！</p>
            <form className="flex mt-2" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="您的 Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 text-white text-sm rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-moso-pink"
              />
              <button 
                type="submit" 
                disabled={status === "loading"}
                className="bg-gradient-to-r from-moso-pink to-moso-red text-white px-4 py-2 rounded-r-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
              >
                {status === "loading" ? "處理中" : "訂閱"}
              </button>
            </form>
            {status === "success" && <p className="text-moso-pink text-sm mt-2">{message}</p>}
            {status === "already" && <p className="text-yellow-500 text-sm mt-2">{message}</p>}
            {status === "error" && <p className="text-red-500 text-sm mt-2">{message}</p>}
          </div>
          
        </div>
      </div>
      
      <div className="border-t border-slate-800 text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Mososhop. All rights reserved.</p>
      </div>
    </footer>
  );
}
