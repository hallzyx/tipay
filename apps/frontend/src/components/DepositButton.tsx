/**
 * Deposit button — transfers XLM into a session via SAC.
 * Single-step deposit (no approve needed on Stellar).
 * @module components/DepositButton
 */
"use client";

import { useState, useEffect } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import {
  useContractWrite,
  deposit as depositTx,
  hasDeposited as hasDepositedFn,
} from "@/hooks/useContract";
import { useContractRead } from "@/hooks/useContract";
import { formatXLM } from "@/lib/utils";
import { ArrowDownToLine, Check } from "lucide-react";

interface DepositButtonProps {
  sessionId: number;
  amount: bigint;
  onDeposited?: () => void;
}

/**
 * Button to deposit XLM into a session.
 * Validates: participant, not already deposited, before deadline.
 */
export function DepositButton({
  sessionId,
  amount,
  onDeposited,
}: DepositButtonProps) {
  const { address } = useFreighter();
  const contractWrite = useContractWrite();
  const { read } = useContractRead();
  const [alreadyDeposited, setAlreadyDeposited] = useState(false);
  const [checking, setChecking] = useState(true);

  /** Check if already deposited on mount. */
  useEffect(() => {
    if (!address) {
      setChecking(false);
      return;
    }
    hasDepositedFn(read, sessionId, address).then((d) => {
      setAlreadyDeposited(d);
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [address, read, sessionId]);

  // Update after successful deposit
  const handleDeposit = async () => {
    if (!address) return;
    try {
      await depositTx(contractWrite, address, sessionId);
      setAlreadyDeposited(true);
      onDeposited?.();
    } catch {
      // Error shown by hook
    }
  };

  if (checking) {
    return (
      <div className="border-2 border-black p-6 shadow-hard-sm">
        <div className="h-4 w-32 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (alreadyDeposited) {
    return (
      <div className="flex items-center gap-3 border-2 border-black bg-black text-white p-6 shadow-hard-sm">
        <Check className="w-6 h-6" strokeWidth={3} />
        <span className="text-sm font-bold uppercase tracking-[0.1em]">
          Deposited {formatXLM(amount)} XLM
        </span>
      </div>
    );
  }

  const isPending = ["building", "signing", "submitting"].includes(
    contractWrite.state,
  );

  return (
    <div className="border-2 border-black p-6 shadow-hard-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">
        Your Deposit
      </p>
      <p className="text-3xl font-black mb-4">{formatXLM(amount)} XLM</p>
      <button
        onClick={handleDeposit}
        disabled={isPending || !address}
        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-black bg-[#d73b19] text-white font-black text-sm uppercase tracking-[0.1em] hover:bg-black transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 shadow-hard-sm"
      >
        <ArrowDownToLine className="w-5 h-5" strokeWidth={3} />
        {contractWrite.state === "building" && "Building…"}
        {contractWrite.state === "signing" && "Sign in Wallet…"}
        {contractWrite.state === "submitting" && "On Chain…"}
        {contractWrite.state === "idle" && "Deposit XLM"}
        {contractWrite.state === "error" && "Try Again"}
      </button>
      {contractWrite.error && (
        <p className="text-xs font-bold text-[#d73b19] mt-3">
          {contractWrite.error}
        </p>
      )}
    </div>
  );
}
