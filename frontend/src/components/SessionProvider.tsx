"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Session } from "@/lib/auth/types";

const SessionContext = createContext<Session | null>(null);

interface SessionProviderProps {
  initialSession: Session | null;
  children: ReactNode;
}

export function SessionProvider({ initialSession, children }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={initialSession}>{children}</SessionContext.Provider>
  );
}

export function useSession(): Session | null {
  return useContext(SessionContext);
}
