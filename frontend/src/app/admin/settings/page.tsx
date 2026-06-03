/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Settings, Store, CreditCard, ShieldAlert, Truck } from "lucide-react";

const API_BASE = `https://manager-ec-backend-164815154526.asia-east1.run.app`;

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        site_name: "",
        maintenance_mode: false,
        reward_percentage: 10,
        free_shipping_threshold: 1000,
        free_shipping_threshold_normal: 79,
        free_shipping_threshold_refrigerated: 150,
        free_shipping_threshold_frozen: 150,
        shipping_fee_normal: 100,
        shipping_fee_refrigerated: 150,
        shipping_fee_frozen: 150,
        review_reward_coin: 50
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/settings`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
            });
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${API_BASE}/admin/settings`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                },
                body: JSON.stringify(settings)
            });
            if (!res.ok) throw new Error("儲存失敗");
            alert("系統設定已儲存更新！");
        } catch (err) {
            console.error(err);
            alert("儲存設定失敗");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20 text-slate-500">載入中...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">系統設定</h1>
                    <p className="text-slate-500 mt-1">管理網站全域參數、維護模式與營運規則</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchSettings}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <RefreshCw size={18} />
                        還原
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "儲存中..." : "儲存設定"}
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* 基本設定 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <Store className="text-moso-pink" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">網站基本設定</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">網站名稱</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                            />
                            <p className="text-xs text-slate-500 mt-1">顯示於瀏覽器標題及各處頁首。</p>
                        </div>
                    </div>
                </div>

                {/* 營運與金流設定 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <CreditCard className="text-moso-gold" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">營運與優惠規則</h2>
                    </div>
                    <div className="p-6 grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">預設 Moso 幣回饋比例 (%)</label>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.reward_percentage}
                                    onChange={(e) => setSettings({ ...settings, reward_percentage: Number(e.target.value) })}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">全站購買商品的基礎點數回饋比例。</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">評價回饋MOSO幣金額</label>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.review_reward_coin ?? 50}
                                    onChange={(e) => setSettings({ ...settings, review_reward_coin: Number(e.target.value) })}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">點</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">會員完成訂單並給予商品評價後所獲得的 Moso 幣獎勵。</p>
                        </div>
                    </div>
                </div>

                {/* 免運費門檻設定 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <Truck className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">免運費門檻 (NT$)</h2>
                    </div>
                    <div className="p-6 grid sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">常溫 免運門檻</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.free_shipping_threshold_normal}
                                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold_normal: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">冷藏 免運門檻</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.free_shipping_threshold_refrigerated}
                                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold_refrigerated: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">冷凍 免運門檻</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.free_shipping_threshold_frozen}
                                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold_frozen: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pb-6 text-sm text-slate-500">
                        購物車將依據商品溫層分別計算運費。單一溫層的商品總額滿該溫層之免運門檻，即自動免收該溫層運費。
                    </div>
                </div>

                {/* 運費設定 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <Truck className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">運費 (NT$)</h2>
                    </div>
                    <div className="p-6 grid sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">常溫 運費</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.shipping_fee_normal ?? 100}
                                    onChange={(e) => setSettings({ ...settings, shipping_fee_normal: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">冷藏 運費</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.shipping_fee_refrigerated ?? 150}
                                    onChange={(e) => setSettings({ ...settings, shipping_fee_refrigerated: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">冷凍 運費</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.shipping_fee_frozen ?? 150}
                                    onChange={(e) => setSettings({ ...settings, shipping_fee_frozen: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pb-6 text-sm text-slate-500">
                        設定各溫層的基本運費金額。當購物車內該溫層商品未達免運門檻時，將會收取此運費金額。
                    </div>
                </div>

            </div>
        </div>
    );
}
