"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Info } from "lucide-react";
import { fadeUp, heroStagger } from "@/utils/animations";

export function HomeCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        variants={heroStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="max-w-2xl text-2xl font-bold text-n-100 sm:text-3xl"
        >
          Pronto para descobrir seu próximo filme?
        </motion.h2>
        <motion.p variants={fadeUp} className="max-w-xl text-n-400">
          Comece pelos filmes que você já ama e deixe o KNN cuidar do resto.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/search"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-medium text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30"
          >
            <Search className="h-4 w-4" />
            Começar agora
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-n-700 bg-n-800 px-6 text-sm font-medium text-n-100 transition-all hover:border-n-600 hover:bg-n-700"
          >
            <Info className="h-4 w-4" />
            Conhecer o projeto
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
