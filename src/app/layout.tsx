import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Character Universe",
  description: "캐릭터들의 세계에 들어오세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
