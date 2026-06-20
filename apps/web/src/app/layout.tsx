import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Topmaster — O'zbekistondagi ishonchli usta bozori",
  description:
    "Uy ta'miri, yuk tashish, kuryer, repetitor — topmaster.uz orqali daqiqalarda usta toping yoki usta sifatida ishlang.",
  keywords: "usta topish, uy ta'miri toshkent, topmaster uz, xizmat bozori",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${jakarta.variable} antialiased`}>
      <body className="min-h-screen bg-white text-[#0D0D1A] font-jakarta">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
