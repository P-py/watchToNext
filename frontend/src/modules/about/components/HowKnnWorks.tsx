"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";
import { KnnDiagram } from "./KnnDiagram";
import { KnnPipeline } from "./KnnPipeline";

export function HowKnnWorks() {
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
        Como o KNN funciona
      </motion.h2>
      <motion.p variants={fadeUp} className="leading-relaxed text-n-400">
        KNN significa <span className="text-n-200">K-Nearest Neighbors</span>{" "}
        — ou &ldquo;os K vizinhos mais próximos&rdquo;. Cada filme é descrito por
        um conjunto de características (gênero, nota, número de votos e
        popularidade) e tratado como um ponto num espaço multidimensional.
      </motion.p>

      <KnnPipeline />

      <motion.p variants={fadeUp} className="leading-relaxed text-n-400">
        Quando você marca um filme como favorito, o algoritmo mede a distância
        entre esse ponto e todos os outros — usando similaridade por cosseno — e
        seleciona os K mais próximos. Esses vizinhos são exatamente os filmes
        mais parecidos com o seu gosto, e é isso que aparece nas suas
        recomendações.
      </motion.p>

      <KnnDiagram />

      <motion.p variants={fadeUp} className="leading-relaxed text-n-400">
        Quanto mais favoritos e avaliações você registra, mais nítido fica o seu
        perfil e mais certeiras ficam as sugestões.
      </motion.p>
    </motion.section>
  );
}
