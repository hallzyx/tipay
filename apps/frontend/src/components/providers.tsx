/**
 * Tipay application providers.
 */
"use client";

import { ReactNode } from "react";
import { RefreshProvider } from "@/contexts/refresh";

/**
 * Wrap children with global context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <RefreshProvider>{children}</RefreshProvider>;
}
