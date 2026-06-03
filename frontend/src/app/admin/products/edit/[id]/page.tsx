/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";

const API_BASE = `https://manager-ec-backend-164815154526.asia-east1.run.app`;

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;
    const [channels, setChannels] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        sku: "",
        name: "",
        description: "",
        specifications: "",
        price: 0,
        selling_price: 0,
        stock: 0,
        supply_channel: "",
        sales_channel: "",
        category: "",
        temperature: "normal",
        is_active: true,
        is_sellable: true,
        imageUrls: [] as string[],
        variants: [] as any[]
    });

    const handleChannelChange = (type: 'supply' | 'sales', name: string, checked: boolean) => {
        const field = type === 'supply' ? 'supply_channel' : 'sales_channel';
        let current = formData[field] ? formData[field].split(',').map(s => s.trim()).filter(Boolean) : [];
        if (checked) {
            if (!current.includes(name)) current.push(name);
        } else {
            current = current.filter(c => c !== name);
        }
        setFormData({ ...formData, [field]: current.join(',') });
    };

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/channels`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });
                const data = await res.json();
                setChannels(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChannels();

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/products/${productId}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });
                if (!res.ok) throw new Error("商品不存在");
                const product = await res.json();

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
                        parsedUrls = [product.images];
                    }
                }

                let parsedVariants: any[] = [];
                if (product.variants) {
                    try {
                        const parsed = JSON.parse(product.variants);
                        if (Array.isArray(parsed)) {
                            parsedVariants = parsed.map(v => typeof v === 'string' ? { name: v, price: product.price, selling_price: product.selling_price || 0, stock: product.stock || 0 } : v);
                        } else if (typeof parsed === "string") {
                            parsedVariants = [{ name: parsed, price: product.price, selling_price: product.selling_price || 0, stock: product.stock || 0 }];
                        }
                    } catch (e) {
                        parsedVariants = [{ name: product.variants, price: product.price, selling_price: product.selling_price || 0, stock: product.stock || 0 }];
                    }
                }
                if (parsedVariants.length === 0) {
                    parsedVariants = [{ name: "預設規格", price: product.price, selling_price: product.selling_price || 0, stock: product.stock || 0 }];
                }

                setFormData({
                    sku: product.sku,
                    name: product.name,
                    description: product.description || "",
                    specifications: product.specifications || "",
                    price: product.price,
                    selling_price: product.selling_price || 0,
                    stock: product.stock,
                    supply_channel: product.supply_channel || "",
                    sales_channel: product.sales_channel || "",
                    category: product.category || "",
                    temperature: product.temperature || "normal",
                    is_active: product.is_active,
                    is_sellable: product.is_sellable !== undefined ? product.is_sellable : true,
                    imageUrls: parsedUrls,
                    variants: parsedVariants
                });
            } catch (err) {
                console.error(err);
                alert("無法載入商品資料");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        try {
            const uploadPromises = files.map(async (file) => {
                const uploadData = new FormData();
                uploadData.append("file", file);
                const res = await fetch(`${API_BASE}/admin/upload`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },
                    body: uploadData,
                });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...uploadedUrls]
            }));

            // 由於上傳後 input 依然維持同樣的值，手動清空它讓下次上傳同檔名時也能觸發 onChange
            e.target.value = '';
        } catch (err) {
            alert("圖片上傳失敗");
            console.error(err);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newUrls = [...prev.imageUrls];
            newUrls.splice(index, 1);
            return { ...prev, imageUrls: newUrls };
        });
    };

    const removeVariant = (index: number) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants.splice(index, 1);
            return { ...prev, variants: newVariants };
        });
    };

    const updateVariant = (idx: number, field: string, value: any) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[idx] = { ...newVariants[idx], [field]: value };
            return { ...prev, variants: newVariants };
        });
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData };
            if (payload.variants && payload.variants.length > 0) {
                payload.price = payload.variants[0].price || 0;
                payload.selling_price = payload.variants[0].selling_price || 0;
                payload.stock = payload.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
            }
            (payload as any).images = JSON.stringify(payload.imageUrls);
            delete (payload as any).imageUrls;
            (payload as any).variants = JSON.stringify(payload.variants);

            const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}`, "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "儲存失敗");
            }
            alert("商品更新成功");
            // Optional: go back to product list, or stay
            // window.close() to close the tab might work, but router.back() or just staying is safer.
        } catch (err: any) {
            alert(err.message || "儲存失敗");
        }
    };

    if (loading) {
        return <div className="p-8">載入中...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center mb-6 gap-4">
                <Link href="/admin/products" className="text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">編輯商品</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input type="text" className="w-full border rounded-lg p-2 bg-slate-50 text-slate-500" value={formData.sku} disabled />
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
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleUploadImage} />
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">名稱</label>
                    <input type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">分類</label>
                        <input type="text" className="w-full border rounded-lg p-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">溫層</label>
                        <select className="w-full border rounded-lg p-2" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })}>
                            <option value="normal">常溫</option>
                            <option value="chilled">冷藏</option>
                            <option value="frozen">冷凍</option>
                        </select>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-medium mb-3 text-slate-700">多種規格設定 (可各別設定進價、售價、庫存)</label>
                    <div className="space-y-3 mb-4">
                        {formData.variants && formData.variants.map((v, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs text-slate-500 mb-1 block">規格名稱</label>
                                    <input type="text" className="w-full border rounded-md p-1.5 text-sm" value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} placeholder="如: L, 藍色" />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-slate-500 mb-1 block">進價</label>
                                    <input type="number" className="w-full border rounded-md p-1.5 text-sm" value={v.price || ''} onChange={e => updateVariant(idx, 'price', Number(e.target.value))} placeholder="0" />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-slate-500 mb-1 block">售價</label>
                                    <input type="number" className="w-full border rounded-md p-1.5 text-sm" value={v.selling_price || ''} onChange={e => updateVariant(idx, 'selling_price', Number(e.target.value))} placeholder="0" />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-slate-500 mb-1 block">庫存</label>
                                    <input type="number" className="w-full border rounded-md p-1.5 text-sm" value={v.stock || ''} onChange={e => updateVariant(idx, 'stock', Number(e.target.value))} placeholder="0" />
                                </div>
                                <button onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700 mt-5 p-1">
                                    <XCircle size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), { name: "", price: prev.price, selling_price: prev.selling_price, stock: 0 }] }))}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + 新增規格
                    </button>
                    <p className="text-xs text-slate-500 mt-3">每個商品至少需要一項規格，如果商品沒有分規格，請保留一項「預設規格」即可。</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">商品敍述</label>
                    <RichTextEditor value={formData.description} onChange={val => setFormData({ ...formData, description: val })} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">商品規格</label>
                    <textarea rows={5} className="w-full border rounded-lg p-2" value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">進貨通路</label>
                        <div className="flex flex-wrap gap-3 border rounded-lg p-3 bg-slate-50/50">
                            {channels.filter(c => c.channel_type === 'supply').length === 0 && <span className="text-sm text-slate-400">尚未建立通路</span>}
                            {channels.filter(c => c.channel_type === 'supply').map(c => {
                                const selected = formData.supply_channel ? formData.supply_channel.split(',').map(s => s.trim()).includes(c.name) : false;
                                return (
                                    <label key={c.id} className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-slate-800 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-moso-pink rounded border-slate-300 focus:ring-moso-pink"
                                            checked={selected}
                                            onChange={(e) => handleChannelChange('supply', c.name, e.target.checked)}
                                        />
                                        <span>{c.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">銷售通路</label>
                        <div className="flex flex-wrap gap-3 border rounded-lg p-3 bg-slate-50/50">
                            {channels.filter(c => c.channel_type === 'sales').length === 0 && <span className="text-sm text-slate-400">尚未建立通路</span>}
                            {channels.filter(c => c.channel_type === 'sales').map(c => {
                                const selected = formData.sales_channel ? formData.sales_channel.split(',').map(s => s.trim()).includes(c.name) : false;
                                return (
                                    <label key={c.id} className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-slate-800 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-moso-pink rounded border-slate-300 focus:ring-moso-pink"
                                            checked={selected}
                                            onChange={(e) => handleChannelChange('sales', c.name, e.target.checked)}
                                        />
                                        <span>{c.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                        <span className="text-sm font-medium">是否上架</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={formData.is_sellable} onChange={e => setFormData({ ...formData, is_sellable: e.target.checked })} />
                        <span className="text-sm font-medium">是否可銷售</span>
                    </label>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => window.close()} className="px-6 py-2.5 border rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">關閉視窗</button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">儲存變更</button>
                </div>
            </div>
        </div>
    );
}
