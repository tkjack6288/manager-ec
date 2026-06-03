import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運送說明 | Mososhop",
  description: "了解 Mososhop 的商品運送方式、運費計算及配送範圍。",
};

export default function ShippingInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
