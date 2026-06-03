/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag, CheckCircle2, XCircle, ExternalLink, Settings } from "lucide-react";

const API_BASE = `https://manager-ec-backend-164815154526.asia-east1.run.app`;

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 通路管理 Modal State
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [newSupplyChannel, setNewSupplyChannel] = useState("");
  const [newSalesChannel, setNewSalesChannel] = useState("");

  const fetchProducts = async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `${API_BASE}/admin/products?search=${encodeURIComponent(query)}` : `${API_BASE}/admin/products`;
      const res = await fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/channels`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此商品嗎？")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });
      if (!res.ok) throw new Error("刪除失敗");
      alert("商品已刪除");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  const handleAddChannel = async (type: 'supply' | 'sales') => {
    const name = type === 'supply' ? newSupplyChannel : newSalesChannel;
    if (!name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/admin/channels`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), channel_type: type })
      });
      if (!res.ok) throw new Error("新增失敗");
      
      if (type === 'supply') setNewSupplyChannel("");
      else setNewSalesChannel("");
      
      fetchChannels();
    } catch (err) {
      console.error(err);
      alert("新增通路失敗");
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm("確定要刪除此通路嗎？ (已套用此通路的商品不會被影響)")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/channels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      fetchChannels();
    } catch (err) {
      console.error(err);
      alert("刪除通路失敗");
    }
  };

  const openChannelModal = () => {
    fetchChannels();
    setIsChannelModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">商品管理</h1>
          <p className="text-slate-500 mt-1">管理與維護所有上架商品與庫存</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openChannelModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings size={18} />
            通路管理
          </button>
          <button
            onClick={() => window.open('/admin/products/add', '_blank')}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            新增商品
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* 列表 */}
        <div className="overflow-x-auto">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="搜尋商品名稱、SKU 或分類..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-moso-pink/50 focus:border-moso-pink"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">商品名稱</th>
                <th className="px-6 py-4">分類</th>
                <th className="px-6 py-4">進價 / 售價</th>
                <th className="px-6 py-4">進貨 / 銷售通路</th>
                <th className="px-6 py-4">庫存</th>
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4">前台頁面</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">載入中...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">找不到符合的商品</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">{prod.sku}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{prod.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {prod.category || "無分類"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 line-through text-xs">NT$ {prod.price != null ? Math.round(prod.price).toLocaleString() : ""}</span>
                        <span className="font-bold text-moso-red">NT$ {prod.selling_price != null ? Math.round(prod.selling_price).toLocaleString() : ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-600 font-medium">進貨: {prod.supply_channel || "未設定"}</span>
                        <span className="text-slate-600 font-medium">銷售: {prod.sales_channel || "未設定"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {prod.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={14} /> 上架中</span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 font-bold text-xs"><XCircle size={14} /> 已下架</span>
                        )}
                        {prod.is_sellable ? (
                          <span className="flex items-center gap-1 text-blue-600 font-bold text-xs"><CheckCircle2 size={14} /> 可銷售</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><XCircle size={14} /> 不可銷售</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/product/${prod.id}`} target="_blank" className="text-moso-pink hover:text-moso-red font-medium flex items-center gap-1 text-sm transition-colors w-max">
                        <ExternalLink size={14} /> 點擊前往
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => window.open(`/admin/products/edit/${prod.id}`, '_blank')} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 通路管理 Modal */}
      {isChannelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-slate-400" size={20} />
                通路管理
              </h2>
              <button onClick={() => setIsChannelModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 gap-8">
              {/* 進貨通路區塊 */}
              <div className="flex flex-col gap-4 border-r border-slate-100 pr-8">
                <h3 className="font-bold text-slate-700">進貨通路</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSupplyChannel}
                    onChange={(e) => setNewSupplyChannel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChannel('supply')}
                    placeholder="輸入進貨通路名稱..."
                    className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-moso-pink/50 focus:border-moso-pink outline-none"
                  />
                  <button onClick={() => handleAddChannel('supply')} className="px-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="border border-slate-100 rounded-lg overflow-hidden flex-1 bg-slate-50/30">
                  <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {channels.filter(c => c.channel_type === 'supply').length === 0 ? (
                      <li className="p-4 text-center text-slate-400 text-sm">尚未建立進貨通路</li>
                    ) : (
                      channels.filter(c => c.channel_type === 'supply').map(c => (
                        <li key={c.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                          <span className="text-sm text-slate-700">{c.name}</span>
                          <button onClick={() => handleDeleteChannel(c.id)} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* 銷售通路區塊 */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-slate-700">銷售通路</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSalesChannel}
                    onChange={(e) => setNewSalesChannel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChannel('sales')}
                    placeholder="輸入銷售通路名稱..."
                    className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-moso-pink/50 focus:border-moso-pink outline-none"
                  />
                  <button onClick={() => handleAddChannel('sales')} className="px-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="border border-slate-100 rounded-lg overflow-hidden flex-1 bg-slate-50/30">
                  <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {channels.filter(c => c.channel_type === 'sales').length === 0 ? (
                      <li className="p-4 text-center text-slate-400 text-sm">尚未建立銷售通路</li>
                    ) : (
                      channels.filter(c => c.channel_type === 'sales').map(c => (
                        <li key={c.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                          <span className="text-sm text-slate-700">{c.name}</span>
                          <button onClick={() => handleDeleteChannel(c.id)} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setIsChannelModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
