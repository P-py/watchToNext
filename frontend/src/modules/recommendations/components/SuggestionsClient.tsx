"use client";

import { useState } from "react";
import { ListPlus, Tags, Wand2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { QuickSuggestions } from "./QuickSuggestions";
import { SeedPicker } from "./SeedPicker";
import { GenreSuggestions } from "./GenreSuggestions";

type Mode = "quick" | "pick" | "genre";

const TABS = [
  { id: "quick", label: "Rápida", icon: Wand2 },
  { id: "pick", label: "Escolher filmes", icon: ListPlus },
  { id: "genre", label: "Por gênero", icon: Tags },
] as const;

export function SuggestionsClient() {
  const [mode, setMode] = useState<Mode>("quick");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            aria-pressed={mode === tab.id}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
              mode === tab.id
                ? "border-amber-500 bg-amber-500/10 text-amber-300"
                : "border-n-800 bg-n-900 text-n-400 hover:text-n-100",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "quick" && <QuickSuggestions />}
      {mode === "pick" && <SeedPicker />}
      {mode === "genre" && <GenreSuggestions />}
    </div>
  );
}
