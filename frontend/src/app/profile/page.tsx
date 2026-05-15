import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { readSession } from "@/lib/auth/session";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await readSession();
  if (!session) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProfileClient />
      </main>
    </>
  );
}
