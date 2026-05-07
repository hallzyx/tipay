/**
 * Contract interaction hooks for Tipay Soroban contract.
 * @module hooks/useContract
 */
"use client";

import { useState, useCallback } from "react";
import {
  buildContractTx,
  simulateRead,
  addressToScVal,
  i128ToScVal,
  u64ToScVal,
  u32ToScVal,
  addressVecToScVal,
  decodeScVal,
} from "@/lib/contract";
import { useFreighter } from "./useFreighter";
import { getRpc } from "@/lib/stellar";
import * as StellarSdk from "@stellar/stellar-sdk";

/* ── Types ──────────────────────────────────────────── */

export interface Session {
  host: string;
  amount: bigint;
  deadline: bigint;
  voting_period: bigint;
  finalized: boolean;
  active: boolean;
  participant_count: number;
}

export type TxState = "idle" | "building" | "signing" | "submitting" | "success" | "error";

/**
 * Hook for write (mutating) contract calls.
 */
export function useContractWrite() {
  const { sign, address } = useFreighter();
  const [state, setState] = useState<TxState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const invoke = useCallback(
    async (method: string, args: StellarSdk.xdr.ScVal[]) => {
      if (!address) throw new Error("Wallet not connected");

      setState("building");
      setError(null);
      setTxHash(null);

      try {
        const xdr = await buildContractTx(address, method, args);

        setState("signing");
        const signedXdr = await sign(xdr);

        setState("submitting");
        const tx = StellarSdk.TransactionBuilder.fromXDR(
          signedXdr,
          StellarSdk.Networks.TESTNET,
        ) as StellarSdk.Transaction;

        const response = await getRpc().sendTransaction(tx);

        if (response.status === "ERROR") {
          throw new Error(`Transaction rejected: ${response.errorResult}`);
        }

        // Poll for confirmation
        let getResponse = await getRpc().getTransaction(response.hash);
        while (getResponse.status === "NOT_FOUND") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await getRpc().getTransaction(response.hash);
        }

        if (getResponse.status === "SUCCESS") {
          setTxHash(response.hash);
          setState("success");
          return { hash: response.hash, result: getResponse.returnValue };
        }

        throw new Error(`Transaction failed: ${getResponse.status}`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setState("error");
        throw err;
      }
    },
    [address, sign],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setTxHash(null);
  }, []);

  return { invoke, state, error, txHash, reset };
}

/**
 * Hook for read-only contract calls.
 * Use this directly or via the helper functions below.
 */
export function useContractRead(sourceAddress?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const read = useCallback(async <T>(
    method: string,
    args: StellarSdk.xdr.ScVal[],
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulateRead(method, args, sourceAddress);
      return decodeScVal(result) as T;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Read failed";
      console.error(`useContractRead error for ${method}:`, err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sourceAddress]);

  return { read, loading, error };
}

/* ── Typed contract helpers ─────────────────────────── */

export type ContractWriter = ReturnType<typeof useContractWrite>;
/**
 * Creates a session on-chain.
 */
export async function createSession(
  invoker: ContractWriter,
  host: string,
  amountToken: string,
  deadlineTimestamp: number,
  votingPeriodSeconds: number,
  participants: string[],
) {
  // Convert token amount to stroops (1 token = 10_000_000 stroops)
  const amountStroops = BigInt(
    Math.round(parseFloat(amountToken) * 10_000_000),
  );

  return invoker.invoke("create_session", [
    addressToScVal(host),
    i128ToScVal(amountStroops),
    u64ToScVal(deadlineTimestamp),
    u64ToScVal(votingPeriodSeconds),
    addressVecToScVal(participants),
  ]);
}

/**
 * Deposits tokens into a session.
 */
export async function deposit(
  invoker: ContractWriter,
  from: string,
  sessionId: number,
) {
  return invoker.invoke("deposit", [
    addressToScVal(from),
    u64ToScVal(sessionId),
  ]);
}

/**
 * Casts a vote for an absent participant.
 */
export async function castVote(
  invoker: ContractWriter,
  voter: string,
  sessionId: number,
  absent: string,
) {
  return invoker.invoke("cast_vote", [
    addressToScVal(voter),
    u64ToScVal(sessionId),
    addressToScVal(absent),
  ]);
}

/**
 * Finalizes a session after the voting window.
 */
export async function finalizeSession(
  invoker: ContractWriter,
  sessionId: number,
) {
  return invoker.invoke("finalize_session", [
    u64ToScVal(sessionId),
  ]);
}

/**
 * Safely converts a BigInt or number value to a JavaScript number.
 * Use only for values known to fit within safe integer range.
 */
function toNumber(val: bigint | number): number {
  return typeof val === "bigint" ? Number(val) : val;
}

/**
 * Reads session data from the contract.
 * In SDK v15+ with Protocol 22, structs are serialized as ScvMap (object with
 * symbolic keys), NOT as ScvVec (array). We must use property access.
 */
export async function getSession(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
): Promise<Session | null> {
  try {
    const result = await readFn<{
      host: string;
      amount: bigint;
      deadline: bigint;
      voting_period: bigint;
      finalized: boolean;
      active: boolean;
      participant_count: number;
    }>("get_session", [u64ToScVal(sessionId)]);
    return {
      host: result.host,
      amount: result.amount,
      deadline: result.deadline,
      voting_period: result.voting_period,
      finalized: result.finalized,
      active: result.active,
      participant_count: toNumber(result.participant_count),
    };
  } catch (err) {
    console.warn(`get_session(${sessionId}) failed:`, err);
    return null;
  }
}

/**
 * Reads a participant at a given index.
 */
export async function getParticipant(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
  index: number,
): Promise<string | null> {
  try {
    return await readFn<string>("get_participant", [
      u64ToScVal(sessionId),
      u32ToScVal(index),
    ]);
  } catch {
    return null;
  }
}

/**
 * Checks if an address has deposited.
 */
export async function hasDeposited(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
  addr: string,
): Promise<boolean> {
  try {
    return await readFn<boolean>("has_deposited", [
      u64ToScVal(sessionId),
      addressToScVal(addr),
    ]);
  } catch {
    return false;
  }
}

/**
 * Checks if an address has voted.
 */
export async function hasVoted(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
  addr: string,
): Promise<boolean> {
  try {
    return await readFn<boolean>("has_voted", [
      u64ToScVal(sessionId),
      addressToScVal(addr),
    ]);
  } catch {
    return false;
  }
}

/**
 * Gets the absence vote count for an address.
 */
export async function absenceVoteCount(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
  addr: string,
): Promise<number> {
  try {
    return await readFn<number>("absence_vote_count", [
      u64ToScVal(sessionId),
      addressToScVal(addr),
    ]);
  } catch {
    return 0;
  }
}

/**
 * Gets total session count.
 */
export async function getSessionCount(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
): Promise<number> {
  try {
    const val = await readFn<bigint>("session_count", []);
    return toNumber(val);
  } catch (err) {
    console.warn("getSessionCount failed:", err);
    return 0;
  }
}

/**
 * Gets voting deadline for a session.
 */
export async function getVotingDeadline(
  readFn: <T>(method: string, args: StellarSdk.xdr.ScVal[]) => Promise<T>,
  sessionId: number,
): Promise<number> {
  try {
    const val = await readFn<bigint>("voting_deadline", [
      u64ToScVal(sessionId),
    ]);
    return toNumber(val);
  } catch (err) {
    console.warn(`getVotingDeadline(${sessionId}) failed:`, err);
    return 0;
  }
}
