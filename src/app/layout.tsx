import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Your personal places backlog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Ambient gradient blobs */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-48 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-sky-400/6 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-violet-400/5 blur-3xl" />
        </div>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
