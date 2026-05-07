/**
 * Tipay Dashboard — session grid with wallet connection.
 * Brutalist design — black/white/orange, hard shadows.
 * @module app/dashboard/page
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useContractRead } from "@/hooks/useContract";
import {
  getSessionCount,
  getSession,
  getParticipant,
  hasDeposited as hasDepositedFn,
} from "@/hooks/useContract";
import { SessionCard } from "@/components/SessionCard";
import { CreateSessionModal } from "@/components/CreateSessionModal";
import { StatusBadge, getSessionStatus } from "@/components/StatusBadge";
import { shortAddress } from "@/lib/utils";
import { Plus, Zap, Users, Shield, ArrowRight } from "lucide-react";

interface SessionSummary {
  id: number;
  host: string;
  amount: bigint;
  deadline: bigint;
  votingPeriod: bigint;
  finalized: boolean;
  active: boolean;
  participantCount: number;
  depositedCount: number;
}

export default function DashboardPage() {
  const { connected, address } = useFreighter();
  const { read } = useContractRead(address ?? undefined);

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /** Fetch all sessions from the contract. */
  const fetchSessions = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      setFetchError(null);
      const count = await getSessionCount(read);
      console.log("Session count:", count);

      const result: SessionSummary[] = [];
      for (let i = 0; i < count; i++) {
        const session = await getSession(read, i);
        if (!session) continue;

        // Check if user is participant
        let isParticipant = false;
        let depositedCount = 0;
        for (let j = 0; j < session.participant_count; j++) {
          const pAddr = await getParticipant(read, i, j);
          if (!pAddr) continue;
          if (pAddr === address) isParticipant = true;
          const dep = await hasDepositedFn(read, i, pAddr);
          if (dep) depositedCount++;
        }

        if (!isParticipant) continue;

        result.push({
          id: i,
          host: session.host,
          amount: session.amount,
          deadline: session.deadline,
          votingPeriod: session.voting_period,
          finalized: session.finalized,
          active: session.active,
          participantCount: session.participant_count,
          depositedCount,
        });
      }

      // Most recent first
      result.reverse();
      setSessions(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch sessions:", err);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [address, read, refreshKey]);

  useEffect(() => {
    if (connected && address) fetchSessions();
  }, [connected, address, fetchSessions]);

  const activeSessions = sessions.filter(
    (s) => !s.finalized && s.active,
  );
  const pastSessions = sessions.filter(
    (s) => s.finalized || !s.active,
  );

  // --- Loading ---
  if (loading) {
    return (
      <div className="w-full px-8 lg:px-16 xl:px-24 pt-28 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 place-items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-black p-6 h-52 shadow-hard-sm animate-pulse w-full max-w-md">
              <div className="h-3 w-20 bg-gray-200 mb-6" />
              <div className="h-4 w-40 bg-gray-200 mb-4" />
              <div className="h-3 w-32 bg-gray-200 mb-2" />
              <div className="h-3 w-28 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 lg:px-16 xl:px-24 pt-28 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 pb-8 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Connected Wallet
            </span>
          </div>
          <span className="text-sm font-mono tracking-wide">
            {address ? shortAddress(address) : "Not connected"}
          </span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-3 px-6 py-3 border-2 border-black bg-black text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-[#d73b19] hover:border-[#d73b19] transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-hard-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          New Session
        </button>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="mb-8 p-6 border-2 border-[#d73b19] bg-red-50">
          <p className="text-xs font-bold text-[#d73b19] uppercase tracking-widest mb-2">
            Error Loading Sessions
          </p>
          <p className="text-sm font-mono text-red-800 break-all">
            {fetchError}
          </p>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        <div className="border-2 border-black p-8 text-center shadow-hard-sm">
          <p className="text-4xl font-black mb-2">{sessions.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Total Sessions
          </p>
        </div>
        <div className="border-2 border-black p-8 text-center shadow-hard-sm">
          <p className="text-4xl font-black mb-2">{activeSessions.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Active
          </p>
        </div>
        <div className="border-2 border-black p-8 text-center shadow-hard-sm">
          <p className="text-4xl font-black mb-2">{pastSessions.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            History
          </p>
        </div>
      </div>

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-black">
            <Shield className="w-5 h-5 text-[#d73b19]" strokeWidth={3} />
            <h2 className="text-sm font-black uppercase tracking-[0.15em]">
              Active Sessions
            </h2>
            <span className="ml-auto text-xs font-mono text-gray-400">
              {activeSessions.length} found
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 place-items-center">
            {activeSessions.map((s) => (
              <SessionCard
                key={s.id}
                sessionId={s.id}
                host={s.host}
                amount={s.amount}
                deadline={s.deadline}
                votingPeriod={s.votingPeriod}
                finalized={s.finalized}
                active={s.active}
                participantCount={s.participantCount}
                depositedCount={s.depositedCount}
                isHost={s.host === address}
                userAddress={address}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past sessions */}
      {pastSessions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-black">
            <Users className="w-5 h-5 text-gray-400" strokeWidth={3} />
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-400">
              History
            </h2>
            <span className="ml-auto text-xs font-mono text-gray-400">
              {pastSessions.length} found
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 place-items-center opacity-60">
            {pastSessions.map((s) => (
              <SessionCard
                key={s.id}
                sessionId={s.id}
                host={s.host}
                amount={s.amount}
                deadline={s.deadline}
                votingPeriod={s.votingPeriod}
                finalized={s.finalized}
                active={s.active}
                participantCount={s.participantCount}
                depositedCount={s.depositedCount}
                isHost={s.host === address}
                userAddress={address}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 max-w-xl mx-auto">
          <Users className="w-16 h-16 mx-auto mb-6 text-gray-300" strokeWidth={2} />
          <p className="text-xl font-black uppercase tracking-[0.1em] text-gray-400 mb-3">
            No Sessions Yet
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Create your first accountability session
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-3 border-2 border-black bg-black text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-[#d73b19] hover:border-[#d73b19] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            Create Session
          </button>
        </div>
      )}

      {/* Create modal */}
      <CreateSessionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
