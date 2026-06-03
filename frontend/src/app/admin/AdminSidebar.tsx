"use client";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Star
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "營運總覽", exact: true },
        { href: "/admin/products", icon: Package, label: "商品管理" },
        { href: "/admin/orders", icon: ShoppingCart, label: "訂單管理" },
        { href: "/admin/users", icon: Users, label: "會員管理" },
        { href: "/admin/reviews", icon: Star, label: "評價管理" },
        { href: "/admin/settings", icon: Settings, label: "系統設定" },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl shrink-0">
            <div className="p-6 border-b border-slate-800 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-moso-pink to-moso-red tracking-tighter">
                    mososhop
                </span>
                <span className="ml-2 text-xs font-bold uppercase tracking-widest text-slate-500">中台</span>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? "bg-moso-pink/10 text-moso-pink"
                                    : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={() => {
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminData");
                        window.location.href = "/admin/login";
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-colors text-left text-slate-400">
                    <LogOut size={20} />
                    登出系統
                </button>
            </div>
        </aside>
    );
}