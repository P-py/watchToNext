"use client";

import { motion } from "framer-motion";
import { Database, ArrowRight, Film } from "lucide-react";
import { staggerContainer, cardItem } from "@/utils/animations";

export function DataImportFlow() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
    >
      <motion.div
        variants={cardItem}
        className="flex-1 rounded-xl border border-n-800 bg-n-900 p-5 text-center"
      >
        <Database className="mx-auto mb-3 h-7 w-7 text-amber-400" />
        <h3 className="text-sm font-semibold text-n-100">
          Base pública de cinema
        </h3>
        <p className="mt-1 text-sm text-n-400">
          Cerca de 930 mil filmes, disponível no Kaggle.
        </p>
      </motion.div>

      <motion.div variants={cardItem} className="flex justify-center">
        <ArrowRight
          className="h-5 w-5 rotate-90 text-n-600 sm:rotate-0"
          aria-hidden="true"
        />
      </motion.div>

      <motion.div
        variants={cardItem}
        className="flex-1 rounded-xl border border-n-800 bg-n-900 p-5 text-center"
      >
        <Film className="mx-auto mb-3 h-7 w-7 text-amber-400" />
        <h3 className="text-sm font-semibold text-n-100">
          Catálogo do watchToNext
        </h3>
        <p className="mt-1 text-sm text-n-400">
          Importado uma única vez, pronto para explorar.
        </p>
      </motion.div>
    </motion.div>
  );
}
