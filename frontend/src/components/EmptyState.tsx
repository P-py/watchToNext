import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="text-zinc-500" aria-hidden="true">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <div className="space-y-1">
        <p className="font-medium text-zinc-200">{title}</p>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
      </div>
    </div>
  );
}
