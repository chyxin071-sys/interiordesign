import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BASE · 住宅空间母模型',
  description: '固定建筑空间与可替换室内设计层。住宅白模、原图对照与第一人称漫游。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
