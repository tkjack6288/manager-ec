import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Mososhop | 中台管理系統",
  description: "Mososhop 員工專屬中台",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              M
            </div>
            <span className="font-medium text-sm">管理員 您好</span>
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
