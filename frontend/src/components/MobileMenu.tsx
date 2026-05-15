"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Session } from "@/lib/auth/types";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  session: Session | null;
  links: NavLink[];
}

export function MobileMenu({ session, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-16 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="flex h-12 items-center text-sm text-zinc-300 transition-colors hover:text-amber-400"
                >
                  {link.label}
                </Link>
              ))}

              {session ? (
                <>
                  <span className="mt-2 flex h-12 items-center text-sm text-zinc-400">
                    {session.displayName}
                  </span>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      onClick={close}
                      className="mb-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
                    >
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex h-12 items-center text-sm text-zinc-300 transition-colors hover:text-amber-400"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="mt-2 mb-3 inline-flex h-11 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition-colors hover:bg-amber-400"
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
