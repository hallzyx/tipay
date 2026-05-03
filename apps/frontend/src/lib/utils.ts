/**
 * General utility functions.
 * @module lib/utils
 */

/**
 * Truncates a Stellar address for display.
 * @example shortAddress("GBZX...ABCD") → "GBZX...ABCD"
 */
export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

/**
 * Formats a stroop amount to XLM string.
 * 1 XLM = 10_000_000 stroops.
 * @param stroops - Amount in stroops (number or bigint).
 * @param decimals - How many decimal places to show (default 2).
 */
export function formatXLM(
  stroops: number | bigint,
  decimals = 2,
): string {
  const n = Number(stroops) / 10_000_000;
  return n.toFixed(decimals);
}

/**
 * Converts a user-facing XLM amount to stroops.
 * @param xlm - Amount in XLM (string or number).
 * @returns Amount in stroops as bigint.
 */
export function xlmToStroops(xlm: string | number): bigint {
  const n = typeof xlm === "string" ? parseFloat(xlm) : xlm;
  return BigInt(Math.round(n * 10_000_000));
}

/**
 * Formats a Unix timestamp to a local date string.
 */
export function formatDate(ts: number | bigint): string {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats seconds into a human-readable duration.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

/**
 * Combines class names using clsx + tailwind-merge.
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | false | null)[]): string {
  return twMerge(clsx(inputs));
}
