import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "導購回饋說明 | Mososhop",
  description: "了解如何在 Mososhop 透過導購功能賺取更多 Moso 幣回饋。",
};

export default function AffiliateInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
