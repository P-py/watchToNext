"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fadeUp, heroStagger } from "@/utils/animations";

export default function SignupPage() {
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
            <ShieldCheck className="h-9 w-9 text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight text-n-100 sm:text-4xl">
              Criar conta
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="max-w-lg text-base text-n-400">
            Você será redirecionado para o nosso provedor de identidade para concluir o
            cadastro com segurança. Suas credenciais nunca passam pelo watchToNext.
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="/api/auth/signup"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </motion.a>

          <motion.p variants={fadeUp} className="text-xs text-n-500">
            Já tem uma conta? Use <a href="/login" className="underline hover:text-amber-400">Entrar</a> após o cadastro.
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
