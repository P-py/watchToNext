import { Navbar } from "@/components/Navbar";
import { requireSession } from "@/lib/auth/guards";
import { SuggestionsClient } from "@/modules/recommendations/components/SuggestionsClient";

export default async function SuggestionsPage() {
  await requireSession();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-n-100 md:text-3xl lg:text-4xl">
          Sugestões
        </h1>
        <p className="mb-8 mt-2 text-n-400">
          Recomendações por similaridade KNN — do seu jeito.
        </p>
        <SuggestionsClient />
      </main>
    </>
  );
}
