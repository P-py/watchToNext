"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cardItem } from "@/utils/animations";

const LAYERS = [
  {
    layer: "Frontend",
    items: ["Next.js", "TypeScript", "TailwindCSS", "framer-motion"],
  },
  {
    layer: "Backend",
    items: ["Kotlin", "Spring Boot", "Gradle multi-módulo"],
  },
  {
    layer: "Infraestrutura",
    items: ["PostgreSQL", "Redis", "Keycloak"],
  },
];

export function TechStack() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-6"
    >
      <motion.h2
        variants={fadeUp}
        className="text-2xl font-bold text-n-100 sm:text-3xl"
      >
        Tecnologias
      </motion.h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {LAYERS.map((layer) => (
          <motion.div
            key={layer.layer}
            variants={cardItem}
            className="rounded-xl border border-n-800 bg-n-900 p-5"
          >
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400/80">
              {layer.layer}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {layer.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-n-800 bg-n-800/60 px-2.5 py-1 text-sm text-n-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
