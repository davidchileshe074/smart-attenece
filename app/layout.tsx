import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/ui/preloader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Attendance | Enterprise Academic Tracking",
  description: "Minimalist, secure, and professional attendance management for modern institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full antialiased text-text-primary`}>
        <Preloader />
        <div className="fixed top-0 left-0 right-0 h-1 z-[10000] pointer-events-none">
           <div className="h-full bg-accent w-1/3 animate-[loading_2s_infinite]" />
        </div>
        {children}
      </body>
    </html>
  );
}

