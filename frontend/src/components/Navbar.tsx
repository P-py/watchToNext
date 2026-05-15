"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import type { Session } from "@/lib/auth/types";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/movies", label: "Movies" },
  { href: "/search", label: "Search" },
  { href: "/profile", label: "Profile" },
];

function AuthActionsDesktop({ session }: { session: Session | null }) {
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-300">{session.displayName}</span>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            Sair
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
      >
        Entrar
      </Link>
      <Link
        href="/signup"
        className="inline-flex h-9 items-center rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition-colors hover:bg-amber-400"
      >
        Criar conta
      </Link>
    </div>
  );
}

export function Navbar() {
  const session = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-amber-400">
          <Film className="h-5 w-5" />
          watchToNext
        </Link>

        <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex">
          <AuthActionsDesktop session={session} />
        </div>

        <MobileMenu session={session} links={NAV_LINKS} />
      </div>
    </nav>
  );
}
