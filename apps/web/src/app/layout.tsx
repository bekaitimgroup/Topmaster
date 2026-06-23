import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Topmaster — O'zbekistondagi ishonchli usta bozori",
  description:
    "Uy ta'miri, yuk tashish, kuryer, repetitor — topmaster.uz orqali daqiqalarda usta toping yoki usta sifatida ishlang.",
  keywords: "usta topish, uy ta'miri toshkent, topmaster uz, xizmat bozori",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${jakarta.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-white text-[#0D0D1A] font-inter">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
