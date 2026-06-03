/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import "../globals.css";
import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("管理員");

  useEffect(() => {
    // 登入頁不需要驗證，直接放行
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const adminDataStr = localStorage.getItem("adminData");
    if (adminDataStr) {
      try {
        const data = JSON.parse(adminDataStr);
        if (data.name) setAdminName(data.name);
      } catch (e) {
        // ignore
      }
    }
    
    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized) {
    // 避免畫面閃爍
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">載入中...</div>;
  }

  // 登入頁面不需要左側邊欄和上方 Header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans antialiased text-slate-800">

      {/* 側邊導覽列 Sidebar */}
      <AdminSidebar />

      {/* 主內容區 Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">管理中心</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-tr from-moso-pink to-moso-red rounded-full flex items-center justify-center text-white font-bold text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-sm">{adminName} 您好</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
