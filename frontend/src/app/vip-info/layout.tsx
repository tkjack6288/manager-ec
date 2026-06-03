import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP 專屬禮遇說明 | Mososhop",
  description: "詳細了解 Mososhop VIP 會員的專屬權益、升級條件及隱藏版優惠。",
};

export default function VipInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
