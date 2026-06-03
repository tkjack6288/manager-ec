import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "所有商品 | Mososhop",
  description: "瀏覽 Mososhop 所有精選商品，享受最高 10% Moso 幣回饋，以及專屬會員折扣優惠。",
  openGraph: {
    title: "所有商品 | Mososhop",
    description: "瀏覽 Mososhop 所有精選商品，享受最高 10% Moso 幣回饋，以及專屬會員折扣優惠。",
    url: "https://www.moso.com.tw/products",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
