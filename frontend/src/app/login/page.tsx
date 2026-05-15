"use client";

import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fadeUp, heroStagger } from "@/utils/animations";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <main className="mx-auto flex max-w-2xl flex-col px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center gap-7 text-center"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <KeyRound className="h-9 w-9 text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Entrar
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="max-w-lg text-base text-zinc-400">
            Você será redirecionado para o nosso provedor de identidade para autenticar
            com segurança. O watchToNext nunca recebe sua senha.
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="/api/auth/login"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </motion.a>

          <motion.p variants={fadeUp} className="text-xs text-zinc-500">
            Ainda não tem conta? <a href="/signup" className="underline hover:text-amber-400">Criar conta</a>.
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
