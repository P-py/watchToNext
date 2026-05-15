"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/Button";
import { useSession } from "@/components/SessionProvider";
import { useWatched } from "@/components/WatchedProvider";

interface WatchedButtonProps {
  movieId: number;
}

export function WatchedButton({ movieId }: WatchedButtonProps) {
  const session = useSession();
  const { isWatched, toggleWatched } = useWatched();
  const [pending, setPending] = useState(false);

  // Anonymous visitors don't see the action — the movie page itself stays public.
  if (!session) return null;

  const watched = isWatched(movieId);

  async function handleClick() {
    setPending(true);
    try {
      await toggleWatched(movieId);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={watched ? "primary" : "secondary"}
      size="sm"
      onClick={handleClick}
      loading={pending}
      leftIcon={watched ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    >
      {watched ? "Assistido" : "Marcar como assistido"}
    </Button>
  );
}
