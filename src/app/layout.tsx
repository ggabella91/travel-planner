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
  description: "Your personal places backlog and trip planner",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Travel Planner",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#5046e4" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
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
