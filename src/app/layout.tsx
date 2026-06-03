import type { Metadata } from "next";
import { ServiceWorker } from "@/components/service-worker";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Big MAQ Story Engine",
    template: "%s | Big MAQ Story Engine",
  },
  description: "A privacy-first visual branching story editor by Big MAQ Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ServiceWorker />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
