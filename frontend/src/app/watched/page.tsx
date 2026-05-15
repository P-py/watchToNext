import { Navbar } from "@/components/Navbar";
import { requireSession } from "@/lib/auth/guards";
import { WatchedList } from "@/modules/user/components/WatchedList";

export default async function WatchedPage() {
  await requireSession();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-100 md:text-3xl lg:text-4xl">
          Assistidos
        </h1>
        <WatchedList />
      </main>
    </>
  );
}
