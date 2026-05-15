import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AcademicDisclaimer } from "@/components/AcademicDisclaimer";
import { SessionProvider } from "@/components/SessionProvider";
import TmdbAttribution from "@/components/TmdbAttribution";
import { readSession } from "@/lib/auth/session";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "watchToNext",
  description: "Discover your next favorite movie with KNN-powered recommendations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await readSession();

  return (
    <html lang="pt-BR">
      <body
        className={`${dmSans.variable} ${dmMono.variable} flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased`}
      >
        <SessionProvider initialSession={session}>
          <AcademicDisclaimer />
          <div className="flex-1">{children}</div>
          <TmdbAttribution />
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
