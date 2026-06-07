"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Film, Search, Sparkles } from "lucide-react";
import { fadeUp, heroStagger } from "@/utils/animations";
import { HowItWorks } from "@/modules/home/components/HowItWorks";
import { FeatureHighlights } from "@/modules/home/components/FeatureHighlights";
import { HomeCta } from "@/modules/home/components/HomeCta";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col items-center gap-7 text-center"
            variants={heroStagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
              >
                <Film className="h-10 w-10 text-amber-400" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight text-n-100 sm:text-5xl lg:text-6xl">
                watchToNext
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-lg text-n-400"
            >
              Descubra filmes que você vai amar. Recomendações baseadas em
              análise de similaridade KNN — não em listas genéricas de
              popularidade.
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
                Buscar filmes
              </Link>
              <Link
                href="/movies"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-n-700 bg-n-800 px-6 text-sm font-medium text-n-100 transition-all hover:border-n-600 hover:bg-n-700"
              >
                <Sparkles className="h-4 w-4" />
                Ver todos
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <HowItWorks />
        <FeatureHighlights />
        <HomeCta />
      </main>
    </>
  );
}
