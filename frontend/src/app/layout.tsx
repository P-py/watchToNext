import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AcademicDisclaimer } from "@/components/AcademicDisclaimer";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { WatchedProvider } from "@/components/WatchedProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemedToaster } from "@/components/ThemedToaster";
import TmdbAttribution from "@/components/TmdbAttribution";
import { readSession } from "@/lib/auth/session";

// Runs before first paint to apply the persisted theme class, avoiding a flash
// of the wrong theme. Defaults to dark when no preference is stored. Keep the
// storage key in sync with `THEME_STORAGE_KEY` in `ThemeProvider`.
const themeScript = `(function(){try{var t=localStorage.getItem('wtn-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true);}catch(e){document.documentElement.classList.add('dark');}})();`;

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${dmSans.variable} ${dmMono.variable} flex min-h-screen flex-col bg-n-950 text-n-100 antialiased`}
      >
        <ThemeProvider>
          <SessionProvider initialSession={session}>
            <FavoritesProvider>
              <WatchedProvider>
                <AcademicDisclaimer />
                <div className="flex-1">{children}</div>
                <TmdbAttribution />
                <ThemedToaster />
              </WatchedProvider>
            </FavoritesProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
