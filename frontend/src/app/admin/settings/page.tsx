"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Settings, Store, CreditCard, ShieldAlert } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        site_name: "",
        maintenance_mode: false,
        reward_percentage: 10,
        free_shipping_threshold: 1000,
        free_shipping_threshold_normal: 79,
        free_shipping_threshold_refrigerated: 150,
        free_shipping_threshold_frozen: 150
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/settings`);
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
                headers: { "Content-Type": "application/json" },
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

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">免運費門檻 (NT$)</label>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={settings.free_shipping_threshold}
                                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                />
                            </div>

                            <label className="block text-sm font-medium text-slate-700 mt-4">各溫層運費 (NT$)</label>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">常溫運費</label>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.free_shipping_threshold_normal}
                                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold_normal: Number(e.target.value) })}
                                        className="w-full pl-10 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">冷藏運費</label>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.free_shipping_threshold_refrigerated}
                                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold_refrigerated: Number(e.target.value) })}
                                        className="w-full pl-10 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">冷凍運費</label>
                                <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">NT$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.free_shipping_threshold_frozen}
                                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold_frozen: Number(e.target.value) })}
                                        className="w-full pl-10 border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-moso-pink focus:ring-1 focus:ring-moso-pink"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-2">購物車將依據商品溫層分別計算運費，若無標示溫層預設以冷凍計費。滿免運門檻即自動免收運費。</p>
                        </div>
                    </div>
                </div>

                {/* 系統維護 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">系統與安全</h2>
                    </div>
                    <div className="p-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={settings.maintenance_mode}
                                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.maintenance_mode ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">開啟網站維護模式</div>
                                <div className="text-sm text-slate-500">開啟後，一般會員將無法進入前台購物，僅允許管理員存取。</div>
                            </div>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}