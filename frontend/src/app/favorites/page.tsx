import { Navbar } from "@/components/Navbar";
import { requireSession } from "@/lib/auth/guards";
import { FavoritesList } from "@/modules/user/components/FavoritesList";

export default async function FavoritesPage() {
  await requireSession();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl">
          Favoritos
        </h1>
        <FavoritesList />
      </main>
    </>
  );
}
