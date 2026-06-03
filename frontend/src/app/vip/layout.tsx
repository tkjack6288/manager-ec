import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP 會員專區 | Mososhop",
  description: "加入 Mososhop VIP，解鎖免年費優惠、專屬隱藏版稀世專區，以及最高 25% Moso 幣回饋禮遇。",
  openGraph: {
    title: "VIP 會員專區 | Mososhop",
    description: "加入 Mososhop VIP，解鎖免年費優惠、專屬隱藏版稀世專區，以及最高 25% Moso 幣回饋禮遇。",
    url: "https://www.moso.com.tw/vip",
  },
};

export default function VipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
