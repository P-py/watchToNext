export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-zinc-800" />
          <div className="h-4 w-48 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
