"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { staggerContainer } from "@/utils/animations";

interface AnimatedGridProps {
  cols?: 2 | 3 | 4 | 5;
  className?: string;
  children: ReactNode;
}

export function AnimatedGrid({ cols = 4, className, children }: AnimatedGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
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
    >
      {children}
    </motion.div>
  );
}
