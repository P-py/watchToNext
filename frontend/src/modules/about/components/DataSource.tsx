"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";
import { DataImportFlow } from "./DataImportFlow";

export function DataSource() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-5"
    >
      <motion.h2
        variants={fadeUp}
        className="text-2xl font-bold text-n-100 sm:text-3xl"
      >
        De onde vêm os filmes
      </motion.h2>
      <motion.p variants={fadeUp} className="leading-relaxed text-n-400">
        Todas as informações de filmes — títulos, sinopses, notas e pôsteres —
        vêm de uma grande base de dados pública de cinema, com cerca de 930 mil
        filmes, disponível no Kaggle.
      </motion.p>
      <motion.p variants={fadeUp} className="leading-relaxed text-n-400">
        Em vez de buscar esses dados na internet a cada acesso, o watchToNext
        traz essa base inteira para dentro do app uma única vez. A partir daí,
        tudo funciona de forma independente — o que deixa a navegação mais
        rápida e estável.
      </motion.p>

      <DataImportFlow />
    </motion.section>
  );
}
