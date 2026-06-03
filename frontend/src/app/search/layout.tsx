import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜尋結果 | Mososhop",
  description: "在 Mososhop 搜尋您心儀的商品，快速找到最划算的優惠與折扣。",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
