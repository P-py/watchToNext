"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, footer, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            tabIndex={-1}
            className={cn(
              "relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl outline-none",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-zinc-100">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
