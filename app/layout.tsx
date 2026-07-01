import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "",
  description: "",
  keywords: [
    "",
  ],
  openGraph: {
    title: '',
    description: '',
    url: 'https://www.',
    siteName: '',
    images: [
      {
        url: 'https://www./images/og_image.png',
        width: 1200,
        height: 630,
        alt: '',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  other: {
    'naver-site-verification': 'search- advider',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
