import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Mososhop | 超凡的購物體驗",
  description: "全台最優質電子商務平台，買東西賺 Moso 幣，全額抵扣無上限。體驗專屬一對一私人購物顧問，解鎖 VVIP 隱藏版稀世專區。",
  keywords: ["Mososhop", "電商", "購物", "Moso 幣", "點數回饋", "網購", "免運"],
  openGraph: {
    title: "Mososhop | 超凡的購物體驗",
    description: "全台最優質電子商務平台，買東西賺 Moso 幣，全額抵扣無上限。",
    url: "https://www.moso.com.tw",
    siteName: "Mososhop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "Mososhop 購物平台",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mososhop | 超凡的購物體驗",
    description: "全台最優質電子商務平台，買東西賺 Moso 幣，全額抵扣無上限。",
    images: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=630"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased min-h-screen flex flex-col pt-[72px] bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
