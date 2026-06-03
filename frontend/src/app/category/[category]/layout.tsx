import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }> | { category: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const decodedCategory = decodeURIComponent(resolvedParams.category);

  return {
    title: `${decodedCategory} 相關商品 | Mososhop`,
    description: `探索 ${decodedCategory} 相關的頂級商品，享受購物 10% 回饋與專屬 VIP 折扣。立即在 Mososhop 選購最適合您的優質商品。`,
    openGraph: {
      title: `${decodedCategory} 相關商品 | Mososhop`,
      description: `探索 ${decodedCategory} 相關的頂級商品，享受購物 10% 回饋與專屬 VIP 折扣。`,
      url: `https://www.moso.com.tw/category/${resolvedParams.category}`,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
