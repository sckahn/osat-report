import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSAT Market Intelligence",
  description: "OSAT 기반 국제 반도체 시장 동향 분석 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 sm:h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                  OS
                </div>
                <span className="text-sm sm:text-lg font-bold text-white truncate">
                  OSAT Market
                </span>
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500 px-4">
          OSAT Market Intelligence
        </footer>
      </body>
    </html>
  );
}
