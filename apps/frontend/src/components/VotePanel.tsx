/**
 * Vote panel — allows voting for an absent participant.
 * Brutalist design — orange accents for active/selected states.
 * @module components/VotePanel
 */
"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import {
  useContractWrite,
  useContractRead,
  castVote as castVoteTx,
  hasVoted as hasVotedFn,
} from "@/hooks/useContract";
import { shortAddress, formatDuration } from "@/lib/utils";
import { CheckCircle, Vote, Clock } from "lucide-react";

interface VotePanelProps {
  sessionId: number;
  participants: string[];
  deadline: bigint;
  votingEnd: bigint;
  onVoted?: () => void;
}

/**
 * Panel for voting during the voting window.
 * Cannot vote for yourself. One vote per participant.
 */
export function VotePanel({
  sessionId,
  participants,
  deadline,
  votingEnd,
  onVoted,
}: VotePanelProps) {
  const { address } = useFreighter();
  const contractWrite = useContractWrite();
  const { read } = useContractRead();

  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [checking, setChecking] = useState(true);

  // Check vote status
  useEffect(() => {
    if (!address) return;
    hasVotedFn(read, sessionId, address).then((v) => {
      setAlreadyVoted(v);
      setChecking(false);
    });
  }, [address, sessionId]);

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      setTimeLeft(Math.max(0, Number(votingEnd) - now));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [votingEnd]);

  const handleVote = async () => {
    if (!address || !selected) return;
    try {
      await castVoteTx(contractWrite, address, sessionId, selected);
      setAlreadyVoted(true);
      onVoted?.();
    } catch {
      // Error shown by hook
    }
  };

  const now = Math.floor(Date.now() / 1000);
  const isOpen = BigInt(now) >= deadline && BigInt(now) < votingEnd;

  if (checking) {
    return (
      <div className="border-2 border-black p-6 shadow-hard-sm">
        <div className="h-4 w-40 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="border-2 border-black p-6 bg-gray-50 shadow-hard-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <Clock className="w-6 h-6" strokeWidth={3} />
          <span className="text-sm font-bold uppercase tracking-[0.1em]">
            {BigInt(now) < deadline
              ? `Voting Opens in ${formatDuration(Number(deadline) - now)}`
              : "Voting Window Closed"}
          </span>
        </div>
      </div>
    );
  }

  if (alreadyVoted) {
    return (
      <div className="flex items-center gap-3 border-2 border-black bg-black text-white p-6 shadow-hard-sm">
        <CheckCircle className="w-6 h-6" strokeWidth={3} />
        <span className="text-sm font-bold uppercase tracking-[0.1em]">
          Vote Cast
        </span>
      </div>
    );
  }

  const others = participants.filter((p) => p !== address);
  const isPending = ["building", "signing", "submitting"].includes(
    contractWrite.state,
  );

  return (
    <div className="border-2 border-black p-6 shadow-hard-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Vote className="w-5 h-5 text-[#d73b19]" strokeWidth={3} />
          <h3 className="text-sm font-black uppercase tracking-[0.15em]">
            Vote Absent
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-500">
          {formatDuration(timeLeft)} Left
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Select who didn&apos;t show up. You cannot vote for yourself.
      </p>

      <div className="space-y-3 mb-6">
        {others.map((p) => (
          <button
            key={p}
            onClick={() => setSelected(p)}
            className={`w-full flex items-center justify-between px-4 py-3 border-2 text-sm font-mono transition-all ${
              selected === p
                ? "border-[#d73b19] bg-[#d73b19] text-white"
                : "border-black hover:border-[#d73b19]"
            }`}
          >
            <span>{shortAddress(p)}</span>
            {selected === p && <CheckCircle className="w-5 h-5" strokeWidth={3} />}
          </button>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={!selected || isPending}
        className="w-full py-4 border-2 border-black bg-black text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-[#d73b19] hover:border-[#d73b19] transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-hard-sm"
      >
        {contractWrite.state === "building" && "Building…"}
        {contractWrite.state === "signing" && "Sign in Wallet…"}
        {contractWrite.state === "submitting" && "On Chain…"}
        {(contractWrite.state === "idle" || contractWrite.state === "error") &&
          "Confirm Vote"}
      </button>

      {contractWrite.error && (
        <p className="text-xs font-bold text-[#d73b19] mt-3">
          {contractWrite.error}
        </p>
      )}
    </div>
  );
}
