/**
 * Hook to read a wallet's USDC (or any SAC token) balance on Stellar.
 * Uses the Stellar Asset Contract's `balance` function via simulation.
 * @module hooks/useTokenBalance
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import { getRpc, networkPassphrase } from "@/lib/stellar";
import { addressToScVal } from "@/lib/contract";

/**
 * Hook that fetches and returns the token balance for a given wallet address.
 * Re-fetches whenever `refreshKey` changes — useful for triggering after
 * deposit / withdrawal transactions.
 */
export function useTokenBalance(
  walletAddress: string | null,
  tokenSacAddress: string,
  refreshKey = 0,
) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !tokenSacAddress) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rpc = getRpc();
      const source = new StellarSdk.Account(
        "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        "0",
      );
      const sac = new StellarSdk.Contract(tokenSacAddress);

      let tx = new StellarSdk.TransactionBuilder(source, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase,
      })
        .addOperation(sac.call("balance", addressToScVal(walletAddress)))
        .setTimeout(300)
        .build();

      const sim = await rpc.simulateTransaction(tx);

      if (StellarSdk.rpc.Api.isSimulationError(sim)) {
        setError(sim.error);
        return;
      }

      if (!sim.result?.retval) {
        setError("No balance returned");
        return;
      }

      // SAC balance returns i128 → scValToNative gives bigint
      const rawBalance = StellarSdk.scValToNative(sim.result.retval) as bigint;
      const tokenVal = Number(rawBalance) / 10_000_000;
      setBalance(tokenVal.toFixed(2));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Balance fetch failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, tokenSacAddress]);

  // Fetch on mount, and whenever refreshKey changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, refreshKey]);

  return { balance, loading, error, refetch: fetchBalance };
}
