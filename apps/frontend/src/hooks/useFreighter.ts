/**
 * Freighter wallet connection hook. Uses @stellar/freighter-api v3.x.
 * @module hooks/useFreighter
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";
import { networkPassphrase } from "@/lib/stellar";

export interface FreighterState {
  connected: boolean;
  address: string | null;
  network: string | null;
  connect: () => Promise<string>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
}

/**
 * Hook for Freighter wallet integration.
 * Handles connect, disconnect, sign, and network detection.
 */
export function useFreighter(): FreighterState {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  /** Check existing connection on mount. */
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const conn = await isConnected();
      if (!conn.isConnected) return;

      const allowed = await isAllowed();
      if (allowed.isAllowed) {
        const addr = await getAddress();
        const net = await getNetwork();
        setConnected(true);
        setAddress(addr.address);
        setNetwork(net.network);
      }
    } catch {
      // Freighter not installed or error — ignore silently
    }
  }, []);

  /** Request permission and connect. */
  const connect = useCallback(async (): Promise<string> => {
    const conn = await isConnected();
    if (!conn.isConnected) {
      throw new Error(
        "Freighter extension not installed. Install it from freighter.app",
      );
    }

    await setAllowed();
    const addr = await getAddress();
    const net = await getNetwork();

    setConnected(true);
    setAddress(addr.address);
    setNetwork(net.network);

    return addr.address;
  }, []);

  /** Reset connection state. */
  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setNetwork(null);
  }, []);

  /** Sign a transaction XDR with Freighter. */
  const sign = useCallback(
    async (xdr: string): Promise<string> => {
      if (!connected) throw new Error("Wallet not connected");
      const result = await signTransaction(xdr, {
        networkPassphrase,
      });
      return result.signedTxXdr;
    },
    [connected],
  );

  return { connected, address, network, connect, disconnect, sign };
}
