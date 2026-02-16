import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders, NextIntlProvider } from "@/components/providers";
import { TopNav } from "@/components/TopNav";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "First Family RAG",
  description:
    "Client-facing RAG dashboard powered by n8n and First Family intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <NextIntlProvider>
          <ClientProviders>
            <div className="relative min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
              <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_55%)]" />
              <div className="relative z-10 flex min-h-screen flex-col">
                <TopNav />
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </div>
          </ClientProviders>
        </NextIntlProvider>
      </body>
    </html>
  );
}
