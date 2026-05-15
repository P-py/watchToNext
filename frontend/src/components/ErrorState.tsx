import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Algo deu errado",
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-red-900/40 bg-red-950/20 px-6 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-red-300">{title}</p>
        {message && <p className="text-sm text-red-400/80">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
