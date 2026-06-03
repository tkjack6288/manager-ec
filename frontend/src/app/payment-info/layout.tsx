import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "付款方式說明 | Mososhop",
  description: "了解 Mososhop 提供的高安全與便捷付款方式，包含信用卡與 Moso 幣折抵。",
};

export default function PaymentInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
