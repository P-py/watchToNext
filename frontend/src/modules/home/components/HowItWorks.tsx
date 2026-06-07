"use client";

import { motion } from "framer-motion";
import { Search, Heart, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, cardItem } from "@/utils/animations";

const STEPS = [
  {
    icon: Search,
    title: "Busque um filme",
    description:
      "Pesquise no catálogo do TMDB e encontre títulos que você já assistiu e curtiu.",
  },
  {
    icon: Heart,
    title: "Escolha o que gostou",
    description:
      "Marque favoritos e avalie filmes com notas de meia em meia estrela.",
  },
  {
    icon: Sparkles,
    title: "Receba recomendações",
    description:
      "O algoritmo KNN encontra os filmes mais parecidos e sugere o que assistir a seguir.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="mb-12 text-center text-2xl font-bold text-n-100 sm:text-3xl"
      >
        Como funciona
      </motion.h2>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-6 sm:grid-cols-3"
      >
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            variants={cardItem}
            className="relative rounded-xl border border-n-800 bg-n-900 p-6"
          >
            <span className="font-mono text-sm text-amber-400/70">
              0{index + 1}
            </span>
            <step.icon className="my-3 h-8 w-8 text-amber-400" />
            <h3 className="mb-2 text-lg font-semibold text-n-100">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-n-400">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
