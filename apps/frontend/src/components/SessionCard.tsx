/**
 * Session card for the dashboard grid.
 * Brutalist design — hard shadows, black borders, orange accents.
 * @module components/SessionCard
 */
"use client";

import Link from "next/link";
import { StatusBadge, getSessionStatus } from "./StatusBadge";
import { formatStroops, formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/language";
import { Users, Clock, Coins, Crown } from "lucide-react";

interface SessionCardProps {
  sessionId: number;
  host: string;
  amount: bigint;
  deadline: bigint;
  votingPeriod: bigint;
  finalized: boolean;
  active: boolean;
  participantCount: number;
  depositedCount: number;
  isHost: boolean;
  userAddress?: string | null;
}

/**
 * Displays a session summary card in the grid.
 */
export function SessionCard({
  sessionId,
  host,
  amount,
  deadline,
  votingPeriod,
  finalized,
  active,
  participantCount,
  depositedCount,
  isHost,
}: SessionCardProps) {
  const { t } = useLanguage();
  const now = BigInt(Math.floor(Date.now() / 1000));
  const votingDeadline = deadline + votingPeriod;
  const status = getSessionStatus({ active, finalized, deadline, votingDeadline });

  const progressPct =
    participantCount > 0
      ? Math.round((depositedCount / participantCount) * 100)
      : 0;

  return (
    <Link href={`/session/${sessionId}`} className="block group">
      <article className="border-2 border-black bg-white shadow-hard-sm hover:shadow-hard hover:-translate-x-1 hover:-translate-y-1 transition-all duration-100 p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
              #{sessionId}
            </span>
            {isHost && (
              <Crown className="w-4 h-4 text-[#d73b19]" strokeWidth={3} />
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Stats grid 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-gray-400" strokeWidth={3} />
            <span className="text-sm font-black">
              {formatStroops(amount, 2, "USDC")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" strokeWidth={3} />
            <span className="text-sm font-black">
              {depositedCount}/{participantCount}
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock className="w-4 h-4 text-gray-400" strokeWidth={3} />
            <span className="text-xs text-gray-600 font-mono">
              {formatDate(deadline)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 border-2 border-black bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </article>
    </Link>
  );
}
