"use client";

import { motion } from "framer-motion";
import { Network, Heart, Star, Eye } from "lucide-react";
import { fadeUp, staggerContainer, cardItem } from "@/utils/animations";

const FEATURES = [
  {
    icon: Network,
    title: "Similaridade KNN",
    description:
      "Recomendações calculadas pela proximidade entre filmes, não por listas genéricas de popularidade.",
  },
  {
    icon: Heart,
    title: "Favoritos",
    description:
      "Salve os filmes que marcaram você e volte a eles sempre que quiser.",
  },
  {
    icon: Star,
    title: "Avaliações precisas",
    description:
      "Dê notas de meia em meia estrela para refinar cada vez mais suas sugestões.",
  },
  {
    icon: Eye,
    title: "Histórico de assistidos",
    description:
      "Marque o que já viu e acompanhe sua jornada pelo catálogo.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="border-y border-zinc-800 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 text-center text-2xl font-bold text-zinc-100 sm:text-3xl"
        >
          Por que watchToNext
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardItem}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <feature.icon className="mb-3 h-7 w-7 text-amber-400" />
              <h3 className="mb-2 text-base font-semibold text-zinc-100">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
