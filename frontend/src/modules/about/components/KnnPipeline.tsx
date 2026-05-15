"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, cardItem } from "@/utils/animations";

const STAGES = [
  {
    title: "Filme",
    detail: "Cada título do catálogo",
  },
  {
    title: "Vetor de características",
    detail: "Gêneros, nota, nº de votos e popularidade",
  },
  {
    title: "Similaridade por cosseno",
    detail: "Compara o vetor com todos os outros filmes",
  },
  {
    title: "Top-N",
    detail: "Os vizinhos mais próximos viram recomendação",
  },
];

export function KnnPipeline() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
    >
      {STAGES.map((stage, index) => (
        <motion.div
          key={stage.title}
          variants={cardItem}
          className="flex flex-1 flex-col items-center gap-3 sm:flex-row"
        >
          <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-amber-400/80">
              {stage.title}
            </p>
            <p className="mt-1 text-xs leading-snug text-zinc-400">
              {stage.detail}
            </p>
          </div>
          {index < STAGES.length - 1 && (
            <ArrowRight
              className="h-4 w-4 shrink-0 rotate-90 text-zinc-600 sm:rotate-0"
              aria-hidden="true"
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
