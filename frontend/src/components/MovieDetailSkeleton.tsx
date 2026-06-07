export function MovieDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row animate-pulse" aria-hidden="true">
      <div className="mx-auto aspect-[2/3] w-48 shrink-0 rounded-xl bg-n-800 md:mx-0" />
      <div className="flex-1 space-y-4 pt-2">
        <div className="h-8 w-64 rounded bg-n-800" />
        <div className="h-4 w-48 rounded bg-n-800" />
        <div className="flex gap-2">
          {[80, 64, 96].map((w) => (
            <div key={w} className="h-6 rounded-full bg-n-800" style={{ width: w }} />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-n-800" />
          <div className="h-4 w-5/6 rounded bg-n-800" />
          <div className="h-4 w-4/6 rounded bg-n-800" />
        </div>
      </div>
    </div>
  );
}
