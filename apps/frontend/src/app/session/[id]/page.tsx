/**
 * Session detail page — view, deposit, vote, and finalize.
 * @module app/session/[id]/page
 */
"use client";

import { use, useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import {
  useContractRead,
  useContractWrite,
  getSession as getSessionFn,
  getParticipant as getParticipantFn,
  hasDeposited as hasDepositedFn,
  hasVoted as hasVotedFn,
  absenceVoteCount as absenceVoteCountFn,
  getVotingDeadline,
  finalizeSession as finalizeSessionTx,
} from "@/hooks/useContract";
import { DepositButton } from "@/components/DepositButton";
import { VotePanel } from "@/components/VotePanel";
import { StatusBadge, getSessionStatus } from "@/components/StatusBadge";
import {
  shortAddress,
  formatStroops,
  formatDate,
  formatDuration,
} from "@/lib/utils";
import {
  ArrowLeft,
  Coins,
  Users,
  Clock,
  Crown,
  Check,
  X,
  Copy,
  Lock,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface ParticipantInfo {
  address: string;
  deposited: boolean;
  voted: boolean;
  votesAgainst: number;
  isHost: boolean;
  isYou: boolean;
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sessionId = parseInt(id);
  const { address } = useFreighter();
  const { read } = useContractRead(address ?? undefined);
  const contractWrite = useContractWrite();

  const [session, setSession] = useState<{
    host: string;
    amount: bigint;
    deadline: bigint;
    voting_period: bigint;
    finalized: boolean;
    active: boolean;
    participant_count: number;
  } | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [votingEnd, setVotingEnd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Load session data. */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const s = await getSessionFn(read, sessionId);
        if (!s) {
          setNotFound(true);
          return;
        }
        setSession(s);

        const vd = await getVotingDeadline(read, sessionId);
        setVotingEnd(vd);

        // Load participants
        const parts: ParticipantInfo[] = [];
        for (let i = 0; i < s.participant_count; i++) {
          const pAddr = await getParticipantFn(read, sessionId, i);
          if (!pAddr) continue;

          const [dep, voted, absVotes] = await Promise.all([
            hasDepositedFn(read, sessionId, pAddr),
            hasVotedFn(read, sessionId, pAddr),
            absenceVoteCountFn(read, sessionId, pAddr),
          ]);

          parts.push({
            address: pAddr,
            deposited: dep,
            voted,
            votesAgainst: absVotes,
            isHost: pAddr === s.host,
            isYou: pAddr === address,
          });
        }
        setParticipants(parts);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId, address, read]);

  const handleFinalize = async () => {
    try {
      await finalizeSessionTx(contractWrite, sessionId);
      // Refresh
      const s = await getSessionFn(read, sessionId);
      if (s) setSession(s);
    } catch {
      // Error shown by hook
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(String(sessionId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="w-full px-8 lg:px-16 xl:px-24 pt-28 pb-16">
        <div className="border-2 border-black p-10 shadow-hard-sm animate-pulse space-y-6 max-w-4xl">
          <div className="h-4 w-40 bg-gray-200" />
          <div className="h-10 w-72 bg-gray-200" />
          <div className="h-4 w-56 bg-gray-200" />
        </div>
      </div>
    );
  }

  // --- Not found ---
  if (notFound || !session) {
    return (
      <div className="w-full px-8 lg:px-16 xl:px-24 pt-28 pb-16 text-center">
        <X className="w-20 h-20 mx-auto mb-6 text-[#d73b19]" strokeWidth={2} />
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          Session Not Found
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Session #{id} doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-black font-bold text-sm uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          Back to Sessions
        </Link>
      </div>
    );
  }

  const status = getSessionStatus({
    active: session.active,
    finalized: session.finalized,
    deadline: session.deadline,
    votingDeadline: BigInt(votingEnd),
  });

  const now = Math.floor(Date.now() / 1000);
  const isDepositOpen =
    !session.finalized && BigInt(now) < session.deadline;
  const isVotingOpen =
    !session.finalized &&
    BigInt(now) >= session.deadline &&
    BigInt(now) < votingEnd;
  const isVotingClosed =
    !session.finalized && BigInt(now) >= votingEnd;

  const userIsParticipant = participants.some((p) => p.isYou);
  const userDeposited = participants.find((p) => p.isYou)?.deposited ?? false;

  return (
    <div className="w-full px-8 lg:px-16 xl:px-24 pt-28 pb-16">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-black mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={3} />
        Back to Sessions
      </Link>

      {/* Header card */}
      <div className="border-2 border-black shadow-hard p-10 mb-10">
        <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
              Session #{sessionId}
            </h1>
            <StatusBadge status={status} />
          </div>
          {address === session.host && (
            <Crown className="w-6 h-6 text-[#d73b19]" strokeWidth={3} />
          )}
        </div>

        {/* Stats 2x2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="border-2 border-black p-6">
            <Coins className="w-5 h-5 text-gray-400 mb-2" strokeWidth={3} />
            <p className="text-2xl font-black">{formatStroops(session.amount)}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">USDC / Person</p>
          </div>
          <div className="border-2 border-black p-6">
            <Users className="w-5 h-5 text-gray-400 mb-2" strokeWidth={3} />
            <p className="text-2xl font-black">
              {participants.filter((p) => p.deposited).length}/
              {session.participant_count}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Deposited</p>
          </div>
          <div className="border-2 border-black p-6">
            <Clock className="w-5 h-5 text-gray-400 mb-2" strokeWidth={3} />
            <p className="text-sm font-black font-mono">
              {formatDate(session.deadline)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Event</p>
          </div>
          <div className="border-2 border-black p-6">
            <Clock className="w-5 h-5 text-gray-400 mb-2" strokeWidth={3} />
            <p className="text-sm font-black font-mono">
              {formatDate(BigInt(votingEnd))}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Voting Ends</p>
          </div>
        </div>

        {/* Session ID */}
        <button
          onClick={copyId}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-black transition-colors"
        >
          <span className="font-bold uppercase tracking-widest">ID:</span> {sessionId}
          {copied ? (
            <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
          ) : (
            <Copy className="w-4 h-4" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Participants */}
      <div className="border-2 border-black p-10 mb-10 shadow-hard-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-8 pb-6 border-b-2 border-black">
          Participants
        </h3>
        <div className="divide-y-2 divide-black">
          {participants.map((p, i) => (
            <div
              key={p.address}
              className="flex items-center justify-between py-5"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 w-6">
                  {i + 1}
                </span>
                <span className="text-sm font-mono">
                  {shortAddress(p.address)}
                </span>
                <div className="flex items-center gap-2">
                  {p.isHost && (
                    <span className="text-[10px] font-bold text-[#d73b19] uppercase tracking-widest">
                      Host
                    </span>
                  )}
                  {p.isYou && (
                    <span className="text-[10px] font-bold text-black border-2 border-black px-2 py-0.5 uppercase tracking-widest">
                      You
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.deposited ? (
                  <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                ) : (
                  <X className="w-5 h-5 text-gray-300" strokeWidth={3} />
                )}
                {session.finalized && (
                  <span className="text-xs font-mono text-gray-400">
                    {p.votesAgainst} votes
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isDepositOpen && userIsParticipant && !userDeposited && (
        <div className="mb-10 max-w-2xl mx-auto">
          <DepositButton
            sessionId={sessionId}
            amount={session.amount}
            onDeposited={() => {
              // Optimistic update
              setParticipants((prev) =>
                prev.map((p) =>
                  p.isYou ? { ...p, deposited: true } : p,
                ),
              );
            }}
          />
        </div>
      )}

      {isVotingOpen && userIsParticipant && (
        <div className="mb-10 max-w-2xl mx-auto">
          <VotePanel
            sessionId={sessionId}
            participants={participants.map((p) => p.address)}
            deadline={session.deadline}
            votingEnd={BigInt(votingEnd)}
          />
        </div>
      )}

      {/* Finalize button */}
      {isVotingClosed && !session.finalized && (
        <div className="border-2 border-black p-10 mb-10 shadow-hard-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-gray-400" strokeWidth={3} />
            <span className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
              Voting Window Closed
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Anyone can resolve this session now. Absentees lose their
            deposit, attendees split the pool.
          </p>
          <button
            onClick={handleFinalize}
            disabled={["building", "signing", "submitting"].includes(
              contractWrite.state,
            )}
            className="w-full py-4 border-2 border-black bg-[#d73b19] text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-black transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 shadow-hard-sm"
          >
            {contractWrite.state === "idle" && "Resolve Session"}
            {contractWrite.state === "building" && "Building…"}
            {contractWrite.state === "signing" && "Sign in Wallet…"}
            {contractWrite.state === "submitting" && "On Chain…"}
            {contractWrite.state === "success" && "✓ Resolved!"}
            {contractWrite.state === "error" && "Try Again"}
          </button>
          {contractWrite.error && (
            <p className="text-xs font-bold text-[#d73b19] mt-3">
              {contractWrite.error}
            </p>
          )}
        </div>
      )}

      {/* Finalized state */}
      {session.finalized && (
        <div className="border-2 border-black bg-black text-white p-10 text-center shadow-hard max-w-2xl mx-auto">
          <Check className="w-16 h-16 mx-auto mb-4 text-green-400" strokeWidth={2} />
          <h3 className="text-2xl font-black uppercase tracking-tight mb-3">
            Session Finalized
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            Funds have been distributed. Absentees lost their deposit,
            attendees received their share.
          </p>
        </div>
      )}
    </div>
  );
}
