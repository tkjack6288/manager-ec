import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "退換貨政策 | Mososhop",
  description: "了解 Mososhop 的退貨及換貨政策，保障您的購物權益。",
};

export default function ReturnPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
