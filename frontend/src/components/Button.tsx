import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50",
        {
          primary:
            "bg-amber-500 text-black hover:bg-amber-400",
          secondary:
            "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
          ghost: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
        }[variant],
        { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" }[
          size
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
