/**
 * Session status badge with brutalist styling.
 * @module components/StatusBadge
 */
"use client";

import { useLanguage } from "@/contexts/language";

export type SessionStatus =
  | "waiting"
  | "active"
  | "voting"
  | "voting-closed"
  | "refunded"
  | "finalized";

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

const statusConfig: Record<
  SessionStatus,
  { labelKey: string; className: string }
> = {
  waiting: {
    labelKey: "status.waiting",
    className:
      "bg-black text-white border-2 border-black",
  },
  active: {
    labelKey: "status.active",
    className:
      "bg-[#d73b19] text-white border-2 border-black",
  },
  voting: {
    labelKey: "status.voting",
    className:
      "bg-black text-[#d73b19] border-2 border-black animate-pulse-border",
  },
  "voting-closed": {
    labelKey: "status.votingClosed",
    className: "bg-white text-black border-2 border-black",
  },
  refunded: {
    labelKey: "status.refunded",
    className: "bg-white text-black border-2 border-black",
  },
  finalized: {
    labelKey: "status.finalized",
    className:
      "bg-black text-white border-2 border-black opacity-70",
  },
};

/**
 * Computes session status from on-chain data.
 */
export function getSessionStatus(params: {
  active: boolean;
  finalized: boolean;
  deadline: bigint;
  votingDeadline: bigint;
}): SessionStatus {
  const { active, finalized, deadline, votingDeadline } = params;
  if (finalized) return "finalized";

  const now = BigInt(Math.floor(Date.now() / 1000));

  if (!active) {
    if (now >= votingDeadline) return "refunded";
    return "waiting";
  }

  if (now < deadline) return "active";
  if (now < votingDeadline) return "voting";
  return "voting-closed";
}

/**
 * Renders a brutalist status badge.
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = statusConfig[status];
  const label = t(config.labelKey);

  return (
    <span
      className={`inline-block px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase ${config.className} ${className}`}
    >
      {label}
    </span>
  );
}
