import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "會員中心 | Mososhop",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
