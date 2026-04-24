"use client";

import { motion } from "framer-motion";
import { Trash2, Plus, Minus, CreditCard, Gift, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [useMosoCoin, setUseMosoCoin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingSettings, setShippingSettings] = useState({
    threshold_normal: 1000,
    threshold_refrigerated: 1500,
    threshold_frozen: 2000,
    fee_normal: 100,
    fee_refrigerated: 150,
    fee_frozen: 150
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMosoCoin, setUserMosoCoin] = useState(0);

  useEffect(() => {
    const cartStr = localStorage.getItem("moso_cart");
    if (cartStr) {
      try {
        setCartItems(JSON.parse(cartStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem("moso_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart_updated"));
  };

  useEffect(() => {
    // 取得中台設定的免運門檻與運費
    axios.get("http://localhost:8000/admin/settings")
      .then(res => {
        if (res.data) {
          setShippingSettings({
            threshold_normal: res.data.free_shipping_threshold ?? 1000,
            threshold_refrigerated: res.data.free_shipping_threshold ?? 1500,
            threshold_frozen: res.data.free_shipping_threshold ?? 2000,
            fee_normal: res.data.free_shipping_threshold_normal ?? 100,
            fee_refrigerated: res.data.free_shipping_threshold_refrigerated ?? 150,
            fee_frozen: res.data.free_shipping_threshold_frozen ?? 150
          });
        }
      })
      .catch(err => console.error("無法取得免運門檻：", err));

    // 檢查是否登入並取得錢包餘額
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      axios.get("http://localhost:8000/wallets/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.data && res.data.moso_coin !== undefined) {
            setUserMosoCoin(Math.floor(res.data.moso_coin));
          }
        })
        .catch(err => {
          console.error("無法取得會員錢包：", err);
          setIsLoggedIn(false);
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
          }
        });
    }
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 依溫層計算運費
  let actualShippingFee = 0;

  const normalItems = cartItems.filter(item => item.temperature === 'normal');
  const normalTotal = normalItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (normalTotal > 0 && normalTotal < shippingSettings.threshold_normal) {
    actualShippingFee += shippingSettings.fee_normal;
  }

  const refrigeratedItems = cartItems.filter(item => item.temperature === 'refrigerated');
  const refrigeratedTotal = refrigeratedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (refrigeratedTotal > 0 && refrigeratedTotal < shippingSettings.threshold_refrigerated) {
    actualShippingFee += shippingSettings.fee_refrigerated;
  }

  const frozenItems = cartItems.filter(item => item.temperature !== 'normal' && item.temperature !== 'refrigerated');
  const frozenTotal = frozenItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (frozenTotal > 0 && frozenTotal < shippingSettings.threshold_frozen) {
    actualShippingFee += shippingSettings.fee_frozen;
  }

  const subtotalWithShipping = totalAmount + actualShippingFee;

  const [mosoCoinAmount, setMosoCoinAmount] = useState<number | ''>('');

  const actualMosoToUse = useMosoCoin ? (mosoCoinAmount === '' ? Math.min(subtotalWithShipping, userMosoCoin) : Math.min(subtotalWithShipping, userMosoCoin, Number(mosoCoinAmount))) : 0;
  const mosoDeduction = actualMosoToUse;
  const finalPaid = subtotalWithShipping - mosoDeduction;
  const reward = Math.floor(finalPaid * 0.1);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cartItems.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    saveCart(newCart);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("請先登入會員才能結帳！");
      router.push("/member/login?redirect=/cart");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        use_moso_coin: useMosoCoin ? actualMosoToUse : false,
        payment_method: finalPaid === 0 ? "wallet" : "ecpay"
      };

      const res = await axios.post("http://localhost:8000/orders/", orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.id) {
        // 結帳成功，清空購物車
        localStorage.removeItem("moso_cart");
        window.dispatchEvent(new Event("cart_updated"));

        if (res.data.payment_method === "ecpay") {
          // 導向後端的綠界結帳轉跳頁面 (加上 timestamp 避免被快取舊的表單)
          window.location.href = `http://localhost:8000/payments/ecpay/checkout/${res.data.id}?t=${Date.now()}`;
        } else {
          // 全額折抵，直接成功
          alert("結帳成功！已使用 Moso 幣全額折抵。");
          router.push("/admin/orders");
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        alert("您的登入憑證已過期或無效，請重新登入！");
        localStorage.removeItem("token");
        router.push("/member/login?redirect=/cart");
        setIsSubmitting(false);
        return;
      }
      const msg = error.response?.data?.detail || "結帳失敗，請檢查庫存或稍後再試！";
      alert(msg);
      setIsSubmitting(false);
    }
  };

  const removeItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    saveCart(newCart);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingCart size={80} className="text-slate-200 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">購物車沒有商品</h2>
        <p className="text-slate-500 mb-8">快去挑選喜歡的商品吧！</p>
        <Link href="/" className="px-8 py-3 bg-gradient-to-r from-moso-pink to-moso-red text-white font-bold rounded-full shadow-lg hover:opacity-90 transition-opacity">
          繼續購物
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">購物車結帳</h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* 左側：購物車列表 */}
          <div className="w-full lg:w-2/3 space-y-4">
            {cartItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">{item.name}</h3>
                  <div className="text-moso-red font-extrabold text-lg">NT$ {item.price}</div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors"><Minus size={16} /></button>
                    <span className="w-4 text-center font-bold text-sm text-slate-800 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors"><Plus size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="bg-moso-light dark:bg-slate-800/50 rounded-2xl p-6 border-l-4 border-moso-pink text-slate-700 dark:text-slate-300">
              <h4 className="font-bold flex items-center gap-2 mb-2"><ShieldCheck className="text-moso-pink" size={20} /> Mososhop 購物保障</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">所有商品皆享有 7 天免費退換貨服務。付款過程全程透過 SSL 加密，並透過綠界全方位金流進行，安全無虞。</p>
            </div>
          </div>

          {/* 右側：結帳資訊 */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">訂單摘要</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>商品總計</span>
                  <span>NT$ {totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>運費</span>
                  <div className="text-right">
                    <span>NT$ {actualShippingFee}</span>
                    <div className="text-moso-pink text-xs mt-1 flex flex-col items-end">
                      {normalTotal > 0 && (
                        <span>常溫: {normalTotal >= shippingSettings.threshold_normal ? '免運' : `差 ${shippingSettings.threshold_normal - normalTotal} 免運`}</span>
                      )}
                      {refrigeratedTotal > 0 && (
                        <span>冷藏: {refrigeratedTotal >= shippingSettings.threshold_refrigerated ? '免運' : `差 ${shippingSettings.threshold_refrigerated - refrigeratedTotal} 免運`}</span>
                      )}
                      {frozenTotal > 0 && (
                        <span>冷凍: {frozenTotal >= shippingSettings.threshold_frozen ? '免運' : `差 ${shippingSettings.threshold_frozen - frozenTotal} 免運`}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Moso Coin Deduction */}
              <div className="bg-gradient-to-r from-moso-pink/10 to-transparent p-4 rounded-xl border border-moso-pink/20 mb-6 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Gift className="text-moso-pink" size={18} /> Moso 幣折抵
                    </h4>
                    {isLoggedIn ? (
                      <p className="text-xs text-slate-500 mt-1">目前可用：{userMosoCoin} 幣 (可全額抵用)</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        <Link href="/member/login" className="text-moso-pink underline">登入會員</Link> 即可享用 Moso 幣折抵
                      </p>
                    )}
                  </div>
                  {isLoggedIn && userMosoCoin > 0 && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={useMosoCoin} onChange={() => setUseMosoCoin(!useMosoCoin)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-moso-pink"></div>
                    </label>
                  )}
                </div>

                {useMosoCoin && isLoggedIn && (
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={Math.min(subtotalWithShipping, userMosoCoin)}
                        value={mosoCoinAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') setMosoCoinAmount('');
                          else {
                            const num = Math.min(Math.max(0, parseInt(val) || 0), Math.min(subtotalWithShipping, userMosoCoin));
                            setMosoCoinAmount(num);
                          }
                        }}
                        placeholder="輸入折抵數量，留空為全額抵扣"
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-moso-pink/50"
                      />
                      <button
                        onClick={() => setMosoCoinAmount(Math.min(subtotalWithShipping, userMosoCoin))}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg transition-colors whitespace-nowrap"
                      >
                        最大
                      </button>
                    </div>
                    <div className="text-sm flex justify-between font-bold text-moso-pink">
                      <span>本次抵扣金額</span>
                      <span>- NT$ {mosoDeduction}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 py-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">付款總金額</span>
                  <span className="text-3xl font-extrabold text-moso-red">NT$ {finalPaid}</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-700/50 text-center py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 mb-6 font-medium">
                完成訂單將獲得 <span className="text-moso-red font-bold text-lg">{reward}</span> Moso 幣
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 mb-3 transition-all ${isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-moso-pink to-moso-red shadow-moso-pink/30 hover:opacity-90"
                  }`}
              >
                <CreditCard size={20} />
                {isSubmitting ? "結帳處理中..." : (finalPaid === 0 ? "確認結帳" : "前往綠界結帳")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
