import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import Script from "next/script";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Onward",
  description: "Your journey starts here.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script src="/newrelic.js" strategy="beforeInteractive" />
      </head>
      <body className="font-[family-name:var(--font-inter)] antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}