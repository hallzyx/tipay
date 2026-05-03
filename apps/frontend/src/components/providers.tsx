/**
 * Tipay application providers.
 */
"use client";

import { ReactNode } from "react";

/**
 * Wrap children with global context providers.
 * Currently no providers needed — Stellar uses direct wallet API.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
