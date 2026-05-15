"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { EditProfileModal } from "@/modules/user/components/EditProfileModal";
import { UserProfile } from "@/modules/user/components/UserProfile";
import { ProfileSummary } from "@/modules/user/components/ProfileSummary";
import { userService } from "@/services/user.service";
import { UserProfile as UserProfileType } from "@/types/user";
import { ApiHttpError } from "@/services/api-error";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { resolveApiError } from "@/utils/error-messages";

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiHttpError | null>(null);
  const [editing, setEditing] = useState(false);

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
      {loading && showSkeleton && <ProfileSkeleton />}
      {resolved && <ErrorState title={resolved.title} message={resolved.message} />}
      {profile && (
        <UserProfile profile={profile} onEdit={() => setEditing(true)} />
      )}
      {profile && <ProfileSummary />}
      {profile && (
        <EditProfileModal
          open={editing}
          onClose={() => setEditing(false)}
          profile={profile}
          onUpdated={setProfile}
        />
      )}
    </>
  );
}
