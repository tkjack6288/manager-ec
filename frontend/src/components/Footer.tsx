import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
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
              <li><Link href="#" className="hover:text-moso-pink transition-colors">會員中心</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">訂單查詢</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">Moso 幣明細</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">升級 VIP 說明</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">購物說明</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-moso-pink transition-colors">付款方式</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">運費與配送</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">退換貨政策</Link></li>
              <li><Link href="#" className="hover:text-moso-pink transition-colors">外部導購回饋</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">訂閱電子報</h4>
            <p className="text-slate-400 text-sm">輸入 Email 獲取最新優惠與 100 moso 幣！</p>
            <form className="flex mt-2">
              <input 
                type="email" 
                placeholder="您的 Email" 
                className="bg-slate-800 text-white text-sm rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-moso-pink"
              />
              <button className="bg-gradient-to-r from-moso-pink to-moso-red text-white px-4 py-2 rounded-r-md hover:opacity-90 transition-opacity font-medium">
                訂閱
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      <div className="border-t border-slate-800 text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Mososhop. All rights reserved.</p>
      </div>
    </footer>
  );
}
