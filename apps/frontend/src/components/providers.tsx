/**
 * Tipay application providers.
 */
"use client";

import { ReactNode } from "react";
import { RefreshProvider } from "@/contexts/refresh";
import { LanguageProvider } from "@/contexts/language";

/**
 * Wrap children with global context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <RefreshProvider>{children}</RefreshProvider>
    </LanguageProvider>
  );
}
