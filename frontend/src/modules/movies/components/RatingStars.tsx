"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/SessionProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ratingsService } from "@/services/ratings.service";

interface RatingStarsProps {
  movieId: number;
}

const STAR_COUNT = 5;

/** How much of the star at `position` (1..5) should be filled for a given value. */
function fillFor(value: number, position: number): 0 | 0.5 | 1 {
  if (value >= position) return 1;
  if (value >= position - 0.5) return 0.5;
  return 0;
}

export function RatingStars({ movieId }: RatingStarsProps) {
  const session = useSession();
  // Touch devices can't hover, and synthetic mouse events make the half-star
  // cursor logic unreliable — fall back to large, whole-star taps there.
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [rating, setRating] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    ratingsService
      .getStatus(movieId)
      .then((status) => {
        if (!cancelled) setRating(status.rating);
      })
      .catch(() => {
        if (!cancelled) setRating(null);
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

  const displayValue = preview ?? rating ?? 0;

  async function submit(value: number) {
    const previous = rating;
    setRating(value); // optimistic
    setLoading(true);
    try {
      await ratingsService.rate(movieId, value);
    } catch {
      setRating(previous);
      toast.error("Não foi possível avaliar", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const previous = rating;
    setRating(null); // optimistic
    setLoading(true);
    try {
      await ratingsService.removeRating(movieId);
    } catch {
      setRating(previous);
      toast.error("Não foi possível remover a avaliação", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Mouse: the half the cursor sits on decides 0.5 vs 1.0 for that star.
  function previewFromCursor(e: MouseEvent<HTMLButtonElement>, position: number) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const onLeftHalf = e.clientX - left < width / 2;
    setPreview(onLeftHalf ? position - 0.5 : position);
  }

  // Touch gets larger targets; desktop keeps the compact hover stars.
  const iconSize = isTouch ? "h-9 w-9" : "h-6 w-6";
  const iconHeight = isTouch ? "h-9" : "h-6";
  const buttonPadding = isTouch ? "p-2" : "p-0.5";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center" onMouseLeave={() => setPreview(null)}>
        {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((position) => {
          const fill = fillFor(displayValue, position);
          return (
            <button
              key={position}
              type="button"
              disabled={loading}
              // Touch commits the whole star; mouse commits the hovered half/full preview.
              onMouseMove={isTouch ? undefined : (e) => previewFromCursor(e, position)}
              onClick={() => submit(isTouch ? position : preview ?? position)}
              aria-label={`${position} ${position === 1 ? "estrela" : "estrelas"}`}
              className={`${buttonPadding} disabled:opacity-50`}
            >
              <span className={`relative inline-block ${iconSize}`}>
                <Star className={`absolute left-0 top-0 ${iconSize} text-n-600`} />
                {fill > 0 && (
                  <span
                    className={`absolute left-0 top-0 ${iconHeight} overflow-hidden`}
                    style={{ width: `${fill * 100}%` }}
                  >
                    <Star className={`${iconSize} fill-amber-400 text-amber-400`} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {rating != null && (
        <button
          type="button"
          disabled={loading}
          onClick={remove}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-n-400 transition-colors hover:bg-n-800/60 hover:text-n-200 disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Remover avaliação
        </button>
      )}
    </div>
  );
}
