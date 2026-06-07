"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

/** Sonner toaster that follows the active app theme. */
export function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster theme={theme} position="bottom-right" richColors closeButton />
  );
}
