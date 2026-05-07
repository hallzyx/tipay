/**
 * Global refresh context — allows any component to trigger data refreshes
 * (USDC balance, session list, session details) across the component tree.
 * @module contexts/refresh
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface RefreshContextType {
  /** Increment to re-fetch USDC balance in the header. */
  balanceKey: number;
  /** Increment to re-fetch session data on dashboard / detail. */
  sessionKey: number;
  /** Call after a deposit / withdrawal tx completes. */
  triggerBalanceRefresh: () => void;
  /** Call after session create / finalize / vote tx completes. */
  triggerSessionRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType>({
  balanceKey: 0,
  sessionKey: 0,
  triggerBalanceRefresh: () => {},
  triggerSessionRefresh: () => {},
});

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [balanceKey, setBalanceKey] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const triggerBalanceRefresh = useCallback(
    () => setBalanceKey((k) => k + 1),
    [],
  );
  const triggerSessionRefresh = useCallback(
    () => setSessionKey((k) => k + 1),
    [],
  );

  return (
    <RefreshContext.Provider
      value={{
        balanceKey,
        sessionKey,
        triggerBalanceRefresh,
        triggerSessionRefresh,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh(): RefreshContextType {
  return useContext(RefreshContext);
}
