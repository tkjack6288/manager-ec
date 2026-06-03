/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Trash2, Search, MessageSquare, AlertCircle } from "lucide-react";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = () => {
        setLoading(true);
        axios.get(`https://manager-ec-backend-164815154526.asia-east1.run.app/admin/reviews`)
            .then(res => {
                setReviews(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("無法取得評價資料：", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除這筆評價嗎？此動作無法復原。")) return;
        try {
            await axios.delete(`https://manager-ec-backend-164815154526.asia-east1.run.app/admin/reviews/${id}`);
            fetchReviews();
            alert("評價已刪除");
        } catch (err: any) {
            console.error(err);
            alert("刪除失敗");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">評價管理</h1>
                    <p className="text-slate-500 mt-1">管理所有會員的商品評價</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="搜尋評價內容或帳號..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-moso-pink outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moso-pink"></div>
                        </div>
                    ) : reviews.length > 0 ? (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="p-4">商品 / 會員</th>
                                    <th className="p-4 w-32">評分</th>
                                    <th className="p-4">評價內容</th>
                                    <th className="p-4 w-32">評價時間</th>
                                    <th className="p-4 w-24 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{review.product_name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{review.user_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded w-fit">
                                                <Star className="fill-amber-400 text-amber-400" size={14} />
                                                <span className="font-bold">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {review.comment ? (
                                                <p className="line-clamp-2 max-w-md text-slate-700" title={review.comment}>
                                                    {review.comment}
                                                </p>
                                            ) : (
                                                <span className="text-slate-400 italic">無文字評價</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">
                                            {new Date(review.created_at).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="刪除評價"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">目前沒有評價</h3>
                            <p className="text-slate-500">尚無會員對商品留下評價</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
