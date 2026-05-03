/**
 * Contract interaction helpers for the Tipay Soroban contract.
 * All functions return XDR strings ready for signing.
 * @module lib/contract
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import { config, getRpc, contractId } from "./stellar";

/**
 * Builds a Soroban contract invocation transaction.
 * Simulates to get resource estimates, then assembles.
 * @param sourceAddress - The Stellar account initiating the tx.
 * @param method - Soroban method name.
 * @param args - ScVal arguments.
 * @returns Unsigned transaction XDR.
 */
export async function buildContractTx(
  sourceAddress: string,
  method: string,
  args: StellarSdk.xdr.ScVal[],
): Promise<string> {
  const rpc = getRpc();
  const account = await rpc.getAccount(sourceAddress);
  const contract = new StellarSdk.Contract(contractId);

  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

  const simulation = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
  return tx.toXDR();
}

/**
 * Simulates a read-only contract call and returns the result.
 * @param method - Soroban method name.
 * @param args - ScVal arguments.
 * @returns Decoded return value.
 */
export async function simulateRead(
  method: string,
  args: StellarSdk.xdr.ScVal[],
): Promise<StellarSdk.xdr.ScVal> {
  const rpc = getRpc();
  const sourceAccount = new StellarSdk.Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0",
  );
  const contract = new StellarSdk.Contract(contractId);

  let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();

  const simulation = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }

  return simulation.result!.retval;
}

/* ── ScVal helpers ──────────────────────────────────── */

/** Converts a Stellar address string (G... or C...) to ScVal. */
export function addressToScVal(addr: string): StellarSdk.xdr.ScVal {
  return StellarSdk.Address.fromString(addr).toScVal();
}

/** Converts a BigInt to i128 ScVal. */
export function i128ToScVal(n: bigint): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(n, { type: "i128" });
}

/** Converts a number to u64 ScVal. */
export function u64ToScVal(n: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(n, { type: "u64" });
}

/** Converts a number to u32 ScVal. */
export function u32ToScVal(n: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(n, { type: "u32" });
}

/** Converts an array of addresses to Vec<Address> ScVal. */
export function addressVecToScVal(
  addrs: string[],
): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(
    addrs.map((a) => StellarSdk.Address.fromString(a)),
    { type: ["address", null] },
  );
}

/** Converts a boolean to ScVal. */
export function boolToScVal(b: boolean): StellarSdk.xdr.ScVal {
  // Soroban SDK reads booleans as `true`/`false` symbols
  return StellarSdk.nativeToScVal(b, { type: "bool" });
}

/* ── Result decoding ────────────────────────────────── */

/** Decodes an ScVal result to a native JS value. */
export function decodeScVal(val: StellarSdk.xdr.ScVal): unknown {
  return StellarSdk.scValToNative(val);
}
