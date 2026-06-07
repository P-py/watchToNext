/**
 * localStorage key for the persisted theme preference.
 *
 * Lives in a plain module (no `"use client"`) so it can be shared by both the
 * server-rendered pre-paint script in `layout.tsx` and the client-side
 * `ThemeProvider`, keeping the two from drifting.
 */
export const THEME_STORAGE_KEY = "wtn-theme";
