"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag, CheckCircle2, XCircle } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    is_active: true,
    imageUrls: [] as string[]
  });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: "POST",
        body: uploadData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, data.url] }));
    } catch (err) {
      alert("圖片上傳失敗");
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls.splice(index, 1);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const fetchProducts = async (query = "") => {
    try {
      setLoading(true);
      const url = query ? `${API_BASE}/admin/products?search=${encodeURIComponent(query)}` : `${API_BASE}/admin/products`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  const openModal = (product: any = null) => {
    if (product) {
      setEditProduct(product);
      let parsedUrls: string[] = [];
      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            parsedUrls = parsed;
          } else if (typeof parsed === "string") {
            parsedUrls = [parsed];
          }
        } catch (e) {
          parsedUrls = [product.images]; // fallback if not json
        }
      }
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category || "",
        is_active: product.is_active,
        imageUrls: parsedUrls
      });
    } else {
      setEditProduct(null);
      setFormData({
        sku: "",
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        is_active: true,
        imageUrls: []
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      (payload as any).images = JSON.stringify(payload.imageUrls);
      delete (payload as any).imageUrls;

      let res;
      if (editProduct) {
        res = await fetch(`${API_BASE}/admin/products/${editProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "儲存失敗");
      }
      alert(editProduct ? "商品更新成功" : "商品新增成功");
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "儲存失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此商品嗎？")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      alert("商品已刪除");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">商品管理</h1>
          <p className="text-slate-500 mt-1">管理與維護所有上架商品與庫存</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          新增商品
        </button>
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
                <th className="px-6 py-4">進價</th>
                <th className="px-6 py-4">庫存</th>
                <th className="px-6 py-4">狀態</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">載入中...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">找不到符合的商品</td>
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
                    <td className="px-6 py-4 font-bold text-moso-red">NT$ {prod.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prod.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={14} /> 上架中</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-bold text-xs"><XCircle size={14} /> 已下架</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => openModal(prod)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editProduct ? "編輯商品" : "新增商品"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} disabled={!!editProduct} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">商品圖片</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {formData.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded border overflow-hidden group">
                      <img src={url} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-white/80 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="輸入圖片網址並按 Enter 新增..." className="flex-1 border rounded-lg p-2 text-sm"
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, e.target.value] }));
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="text-sm text-slate-500">或</span>
                  <label className="cursor-pointer bg-slate-100 px-3 py-2 rounded-lg text-sm border hover:bg-slate-200 whitespace-nowrap">
                    上傳圖片
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">名稱</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分類</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">進價 (原 DB 售價欄位)</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">庫存</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  <span className="text-sm font-medium">是否上架</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white rounded-lg">儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
