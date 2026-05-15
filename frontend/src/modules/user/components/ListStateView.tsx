"use client";

import { type ReactNode } from "react";
import { ApiHttpError } from "@/services/api-error";
import { resolveApiError } from "@/utils/error-messages";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { MovieGridSkeleton } from "@/components/MovieGridSkeleton";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";

interface ListStateViewProps {
  loading: boolean;
  error: ApiHttpError | null;
  isEmpty: boolean;
  emptyIcon?: ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Shared loading / error / empty / content switch for the preference list
 * pages (favorites, watched, ratings).
 */
export function ListStateView({
  loading,
  error,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: ListStateViewProps) {
  const showSkeleton = useDelayedFlag(loading);

  if (error) {
    const resolved = resolveApiError(error);
    return (
      <ErrorState
        title={resolved.title}
        message={resolved.message}
        onRetry={onRetry}
        retryLabel="Tentar novamente"
      />
    );
  }

  if (loading) {
    return showSkeleton ? <MovieGridSkeleton count={8} cols={4} /> : null;
  }

  if (isEmpty) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    );
  }

  return <>{children}</>;
}
