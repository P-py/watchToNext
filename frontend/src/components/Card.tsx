import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 p-4",
        hover && "cursor-pointer transition-colors hover:border-zinc-700 hover:bg-zinc-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
