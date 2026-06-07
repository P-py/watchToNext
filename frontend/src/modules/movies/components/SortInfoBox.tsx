import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { fadeIn } from "@/utils/animations";
import { MovieSort } from "@/types/movie";

interface SortInfo {
  title: string;
  body: string;
}

/** Plain-language copy for the sort modes whose ranking isn't self-evident. */
const SORT_INFO: Partial<Record<MovieSort, SortInfo>> = {
  RELEVANCE: {
    title: "Ordenado por relevância",
    body:
      "Mostramos primeiro os filmes mais conhecidos e bem avaliados pelo " +
      "público. Em vez de seguir modas passageiras, combinamos a nota dada " +
      "pelos espectadores com a quantidade de avaliações — assim, clássicos " +
      "queridos aparecem à frente de títulos ainda pouco vistos.",
  },
  RATING: {
    title: "Ordenado por avaliação",
    body:
      "As notas vêm da comunidade do TMDB (The Movie Database), nossa fonte " +
      "de dados de filmes: é a média das avaliações dadas por milhares de " +
      "espectadores. Aqui os filmes com a maior nota média aparecem primeiro.",
  },
};

/** True when [sort] has an explanatory info box to show. */
export function hasSortInfo(sort: MovieSort): boolean {
  return sort in SORT_INFO;
}

/**
 * Plain-language explainer shown on `/movies` for sort modes whose ranking
 * isn't self-evident — tells the visitor, without jargon, how the order works.
 */
export function SortInfoBox({ sort }: { sort: MovieSort }) {
  const info = SORT_INFO[sort];
  if (!info) return null;
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="mb-6 flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div className="text-sm">
        <p className="font-medium text-n-100">{info.title}</p>
        <p className="mt-1 text-n-400">{info.body}</p>
      </div>
    </motion.div>
  );
}
