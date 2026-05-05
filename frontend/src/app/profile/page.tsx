"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ErrorState } from "@/components/ErrorState";
import { UserProfile } from "@/modules/user/components/UserProfile";
import { userService } from "@/services/user.service";
import { UserProfile as UserProfileType } from "@/types/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-zinc-800" />
                <div className="h-4 w-48 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        )}
        {error && <ErrorState message={error} />}
        {profile && <UserProfile profile={profile} />}
      </main>
    </>
  );
}
