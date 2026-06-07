"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";

export function AboutIntro() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-4"
    >
      <motion.h2
        variants={fadeUp}
        className="text-2xl font-bold text-n-100 sm:text-3xl"
      >
        A ideia
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="leading-relaxed text-n-400"
      >
        O watchToNext nasceu como um projeto acadêmico com uma pergunta simples:
        como recomendar filmes sem depender apenas das listas de mais populares?
        Em vez de mostrar o que todo mundo está assistindo, queríamos sugerir o
        que combina com o gosto de cada pessoa.
      </motion.p>
      <motion.p
        variants={fadeUp}
        className="leading-relaxed text-n-400"
      >
        A resposta foi tratar recomendação como um problema de proximidade: a
        partir dos filmes que você já gostou, encontrar os títulos mais
        parecidos. É daí que vem o nome — depois de assistir a um filme, sempre
        fica a pergunta &ldquo;o que ver a seguir?&rdquo;.
      </motion.p>
    </motion.section>
  );
}
