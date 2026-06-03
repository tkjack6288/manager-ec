/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  try {
    // 透過 API 獲取商品資訊
    const res = await fetch(`https://manager-ec-backend-164815154526.asia-east1.run.app/products/${id}`, {
      next: { revalidate: 3600 }, // 快取一小時
    });

    if (!res.ok) {
      return {
        title: "找不到商品 | Mososhop",
        description: "您尋找的商品不存在或已下架。",
      };
    }

    const product = await res.json();
    
    // 解析圖片
    let imageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=630";
    if (product.images) {
      try {
        const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          imageUrl = parsedImages[0];
        }
      } catch (e) {
        imageUrl = product.images;
      }
    }

    // 處理描述
    const plainDescription = product.description 
      ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 160) // 簡單移除 HTML tag 並截斷
      : `探索 ${product.name} 的詳細資訊，立即在 Mososhop 選購，享有最高 10% Moso 幣回饋！`;

    return {
      title: `${product.name} | Mososhop`,
      description: plainDescription,
      openGraph: {
        title: `${product.name} | Mososhop`,
        description: plainDescription,
        url: `https://www.moso.com.tw/product/${id}`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Mososhop`,
        description: plainDescription,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "商品詳情 | Mososhop",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
