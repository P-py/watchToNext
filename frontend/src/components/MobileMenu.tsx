"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Session } from "@/lib/auth/types";
import { ThemeToggle } from "./ThemeToggle";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  session: Session | null;
  links: NavLink[];
}

/** Shared row treatment so every menu entry looks and sizes the same. */
const ROW = "flex h-12 items-center gap-3 rounded-lg px-3 text-sm transition-colors";

export function MobileMenu({ session, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="flex items-center gap-1 md:hidden">
      <ThemeToggle />

      {/* Auth state, always visible — no need to open the menu to tell. */}
      {session ? (
        <Link
          href="/profile"
          aria-label={`Perfil de ${session.displayName}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 transition-colors hover:bg-amber-500/25"
        >
          <User className="h-4 w-4" />
        </Link>
      ) : (
        <Link
          href="/login"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-n-300 transition-colors hover:text-amber-400"
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </Link>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-n-300 transition-colors hover:bg-n-800"
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
            className="absolute left-0 right-0 top-16 border-t border-n-800 bg-n-950/95 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`${ROW} text-n-300 hover:bg-n-800 hover:text-amber-400`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-n-800" />

              {session ? (
                <>
                  <span className={`${ROW} text-n-500`}>
                    <User className="h-4 w-4 shrink-0" />
                    {session.displayName}
                  </span>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      onClick={close}
                      className={`${ROW} w-full text-n-300 hover:bg-n-800 hover:text-amber-400`}
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
                    className={`${ROW} text-n-300 hover:bg-n-800 hover:text-amber-400`}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className={`${ROW} font-medium text-amber-400 hover:bg-n-800`}
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
