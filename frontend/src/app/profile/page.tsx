import { Navbar } from "@/components/Navbar";
import { requireSession } from "@/lib/auth/guards";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  await requireSession();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProfileClient />
      </main>
    </>
  );
}
