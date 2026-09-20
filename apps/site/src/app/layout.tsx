import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import "./styles.css";

export const metadata: Metadata = {
  title: "BlogGenius",
  description: "주제만 정하세요. 글쓰기부터 발행까지 BlogGenius가 도와드립니다.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <SiteHeader />
        <div className="site-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
