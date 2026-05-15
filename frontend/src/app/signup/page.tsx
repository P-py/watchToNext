"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { fadeUp, heroStagger } from "@/utils/animations";
import { buildKeycloakRegisterUrl } from "@/utils/keycloak";

export default function SignupPage() {
  async function handleContinue() {
    const url = await buildKeycloakRegisterUrl();
    window.location.assign(url);
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Criar conta
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="max-w-lg text-base text-zinc-400">
            Você será redirecionado para o nosso provedor de identidade para concluir o
            cadastro com segurança. Suas credenciais nunca passam pelo watchToNext.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continuar
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-zinc-500">
            Já tem uma conta? Faça login pelo mesmo fluxo após o cadastro.
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
