"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fadeUp, heroStagger } from "@/utils/animations";
import { AboutIntro } from "@/modules/about/components/AboutIntro";
import { HowKnnWorks } from "@/modules/about/components/HowKnnWorks";
import { DataSource } from "@/modules/about/components/DataSource";
import { TechStack } from "@/modules/about/components/TechStack";
import { AboutDisclaimer } from "@/modules/about/components/AboutDisclaimer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.header
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div variants={fadeUp}>
            <Film className="h-9 w-9 text-amber-400" />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-n-100 sm:text-4xl"
          >
            Sobre o watchToNext
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl text-n-400">
            Uma plataforma de recomendação de filmes que sugere o que assistir a
            seguir a partir do que você já ama.
          </motion.p>
        </motion.header>

        <div className="mt-16 space-y-16">
          <AboutIntro />
          <HowKnnWorks />
          <DataSource />
          <TechStack />
          <AboutDisclaimer />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="flex justify-center"
          >
            <Link
              href="/search"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-medium text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30"
            >
              <Search className="h-4 w-4" />
              Explorar filmes
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
}
