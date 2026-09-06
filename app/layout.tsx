import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BASE · 住宅空间设计实验室',
  description: '固定建筑空间、三套全屋家具与软装方案。白模检查、固定机位比较、原图对照与第一人称漫游。',
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

