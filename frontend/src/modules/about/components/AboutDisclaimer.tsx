"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { fadeUp } from "@/utils/animations";

export function AboutDisclaimer() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="rounded-xl border border-amber-900/40 bg-amber-950/30 p-6"
    >
      <div className="mb-3 flex items-center gap-2 text-amber-200">
        <GraduationCap className="h-5 w-5 shrink-0" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Um aviso importante!</h2>
      </div>
      <p className="leading-relaxed text-amber-100/70">
        O &ldquo;watchToNext&rdquo; é um projeto acadêmico, temporário e sem fins lucrativos.
        Não é um serviço de produção e não tem qualquer vínculo com estúdios de
        cinema, plataformas de streaming ou com o TMDB. Os dados de filmes vêm da
        API e do Dataset do TMDB, mas este produto não é endossado nem certificado pelo TMDB.
      </p>
    </motion.section>
  );
}
