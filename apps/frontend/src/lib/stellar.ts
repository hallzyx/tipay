/**
 * Stellar SDK configuration — singleton instances for RPC, Horizon, and network.
 * Uses testnet by default. Mainnet RPC has a fallback.
 * @module lib/stellar
 */

import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet") as
  | "testnet"
  | "mainnet";

const networkConfig = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  },
  mainnet: {
    horizonUrl: "https://horizon.stellar.org",
    rpcUrl:
      process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL ||
      "https://mainnet.sorobanrpc.com",
    networkPassphrase: StellarSdk.Networks.PUBLIC,
  },
} as const;

export const config = networkConfig[NETWORK];

/** Network passphrase for transaction signing. */
export const networkPassphrase = config.networkPassphrase;

/** Tipay contract ID from environment. */
export const contractId =
  process.env.NEXT_PUBLIC_TIPAY_CONTRACT_ID || "";

/** Native XLM SAC address. */
export const tokenSacAddress =
  process.env.NEXT_PUBLIC_TOKEN_SAC_ADDRESS ||
  "CDMLFMKMMD7MWZP3FKUBZPVEGUJYXKAKHNBYJKPQXKTBBSBKKYRDQ7Y6";

/** Returns the Horizon server instance (lazy singleton). */
export function getHorizon(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(config.horizonUrl);
}

/** Returns the Soroban RPC server instance (lazy singleton). */
export function getRpc(): StellarSdk.rpc.Server {
  return new StellarSdk.rpc.Server(config.rpcUrl);
}
