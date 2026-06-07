import { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-n-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-10 w-full rounded-lg border border-n-700 bg-n-800 px-3 text-sm text-n-100 placeholder:text-n-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
          className
        )}
        {...props}
      />
    </div>
  );
}
