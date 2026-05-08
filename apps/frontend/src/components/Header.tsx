/**
 * Tipay header with Freighter wallet integration.
 * Brutalist design — massive spacing, structural borders, hard shadows.
 * @module components/Header
 */
"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useRefresh } from "@/contexts/refresh";
import { useLanguage } from "@/contexts/language";
import { shortAddress } from "@/lib/utils";
import { tokenSacAddress } from "@/lib/stellar";
import {
  Wallet,
  LogOut,
  Shield,
  Coins,
  Zap,
  Menu,
  X,
  Copy,
  Globe,
} from "lucide-react";

export function Header() {
  const { connected, address, connect, disconnect } = useFreighter();
  const { balanceKey } = useRefresh();
  const { t, locale, toggleLocale } = useLanguage();
  const { balance, loading: balLoading } = useTokenBalance(
    address ?? null,
    tokenSacAddress,
    balanceKey,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      // Error shown by wallet
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-b-2 border-black">
      <div className="w-full px-8 lg:px-16 xl:px-24 h-20 flex items-center justify-between relative">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-3 font-black text-2xl tracking-tight hover:text-[#d73b19] transition-colors"
        >
          <Zap className="w-6 h-6" strokeWidth={3} />
          <span className="uppercase">Tipay</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/sessions"
            className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#d73b19] transition-colors"
          >
            {t("header.sessions")}
          </a>

          {connected && address ? (
            <div className="flex items-center gap-3">
              {/* Wallet button */}
              <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-bold text-sm tracking-wide active:translate-x-0.5 active:translate-y-0.5"
              >
                <Shield className="w-4 h-4" strokeWidth={3} />
                <span className="font-mono text-xs">{shortAddress(address)}</span>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 bg-white border-2 border-black shadow-hard animate-slide-up"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="p-4 border-b-2 border-black">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                      {t("header.connectedAs")}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-gray-500 tracking-wide">
                        {shortAddress(address)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(address ?? "");
                        }}
                        className="p-1.5 border border-gray-300 hover:border-black hover:bg-gray-100 transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                    </div>
                    {/* Balance inside dropdown */}
                    <div className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-gray-50">
                      <Coins className="w-4 h-4 text-[#d73b19]" strokeWidth={3} />
                      <span className="text-xs font-black font-mono">
                        {balLoading ? (
                          <span className="text-gray-300">…</span>
                        ) : balance !== null ? (
                          balance + " USDC"
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Locale toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLocale();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" strokeWidth={3} />
                    {locale === "en" ? "ES" : "EN"}
                  </button>

                  <button
                    onClick={() => {
                      disconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-[#d73b19] hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={3} />
                    {t("header.disconnect")}
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-3 px-5 py-2.5 border-2 border-black bg-black text-white hover:bg-[#d73b19] hover:border-[#d73b19] transition-all font-bold text-sm tracking-wide active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" strokeWidth={3} />
              {connecting ? "CONNECTING…" : "CONNECT WALLET"}
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 border-2 border-black"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" strokeWidth={3} /> : <Menu className="w-6 h-6" strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-black bg-white animate-slide-up">
          <div className="p-6 space-y-4">
            <a
              href="/sessions"
              className="block text-sm font-bold uppercase tracking-[0.15em] hover:text-[#d73b19]"
              onClick={() => setMobileOpen(false)}
            >
              {t("header.sessions")}
            </a>
            {connected && address ? (
              <div className="space-y-3 border-t-2 border-black pt-4">
                {/* Mobile balance */}
                <div className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white">
                  <Coins className="w-4 h-4 text-[#d73b19]" strokeWidth={3} />
                  <span className="text-xs font-black font-mono">
                    {balLoading ? "…" : balance !== null ? balance + " USDC" : "—"}
                  </span>
                </div>
                <p className="text-xs font-mono break-all">{address}</p>
                <button
                  onClick={() => {
                    disconnect();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-black text-white font-bold text-sm hover:bg-[#d73b19] hover:border-[#d73b19] transition-all"
                >
                  <LogOut className="w-4 h-4" strokeWidth={3} />
                  {t("header.disconnect")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-black text-white font-bold text-sm hover:bg-[#d73b19] hover:border-[#d73b19] transition-all"
              >
                <Wallet className="w-4 h-4" strokeWidth={3} />
              {connecting ? t("header.connecting") : t("header.connectWallet")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
