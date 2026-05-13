"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ErrorState } from "@/components/ErrorState";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { UserProfile } from "@/modules/user/components/UserProfile";
import { userService } from "@/services/user.service";
import { UserProfile as UserProfileType } from "@/types/user";
import { ApiHttpError } from "@/services/api-error";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
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
  const showSkeleton = useDelayedFlag(loading);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && showSkeleton && <ProfileSkeleton />}
        {resolved && <ErrorState title={resolved.title} message={resolved.message} />}
        {profile && <UserProfile profile={profile} />}
      </main>
    </>
  );
}
