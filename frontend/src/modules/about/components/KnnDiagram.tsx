"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/utils/animations";

// Background catalog points (movies that are NOT near the seed).
const CATALOG = [
  { x: 60, y: 60 },
  { x: 110, y: 220 },
  { x: 320, y: 70 },
  { x: 350, y: 210 },
  { x: 70, y: 150 },
  { x: 300, y: 250 },
  { x: 250, y: 50 },
  { x: 90, y: 110 },
  { x: 340, y: 140 },
];

// The K nearest neighbours of the seed — inside the dashed radius.
const NEIGHBOURS = [
  { x: 155, y: 110 },
  { x: 248, y: 118 },
  { x: 168, y: 188 },
  { x: 242, y: 178 },
];

const SEED = { x: 200, y: 145 };

export function KnnDiagram() {
  return (
    <motion.figure
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="rounded-xl border border-n-800 bg-n-900 p-5"
    >
      <svg
        viewBox="0 0 400 290"
        className="w-full"
        role="img"
        aria-label="Diagrama do espaço de características: o filme semente e seus vizinhos mais próximos"
      >
        {/* axes */}
        <line x1="40" y1="260" x2="380" y2="260" stroke="#3f3f46" strokeWidth="1" />
        <line x1="40" y1="260" x2="40" y2="20" stroke="#3f3f46" strokeWidth="1" />
        <text x="380" y="278" textAnchor="end" className="fill-n-500" fontSize="11">
          gênero · tom
        </text>
        <text
          x="32"
          y="20"
          textAnchor="end"
          className="fill-n-500"
          fontSize="11"
          transform="rotate(-90 32 20)"
        >
          nota · popularidade
        </text>

        {/* neighbourhood radius */}
        <circle
          cx={SEED.x}
          cy={SEED.y}
          r="62"
          fill="rgba(245,158,11,0.07)"
          stroke="rgba(245,158,11,0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* edges from seed to its K neighbours */}
        {NEIGHBOURS.map((n) => (
          <line
            key={`edge-${n.x}-${n.y}`}
            x1={SEED.x}
            y1={SEED.y}
            x2={n.x}
            y2={n.y}
            stroke="rgba(245,158,11,0.5)"
            strokeWidth="1.5"
          />
        ))}

        {/* far-away catalog movies */}
        {CATALOG.map((p) => (
          <circle key={`cat-${p.x}-${p.y}`} cx={p.x} cy={p.y} r="5" fill="#52525b" />
        ))}

        {/* the K nearest neighbours */}
        {NEIGHBOURS.map((n) => (
          <circle
            key={`nb-${n.x}-${n.y}`}
            cx={n.x}
            cy={n.y}
            r="6"
            fill="#fcd34d"
          />
        ))}

        {/* the seed movie */}
        <circle cx={SEED.x} cy={SEED.y} r="9" fill="#f59e0b" />
        <text
          x={SEED.x}
          y={SEED.y - 16}
          textAnchor="middle"
          className="fill-n-200"
          fontSize="11"
        >
          filme semente
        </text>
      </svg>

      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-n-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> filme que você gostou
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> K vizinhos mais próximos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-n-600" /> demais filmes do catálogo
        </span>
      </figcaption>
    </motion.figure>
  );
}
