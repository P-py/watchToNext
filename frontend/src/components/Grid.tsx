import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 2 | 3 | 4 | 5;
}

export function Grid({ cols = 4, className, children, ...props }: GridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        {
          2: "grid-cols-2 sm:grid-cols-2",
          3: "grid-cols-2 sm:grid-cols-3",
          4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        }[cols],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
