"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Eye, DollarSign, Truck, CheckCircle, Clock } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm(`確定要將狀態改為 ${newStatus} 嗎？`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status?status=${newStatus}`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error("更新失敗");
      alert("訂單狀態已更新");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("更新狀態失敗");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "pending": return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-bold"><Clock size={14} /> 待處理</span>;
      case "shipping": return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-bold"><Truck size={14} /> 出貨中</span>;
      case "completed": return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-xs font-bold"><CheckCircle size={14} /> 已完成</span>;
      case "cancelled": return <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">已取消</span>;
      default: return <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">訂單管理</h1>
          <p className="text-slate-500 mt-1">追蹤與處理 Mososhop 全站交易紀錄</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          匯出報表
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* 工具列 */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜尋訂單編號..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-moso-pink/50 focus:border-moso-pink"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white w-full sm:w-auto bg-white">
              <Filter size={16} /> 進階篩選
            </button>
            <select className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-moso-pink">
              <option>全部狀態</option>
              <option>待處理</option>
              <option>出貨中</option>
              <option>已完成</option>
            </select>
          </div>
        </div>

        {/* 列表 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">訂單編號 & 時間</th>
                <th className="px-6 py-4">顧客 ID</th>
                <th className="px-6 py-4 text-right">訂單總額</th>
                <th className="px-6 py-4 text-right">Moso 幣折抵</th>
                <th className="px-6 py-4 text-right">實付金額</th>
                <th className="px-6 py-4 text-center">付款方式</th>
                <th className="px-6 py-4 text-center">狀態</th>
                <th className="px-6 py-4 text-right">變更狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">載入中...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">目前無訂單</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800" title={order.id}>{order.id.slice(0, 18)}...</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 text-xs" title={order.user_id}>
                      {order.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-right font-medium">NT$ {order.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-moso-pink font-bold">- {order.moso_coin_used}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-moso-red">
                      NT$ {order.final_paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.payment_method === 'wallet' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-moso-pink bg-moso-pink/10 px-2 py-1 rounded">全額抵扣</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded"><DollarSign size={12} /> 綠界金流</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-center mt-2.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        className="text-xs border rounded p-1"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">待處理</option>
                        <option value="shipping">出貨中</option>
                        <option value="completed">已完成</option>
                        <option value="cancelled">已取消</option>
                      </select>
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