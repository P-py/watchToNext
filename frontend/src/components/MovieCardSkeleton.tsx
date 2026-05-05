import { cn } from "@/utils/cn";

interface MovieCardSkeletonProps {
  className?: string;
}

export function MovieCardSkeleton({ className }: MovieCardSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-md animate-pulse",
        className
      )}
      aria-hidden="true"
    >
      <div className="aspect-[2/3] w-full bg-zinc-800" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-zinc-800" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-10 rounded bg-zinc-800" />
          <div className="h-3 w-8 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
