import { GraduationCap } from "lucide-react";

/**
 * Top-of-page banner declaring the project is academic and temporary.
 * Mounted globally in `layout.tsx` above the page tree; the footer
 * (`TmdbAttribution`) repeats it in long-form for users who scroll past.
 *
 * Hidden when `NEXT_PUBLIC_SHOW_ACADEMIC_DISCLAIMER=false`. Defaults to shown.
 */
export function AcademicDisclaimer() {
  if (process.env.NEXT_PUBLIC_SHOW_ACADEMIC_DISCLAIMER === "false") return null;

  return (
    <div
      role="note"
      aria-label="Aviso de projeto acadêmico"
      className="flex items-center justify-center gap-2 border-b border-amber-900/40 bg-amber-950/60 px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-amber-200"
    >
      <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Projeto acadêmico — temporário, não comercial, não é um serviço de produção.
      </span>
    </div>
  );
}
