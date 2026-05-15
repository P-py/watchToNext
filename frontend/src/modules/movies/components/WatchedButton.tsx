"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useSession } from "@/components/SessionProvider";
import { watchedService } from "@/services/watched.service";

interface WatchedButtonProps {
  movieId: number;
}

export function WatchedButton({ movieId }: WatchedButtonProps) {
  const session = useSession();
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    watchedService
      .getStatus(movieId)
      .then((status) => {
        if (!cancelled) setWatched(status.watched);
      })
      .catch(() => {
        if (!cancelled) setWatched(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, movieId]);

  // Anonymous visitors don't see the action — the movie page itself stays public.
  if (!session) return null;

  async function toggle() {
    const next = !watched;
    setWatched(next); // optimistic
    setLoading(true);
    try {
      if (next) {
        await watchedService.markWatched(movieId);
      } else {
        await watchedService.unmarkWatched(movieId);
      }
    } catch {
      setWatched(!next); // rollback
      toast.error("Não foi possível atualizar", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={watched ? "primary" : "secondary"}
      size="sm"
      onClick={toggle}
      loading={loading}
      leftIcon={watched ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    >
      {watched ? "Assistido" : "Marcar como assistido"}
    </Button>
  );
}
