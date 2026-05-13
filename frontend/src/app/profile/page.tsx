"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ErrorState } from "@/components/ErrorState";
import { UserProfile } from "@/modules/user/components/UserProfile";
import { userService } from "@/services/user.service";
import { UserProfile as UserProfileType } from "@/types/user";
import { ApiHttpError } from "@/services/api-error";
import { resolveApiError } from "@/utils/error-messages";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      try {
        const data = await userService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiHttpError
            ? err
            : new ApiHttpError({
                code: "UNKNOWN",
                message: err instanceof Error ? err.message : "Unexpected error",
                status: 0,
              }),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolved = error ? resolveApiError(error) : null;

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
        {resolved && <ErrorState title={resolved.title} message={resolved.message} />}
        {profile && <UserProfile profile={profile} />}
      </main>
    </>
  );
}
