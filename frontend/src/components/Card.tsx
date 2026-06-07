import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-n-800 bg-n-900 p-4",
        hover && "cursor-pointer transition-colors hover:border-n-700 hover:bg-n-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
