/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Search, Shield, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = `https://manager-ec-backend-164815154526.asia-east1.run.app`;

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsers = async (query = "") => {
        try {
            setLoading(true);
            // 加上時間戳以避免 Next.js 或瀏覽器快取，確保每次進入都顯示最新資料
            const url = query
                ? `${API_BASE}/admin/users?search=${encodeURIComponent(query)}&t=${Date.now()}`
                : `${API_BASE}/admin/users?t=${Date.now()}`;
            const res = await fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }, cache: "no-store" });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(searchQuery);
    }, [searchQuery]);

    const handleToggleVip = async (userId: string, isVip: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/vip?is_vip=${isVip}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
            });
            if (!res.ok) throw new Error("設定失敗");
            alert(isVip ? "已設為 VIP 會員" : "已取消 VIP 資格");
            fetchUsers(searchQuery);
        } catch (err) {
            console.error(err);
            alert("更新 VIP 狀態失敗");
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">會員管理</h1>
                    <p className="text-slate-500 mt-1">管理所有註冊會員及 VIP 狀態設定</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="搜尋會員姓名或 Email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-moso-pink/50 focus:border-moso-pink"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">會員 ID</th>
                                <th className="px-6 py-4">姓名</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">登入方式</th>
                                <th className="px-6 py-4">註冊時間</th>
                                <th className="px-6 py-4">VIP 狀態</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">載入中...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">找不到會員資料</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400" title={user.id}>
                                            {user.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold capitalize">
                                                {user.auth_provider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(user.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_vip ? (
                                                <span className="flex items-center gap-1 text-moso-gold font-bold text-xs">
                                                    <Shield size={14} /> VIP 會員
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                                                    一般會員
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.is_vip ? (
                                                <button
                                                    onClick={() => handleToggleVip(user.id, false)}
                                                    className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-red-500 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    取消 VIP
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleVip(user.id, true)}
                                                    className="px-3 py-1.5 border border-moso-gold text-moso-gold hover:bg-moso-gold hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    升級 VIP
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}